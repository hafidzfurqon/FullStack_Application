// useMutationCreateProduct.tsx
import axiosInstance, { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationCreateProduct = ({ onSuccess, onError }: any) => {
  return useMutation({
    mutationKey: ["add.products"],
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post(
        endpoints.products.create,
        formData
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};
