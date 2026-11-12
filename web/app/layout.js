import "./globals.css";

export const metadata = {
  title: "额度池 · 连续生成控制台",
  description: "账号池轮换生成：一条提示词，自动跨号打满全部余额",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
