"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export type ImageViewType = "FRONT" | "SIDE" | "TOP" | "BACK" | "GENERAL";

export interface ProductImage {
  id?: string;
  url: string;
  viewType: ImageViewType;
  alt?: string;
  sortOrder: number;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

const viewTypeLabels: Record<ImageViewType, string> = {
  FRONT: "Front View",
  SIDE: "Side View",
  TOP: "Top View",
  BACK: "Back View",
  GENERAL: "General View",
};

export function ProductImageUpload({
  images,
  onChange,
}: ProductImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    file: File,
    viewType: ImageViewType,
    index?: number
  ) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const uploadIndex = index !== undefined ? index : images.length;
    setUploadingIndex(uploadIndex);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();

      const newImage: ProductImage = {
        url,
        viewType,
        alt: "",
        sortOrder: uploadIndex,
      };

      if (index !== undefined) {
        // Update existing image
        const updated = [...images];
        updated[index] = newImage;
        onChange(updated);
      } else {
        // Add new image
        onChange([...images, newImage]);
      }

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // Reorder sortOrder
    updated.forEach((img, i) => {
      img.sortOrder = i;
    });
    onChange(updated);
  };

  const updateViewType = (index: number, viewType: ImageViewType) => {
    const updated = [...images];
    updated[index].viewType = viewType;
    onChange(updated);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const updated = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updated.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((img, i) => {
      img.sortOrder = i;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          Product Images *
          <span className="text-xs text-muted-foreground ml-2">
            At least 1 image required
          </span>
        </Label>
        {images.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} uploaded
          </span>
        )}
      </div>

      {/* Uploaded Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative rounded-lg border overflow-hidden bg-muted"
          >
            <div className="relative aspect-square">
              <Image
                src={image.url}
                alt={image.alt || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {uploadingIndex === index && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              <select
                value={image.viewType}
                onChange={(e) =>
                  updateViewType(index, e.target.value as ImageViewType)
                }
                className="w-full text-xs rounded-md border border-input bg-background px-2 py-1.5"
                disabled={uploadingIndex === index}
              >
                {Object.entries(viewTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0 || uploadingIndex === index}
                  className="flex-1 text-xs"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveImage(index, "down")}
                  disabled={
                    index === images.length - 1 || uploadingIndex === index
                  }
                  className="flex-1 text-xs"
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  disabled={uploadingIndex === index}
                  className="flex-1 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload New Image Button */}
        <div className="relative">
          <input
            type="file"
            id={`image-upload-${images.length}`}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file, "GENERAL");
              }
            }}
            disabled={uploadingIndex !== null}
          />
          <label
            htmlFor={`image-upload-${images.length}`}
            className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary cursor-pointer transition-colors bg-muted/50 hover:bg-muted"
          >
            {uploadingIndex === images.length ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Add Image
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      {images.length === 0 && (
        <p className="text-sm text-destructive">
          At least one image is required
        </p>
      )}
    </div>
  );
}

