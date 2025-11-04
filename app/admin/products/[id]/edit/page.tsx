"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { ProductImageUpload, type ProductImage } from "@/components/admin/ProductImageUpload";
import { ProductDetailsManager, type ProductDetail } from "@/components/admin/ProductDetailsManager";
import { X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  stock: z.number().int().nonnegative().default(0),
  deliveryTime: z.string().optional(),
  warranty: z.string().optional(),
  quality: z.string().optional(),
  shippingFee: z.number().nonnegative().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [productId, setProductId] = useState<string | null>(null);
  const [sizes, setSizes] = useState<Array<{ size: string; stock: number }>>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const addSize = () => {
    setSizes([...sizes, { size: "", stock: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: "size" | "stock", value: string | number) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    async function loadProduct() {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);

      try {
        const response = await fetch(`/api/admin/products/${resolvedParams.id}`);
        if (!response.ok) throw new Error("Failed to load product");

        const { product } = await response.json();
        
        setValue("name", product.name);
        setValue("description", product.description || "");
        setValue("price", Number(product.price));
        setValue("brand", product.brand || "");
        setValue("sku", product.sku || "");
        setValue("featured", product.featured);
        setValue("stock", product.stock);
        setValue("deliveryTime", product.deliveryTime || "");
        setValue("warranty", product.warranty || "");
        setValue("quality", product.quality || "");
        setValue("shippingFee", product.shippingFee || 0);

        if (product.sizes) {
          setSizes(product.sizes.map((s: any) => ({ size: s.size, stock: s.stock })));
        }

        // Load product images
        if (product.productImages && product.productImages.length > 0) {
          setImages(
            product.productImages.map((img: any) => ({
              id: img.id,
              url: img.url,
              viewType: img.viewType,
              alt: img.alt || "",
              sortOrder: img.sortOrder,
            }))
          );
        } else if (product.images && product.images.length > 0) {
          // Fallback to legacy images array
          setImages(
            product.images.map((url: string, index: number) => ({
              url,
              viewType: "GENERAL" as const,
              alt: "",
              sortOrder: index,
            }))
          );
        }

        // Load product details
        if (product.productDetails) {
          setDetails(
            product.productDetails.map((detail: any) => ({
              id: detail.id,
              label: detail.label,
              value: detail.value,
              sortOrder: detail.sortOrder,
            }))
          );
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [params, setValue, router, toast]);

  const onSubmit = async (data: ProductFormData) => {
    if (!productId) return;

    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one product image is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => img.url), // Legacy support
          productImages: images,
          productDetails: details,
          sizes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      setShowDeleteDialog(false);
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KSh) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register("brand")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Total Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="h-4 w-4"
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            {/* Product Features */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Product Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    placeholder="e.g., 1-3 Days, 5-7 Days"
                    {...register("deliveryTime")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    placeholder="e.g., 1 Year, 2 Years, 6 Months"
                    {...register("warranty")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Input
                    id="quality"
                    placeholder="e.g., Premium, Standard, Basic"
                    {...register("quality")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingFee">Shipping Fee (KSh)</Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("shippingFee", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default shipping fee for this product. Can be calculated based on location in future.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-4 border-t pt-4">
              <ProductImageUpload images={images} onChange={setImages} />
            </div>

            {/* Product Details */}
            <div className="space-y-4 border-t pt-4">
              <ProductDetailsManager details={details} onChange={setDetails} />
            </div>

            {/* Sizes & Stock */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sizes & Stock</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add each size separately (e.g., 8, 9, 10 as separate entries)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={addSize}>
                    Add Size
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add common shoe sizes
                      const commonSizes = ["7", "8", "9", "10", "11", "12"];
                      const newSizes = commonSizes.map((size) => ({
                        size,
                        stock: 0,
                      }));
                      setSizes([...sizes, ...newSizes.filter((s) => !sizes.some((existing) => existing.size === s.size))]);
                    }}
                    title="Add common sizes"
                  >
                    Add Common Sizes
                  </Button>
                </div>
              </div>

              {sizes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No sizes added yet. Each size needs its own stock count.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Example: Size "8" with stock "5", Size "9" with stock "3", etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          placeholder="Size (e.g., 8, 9, 10, 42, etc.)"
                          value={size.size}
                          onChange={(e) => updateSize(index, "size", e.target.value)}
                          className="font-medium"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={size.stock}
                          onChange={(e) => updateSize(index, "stock", parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSize(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
              Any orders containing this product will remain, but the product will no longer be available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

