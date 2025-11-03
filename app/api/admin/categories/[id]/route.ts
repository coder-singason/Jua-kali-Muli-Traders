import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  parentId: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = categorySchema.parse(body);

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if slug already exists (excluding current category)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Validate parent exists if provided
    if (data.parentId !== undefined && data.parentId !== null) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 }
        );
      }
      // Prevent setting itself as parent
      if (data.parentId === id) {
        return NextResponse.json(
          { error: "Category cannot be its own parent" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Prevent deletion if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Please remove or reassign products first." },
        { status: 400 }
      );
    }

    // Prevent deletion if category has children
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories. Please delete or reassign subcategories first." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

