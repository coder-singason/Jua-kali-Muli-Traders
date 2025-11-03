"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          parentId: category.parentId || undefined,
        }
      : {
          name: "",
          slug: "",
          parentId: undefined,
        },
  });

  const parentId = watch("parentId");

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          parentId: data.parentId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${category ? "update" : "create"} category`);
      }

      toast({
        title: category ? "Category Updated" : "Category Created",
        description: `Category has been ${category ? "updated" : "created"} successfully.`,
      });
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${category ? "update" : "create"} category`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Edit Category" : "New Category"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register("name")}
              onChange={(e) => {
                register("name").onChange(e);
                handleNameChange(e);
              }}
              placeholder="e.g., Men's Shoes"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="e.g., mens-shoes"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier (auto-generated from name)
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Category (Optional)</Label>
            <Select
              value={parentId || ""}
              onValueChange={(value) => setValue("parentId", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Top-level category)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {category ? "Updating..." : "Creating..."}
                </>
              ) : (
                category ? "Update Category" : "Create Category"
              )}
            </Button>
            <Link href="/admin/categories">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

