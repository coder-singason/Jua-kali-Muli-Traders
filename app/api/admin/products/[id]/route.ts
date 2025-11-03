import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  viewType: z.enum(["FRONT", "SIDE", "TOP", "BACK", "GENERAL"]),
  alt: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
});

const productDetailSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
});

const updateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string()).optional(), // Legacy support
  productImages: z.array(productImageSchema).optional(),
  productDetails: z.array(productDetailSchema).optional(),
  sizes: z.array(
    z.object({
      size: z.string(),
      stock: z.number().int().nonnegative(),
    })
  ).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

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
    const parsedData = updateProductSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { sizes, productImages, productDetails, ...productData } = parsedData.data;

    // Ensure at least one image
    if (productImages && productImages.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: productData,
    });

    // Update sizes if provided
    if (sizes) {
      // Delete existing sizes
      await prisma.productSize.deleteMany({
        where: { productId: id },
      });

      // Create new sizes
      await prisma.productSize.createMany({
        data: sizes.map((size) => ({
          productId: id,
          size: size.size,
          stock: size.stock,
        })),
      });
    }

    // Update product images if provided
    if (productImages) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      await prisma.productImage.createMany({
        data: productImages.map((img) => ({
          productId: id,
          url: img.url,
          viewType: img.viewType,
          alt: img.alt || "",
          sortOrder: img.sortOrder,
        })),
      });
    }

    // Update product details if provided
    if (productDetails) {
      // Delete existing details
      await prisma.productDetail.deleteMany({
        where: { productId: id },
      });

      // Create new details
      await prisma.productDetail.createMany({
        data: productDetails.map((detail) => ({
          productId: id,
          label: detail.label,
          value: detail.value,
          sortOrder: detail.sortOrder,
        })),
      });
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
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

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if product has been ordered
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product with existing orders",
          message: `This product has been ordered ${product._count.orderItems} time(s). Products with order history cannot be deleted to maintain order integrity.`,
        },
        { status: 400 }
      );
    }

    // Delete product (sizes and cart items will be deleted via cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    
    // Handle Prisma relation constraint errors
    if (error.code === "P2014") {
      return NextResponse.json(
        {
          error: "Cannot delete product",
          message: "This product is referenced in existing orders and cannot be deleted.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete product", message: error.message },
      { status: 500 }
    );
  }
}

