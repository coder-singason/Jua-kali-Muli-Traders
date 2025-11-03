import { useQuery } from "@tanstack/react-query";

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  brand?: string;
  color?: string;
  material?: string;
  page?: string;
  limit?: string;
}

interface ProductsResponse {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for products
  });
}

