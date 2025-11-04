"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, User, Package, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
import Link from "next/link";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews: initialReviews }: ReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete review");
      }

      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast({
        title: "Review Deleted",
        description: "The review has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Product Info */}
              <div className="flex gap-4 flex-1 min-w-0">
                <Link
                  href={`/products/${review.product.id}`}
                  className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {review.product.images?.[0] ? (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${review.product.id}`}
                    className="hover:underline"
                  >
                    <h3 className="font-semibold text-base sm:text-lg mb-1 break-words">
                      {review.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {review.user.name || review.user.email}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Customer
                      </Badge>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mb-2 break-words">
                        {review.comment}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                      {review.updatedAt !== review.createdAt && (
                        <span className="text-xs">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start justify-end sm:justify-start">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === review.id}
                    >
                      {deletingId === review.id ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(review.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

