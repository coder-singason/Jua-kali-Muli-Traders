import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

async function getCategories() {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await getCategories();

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Add New Category</h1>
      <CategoryForm categories={categories} />
    </>
  );
}

