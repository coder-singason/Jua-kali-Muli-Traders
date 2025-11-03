"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { XCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
  orderStatus: string;
}

export function CancelOrderButton({
  orderId,
  orderStatus,
}: CancelOrderButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // STRICT: Only PENDING and PROCESSING orders can be cancelled
  // Explicitly check ALL statuses - never show button for anything else
  const status = orderStatus?.toUpperCase();
  
  if (
    status !== "PENDING" && 
    status !== "PROCESSING"
  ) {
    // Don't render button for DELIVERED, SHIPPED, CANCELLED, or any other status
    return null;
  }

  const handleCancel = async () => {
    // Double-check status before allowing cancellation
    const status = orderStatus?.toUpperCase();
    if (status !== "PENDING" && status !== "PROCESSING") {
      toast({
        title: "Cannot Cancel",
        description: `Cannot cancel an order with status: ${orderStatus}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Order Cancelled",
          description: "Your order has been cancelled successfully.",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone. If you have already paid, you will receive a refund according
            to our refund policy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Order"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

