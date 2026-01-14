"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ProductDetail {
  id?: string;
  label: string;
  value: string;
  sortOrder: number;
}

interface ProductDetailsManagerProps {
  details: ProductDetail[];
  onChange: (details: ProductDetail[]) => void;
}

// Suggested product details - these are just templates to help admins
// Admins can use these as starting points or create their own
const suggestedDetails = [
  { label: "Material", value: "Leather" },
  { label: "Sole Material", value: "Rubber" },
  { label: "Closure", value: "Lace-up" },
  { label: "Style", value: "Casual" },
  { label: "Season", value: "All Season" },
  { label: "Origin", value: "Made in Kenya" },
  { label: "Care Instructions", value: "Wipe clean with damp cloth" },
  { label: "Weight", value: "0.5 kg" },
  { label: "Packaging", value: "Original Box" },
];

export function ProductDetailsManager({
  details,
  onChange,
}: ProductDetailsManagerProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  const addDetail = () => {
    if (!newLabel.trim() || !newValue.trim()) {
      toast({
        title: "Invalid input",
        description: "Both label and value are required",
        variant: "destructive",
      });
      return;
    }

    const newDetail: ProductDetail = {
      label: newLabel.trim(),
      value: newValue.trim(),
      sortOrder: details.length,
    };

    onChange([...details, newDetail]);
    setNewLabel("");
    setNewValue("");
  };

  const removeDetail = (index: number) => {
    const updated = details.filter((_, i) => i !== index);
    updated.forEach((detail, i) => {
      detail.sortOrder = i;
    });
    onChange(updated);
  };

  const updateDetail = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const updated = [...details];
    updated[index][field] = value;
    onChange(updated);
  };

  const moveDetail = (index: number, direction: "up" | "down") => {
    const updated = [...details];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updated.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((detail, i) => {
      detail.sortOrder = i;
    });
    onChange(updated);
  };

  const handleUseSuggestion = (suggestion: { label: string; value: string }) => {
    setNewLabel(suggestion.label);
    setNewValue(suggestion.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Product Details</Label>
        <span className="text-sm text-muted-foreground">
          {details.length} detail{details.length !== 1 ? "s" : ""} added
        </span>
      </div>

      {/* Existing Details */}
      <div className="space-y-2">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex gap-2 items-start p-3 rounded-lg border bg-card"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-move"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={detail.label}
                onChange={(e) => updateDetail(index, "label", e.target.value)}
                placeholder="Label (e.g., Material)"
                className="text-sm"
              />
              <Input
                value={detail.value}
                onChange={(e) => updateDetail(index, "value", e.target.value)}
                placeholder="Value (e.g., Leather)"
                className="text-sm"
              />
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveDetail(index, "up")}
                disabled={index === 0}
                className="h-8 w-8 p-0"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveDetail(index, "down")}
                disabled={index === details.length - 1}
                className="h-8 w-8 p-0"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeDetail(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Detail */}
      <div className="space-y-2 p-4 rounded-lg border border-dashed">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., Material)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDetail();
              }
            }}
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value (e.g., Leather)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDetail();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDetail}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Detail
          </Button>

          {/* Quick Suggestions */}
          <div className="flex gap-1 flex-wrap">
            {suggestedDetails
              .filter((s) => !details.some((d) => d.label === s.label))
              .slice(0, 3)
              .map((suggestion, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="text-xs h-7"
                >
                  {suggestion.label}
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* All Suggestions */}
      {details.length === 0 && (
        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedDetails.map((suggestion, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewLabel(suggestion.label);
                  setNewValue(suggestion.value);
                }}
                className="text-xs"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

