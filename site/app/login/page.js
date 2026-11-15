import { redirect } from "next/navigation";
import { requirePass } from "../../lib/gate";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  const s = sp.s ? `?s=${encodeURIComponent(String(sp.s))}` : "";
  redirect(`/sign-in${s}`);
}
