import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <Icon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <a href={action.href}>
            <Button onClick={action.onClick}>{action.label}</Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}

