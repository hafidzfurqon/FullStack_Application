import axiosInstance, { endpoints } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

type FetchParams = {
  page: number;
  search: string;
  sort: "latest" | "oldest" ;
};

export const useFetchAllProducts = ({ page, search, sort }: FetchParams) => {
  return useQuery({
    queryKey: ["fetch.products", page, search, sort],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.products.list, {
        params: { page, search, sort },
      });
      return response.data;
    },
  });
};
