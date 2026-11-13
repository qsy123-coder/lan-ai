import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import memory as m


class ExtractTest(unittest.TestCase):
    def test_extracts_setting(self):
        h = [{"role": "user", "content": "以后私底下叫我主人，有外人在的时候叫哥哥。"}]
        pins = m.extract_pins(h)
        self.assertEqual(len(pins), 1)
        self.assertIn("主人", pins[0]["text"])
        self.assertEqual(pins[0]["source"], "auto")

    def test_ignores_question(self):
        self.assertEqual(m.extract_pins([{"role": "user", "content": "你在干什么呢？"}]), [])

    def test_multi_sentence_probe_not_pin(self):
        """「现在该怎么称呼我？我们约定了什么？」是追问，不是设定。"""
        line = "现在该怎么称呼我？我们约定了什么？用一句话回答。"
        self.assertEqual(m.extract_pins([{"role": "user", "content": line}]), [])

    def test_question_with_setting_word_not_pin(self):
        """问句里带「以后/约定」也不能当设定。"""
        line = "以后的剧情会怎么走？我们约定过什么？"
        self.assertEqual(m.extract_pins([{"role": "user", "content": line}]), [])

    def test_ignores_assistant(self):
        h = [{"role": "assistant", "content": "以后我都叫你主人。"}]
        self.assertEqual(m.extract_pins(h), [])

    def test_dedup_similar(self):
        p1 = m.extract_pins([{"role": "user", "content": "记住：私下叫主人。"}])
        p2 = m.extract_pins([{"role": "user", "content": "记住，私下叫主人"}])
        merged = m.merge_pins(p1, p2)
        self.assertEqual(len(merged), 1)

    def test_limit_and_manual_kept(self):
        existing = [{"text": "手动规则", "source": "manual", "id": m.pin_id("手动规则")}]
        incoming = [{"text": "自动设定%d" % i} for i in range(40)]
        merged = m.merge_pins(existing, incoming)
        self.assertLessEqual(len(merged), m.MAX_PINS)
        self.assertTrue(any(p["source"] == "manual" for p in merged))
        self.assertIn("手动规则", [p["text"] for p in merged])

    def test_chatter_not_a_setting(self):
        """日常台词里的「哥哥/主人」不是设定，不能落锚点。"""
        for line in ["哥哥，我回来了。", "主人……抱抱我嘛。", "哥哥今天好帅。",
                     "主人，我饿了。", "哥哥你别走。"]:
            self.assertEqual(
                m.extract_pins([{"role": "user", "content": line}]), [],
                "误抽：%s" % line)

    def test_weak_marker_with_directive_is_pin(self):
        """没有强触发词，但「称呼指令」明确时仍要识别。"""
        pins = m.extract_pins(
            [{"role": "user", "content": "私下只有我们两人时，她叫我主人。"}])
        self.assertEqual(len(pins), 1)
        self.assertIn("叫我主人", pins[0]["text"])
        self.assertEqual(pins[0]["weight"], 1)

    def test_rule_survives_chatter(self):
        """20 条不同的日常台词不能把最早的真规则挤出上限。"""
        real = m.extract_pins(
            [{"role": "user", "content": "以后私底下叫我主人，有别人在叫哥哥。"}])
        chatter = [{"role": "user", "content": s} for s in [
            "哥哥，我回来了。", "主人……抱抱我嘛。", "哥哥今天好帅。", "主人，我饿了。",
            "哥哥你别走。", "主人最好了。", "哥哥，外面下雨了。", "主人，我想你了。",
            "哥哥，你先吃。", "主人，晚安。", "哥哥，我冷。", "主人，亲一下。",
            "哥哥，抱我。", "主人，你今天好凶。", "哥哥，看我。", "主人，我错了。",
            "哥哥，陪着我。", "主人，别生气。", "哥哥，我害怕。", "主人，摸摸头。",
        ] * 2]
        merged = m.merge_pins(real, m.extract_pins(chatter))
        self.assertTrue(any("以后私底下" in p["text"] for p in merged),
                        "真规则被日常台词挤掉了")
        self.assertLessEqual(len(merged), m.MAX_PINS)

    def test_weak_pins_evicted_first(self):
        """即使弱锚点已经存在，超限时也先淘汰弱、保住强规则。"""
        weak = [{"text": "弱规则%d" % i, "source": "auto", "weight": 1,
                 "id": m.pin_id("弱规则%d" % i)} for i in range(30)]
        real = [{"text": "真规则", "source": "auto", "weight": 2,
                 "id": m.pin_id("真规则")}]
        merged = m.merge_pins(weak, real)
        self.assertIn("真规则", [p["text"] for p in merged])
        self.assertLessEqual(len(merged), m.MAX_PINS)


