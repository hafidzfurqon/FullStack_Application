"use client";
import axios from "axios";

const HOST_API = process.env.NEXT_PUBLIC_HOST_API;

const axiosInstance = axios.create({ baseURL: HOST_API });

export default axiosInstance;
export const endpoints = {
  products: {
    list: "/products",
    detail: "/products", //need id here
    create: "/products",
    update: "/products",
    delete: "/products",
  },
};
