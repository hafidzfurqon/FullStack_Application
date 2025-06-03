import { apiCall } from "@/lib/auth";
import { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationDeleteProduct = () => {
  return useMutation({
    mutationKey: ["delete.product"],
    mutationFn: async (id: string) => {
      const response = await apiCall.delete(
        `${endpoints.products.delete}/${id}`
      );
      return response.data;
    },
  });
};
