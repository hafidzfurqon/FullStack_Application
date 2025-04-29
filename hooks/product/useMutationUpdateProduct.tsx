import axiosInstance, { endpoints } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useMutationUpdateProduct = ({ onSuccess, onError }: any) => {
  return useMutation({
    mutationKey: ["update.products"],
    mutationFn: async ({ id, formData }: { id: any; formData: FormData }) => {
      const response = await axiosInstance.put(
        `${endpoints.products.update}/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};