class ComposeTest(unittest.TestCase):
    @staticmethod
    def history(n):
        return [
            {"role": "user" if i % 2 == 0 else "assistant",
             "content": "第%d条消息" % i + "啊" * 50}
            for i in range(n)
        ]

    def test_order_and_alternation(self):
        mem = {"pinned": [{"text": "私下叫主人"}], "summary": "前情提要"}
        prompts, meta = m.compose_prompts(self.history(40), mem, 32000, 4000)
        self.assertEqual(prompts[0]["role"], "user")
        self.assertEqual(prompts[-1]["role"], "assistant")
        roles = [p["role"] for p in prompts]
        for a, b in zip(roles, roles[1:]):
            self.assertNotEqual(a, b, "角色必须交替")
        self.assertTrue(any("长期设定" in p["content"] for p in prompts))
        self.assertTrue(any("前情摘要" in p["content"] for p in prompts))

    def test_head_preserved(self):
        prompts, _ = m.compose_prompts(self.history(60),
                                       {"pinned": [], "summary": ""}, 16000, 4000)
        self.assertIn("第0条消息", prompts[0]["content"])

    def test_budget_respected(self):
        prompts, meta = m.compose_prompts(self.history(200),
                                          {"pinned": [], "summary": ""}, 16000, 4000)
        total = sum(len(p["content"]) for p in prompts)
        self.assertLessEqual(total, meta["budget"], "不得超出输入预算")

    def test_empty_memory_no_block(self):
        prompts, meta = m.compose_prompts(self.history(10),
                                          {"pinned": [], "summary": ""}, 32000, 4000)
        self.assertEqual(meta["memory"], 0)
        self.assertFalse(any("长期设定" in p["content"] for p in prompts))

    def test_memory_only_history(self):
        prompts, _ = m.compose_prompts([], {"pinned": [{"text": "规则"}], "summary": ""},
                                       32000, 4000)
        self.assertEqual([p["role"] for p in prompts], ["user", "assistant"])


class ContentPrefixTest(unittest.TestCase):
    """上游只认 content，记忆必须能拼进当前消息。"""

    def test_empty_memory(self):
        self.assertEqual(m.content_prefix(None), "")
        self.assertEqual(m.content_prefix({"pinned": [], "summary": ""}), "")

    def test_pins_and_summary_included(self):
        txt = m.content_prefix({"pinned": [{"text": "沈棠是我的小狗，叫她小狗必须喊主人"}],
                                "summary": "前情提要"})
        self.assertIn("长期设定", txt)
        self.assertIn("沈棠是我的小狗", txt)
        self.assertIn("执行要求", txt)
        self.assertIn("前情摘要", txt)
        self.assertTrue(txt.endswith("\n\n"), "前缀必须自带换行，避免与用户正文粘连")

    def test_capped(self):
        txt = m.content_prefix({"pinned": [{"text": "x" * 5000}], "summary": "y" * 5000})
        self.assertLessEqual(len(txt), 900 + 2)


