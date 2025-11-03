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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ProductImageUpload, type ProductImage } from "@/components/admin/ProductImageUpload";
import { ProductDetailsManager, type ProductDetail } from "@/components/admin/ProductDetailsManager";
import { X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  stock: z.number().int().nonnegative().default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ size: string; stock: number }>>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        // Fetch all categories with hierarchy indication for product selection
        const response = await fetch("/api/categories?all=true");
        if (!response.ok) throw new Error("Failed to load categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [toast]);

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

  const onSubmit = async (data: ProductFormData) => {
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
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => img.url), // Legacy support
          productImages: images,
          productDetails: details,
          sizes: sizes.filter((s) => s.size && s.stock > 0),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to create product");
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        <h1 className="text-3xl font-bold">Add New Product</h1>
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
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register("brand")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Total Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
              />
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

            {/* Product Images */}
            <div className="space-y-4 border-t pt-4">
              <ProductImageUpload images={images} onChange={setImages} />
            </div>

            {/* Product Details */}
            <div className="space-y-4 border-t pt-4">
              <ProductDetailsManager details={details} onChange={setDetails} />
            </div>

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
                        Creating...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

