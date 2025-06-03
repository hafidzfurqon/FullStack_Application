import { apiCall } from "@/lib/auth";
import { endpoints } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useFetchDetailProduct = (id: any | string) => {
  return useQuery({
    queryKey: ["fetch.detail.product"],
    queryFn: async () => {
      const response = await apiCall.get(`${endpoints.products.detail}/${id}`);
      return response;
    },
  });
};
