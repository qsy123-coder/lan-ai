// 用户会话 cookie：只存引擎签发的随机 token，不存用户信息。
import { cookies } from "next/headers";

export const SESSION_COOKIE = "lan_sess";
const MAX_AGE = 60 * 60 * 24 * 30;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.SITE_SECURE === "1",
  };
}

export function tokenFromRequest(req) {
  return req.cookies.get(SESSION_COOKIE)?.value || "";
}

export async function tokenFromCookies() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value || "";
}

export function setSession(res, token) {
  res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return res;
}

export function clearSession(res) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
