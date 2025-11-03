"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
}

interface FilterOptions {
  brands: string[];
  colors: string[];
  materials: string[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [material, setMaterial] = useState(searchParams.get("material") || "");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    colors: [],
    materials: [],
  });

  // Flatten categories for select dropdown
  const flattenedCategories: { value: string; label: string }[] = [];
  const flattenCategories = (cats: Category[], prefix = "") => {
    cats.forEach((cat) => {
      flattenedCategories.push({
        value: cat.slug,
        label: prefix + cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, `${cat.name} > `);
      }
    });
  };
  flattenCategories(categories);

  useEffect(() => {
    // Fetch filter options
    fetch("/api/products/filters")
      .then((res) => res.json())
      .then((data) => setFilterOptions(data))
      .catch((error) => console.error("Error fetching filter options:", error));
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (category && category !== "all") params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (featured) params.set("featured", "true");
    if (brand && brand !== "all") params.set("brand", brand);
    if (color && color !== "all") params.set("color", color);
    if (material && material !== "all") params.set("material", material);
    
    // Reset to page 1 when filters change
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setFeatured(false);
    setBrand("");
    setColor("");
    setMaterial("");
    router.push("/products");
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || featured || (brand && brand !== "all") || (color && color !== "all") || (material && material !== "all");

  useEffect(() => {
    // Auto-apply filters when search changes (debounced)
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, brand, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {flattenedCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            {filterOptions.brands.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select value={brand || "all"} onValueChange={(value) => setBrand(value === "all" ? "" : value)}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {filterOptions.brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Filter */}
            {filterOptions.colors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={color || "all"} onValueChange={(value) => setColor(value === "all" ? "" : value)}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    {filterOptions.colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Material Filter */}
            {filterOptions.materials.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select value={material || "all"} onValueChange={(value) => setMaterial(value === "all" ? "" : value)}>
                  <SelectTrigger id="material">
                    <SelectValue placeholder="All Materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {filterOptions.materials.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price (KSh)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price (KSh)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>

            {/* Featured Filter */}
            <div className="space-y-2">
              <Label htmlFor="featured">Filter</Label>
              <Select
                value={featured ? "featured" : "all"}
                onValueChange={(value) => setFeatured(value === "featured")}
              >
                <SelectTrigger id="featured">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={applyFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

