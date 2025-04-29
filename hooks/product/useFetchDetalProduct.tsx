import axiosInstance, { endpoints } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useFetchDetailProduct = (id: any | string) => {
  return useQuery({
    queryKey: ["fetch.detail.product"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${endpoints.products.detail}/${id}`
      );
      return response.data;
    },
  });
};
