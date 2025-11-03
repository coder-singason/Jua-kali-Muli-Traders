"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  userId: string;
  address?: Address;
  onSaved: () => void;
  onCancel: () => void;
}

export function AddressForm({ userId, address, onSaved, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          city: address.city,
          postalCode: address.postalCode || "",
          isDefault: address.isDefault,
        }
      : {
          label: "",
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          postalCode: "",
          isDefault: false,
        },
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    try {
      const url = address
        ? `/api/addresses/${address.id}`
        : "/api/addresses";
      const method = address ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save address");
      }

      toast({
        title: address ? "Address Updated" : "Address Added",
        description: `Your address has been ${address ? "updated" : "saved"} successfully.`,
      });
      onSaved();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">Label (e.g., Home, Work)</Label>
          <Input id="label" {...register("label")} placeholder="Home" />
          {errors.label && (
            <p className="text-sm text-destructive">{errors.label.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
        {errors.addressLine1 && (
          <p className="text-sm text-destructive">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code (Optional)</Label>
          <Input id="postalCode" {...register("postalCode")} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          {...register("isDefault", { valueAsNumber: false })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as default address
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            address ? "Update Address" : "Save Address"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

