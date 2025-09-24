import axios, { InternalAxiosRequestConfig } from "axios";

const req = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL!,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ใช้สำหรับการส่งคุกกี้
  timeout: 10000, // กำหนดเวลา timeout เป็น 10 วินาที
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

function flushQueue(error?: any) {
  pendingQueue.forEach(({ reject, resolve }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  pendingQueue = [];
}

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
  async function (error) {
    const originalRequest = error?.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error?.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => req(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // เรียก refresh-token โดยพึ่งพา cookie (withCredentials:true)
        await req.post("/refresh-token");
        flushQueue();
        return req(originalRequest);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default req;
