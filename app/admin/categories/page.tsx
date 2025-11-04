import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesList } from "@/components/admin/CategoriesList";

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        parentId: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export default async function AdminCategoriesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your products with categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}

