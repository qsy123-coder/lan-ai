import Nav from "../../components/Nav";
import LoginForm from "../../components/LoginForm";
import { requirePass } from "../../lib/gate";
import "../account.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "登录 · 澜" };

export default async function LoginPage() {
  await requirePass();
  return (
    <div className="shell">
      <Nav />
      <LoginForm />
    </div>
  );
}
