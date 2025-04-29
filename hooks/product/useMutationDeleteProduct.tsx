import axiosInstance, { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationDeleteProduct = () => {
  return useMutation({
    mutationKey: ["delete.product"],
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        `${endpoints.products.delete}/${id}`
      );
      return response.data;
    },
  });
};
