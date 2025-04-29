"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Product } from "../page";
import { useMutationCreateProduct } from "@/hooks/product/useMutationCreateProduct";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateProductPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<Product>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Function to handle file input and preview image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { mutate, isPending } = useMutationCreateProduct({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch.products"] });
      toast.success("Product Successfulyy created", {
        position: "top-right",
      });
      router.push("/");
    },
    onError: (err: any) => {
      toast.error("Error While Creating Product", {
        position: "top-right",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formData: any = new FormData();
    formData.append("name", data.name);
    formData.append("price", parseInt(data.price)); // tidak perlu parseInt jika backend sudah handle
    formData.append("description", data.description);

    if (selectedImage) {
      formData.append("image", selectedImage);
    } else {
      console.log("Image not found.");
    }

    mutate(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl mb-5">Add Product</h1>
        </div>
        <hr />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full max-w-sm">
            <label htmlFor="name" className="mb-2 block">
              Product Name
            </label>
            <Input
              {...register("name")}
              type="text"
              name="name"
              id="name"
              placeholder="Product Name..."
            />
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="price" className="mb-2 block">
              Price
            </label>
            <Input
              type="number"
              {...register("price")}
              name="price"
              id="price"
              placeholder="Product Price..."
            />
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="description" className="mb-2 block">
              Product Description
            </label>
            <Input
              type="text"
              {...register("description")}
              id="description"
              name="description"
              placeholder="Product Description..."
            />
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="image" className="mb-2 block">
              Product Image
            </label>

            <Input
              id="image"
              name="image"
              type="file"
              onChange={(e: any) => {
                handleImageChange(e); // preview
                setSelectedImage(e.target.files?.[0]); // simpan file
              }}
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="w-full max-w-sm mt-4">
              <label className="mb-2 block">Image Preview</label>
              <img
                src={imagePreview}
                alt="Image Preview"
                className="w-full h-auto rounded-lg border-2 border-gray-300"
              />
            </div>
          )}
        </div>
        <div className="flex mt-3 gap-4">
          <Button type="submit">
            {isPending ? "Submitting..." : "Submit"}
          </Button>
          <Link href="/">
            <Button className="mb-2 cursor-pointer" variant="outline">
              Kembali
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
