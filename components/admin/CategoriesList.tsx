"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { CategoryActions } from "@/components/admin/CategoryActions";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent: {
    id: string;
    name: string;
  } | null;
  _count: {
    products: number;
    children: number;
  };
}

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories: initialCategories }: CategoriesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    router.push(`/admin/categories?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/admin/categories");
  };

  // Filter categories client-side if search is provided
  const filteredCategories = search.trim()
    ? initialCategories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.slug.toLowerCase().includes(search.toLowerCase()) ||
        (category.parent && category.parent.name.toLowerCase().includes(search.toLowerCase()))
      )
    : initialCategories;

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by category name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {search && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearSearch}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No categories found matching your search." : "No categories yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      {category.parent && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({category.parent.name})
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <CategoryActions category={category} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="font-mono text-xs">{category.slug}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-semibold">{category._count.products}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subcategories:</span>
                      <span className="font-semibold">{category._count.children}</span>
                    </div>
                  </div>
                  {category.parent && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Parent Category:</span>
                        <span className="font-medium">{category.parent.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

