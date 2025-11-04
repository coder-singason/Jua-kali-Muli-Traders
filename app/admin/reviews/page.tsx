import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewsListAdmin } from "@/components/admin/ReviewsListAdmin";
import { MessageSquare } from "lucide-react";

async function getReviews() {
  const reviews = await prisma.productReview.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
}

export default async function AdminReviewsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const reviews = await getReviews();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
          Product Reviews
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage and monitor all customer reviews
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewsListAdmin reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}

