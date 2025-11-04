"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWishlistCheck, useToggleWishlist } from "@/lib/hooks/use-wishlist";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean; // New prop to show text alongside icon
  variant?: "icon" | "button"; // icon-only or button with text
}

export function WishlistButton({
  productId,
  className,
  size = "md",
  showText = false,
  variant = "icon",
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  // All hooks must be called before any conditional returns
  const { data: wishlistCheck, isLoading: checking } = useWishlistCheck(
    productId,
    !!session?.user?.id && session.user.role !== "ADMIN"
  );
  const toggleWishlist = useToggleWishlist();
  
  // Hide wishlist for admins (after all hooks are called)
  if (session?.user?.role === "ADMIN") {
    return null;
  }

  const isInWishlist = wishlistCheck?.inWishlist || false;
  const loading = toggleWishlist.isPending;
  const [previousWishlistState, setPreviousWishlistState] = useState(isInWishlist);
  const [justToggled, setJustToggled] = useState(false);

  // Show success feedback when wishlist state changes
  useEffect(() => {
    if (previousWishlistState !== isInWishlist && !loading && previousWishlistState !== undefined) {
      setShowSuccessFeedback(true);
      setJustToggled(true);
      
      if (isInWishlist) {
        setFeedbackMessage("Added to wishlist!");
      } else {
        setFeedbackMessage("Removed from wishlist");
      }
      
      const timer = setTimeout(() => {
        setShowSuccessFeedback(false);
        setJustToggled(false);
      }, 3000); // Show feedback longer for better UX
      
      setPreviousWishlistState(isInWishlist);
      return () => clearTimeout(timer);
    } else if (previousWishlistState === undefined) {
      setPreviousWishlistState(isInWishlist);
    }
  }, [isInWishlist, loading, previousWishlistState]);

  const handleToggleWishlist = () => {
    if (!session) {
      setShowLoginDialog(true);
      return;
    }

    toggleWishlist.mutate({
      productId,
      isInWishlist,
    });
  };

  const handleLogin = () => {
    setShowLoginDialog(false);
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleRegister = () => {
    setShowLoginDialog(false);
    router.push(`/register?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const sizeClasses = {
    sm: variant === "icon" ? "h-8 w-8" : "h-8 px-3",
    md: variant === "icon" ? "h-10 w-10" : "h-10 px-4",
    lg: variant === "icon" ? "h-12 w-12" : "h-12 px-6",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (checking) {
    return (
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "default"}
        className={cn(sizeClasses[size], className)}
        disabled
      >
        <LoadingSpinner size="sm" />
        {variant === "button" && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  // Icon-only variant (default)
  if (variant === "icon") {
    return (
      <>
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="icon"
            className={cn(sizeClasses[size], className)}
            onClick={handleToggleWishlist}
            disabled={loading || checking}
            title={
              loading 
                ? "Processing..."
                : showSuccessFeedback
                ? (isInWishlist ? "Tap to remove" : "Tap to re-add")
                : isInWishlist 
                  ? "Remove from wishlist"
                  : justToggled
                  ? "Re-add to wishlist"
                  : "Add to wishlist"
            }
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : showSuccessFeedback ? (
              <Check className={cn(iconSizeClasses[size], "text-green-500")} />
            ) : (
              <Heart
                className={cn(
                  iconSizeClasses[size],
                  "transition-all",
                  isInWishlist
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                )}
              />
            )}
          </Button>

          {/* Success feedback tooltip */}
          {showSuccessFeedback && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-green-500 text-white text-xs rounded-md shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
              <div className="font-medium">{feedbackMessage}</div>
              <div className="text-[10px] opacity-90 mt-0.5">
                {isInWishlist ? "Tap to remove" : "Tap to re-add"}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
            </div>
          )}
        </div>

        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Login Required</AlertDialogTitle>
              <AlertDialogDescription>
                You need to be logged in to add items to your wishlist. Please login or create an account to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegister} className="bg-primary">
                Create Account
              </AlertDialogAction>
              <AlertDialogAction onClick={handleLogin}>
                Login
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Button with text variant
  return (
    <>
      <Button
        variant={isInWishlist ? "default" : "outline"}
        size="default"
        className={cn(sizeClasses[size], className, "gap-2")}
        onClick={handleToggleWishlist}
        disabled={loading || checking}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className={textClasses[size]}>Processing...</span>
          </>
        ) : (
          <>
            {showSuccessFeedback ? (
              <Check className={cn(iconSizeClasses[size], "text-green-500")} />
            ) : (
              <Heart
                className={cn(
                  iconSizeClasses[size],
                  "transition-all",
                  isInWishlist
                    ? "fill-current"
                    : ""
                )}
              />
            )}
            <span className={textClasses[size]}>
              {loading 
                ? "Processing..."
                : showSuccessFeedback
                ? feedbackMessage
                : isInWishlist 
                  ? "Remove from Wishlist"
                  : justToggled
                  ? "Re-add to Wishlist"
                  : "Add to Wishlist"
              }
            </span>
          </>
        )}
      </Button>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to add items to your wishlist. Please login or create an account to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegister} className="bg-primary">
              Create Account
            </AlertDialogAction>
            <AlertDialogAction onClick={handleLogin}>
              Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

