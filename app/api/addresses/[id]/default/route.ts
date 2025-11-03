import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

    // Verify ownership
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Unset other defaults
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

    // Set this as default
    const address = await prisma.address.update({
      where: { id },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}

