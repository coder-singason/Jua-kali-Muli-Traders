import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: MpesaCallbackBody = await request.json();

    const stkCallback = body.Body.stkCallback;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    // Find payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: {
        mpesaTransactionId: checkoutRequestId,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.error("Payment not found for checkout request:", checkoutRequestId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // ResultCode 0 means success
    if (resultCode === 0 && stkCallback.CallbackMetadata) {
      const items = stkCallback.CallbackMetadata.Item;
      const receiptNumber = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value as string | undefined;
      const transactionDate = items.find((item) => item.Name === "TransactionDate")?.Value as string | undefined;
      const phoneNumber = items.find((item) => item.Name === "PhoneNumber")?.Value as string | undefined;

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          mpesaReceiptNumber: receiptNumber,
          phoneNumber: phoneNumber || payment.phoneNumber,
          callbackData: body as any,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PROCESSING",
        },
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          callbackData: body as any,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}

