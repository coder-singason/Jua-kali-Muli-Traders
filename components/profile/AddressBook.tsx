"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Address } from "@prisma/client";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AddressBookProps {
  userId: string;
  addresses: Address[];
}

export function AddressBook({ userId, addresses: initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast({
        title: "Address Deleted",
        description: "The address has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      toast({
        title: "Default Address Updated",
        description: "Your default address has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleAddressSaved = () => {
    setIsAdding(false);
    setEditingId(null);
    window.location.reload();
  };

  if (isAdding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add New Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressForm userId={userId} onSaved={handleAddressSaved} onCancel={() => setIsAdding(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Addresses Saved</h3>
            <p className="text-muted-foreground mb-4">
              Add an address to make checkout faster
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            if (editingId === address.id) {
              return (
                <Card key={address.id}>
                  <CardHeader>
                    <CardTitle>Edit Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddressForm
                      userId={userId}
                      address={address}
                      onSaved={handleAddressSaved}
                      onCancel={() => setEditingId(null)}
                    />
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={address.id} className={address.isDefault ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {address.label}
                        {address.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-muted-foreground">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-muted-foreground">{address.addressLine2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {address.city}
                      {address.postalCode && `, ${address.postalCode}`}
                    </p>
                    <p className="text-muted-foreground">{address.phone}</p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={settingDefaultId === address.id}
                      >
                        {settingDefaultId === address.id ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Setting...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Set Default
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(address.id)}
                      disabled={deletingIds.has(address.id) || settingDefaultId === address.id}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingIds.has(address.id) || settingDefaultId === address.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingIds.has(address.id) ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

