"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFetchDetailProduct } from "@/hooks/product/useFetchDetalProduct";
// import { Badge } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import React from "react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading, isFetching } = useFetchDetailProduct(id);

  if (isLoading || isFetching) {
    return <div>Loading....</div>;
  }

  if (!product) {
    return <div>Product Is Not Available</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Card className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <img
            src={product?.image}
            alt={product?.name}
            width={500}
            height={500}
            className="rounded-xl object-cover w-full h-auto"
          />
        </div>
        <CardContent className="flex-1 space-y-4 pt-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold text-green-600">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <Separator />

          <p className="max-w-md overflow-auto break-words">
            {product.description}
          </p>
          <Link href={"/dashboard/products"}>
            <Button className="cursor-pointer">Kembali</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
