import { getLocalStoreToken } from "@/utils/auth";

/** 初始化连接 */
export function initConnect() {
  if (getLocalStoreToken()) {
    // initSSE();
  }
}
