"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchAllProducts } from "@/hooks/product/useFetchAllProducts";
import Link from "next/link";
import { ConfirmationDialog } from "@/components/DialogDeleteComponent";
import { useMutationDeleteProduct } from "@/hooks/product";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: "string";
};

export default function Home() {
  const [selectedProductId, setSelectedProductId] = React.useState<
    string | null
  >(null);
  const { data, isLoading, isFetching } = useFetchAllProducts();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutationDeleteProduct();

  const handleConfirmDelete = () => {
    if (!selectedProductId) return;

    mutate(selectedProductId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fetch.products"] });
        toast.success("Product Deleted Successfully", {
          position: "top-right",
        });
        setSelectedProductId(null);
      },
      onError: (err: any) => {
        console.error(err);
        toast.error("Failed to delete product");
      },
    });
  };

  if (isLoading || isFetching) {
    return <div>Loading....</div>;
  }

  if (!data) {
    return <div>Product Is Not Available</div>;
  }

  console.log(data);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-2xl mb-5">Welcome To E-Commerce Product</h1>
        <Link href="/create">
          <Button className="mb-2 cursor-pointer">Tambah Produk</Button>
        </Link>
      </div>
      <hr />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {data.map((product: Product, idx: number) => (
          <Card key={idx} className="flex flex-col">
            <img
              src={product?.image}
              alt={product?.name}
              className="object-cover w-full h-48 rounded-t"
            />
            <CardHeader>
              <CardTitle>{product?.name}</CardTitle>
              <CardDescription>{product?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                Rp {product?.price.toLocaleString("id-ID")}
              </p>
            </CardContent>
            <div className="flex flex-col gap-2 md:flex-row items-center">
              <Link href={`/edit/${product?.id}`}>
                <Button className="mx-2 cursor-pointer" variant="outline">
                  Update Product
                </Button>
              </Link>

              <ConfirmationDialog
                title="Hapus Produk?"
                description={`Anda yakin ingin menghapus produk "${product.name}"?`}
                onConfirm={handleConfirmDelete}
                isPending={isPending && selectedProductId === product.id}
                confirmText="Ya, hapus"
                cancelText="Batal"
                triggerButton={
                  <Button
                    className="mx-2 cursor-pointer"
                    variant="destructive"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    Delete Product
                  </Button>
                }
              />
            </div>
            <Link href={`/product/${product?.id}`}>
              <Button className="w-full">See Detail</Button>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
