"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFetchDetailProduct } from "@/hooks/product/useFetchDetalProduct";
import { useMutationUpdateProduct } from "@/hooks/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const EditProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { data: product, isLoading, isFetching } = useFetchDetailProduct(id);

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
      router.push("/");
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
    mutate({ id, formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Setelah semua hook dideklarasikan, baru bisa kondisional render
  if (isLoading || isFetching) return <div>Loading...</div>;
  if (!product) return <div>Product Not Available</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl mb-5">Update Product ({product?.name})</h1>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label>Name</label>
          <input
            className="w-full border px-2 py-1"
            {...register("name", { required: true })}
          />
          {errors.name && <p className="text-red-500">Name is required</p>}
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            className="w-full border px-2 py-1"
            {...register("price", { required: true })}
          />
          {errors.price && <p className="text-red-500">Price is required</p>}
        </div>

        <div>
          <label>Description</label>
          <textarea
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
        <div className="flex space-x-4 mt-2">
          {previewImage ? (
            <div>
              <p className="text-sm">New Image Preview:</p>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto rounded-lg border-2 border-gray-300"
              />
            </div>
          ) : (
            product?.image && (
              <div>
                <p className="text-sm">Current Image:</p>
                <img
                  src={product.image}
                  alt="Current"
                  className="w-full h-auto rounded-lg border-2 border-gray-300"
                />
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex mt-3 gap-4">
        <Button type="submit">{isPending ? "Submitting..." : "Submit"}</Button>
        <Link href="/">
          <Button className="mb-2 cursor-pointer" variant="outline">
            Kembali
          </Button>
        </Link>
      </div>
    </form>
  );
};

export default EditProductPage;
