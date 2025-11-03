import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1).optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = addressSchema.parse(body);

    // Verify ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data,
    });

    return NextResponse.json({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}

