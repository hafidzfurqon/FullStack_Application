// useMutationCreateProduct.tsx
import { apiCall } from "@/lib/auth";
import { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationCreateProduct = ({ onSuccess, onError }: any) => {
  return useMutation({
    mutationKey: ["add.products"],
    mutationFn: async (formData: FormData) => {
      const response = await apiCall.post(endpoints.products.create, formData);
      return response;
    },
    onSuccess,
    onError,
  });
};
