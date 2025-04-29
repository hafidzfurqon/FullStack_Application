import axiosInstance, { endpoints } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const useFetchAllProducts = () => {
  return useQuery({
    queryKey: ["fetch.products"],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.products.list);
      return response.data;
    },
  });
};
