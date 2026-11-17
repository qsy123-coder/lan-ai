import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server as s


def _msgs(n=20):
    return [{"role": "user" if i % 2 == 0 else "assistant",
             "content": "第%d条：剧情推进，伊一在玄关跪下。" % i} for i in range(n)]


GOOD = ("暑假的夜晚，伊一在玄关跪下，主动解开你的裤子，称呼你为主人；"
        "两人约定回家后继续，结衣线尚未收束，门外传来脚步声。")


class SummaryAccountTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.old_mem = s.MEMORY_DIR
        self.old_ensure = s.ensure_chat
        self.old_generate = s.generate
        s.MEMORY_DIR = self.tmp
        s.ensure_chat = lambda st, pool, name, emit: ("chat-" + name, 426322)
        self.calls = []

    def tearDown(self):
        s.MEMORY_DIR = self.old_mem
        s.ensure_chat = self.old_ensure
        s.generate = self.old_generate

    def _state(self, credits):
        return {"accounts": {n: {"credit": c} for n, c in credits.items()},
                "stats": {"generated": 0, "spent": 0.0}, "site_chats": {}}

    def test_accounts_ordering_and_filter(self):
        st = self._state({"a1": 10, "a2": 50, "a3": 1, "a4": 30})
        st["accounts"]["a2"]["disabled"] = True
        pool = {n: {"cookie": n} for n in st["accounts"]}
        got = s.summary_accounts(pool, st, "a1", limit=3)
        self.assertEqual(got[0], "a1")           # 原号优先
        self.assertNotIn("a2", got)              # disabled 排除
        self.assertNotIn("a3", got)              # 余额不足排除
        self.assertEqual(got[1], "a4")           # 其余按余额降序

    def test_fallback_to_funded_account(self):
        st = self._state({"broke": 0.5, "rich": 20})
        pool = {"broke": {"cookie": "broke"}, "rich": {"cookie": "rich"}}

        def fake_generate(cookie, *a, **k):
            self.calls.append(cookie)
            if cookie == "broke":
                return {"status": "exhausted", "reason": "upgrade_needed"}
            return {"status": "ok", "text": GOOD}

        s.generate = fake_generate
        mem = s.memlib.default_memory(426322)
        mem["sessionId"] = "sid-fb"
        out = s.maybe_summarize(pool, "broke", st, 426322, mem, _msgs())
        self.assertIn("玄关", out["summary"])
        self.assertEqual(self.calls, ["rich"])   # 低余额号根本没被调用
        saved = s.memlib.load_memory(self.tmp, 426322, "sid-fb")
        self.assertTrue(saved["summaryHash"])

    def test_content_failure_does_not_switch(self):
        st = self._state({"a1": 20, "a2": 20})
        pool = {"a1": {"cookie": "a1"}, "a2": {"cookie": "a2"}}

        def fake_generate(cookie, *a, **k):
            self.calls.append(cookie)
            return {"status": "ok", "text": "抱歉，我无法完成这个摘要。"}

        s.generate = fake_generate
        mem = s.memlib.default_memory(426322)
        mem["sessionId"] = "sid-ref"
        out = s.maybe_summarize(pool, "a1", st, 426322, mem, _msgs())
        self.assertEqual(self.calls, ["a1"])     # 拒答是内容问题，不换号
        self.assertNotIn("无法完成", out["summary"])
        self.assertIn("他：", out["summary"])    # 规则兜底

    def test_all_accounts_broke_logs_rule_fallback(self):
        st = self._state({"a1": 0.5, "a2": 0.5})
        pool = {"a1": {"cookie": "a1"}, "a2": {"cookie": "a2"}}
        s.generate = lambda *a, **k: {"status": "exhausted", "reason": "upgrade_needed"}
        mem = s.memlib.default_memory(426322)
        mem["sessionId"] = "sid-none"
        out = s.maybe_summarize(pool, "a1", st, 426322, mem, _msgs())
        self.assertIn("他：", out["summary"])
        self.assertEqual(out.get("summarizedUpTo"), 0)  # 失败不推进


if __name__ == "__main__":
    unittest.main()
