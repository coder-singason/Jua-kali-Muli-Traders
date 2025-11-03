import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

async function getCategory(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  });
}

async function getCategories() {
  return await prisma.category.findMany({
    where: {
      id: { not: undefined }, // Will filter out current category in component
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const [category, categories] = await Promise.all([
    getCategory(id),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  // Filter out current category from parent options
  const parentOptions = categories.filter((c) => c.id !== category.id);

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Edit Category</h1>
      <CategoryForm category={category} categories={parentOptions} />
    </>
  );
}

