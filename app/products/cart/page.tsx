import { CheckoutPage } from "@/components/cart-checkout";
import React, { Suspense } from "react";

export default function CartCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading Checkout...</div>}>
      <CheckoutPage />;
    </Suspense>
  );
}