class LongConversationTest(unittest.TestCase):
    def test_rule_survives_50_rounds(self):
        """第 5 轮下的称呼规则，50 轮后仍必须出现在注入内容里。"""
        mem = m.default_memory(1)
        history = []
        for i in range(50):
            rule = "以后私底下叫我主人，外人面前叫哥哥。" if i == 5 else ""
            user = "第%d轮。%s继续剧情。" % (i, rule) + "啊" * 300
            assistant = "她回应了。" + "嗯" * 500
            history += [{"role": "user", "content": user},
                        {"role": "assistant", "content": assistant}]

            mem["pinned"] = m.merge_pins(
                mem["pinned"], m.extract_pins([{"role": "user", "content": user}]))
            if m.should_summarize(len(history), mem):
                window, end = m.summary_window(history, mem)
                mem["summary"] = m.rule_summary(
                    window, mem["summary"], [p["text"] for p in mem["pinned"]])
                mem["summarizedUpTo"] = end

            prompts, _ = m.compose_prompts(history, mem, 32000, 6000)
            joined = "\n".join(p["content"] for p in prompts)
            if i >= 5:
                self.assertIn("私底下叫我主人", joined, "第 %d 轮规则丢失" % (i + 1))

        self.assertTrue(mem["summary"])
        # 反证：没有记忆层时，50 轮后规则已经不在窗口里
        prompts, _ = m.compose_prompts(history, {"pinned": [], "summary": ""},
                                       32000, 6000)
        self.assertNotIn("私底下叫我主人",
                         "\n".join(p["content"] for p in prompts))


class SummaryTest(unittest.TestCase):
    def test_rule_summary_len(self):
        msgs = [{"role": "user", "content": "x" * 500} for _ in range(20)]
        s = m.rule_summary(msgs, "", ["规则"])
        self.assertLessEqual(len(s), m.SUMMARY_MAX)
        self.assertIn("规则", s)

    def test_should_summarize(self):
        self.assertTrue(m.should_summarize(40, {"summarizedUpTo": 0}))
        self.assertFalse(m.should_summarize(10, {"summarizedUpTo": 0}))
        self.assertFalse(m.should_summarize(40, {"summarizedUpTo": 36}))

    def test_summary_window(self):
        msgs = [{"content": str(i)} for i in range(50)]
        window, end = m.summary_window(msgs, {"summarizedUpTo": 10}, keep_recent=12)
        self.assertEqual(end, 38)
        self.assertEqual(window[0]["content"], "10")
        self.assertEqual(window[-1]["content"], "37")

    def test_clean(self):
        self.assertEqual(m.clean_summary("摘要：abc"), "abc")
        self.assertEqual(len(m.clean_summary("x" * 900)), m.SUMMARY_MAX)

    def test_chunks_cover_all(self):
        msgs = [{"role": "user", "content": "x" * 3000} for _ in range(5)]
        chunks = m.chunk_messages(msgs, 6000)
        self.assertTrue(all(sum(len(x["content"]) for x in ch) <= 6000 for ch in chunks))
        self.assertEqual(sum(len(ch) for ch in chunks), 5)

    def test_summary_prompt_has_recent(self):
        p = m.model_summary_prompt([{"role": "user", "content": "a"}], "旧摘要", ["规则"],
                                   recent=[{"role": "assistant", "content": "当前场景"}])
        self.assertIn("当前场景", p)
        self.assertIn("规则", p)
        self.assertIn("旧摘要", p)


class FileTest(unittest.TestCase):
    def test_roundtrip(self):
        with tempfile.TemporaryDirectory() as d:
            mem = m.default_memory(426322)
            mem["pinned"] = [{"id": "a", "text": "私下叫主人", "source": "manual", "at": 0}]
            mem["summary"] = "前情"
            m.save_memory(d, mem)
            loaded = m.load_memory(d, 426322)
            self.assertEqual(loaded["pinned"][0]["text"], "私下叫主人")
            self.assertEqual(loaded["summary"], "前情")
            self.assertTrue(os.path.exists(m.memory_path(d, 426322)))

    def test_corrupt_file_recovers(self):
        with tempfile.TemporaryDirectory() as d:
            path = m.memory_path(d, 7)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write("{not json")
            loaded = m.load_memory(d, 7)
            self.assertEqual(loaded["pinned"], [])
            self.assertEqual(loaded["summary"], "")


if __name__ == "__main__":
    unittest.main()
