import axios, { InternalAxiosRequestConfig } from "axios";
import { useToken } from "../store/BearerToken";

const req = axios.create({
  baseURL: "http://localhost:3001/",
  headers: {
    "Content-Type": "application/json",
  },
});

req.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    const token = useToken.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
req.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default req;
