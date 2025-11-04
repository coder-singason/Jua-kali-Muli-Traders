import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url(),
  viewType: z.enum(["FRONT", "SIDE", "TOP", "BACK", "GENERAL"]),
  alt: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
});

const productDetailSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string(),
  brand: z.string().optional(),
  images: z.array(z.string()).default([]), // Legacy support
  productImages: z.array(productImageSchema).default([]),
  productDetails: z.array(productDetailSchema).default([]),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  deliveryTime: z.string().optional(),
  warranty: z.string().optional(),
  quality: z.string().optional(),
  shippingFee: z.number().nonnegative().optional(),
  sizes: z.array(
    z.object({
      size: z.string(),
      stock: z.number().int().nonnegative(),
    })
  ).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = createProductSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { sizes, productImages, productDetails, ...productData } = parsedData.data;

    // Ensure at least one image
    if (productImages.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    // Check if SKU already exists (if provided)
    if (productData.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: productData.sku },
        select: { id: true, name: true },
      });

      if (existingProduct) {
        return NextResponse.json(
          {
            error: "SKU already exists",
            message: `A product with SKU "${productData.sku}" already exists. Please use a different SKU or leave it blank.`,
          },
          { status: 400 }
        );
      }
    }

    // Build product data object explicitly - always include all fields
    const createData = {
      name: productData.name,
      description: productData.description || null,
      price: productData.price,
      categoryId: productData.categoryId,
      brand: productData.brand || null,
      sku: productData.sku || null,
      featured: productData.featured || false,
      stock: productData.stock || 0,
      images: productData.images || [],
      // Always include new optional fields (set to null if not provided)
      deliveryTime: productData.deliveryTime || null,
      warranty: productData.warranty || null,
      quality: productData.quality || null,
      shippingFee: productData.shippingFee !== undefined && productData.shippingFee !== null ? productData.shippingFee : null,
    };

    const product = await prisma.product.create({
      data: {
        ...createData,
        sizes: {
          create: sizes,
        },
        productImages: {
          create: productImages.map((img) => ({
            url: img.url,
            viewType: img.viewType,
            alt: img.alt || "",
            sortOrder: img.sortOrder,
          })),
        },
        productDetails: {
          create: productDetails.map((detail) => ({
            label: detail.label,
            value: detail.value,
            sortOrder: detail.sortOrder,
          })),
        },
      },
      include: {
        category: true,
        sizes: true,
        productImages: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        productDetails: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes("sku")) {
        return NextResponse.json(
          {
            error: "SKU already exists",
            message: "A product with this SKU already exists. Please use a different SKU or leave it blank.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: "Duplicate entry",
          message: "A product with this information already exists.",
        },
        { status: 400 }
      );
    }

    // Handle Prisma validation errors
    if (error.code === "P2009" || error.message?.includes("Unknown argument")) {
      return NextResponse.json(
        { 
          error: "Invalid product data",
          message: "Some fields are not recognized. Please restart the development server and try again.",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create product",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        sizes: true,
        productImages: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1, // Only get first image for list view
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

