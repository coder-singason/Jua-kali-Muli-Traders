import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InvoicePrintButton } from "@/components/invoice/InvoicePrintButton";

async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
}

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    // Permission check: Admin or Owner
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = order.userId === session.user.id;

    if (!isAdmin && !isOwner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-4">You do not have permission to view this invoice.</p>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        );
    }

    const shippingAddress = (order.shippingAddress as {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        postalCode?: string;
    }) || {
        fullName: order.user.name || "N/A",
        phone: order.user.phone || "N/A",
        addressLine1: "Address not available",
        city: "N/A",
    };

    return (
        <div className="min-h-screen bg-white text-black p-8 print:p-0">
            {/* Print Controls - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-end items-center print:hidden">
                <InvoicePrintButton />
            </div>

            {/* Invoice Content */}
            <div className="max-w-4xl mx-auto border border-gray-200 p-8 shadow-sm print:shadow-none print:border-none print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">INVOICE</h1>
                        <p className="text-sm text-gray-500">
                            #{order.orderNumber}
                        </p>
                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-semibold text-gray-900">JUA-KALI MULI TRADERS</p>
                            <p>Murang'a, Kenya</p>
                            <p>Email: admin@juakalimulitraders.com</p>
                            <p>Phone: +254 714 747 751</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block text-left min-w-[200px] print:bg-transparent print:border print:border-gray-200">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Date Issued</span>
                                <span className="font-medium text-gray-900">{format(new Date(order.createdAt), "MMMM dd, yyyy")}</span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Status</span>
                                <span className={`font-medium capitalize ${order.paymentMethod === "CASH_ON_DELIVERY" ? "text-amber-600" : "text-green-600"
                                    }`}>
                                    {order.paymentMethod === "CASH_ON_DELIVERY" ? "Payment Pending (COD)" : "Paid"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To / Ship To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                        <div className="text-sm text-gray-700">
                            <p className="font-medium text-gray-900">{order.user.name || "Valued Customer"}</p>
                            <p className="mt-1">{order.user.email}</p>
                            {order.user.phone && <p>{order.user.phone}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ship To</h3>
                        <div className="text-sm text-gray-700">
                            <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
                            <p className="mt-1">{shippingAddress.addressLine1}</p>
                            {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                            <p>
                                {shippingAddress.city}
                                {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
                            </p>
                            <p className="mt-1">{shippingAddress.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left bg-gray-50 print:bg-transparent">Item</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center bg-gray-50 print:bg-transparent w-24">Size</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center bg-gray-50 print:bg-transparent w-24">Qty</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right bg-gray-50 print:bg-transparent w-32">Price</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right bg-gray-50 print:bg-transparent w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.product?.brand}</p>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600 text-center">{item.size}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 text-right">KSh {item.price.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900 text-right">KSh {(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>KSh {order.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>
                                {order.shippingCost === 0 ? "Free" : `KSh ${order.shippingCost.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                            <span>Total</span>
                            <span>KSh {order.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Thank you for your business!</h4>
                    <p className="text-xs text-gray-500">
                        For any questions regarding this invoice, please contact us at admin@juakalimulitraders.com.
                        We appreciate your support of local Juakali artisans.
                    </p>
                </div>
            </div>
        </div>
    );
}
