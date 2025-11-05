"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  viewType: string;
  alt?: string | null;
}

interface ProductImageViewerProps {
  images: ProductImage[];
  productName: string;
  featured?: boolean;
}

const viewTypeLabels: Record<string, string> = {
  FRONT: "Front View",
  SIDE: "Side View",
  TOP: "Top View",
  BACK: "Back View",
  GENERAL: "General View",
};

export function ProductImageViewer({
  images,
  productName,
  featured,
}: ProductImageViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <ProductImageFallback className="w-full h-full" size="lg" />
      </div>
    );
  }

  const currentImage = images[selectedIndex];
  const groupedByView = images.reduce(
    (acc, img, idx) => {
      const type = img.viewType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({ ...img, originalIndex: idx });
      return acc;
    },
    {} as Record<string, Array<ProductImage & { originalIndex: number }>>
  );

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectByViewType = (viewType: string) => {
    const viewImages = groupedByView[viewType];
    if (viewImages && viewImages.length > 0) {
      setSelectedIndex(viewImages[0].originalIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted group">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || `${productName} - ${viewTypeLabels[currentImage.viewType] || "Product image"}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {featured && (
          <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-lg">
            <span>Featured</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-background/80 hover:bg-background"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-background/80 hover:bg-background"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* View Type Buttons */}
      {Object.keys(groupedByView).length > 1 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupedByView).map(([viewType, viewImages]) => (
            <Button
              key={viewType}
              variant={
                images[selectedIndex].viewType === viewType
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => selectByViewType(viewType)}
              className="text-xs"
            >
              {viewTypeLabels[viewType] || viewType}
              <span className="ml-1 text-xs opacity-75">
                ({viewImages.length})
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted transition-all ${
                selectedIndex === index
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-primary/50"
              }`}
              aria-label={`View ${viewTypeLabels[image.viewType] || "image"} ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

