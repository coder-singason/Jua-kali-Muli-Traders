"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { useProductReviews, useSubmitReview, useDeleteReview } from "@/lib/hooks/use-reviews";
import { formatDistanceToNow } from "date-fns";
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
} from "@/components/ui/alert-dialog";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: reviewsData, isLoading: loading } = useProductReviews(productId);
  const submitReview = useSubmitReview();
  const deleteReview = useDeleteReview();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const ratingCounts = reviewsData?.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Find user's review if exists
  const userReview = useMemo(() => {
    if (!session?.user?.id) return null;
    return reviews.find((r: Review) => r.user.id === session.user.id) || null;
  }, [reviews, session?.user?.id]);

  // Initialize form with user's review if it exists
  useMemo(() => {
    if (userReview) {
      setUserRating(userReview.rating);
      setUserComment(userReview.comment || "");
    }
  }, [userReview]);

  const handleLogin = () => {
    setShowLoginDialog(false);
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleRegister = () => {
    setShowLoginDialog(false);
    router.push(`/register?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleSubmitReview = async () => {
    if (!session) {
      setShowLoginDialog(true);
      return;
    }

    if (userRating === 0) {
      return;
    }

    submitReview.mutate({
      productId,
      rating: userRating,
      comment: userComment || undefined,
    }, {
      onSuccess: () => {
        setShowReviewForm(false);
        setUserRating(0);
        setUserComment("");
      },
    });
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    if (!session || !userReview) return;

    deleteReview.mutate(productId, {
      onSuccess: () => {
        setUserRating(0);
        setUserComment("");
      },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews & Ratings
          </CardTitle>
          {session && session.user.role !== "ADMIN" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {userReview ? "Edit Review" : "Write Review"}
            </Button>
          ) : !session ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoginDialog(true)}
            >
              Write Review
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="lg" showLabel={false} />
            <div className="text-sm text-muted-foreground mt-1">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${
                        totalReviews > 0
                          ? (ratingCounts[star as keyof typeof ratingCounts] /
                              totalReviews) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {ratingCounts[star as keyof typeof ratingCounts]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && session && session.user.role !== "ADMIN" && (
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>Your Rating</Label>
                <StarRating
                  rating={userRating}
                  interactive={true}
                  onRatingChange={setUserRating}
                  size="lg"
                />
              </div>
              <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this product..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitReview.isPending || userRating === 0}
                >
                  {submitReview.isPending ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                </Button>
                {userReview && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteReview}
                    disabled={deleteReview.isPending}
                  >
                    {deleteReview.isPending ? (
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
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    if (!userReview) {
                      setUserRating(0);
                      setUserComment("");
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">
                      {review.user.name || review.user.email.split("@")[0]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                      {review.updatedAt !== review.createdAt && " (edited)"}
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      </Card>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to write a review. Please login or create an account to continue.
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

