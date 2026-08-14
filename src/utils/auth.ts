import { Base64 } from "js-base64";

const TOKEN_NAME = import.meta.env.VITE_APP_TOKEN_NAME;
const USER_INFO = import.meta.env.VITE_APP_USER_INFO;

/** 检查用户信息是否存在 */
export function hasUserInfo(): boolean {
  const res = localStorage.getItem(USER_INFO);
  return res != null;
}

/** 获取用户信息 */
export function getLocalStoreUserInfo() {
  const res = localStorage.getItem(USER_INFO);
  if (!res) return null;

  return JSON.parse(Base64.decode(res));
}

/** 设置用户信息 */
export function setUserInfoToLocalStore(uInfo: any) {
  localStorage.setItem(USER_INFO, Base64.encode(JSON.stringify(uInfo)));
}

/** 设置登录Token */
export function setTokenToLocalStore(token: string) {
  document.cookie = `tk=${token}; path=/; max-age=66000`;
  localStorage.setItem(TOKEN_NAME, token);
}

/** 获取登录Token */
export function getLocalStoreToken(): string {
  return localStorage.getItem(TOKEN_NAME) as string;
}

/** 清除用户信息 */
export function delTokenUser() {
  localStorage.removeItem(TOKEN_NAME);
  localStorage.removeItem(USER_INFO);
}

/** 获取角色 */
export function getRole(): string | null {
  const userInfo = getLocalStoreUserInfo();
  if (!userInfo) return null;
  if (!userInfo.roles) return null;
  return userInfo.roles.split(",")[0];
}

/** 是否是超级管理员角色 */
export function isSuperAdmin(): boolean {
  const role = getRole();
  return role === "root";
}
