import React, { Suspense } from "react";
import { ProductPage } from "@/components/ProductPage";

export default function ProductPages() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPage />
    </Suspense>
  );
}
