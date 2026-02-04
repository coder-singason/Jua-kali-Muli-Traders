import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPayPalWebhook } from "@/lib/payments/paypal";

/**
 * POST /api/payments/paypal/webhook
 * Handle PayPal webhook events
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;

        if (!webhookId) {
            console.error("PayPal webhook ID not configured");
            return NextResponse.json(
                { error: "Webhook not configured" },
                { status: 500 }
            );
        }

        // Extract headers for signature verification
        const headers = {
            "paypal-transmission-id":
                request.headers.get("paypal-transmission-id") || "",
            "paypal-transmission-time":
                request.headers.get("paypal-transmission-time") || "",
            "paypal-transmission-sig":
                request.headers.get("paypal-transmission-sig") || "",
            "paypal-cert-url": request.headers.get("paypal-cert-url") || "",
            "paypal-auth-algo": request.headers.get("paypal-auth-algo") || "",
        };

        // Verify webhook signature
        const isValid = verifyPayPalWebhook(webhookId, headers, body);
        if (!isValid) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);
        const eventType = event.event_type;

        console.log(`Received PayPal webhook: ${eventType}`);

        switch (eventType) {
            case "PAYMENT.CAPTURE.COMPLETED":
                await handlePaymentCaptureCompleted(event);
                break;

            case "PAYMENT.CAPTURE.DENIED":
                await handlePaymentCaptureDenied(event);
                break;

            case "PAYMENT.CAPTURE.REFUNDED":
                await handlePaymentCaptureRefunded(event);
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("PayPal webhook error:", error);
        return NextResponse.json(
            {
                error: "Webhook processing failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

async function handlePaymentCaptureCompleted(event: any) {
    const paypalOrderId = event.resource.supplementary_data?.related_ids?.order_id;

    if (!paypalOrderId) {
        console.error("No PayPal order ID in webhook event");
        return;
    }

    // Update payment status
    const payment = await prisma.payment.findUnique({
        where: { paypalOrderId },
    });

    if (!payment) {
        console.error(`Payment not found for PayPal order: ${paypalOrderId}`);
        return;
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "COMPLETED",
            callbackData: event as any,
        },
    });

    // Update order status
    await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PROCESSING" },
    });

    console.log(`Payment captured for order: ${payment.orderId}`);
}

async function handlePaymentCaptureDenied(event: any) {
    const paypalOrderId = event.resource.supplementary_data?.related_ids?.order_id;

    if (!paypalOrderId) {
        console.error("No PayPal order ID in webhook event");
        return;
    }

    const payment = await prisma.payment.findUnique({
        where: { paypalOrderId },
    });

    if (!payment) {
        console.error(`Payment not found for PayPal order: ${paypalOrderId}`);
        return;
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "FAILED",
            callbackData: event as any,
        },
    });

    // Update order status
    await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELLED" },
    });

    console.log(`Payment denied for order: ${payment.orderId}`);
}

async function handlePaymentCaptureRefunded(event: any) {
    const paypalOrderId = event.resource.supplementary_data?.related_ids?.order_id;

    if (!paypalOrderId) {
        console.error("No PayPal order ID in webhook event");
        return;
    }

    const payment = await prisma.payment.findUnique({
        where: { paypalOrderId },
    });

    if (!payment) {
        console.error(`Payment not found for PayPal order: ${paypalOrderId}`);
        return;
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "CANCELLED",
            callbackData: event as any,
        },
    });

    console.log(`Payment refunded for order: ${payment.orderId}`);
}
