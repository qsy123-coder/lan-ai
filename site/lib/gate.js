import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PASS = () => process.env.SITE_PASS || "";

/** 口令是否通过（未设置口令时视为公开） */
export function passOk(value) {
  const p = PASS();
  return !p || value === p;
}

/** 服务端页面守卫：未通过则跳 /enter */
export async function requirePass() {
  const p = PASS();
  if (!p) return;
  const c = await cookies();
  if (!passOk(c.get("lg_pass")?.value)) redirect("/enter");
}

/** 路由处理器守卫：返回 true 表示被拦 */
export function denyIfNoPass(req) {
  const p = PASS();
  if (!p) return false;
  return !passOk(req.cookies.get("lg_pass")?.value);
}
