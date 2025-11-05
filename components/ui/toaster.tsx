"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const getToastIcon = (variant?: "default" | "destructive" | "success" | "warning" | "info") => {
  switch (variant) {
    case "destructive":
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
    case "success":
    case "default":
    default:
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 flex-1">
              {/* Icon */}
              {getToastIcon(variant)}
              
              {/* Content */}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

