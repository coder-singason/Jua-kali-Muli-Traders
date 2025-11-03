import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get("all") === "true";

    if (all) {
      // Return all categories in a flat list for product selection
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          parent: {
            select: {
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

      // Format for product selection with hierarchy indication
      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name,
        slug: cat.slug,
      }));

      return NextResponse.json(formatted);
    }

    // Default: return hierarchical structure for navigation
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      include: {
        children: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
