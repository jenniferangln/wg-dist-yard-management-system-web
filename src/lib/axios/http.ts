import axios from "axios";
import { cookies } from "next/headers";

export const http = axios.create({
  baseURL: process.env.API_URL,
});

http.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  if (cookieStore.get("id_token") !== undefined) {
    config.headers.Authorization = `Bearer ${
      cookieStore.get("id_token")?.value
    }`;
  }
  return config;
});