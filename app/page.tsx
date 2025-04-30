"use client";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/DialogDeleteComponent";
import { useFetchAllProducts } from "@/hooks/product/useFetchAllProducts";
import {
  useMutationCreateProduct,
  useMutationDeleteProduct,
} from "@/hooks/product";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Dialog } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { EditProductDialog } from "@/components/EditProductDialog";
import ProductFormDialog from "@/components/ProductFormDialog";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const { reset } = useForm<Product>();
  // const router = useRouter();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, isFetching } = useFetchAllProducts({
    page,
    // perPage,
    search: searchTerm,
    sort: sortOrder,
  });

  const { mutate, isPending } = useMutationDeleteProduct();

  const { mutate: mutationCreateProduct, isPending: PendingCreatingProduct } =
    useMutationCreateProduct({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fetch.products"] });
        toast.success("Product Successfully created", {
          position: "top-right",
        });
        reset();
        setOpen(false);
      },
      onError: (err: any) => {
        toast.error("Error While Creating Product", {
          position: "top-right",
        });
      },
    });

  const handleConfirmDelete = () => {
    if (!selectedProductId) return;

    mutate(selectedProductId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fetch.products"] });
        toast.success("Product Deleted Successfully", {
          position: "top-right",
        });

        const totalAfterDelete = (data?.total || 0) - 1;
        const totalPagesAfterDelete = Math.ceil(totalAfterDelete / perPage);

        if (page > totalPagesAfterDelete) {
          setPage(Math.max(totalPagesAfterDelete, 1)); // pindah ke page sebelumnya
        }

        setSelectedProductId(null);
      },
      onError: () => {
        toast.error("Failed to delete product");
      },
    });
  };

  const totalPages = Math.ceil((data?.total || 1) / perPage);
  const products = data?.data || [];

  console.log(data);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">Welcome To Catalog Product</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-[180px]"
          />
          <ModeToggle />
          <Select
            value={sortOrder}
            onValueChange={(value: "latest" | "oldest") => {
              setSortOrder(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>

            <ProductFormDialog
              title="Add a product to catalog"
              description="This action will add a new product to your catalog"
              isPending={PendingCreatingProduct}
              onSubmit={mutationCreateProduct}
            />
          </Dialog>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-3">
          Nothing to show here. Try change your keyword or
          check your local env like BACKEND_URL_API.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-14 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {product.description}
                  </TableCell>
                  <TableCell>
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Link href={`/product/${product.id}`}>
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-1" /> Detail
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
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedProductId(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Hapus
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
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
          {selectedProduct && (
            <EditProductDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              product={selectedProduct}
            />
          )}
        </>
      )}
    </>
  );
}
