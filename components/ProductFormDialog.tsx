// components/ProductFormDialog.tsx

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface ProductFormProps {
  title: string;
  description: string;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  defaultValues?: {
    name?: string;
    price?: number;
    description?: string;
  };
  onClose?: () => void;
}

type FormFields = {
  name: string;
  price: number;
  description: string;
  image?: FileList; // <- tambahkan ini
};

export default function ProductFormDialog({
  title,
  description,
  onSubmit,
  isPending,
  defaultValues,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      name: defaultValues?.name || "",
      price: defaultValues?.price || undefined,
      description: defaultValues?.description || "",
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      clearErrors("image");
    }
  };

  const internalSubmit = (formDataValues: any) => {
    if (!selectedImage) {
      setError("image", { type: "manual", message: "Image is required" });
      return;
    }

    const formData: any = new FormData();
    formData.append("name", formDataValues.name);
    formData.append("price", parseInt(formDataValues.price));
    formData.append("description", formDataValues.description);
    formData.append("image", selectedImage);

    onSubmit(formData);
    reset();
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(internalSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              {...register("name", { required: "Product name is required" })}
              id="name"
              className="col-span-3"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              type="number"
              {...register("price", { required: "Price is required" })}
              id="price"
              className="col-span-3"
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              {...register("description", {
                required: "Description is required",
              })}
              id="description"
              className="col-span-3"
            />
          </div>
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              onChange={handleImageChange}
              className="col-span-3"
            />
          </div>
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image.message}</p>
          )}

          {imagePreview && (
            <div>
              <Label className="mb-2 block">Image Preview</Label>
              <img
                src={imagePreview}
                alt="Image Preview"
                className="w-full h-42 rounded-lg object-cover border-2 border-gray-300"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Data"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
