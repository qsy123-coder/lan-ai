import Nav from "../../components/Nav";
import SignInClient from "../../components/SignInClient";
import { requirePass } from "../../lib/gate";
import "../account.css";
import "./sign-in.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "登录 · 澜" };

export default async function SignInPage({ searchParams }) {
  await requirePass();
  const sp = (await searchParams) || {};
  return (
    <div className="shell">
      <Nav />
      <main className="page signin-page">
        <SignInClient
          initialMode={(sp.s || "login").toString()}
          next={(sp.next || "/").toString()}
        />
      </main>
    </div>
  );
}
