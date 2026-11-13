import "./globals.css";

export const metadata = {
  title: "澜 · 角色对话",
  description: "液态玻璃风格的角色卡与对话站",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 首屏防闪：HTML 渲染前就写 data-theme。
            localStorage 没有值时跟随系统 prefers-color-scheme。 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `(function(){try{var p=localStorage.getItem('theme');` +
              `var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;` +
              `var t=(p==='dark'||p==='light')?p:(d?'dark':'light');` +
              `document.documentElement.dataset.theme=t;` +
              `window.__tp=(p==='dark'||p==='light')?p:'auto';}catch(e){}}())`,
          }}
        />
      </head>
      <body>
        <div className="scene" aria-hidden="true">
          <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <filter id="glass-warp" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.006 0.01"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                <feGaussianBlur in="noise" stdDeviation="8" result="soft" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="soft"
                  scale="16"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9fd3c9" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#9fd3c9" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* 描边色走 CSS 变量，深色主题下换成低亮度青，不重建渐变 */}
            {Array.from({ length: 26 }).map((_, i) => (
              <path
                key={i}
                d={`M-40 ${40 + i * 34} C 240 ${-30 + i * 40}, 560 ${130 + i * 30}, 860 ${
                  40 + i * 32
                } S 1320 ${-20 + i * 36}, 1500 ${50 + i * 30}`}
                fill="none"
                stroke="url(#line)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
        {children}
      </body>
    </html>
  );
}
