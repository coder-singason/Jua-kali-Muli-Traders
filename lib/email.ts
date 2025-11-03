import { Resend } from "resend";

// Initialize Resend only if API key is available
let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.warn("Failed to initialize Resend:", error);
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
  };
  paymentMethod: string;
  orderDate: Date;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log("Email not sent: RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name} (Size: ${item.size})
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          KSh ${item.price.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          KSh ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - KicksZone</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e1e1e 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">KicksZone</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${data.customerName || "Customer"},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your order! We've received your order and are preparing it for shipment.
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #1e1e1e; font-size: 20px;">Order #${data.orderNumber}</h2>
              <p style="margin: 5px 0; color: #6b7280;">
                Order Date: ${new Date(data.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            
            <h3 style="color: #1e1e1e; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">KSh ${data.subtotal.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Shipping:</span>
                <span style="font-weight: 600;">KSh ${data.shippingCost.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #e5e7eb; font-size: 18px; font-weight: 700;">
                <span>Total:</span>
                <span>KSh ${data.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e1e1e; font-size: 16px; margin-bottom: 10px;">Shipping Address</h3>
              <p style="margin: 5px 0;">${data.shippingAddress.fullName}</p>
              <p style="margin: 5px 0;">${data.shippingAddress.addressLine1}</p>
              ${data.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${data.shippingAddress.addressLine2}</p>` : ""}
              <p style="margin: 5px 0;">
                ${data.shippingAddress.city}${data.shippingAddress.postalCode ? `, ${data.shippingAddress.postalCode}` : ""}
              </p>
              <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e1e1e; font-size: 16px; margin-bottom: 10px;">Payment Method</h3>
              <p style="margin: 5px 0; font-weight: 600;">
                ${data.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "M-Pesa"}
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px; margin-bottom: 20px;">
              We'll send you another email when your order ships. If you have any questions, please contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Thank you for shopping with KicksZone!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      return { success: false, error: "Resend client not initialized" };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KicksZone <noreply@kickszone.com>",
      to: data.customerEmail,
      subject: `Order Confirmation - #${data.orderNumber}`,
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingInfo?: string
) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log("Email not sent: RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const statusMessages: Record<string, { subject: string; message: string }> = {
      PROCESSING: {
        subject: `Your Order #${orderNumber} is Being Processed`,
        message: "We're preparing your order for shipment. You'll receive another email when it ships.",
      },
      SHIPPED: {
        subject: `Your Order #${orderNumber} Has Shipped!`,
        message: trackingInfo
          ? `Your order has been shipped! Tracking: ${trackingInfo}`
          : "Your order has been shipped! You should receive it within 2-3 business days.",
      },
      DELIVERED: {
        subject: `Your Order #${orderNumber} Has Been Delivered`,
        message: "Your order has been delivered. We hope you love your purchase!",
      },
      CANCELLED: {
        subject: `Your Order #${orderNumber} Has Been Cancelled`,
        message: "Your order has been cancelled. If you have any questions, please contact our support team.",
      },
    };

    const statusInfo = statusMessages[status] || {
      subject: `Order #${orderNumber} Status Update`,
      message: `Your order status has been updated to: ${status.toLowerCase()}`,
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e1e1e 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">KicksZone</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Update</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${customerName || "Customer"},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${statusInfo.message}
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="margin: 0; color: #1e1e1e; font-size: 24px;">Order #${orderNumber}</h2>
              <p style="margin: 10px 0 0 0; color: #6b7280; text-transform: capitalize; font-size: 18px; font-weight: 600;">
                Status: ${status.toLowerCase()}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kickszone.com"}/orders/${orderNumber}" 
                 style="display: inline-block; background: #1e1e1e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Order Details
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Thank you for shopping with KicksZone!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!resend) {
      return { success: false, error: "Resend client not initialized" };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KicksZone <noreply@kickszone.com>",
      to: customerEmail,
      subject: statusInfo.subject,
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return { success: false, error: String(error) };
  }
}

