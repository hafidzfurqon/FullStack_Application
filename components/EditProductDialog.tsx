"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutationUpdateProduct } from "@/hooks/product";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/app/page";
import { Textarea } from "./ui/textarea";

export const EditProductDialog = ({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}) => {
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("price", product.price);
      setValue("description", product.description);
    }
  }, [product, setValue]);

  const { mutate, isPending } = useMutationUpdateProduct({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch.products"] });
      toast.success("Product successfully updated", { position: "top-right" });
      onOpenChange(false); // Tutup dialog
    },
    onError: () => {
      toast.error("Error while updating product", { position: "top-right" });
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }
    mutate({ id: product.id, formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Product ({product.name})</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label>Name</label>
              <Input
                className="w-full border px-2 py-1"
                {...register("name", { required: true })}
              />
              {errors.name && <p className="text-red-500">Name is required</p>}
            </div>

            <div>
              <label>Price</label>
              <Input
                type="number"
                className="w-full border px-2 py-1"
                {...register("price", { required: true })}
              />
              {errors.price && (
                <p className="text-red-500">Price is required</p>
              )}
            </div>

            <div>
              <label>Description</label>
              <Textarea
                className="w-full border px-2 py-1"
                {...register("description", { required: true })}
              />
              {errors.description && (
                <p className="text-red-500">Description is required</p>
              )}
            </div>

            <div>
              <label>Image</label>
              <Input
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={handleImageChange}
              />
            </div>

            <div>
              {previewImage ? (
                <>
                  <p className="text-sm">New Image Preview:</p>
                  <img
                    src={previewImage}
                    className="w-full h-auto border rounded"
                    alt="Preview"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm">Current Image:</p>
                  <img
                    src={product.image}
                    className="w-full h-auto border rounded"
                    alt="Current"
                  />
                </>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
