"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { fCurrency } from "@/utils/format-number";
import { useFetchAllProducts } from "@/hooks/product";
import { Skeleton } from "./ui/skeleton";
import { ModeToggle } from "./mode-toggle";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { apiCall } from "@/lib/auth";
import { User } from "@/types/user";

export interface ProductData {
  id: any;
  name: string;
  description: string;
  price: number;
  image: string;
}

export function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  const handleAdd = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: number) => {
    setCart((prev) => {
      const count = prev[id] - 1;
      if (count <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: count };
    });
  };
  const router = useRouter();
  const goToCheckout = () => {
    const selectedProducts = products.filter((p: ProductData) => cart[p.id]);
    const query = encodeURIComponent(
      JSON.stringify(
        selectedProducts.map((p: ProductData) => ({ ...p, qty: cart[p.id] }))
      )
    );

    router.push(`/products/cart?items=${query}`);
  };

  const {
    data: productResponse,
    isLoading,
    isFetching,
  } = useFetchAllProducts({
    page,
    // perPage,
    search: searchTerm,
    sort: "latest",
  });

  const totalPages = Math.ceil((productResponse?.total || 1) / perPage);

  // const products = productResponse?.data || [];
  const products = useMemo(
    () => productResponse?.data || [],
    [productResponse]
  );

  const sortedProducts = useMemo(() => {
    const copiedProducts = [...products];
    return copiedProducts.sort((a: any, b: any) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      return 0;
    });
  }, [products, sortBy]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return sortedProducts;
    return sortedProducts.filter((product: ProductData) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sortedProducts]);

  // Display products (filtered if there's a search term)
  const currentProducts = filteredProducts;

  const logout = async () => {
    try {
      await apiCall.post("/logout");
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success("Logout Successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

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

  console.log(userAuthenticated);

  return (
    <div className="bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <MountainIcon className="h-6 w-6" />
            <span className="font-semibold text-lg">Goodojo commerce</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="w-8">
                  <AvatarImage src="/avatar/avatar.webp" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">
                      {userAuthenticated?.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {userAuthenticated?.email}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Button variant="destructive" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Product Catalog</h1>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Input
              type="search"
              placeholder="Search products..."
              className="bg-background text-foreground border border-input rounded-md px-4 py-2 w-full max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort by:{" "}
                  {sortBy === "low"
                    ? "Price: Low to High"
                    : sortBy === "high"
                    ? "Price: High to Low"
                    : "Default"}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <DropdownMenuRadioItem value="default">
                    Default
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low">
                    Price: Low to High
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="high">
                    Price: High to Low
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ||
          (isFetching && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ))}

        {currentProducts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-md" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: ProductData) => {
            const count = cart[product.id] || 0;
            return (
              <div key={product.id} className="bg-card rounded-lg shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-60 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-base font-semibold">
                      {fCurrency(product.price)}
                    </span>
                    {count > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRemove(product.id)}
                        >
                          -
                        </Button>
                        <span>{count}</span>
                        <Button size="sm" onClick={() => handleAdd(product.id)}>
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handleAdd(product.id)}>
                        Buy
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(cart).length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button className="px-6 py-3" onClick={goToCheckout}>
              <ShoppingCartIcon className="h-6 w-6" /> Checkout (
              {Object.values(cart).reduce((a, b) => a + b, 0)})
            </Button>
          </div>
        )}

        {/* Pagination Controls - Always show if totalPages > 1 */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-2 py-1 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MountainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
