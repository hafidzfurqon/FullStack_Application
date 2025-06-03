import { apiCall } from "@/lib/auth";
import { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationUpdateProduct = ({ onSuccess, onError }: any) => {
  return useMutation({
    mutationKey: ["update.products"],
    mutationFn: async ({ id, formData }: { id: any; formData: FormData }) => {
      const response = await apiCall.put(
        `${endpoints.products.update}/${id}`,
        formData,
      );
      return response;
    },
    onSuccess,
    onError,
  });
};
