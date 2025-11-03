"use client";

import { OrderStatus } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Check,
} from "lucide-react";

interface OrderTrackingProps {
  status: OrderStatus;
  createdAt: Date;
  estimatedDelivery?: Date;
}

const statusSteps = [
  {
    status: "PENDING" as const,
    label: "Order Placed",
    icon: Clock,
    description: "Your order has been received",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-600",
  },
  {
    status: "PROCESSING" as const,
    label: "Processing",
    icon: Package,
    description: "We're preparing your order",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-600",
  },
  {
    status: "SHIPPED" as const,
    label: "Shipped",
    icon: Truck,
    description: "Your order is on the way",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-600",
  },
  {
    status: "DELIVERED" as const,
    label: "Delivered",
    icon: CheckCircle2,
    description: "Order delivered successfully",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-600",
  },
];

const cancelledStep = {
  status: "CANCELLED" as const,
  label: "Cancelled",
  icon: XCircle,
  description: "Order has been cancelled",
  color: "text-red-600",
  bg: "bg-red-50 dark:bg-red-950",
  border: "border-red-600",
};

export function OrderTracking({
  status,
  createdAt,
  estimatedDelivery,
}: OrderTrackingProps) {
  const getStatusIndex = (currentStatus: OrderStatus): number => {
    if (currentStatus === "CANCELLED") return -1;
    return statusSteps.findIndex((step) => step.status === currentStatus);
  };

  const currentIndex = getStatusIndex(status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <div className={`p-3 rounded-full ${cancelledStep.bg} ${cancelledStep.color}`}>
            <cancelledStep.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {cancelledStep.label}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {cancelledStep.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border">
            <div
              className="absolute top-0 left-0 w-full bg-primary origin-top transition-all duration-800 ease-out"
              style={{
                height: currentIndex >= 0 ? `${((currentIndex + 1) / statusSteps.length) * 100}%` : "0%",
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="relative flex gap-4">
                  {/* Icon */}
                  <div className="relative z-10">
                    <div
                      className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all animate-in fade-in zoom-in duration-300 ${
                        isActive
                          ? `${step.bg} ${step.border} ${step.color}`
                          : "bg-muted border-border"
                      }`}
                      style={{
                        animationDelay: `${index * 200}ms`,
                      }}
                    >
                      {isActive && !isCurrent ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    {isCurrent && (
                      <div
                        className={`absolute inset-0 rounded-full ${step.bg} animate-pulse`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div
                      className={`font-semibold mb-1 ${
                        isActive ? step.color : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {isCurrent && index === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(createdAt).toLocaleString()}
                      </p>
                    )}
                    {isCurrent && index === 3 && estimatedDelivery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated: {new Date(estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                    {isCurrent && index === 2 && (
                      <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                        <Truck className="h-5 w-5 text-purple-600 animate-pulse" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            On the way to you
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            Your package is in transit
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estimated Delivery Info */}
      {!isCancelled && estimatedDelivery && currentIndex < 3 && (
        <div className="mt-6 p-4 rounded-lg bg-muted border">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">
                {new Date(estimatedDelivery).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

