"use client";

import { CheckCircle2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderSuccessBannerProps {
  orderNumber: string;
  paymentMethod: string;
  showPaymentNote?: boolean;
}

export function OrderSuccessBanner({
  orderNumber,
  paymentMethod,
  showPaymentNote,
}: OrderSuccessBannerProps) {
  return (
    <Card className="mb-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-600 p-2">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-green-800 dark:text-green-200 mb-3">
              Thank you for your purchase! Your order <span className="font-semibold">#{orderNumber}</span> has been received and is being processed.
            </p>
            {showPaymentNote && paymentMethod === "PAYPAL" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-800 mb-3">
                <CreditCard className="h-5 w-5 text-green-700 dark:text-green-300 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Payment Successful
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                    Your payment has been securely processed via PayPal.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile?tab=orders">View All Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

