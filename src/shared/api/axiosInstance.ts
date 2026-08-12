import { ENV } from "@config/env";
import axios, { InternalAxiosRequestConfig } from "axios";
import { ERROR_CODE, getErrorCode } from "./error";

const req = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
    // ngrok free tier requires this header to skip the browser warning interstitial
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // ใช้สำหรับการส่งคุกกี้
  timeout: 30000, // 30s — รองรับ bulk operation / network ช้า
});

// ── Actor token (PIN) ──────────────────────────────────────────────────────
// layer auth ลงทะเบียน getter ไว้ตอน init (useActor.ts) เพื่อกัน shared → features
// circular dependency. ถ้ามี actor token ที่ยังไม่หมดอายุ จะถูกแนบเป็น X-Actor-Token
let getActorToken: () => string | null = () => null;
export function registerActorTokenGetter(fn: () => string | null) {
  getActorToken = fn;
}

// เรียกเมื่อ backend ตอบว่า actor token ใช้ไม่ได้ (ERROR_CODE.ACTOR_TOKEN_INVALID)
// เพื่อล้าง actor ให้ state ฝั่ง UI ตรงกับความจริง → หน้าที่ต้องใช้ PIN จะขอ PIN ใหม่เอง
// ลงทะเบียนจาก useActor.ts ด้วยเหตุผลเดียวกับ getter ข้างบน (กัน circular dependency)
let onActorInvalid: () => void = () => {};
export function registerActorInvalidHandler(fn: () => void) {
  onActorInvalid = fn;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function flushQueue(error?: unknown) {
  pendingQueue.forEach(({ reject, resolve }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  pendingQueue = [];
}

req.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    const actorToken = getActorToken();
    if (actorToken) config.headers.set("X-Actor-Token", actorToken);
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
    const requestUrl = (originalRequest?.url ?? "").toString();

    // If unauthorized
    if (status === 401) {
      // PIN (actor) หมดอายุ ≠ session หมดอายุ — เป็นคนละ identity กัน
      // ถ้าไม่แยก: refresh ที่ไม่ได้แก้อะไรเลย 1 รอบ และถ้า refresh พลาดจะ
      // window.location.replace → reload ทั้งแอป → บิลที่สแกนค้างไว้หายหมด
      // ทั้งที่ผู้ใช้แค่ต้องกด PIN ใหม่
      if (getErrorCode(error) === ERROR_CODE.ACTOR_TOKEN_INVALID) {
        onActorInvalid();
        return Promise.reject(error);
      }

      // Do NOT attempt a token refresh for the auth endpoints themselves. A 401
      // from login / pin-verify is a credential error, not an expired session —
      // refreshing would swallow the real message (e.g. "รหัสผ่านไม่ถูกต้อง") and
      // replace it with the refresh failure. The refresh endpoint is excluded to
      // avoid an infinite loop.
      const isAuthEndpoint = ["/auth/login", "/auth/refresh-token", "/auth/pin/verify"].some(
        (p) => requestUrl.endsWith(p)
      );

      // If we've already retried or it's an auth endpoint, reject immediately
      if (originalRequest?._retry || isAuthEndpoint) {
        return Promise.reject(error);
      }

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
        await req.post("/auth/refresh-token");
        flushQueue();
        return req(originalRequest);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        // Refresh ไม่สำเร็จ — เปลี่ยน path ไปหน้า login (กันลูป)
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          const back = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(`/login?from=${back}`);
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default req;
