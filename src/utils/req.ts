import axios, { InternalAxiosRequestConfig } from "axios";

const req = axios.create({
  baseURL: "http://localhost:3001/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ใช้สำหรับการส่งคุกกี้
  timeout: 10000, // กำหนดเวลา timeout เป็น 10 วินาที
});

req.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
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
