"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiCall } from "@/lib/auth"; // Assuming you have this utility
import { toast } from "sonner";

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  qty: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
}

// Format currency helper
const fCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // You'll need to get this from your auth context or state management
  const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);

  const products: ProductData[] = useMemo(() => {
    try {
      const items = searchParams.get("items");
      return items ? JSON.parse(items) : [];
    } catch (err) {
      return [];
    }
  }, [searchParams]);

  const subtotal = useMemo(() => {
    return products.reduce(
      (acc, product) => acc + product.price * product.qty,
      0
    );
  }, [products]);

  const platformFee = useMemo(() => subtotal * 0.02, [subtotal]);
  const total = useMemo(() => subtotal + platformFee, [subtotal, platformFee]);

  // Get user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiCall.get("/me"); // Adjust endpoint as needed
        setUserAuthenticated(userData.data || userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Please login to continue");
        router.push("/");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
    );
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createOrderRecord = async (
    paymentToken: string,
    paymentResult?: any
  ) => {
    try {
      const response = await apiCall.post("/orders", {
        items: products,
        customer: userAuthenticated,
        paymentToken: paymentToken,
        paymentResult: paymentResult, // KIRIM PAYMENT RESULT
      });

      return response.data;
    } catch (error) {
      console.error("Error creating order record:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!userAuthenticated) {
      toast.error("Please login to continue");
      router.push("/");
      return;
    }

    if (products.length === 0) {
      toast.error("No items to checkout");
      return;
    }

    setIsProcessing(true);

    try {
      // Get payment token from Midtrans
      const res = await apiCall.post("/products/pay", {
        items: products,
        customer: userAuthenticated,
      });

      const data = res;
      const windowType: any = window;

      if (data.success && data.token) {
        // Show Midtrans Snap popup
        windowType?.snap?.pay(data.token, {
          onSuccess: async function (result: any) {
            console.log("Payment success", result);

            try {
              // Create order record with SUCCESS status
              const orderData = await createOrderRecord(data.token, {
                ...result,
                status: "success", 
              });

              toast.success("Payment successful! Order created.");

              // Redirect to order success page
              router.push(
                `/orders/success?orderId=${orderData[0]?.id || "multiple"}`
              );
            } catch (orderError) {
              console.error("Failed to create order record:", orderError);
              // Payment was successful but order creation failed
              toast.error(
                "Payment successful but failed to save order. Please contact support."
              );
            }
          },

          onPending: async function (result: any) {
            console.log("Payment pending", result);

            try {
              // Create order record with PENDING status
              const orderData = await createOrderRecord(data.token, {
                ...result,
                status: "pending", // Explicitly set status to pending
              });

              toast.warning(
                "Payment is pending. Order has been recorded as pending."
              );
              router.push(`/products`);
            } catch (orderError) {
              console.error("Failed to create pending order:", orderError);
              toast.error("Payment pending but failed to save order.");
              router.push("/products");
            }
          },

          onError: async function (result: any) {
            console.error("Payment error", result);

            try {
              // Create order record with REJECTED status untuk payment yang error
              await createOrderRecord(data.token, {
                ...result,
                status: "rejected", // Set status to rejected for payment errors
              });

              toast.error("Payment failed! Order marked as rejected.");
            } catch (orderError) {
              console.error(
                "Failed to create rejected order record:",
                orderError
              );
              toast.error("Payment failed!");
            }

            setIsProcessing(false);
            router.push("/products");
          },

          onClose: async function () {
            console.log("Payment popup closed");

            try {
              // Create order record with CANCELED status untuk user yang cancel
              await createOrderRecord(data.token, {
                status: "canceled", // Set status to canceled when user closes popup
                transaction_status: "canceled",
                fraud_status: "accept",
              });

              toast.info(
                "Payment canceled! Order has been recorded as canceled."
              );
            } catch (orderError) {
              console.error(
                "Failed to create canceled order record:",
                orderError
              );
              toast.info("Payment popup closed!");
            }

            setIsProcessing(false);
            router.push("/products");
          },
        });
      } else {
        throw new Error(data.message || "Failed to get payment token");
      }
    } catch (err: any) {
      console.error("Error in handlePayment:", err);
      toast.error(
        err.response?.data?.message || "Something went wrong during payment"
      );
      setIsProcessing(false);
    }
  };

  if (!userAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center">
          <p className="mb-4">Loading user data...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-lg bg-background shadow-lg sm:w-[600px]">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-medium">Detail Products</h2>
          <div className="text-sm text-muted-foreground">
            Customer: {userAuthenticated.name}
          </div>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[80px_1fr_auto] items-center gap-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                  style={{ aspectRatio: "80/80", objectFit: "cover" }}
                />
                <div className="grid gap-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="text-sm font-medium">
                    {fCurrency(product.price)} x {product.qty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {fCurrency(product.price * product.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-medium">{fCurrency(subtotal)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Platform Fee (2%)</p>
              <p className="font-medium">{fCurrency(platformFee)}</p>
            </div>

            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">Total Order</p>
              <p className="text-lg font-medium">{fCurrency(total)}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={"/products"} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                variant="default"
                className="flex-1"
                onClick={handlePayment}
                disabled={isProcessing || products.length === 0}
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
