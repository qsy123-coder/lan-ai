import Nav from "../../components/Nav";

export const metadata = { title: "关于 · 澜" };

export default function About() {
  return (
    <div className="shell">
      <Nav />
      <div className="page" style={{ paddingTop: 56, paddingBottom: 88 }}>
        <h1 style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.035em", margin: 0 }}>
          关于这个站
        </h1>
        <div className="panel" style={{ marginTop: 24 }}>
          <p style={{ margin: 0, lineHeight: 1.62 }}>
            角色卡来自公开榜单的种子数据，对话由后台额度池统一转发。前端的会话与消息保存在本机浏览器，
            不上传服务器；换号与扣费都在后台完成，这里只负责呈现。
          </p>
          <p style={{ margin: "16px 0 0", color: "rgba(32,41,41,.6)", fontSize: 13 }}>
            设计语言：液态玻璃（纸面 #F3F2ED / 场景 #25414A / 焦点 #557B79）。
          </p>
        </div>
      </div>
    </div>
  );
}
