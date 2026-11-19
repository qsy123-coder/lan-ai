import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server as s


class ActiveSiteTest(unittest.TestCase):
    def test_counter(self):
        s.ACTIVE_SITE = 0
        s.site_job_begin()
        self.assertEqual(s.ACTIVE_SITE, 1)
        s.site_job_end()
        self.assertEqual(s.ACTIVE_SITE, 0)


class ChatAffinityTest(unittest.TestCase):
    """notes/052：会话必须钉在一条上游 chat 上，换号只能开空会话。"""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.old_paths = (s.SESSIONS_PATH, s.STATE_PATH)
        s.SESSIONS_PATH = os.path.join(self.tmp, "sessions.json")
        s.STATE_PATH = os.path.join(self.tmp, "webstate.json")

    def tearDown(self):
        s.SESSIONS_PATH, s.STATE_PATH = self.old_paths

    def test_chat_owner_session(self):
        s.save_sessions({
            "426322:sid1": {"cardId": 426322, "sessionId": "sid1",
                            "account": "b1", "chatId": "c1"},
            "426322:sid2": {"cardId": 426322, "sessionId": "sid2",
                            "account": "b2", "chatId": "c2"},
        })
        self.assertEqual(s.chat_owner_session("c2"), (426322, "sid2"))
        self.assertIsNone(s.chat_owner_session("nope"))

    def test_chat_in_use_excludes_own_session(self):
        s.save_sessions({
            "426322:sid1": {"cardId": 426322, "sessionId": "sid1",
                            "account": "b1", "chatId": "c1"},
        })
        s.save_state({"accounts": {}, "stats": {"generated": 0, "spent": 0.0},
                      "site_chats": {
                          "site:b2:426322:sid2": {"account": "b2", "chatId": "c9"},
                          "site:b1:426322:sid1": {"account": "b1", "chatId": "c1"},
                      }})
        self.assertTrue(s.chat_in_use("c1", except_session=None))
        self.assertFalse(s.chat_in_use("c1", except_session=(426322, "sid1")))
        self.assertTrue(s.chat_in_use("c9"))
        self.assertTrue(s.chat_in_use("c9", except_session=(426322, "sid1")))


class FreshChatTest(unittest.TestCase):
    """createByCard 按 cardId 去重，返回旧会话时必须清掉重开（notes/052）。"""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.old_paths = (s.SESSIONS_PATH, s.STATE_PATH)
        self.old_fns = (s.create_chat, s.chat_has_history, s.chat_in_use, s.delete_chat)
        s.SESSIONS_PATH = os.path.join(self.tmp, "sessions.json")
        s.STATE_PATH = os.path.join(self.tmp, "webstate.json")
        s.save_sessions({})

    def tearDown(self):
        s.SESSIONS_PATH, s.STATE_PATH = self.old_paths
        (s.create_chat, s.chat_has_history, s.chat_in_use, s.delete_chat) = self.old_fns

    def test_fresh_chat_with_opening_is_used(self):
        """新建会话自带卡片开场（1 条 assistant），不能当成旧会话删掉。"""
        s.create_chat = lambda cookie, card: ("c1", "")
        s.chat_has_history = lambda cookie, cid: (False, "")
        s.delete_chat = lambda cookie, cid: self.fail("新会话不能删")
        self.assertEqual(s.fresh_chat_for_card("ck", 1), ("c1", None))

    def test_stale_chat_is_deleted_and_recreated(self):
        calls = {"create": 0, "delete": []}

        def create(cookie, card):
            calls["create"] += 1
            return ("c%d" % calls["create"], "")

        s.create_chat = create
        s.chat_has_history = lambda cookie, cid: (cid == "c1", "")
        s.chat_in_use = lambda cid, except_session=None: False
        s.delete_chat = lambda cookie, cid: (calls["delete"].append(cid), (True, ""))[1]
        self.assertEqual(s.fresh_chat_for_card("ck", 1), ("c2", None))
        self.assertEqual(calls["delete"], ["c1"])

    def test_chat_owned_by_other_session_is_not_deleted(self):
        s.create_chat = lambda cookie, card: ("c1", "")
        s.chat_has_history = lambda cookie, cid: (True, "")
        s.chat_in_use = lambda cid, except_session=None: True
        s.delete_chat = lambda cookie, cid: self.fail("不能删别的会话")
        self.assertEqual(s.fresh_chat_for_card("ck", 1),
                         (None, "chat_owned_by_other_session"))

    def test_active_chat_is_never_deleted(self):
        s.create_chat = lambda cookie, card: ("active", "")
        s.chat_has_history = lambda cookie, cid: self.fail("不读也不删")
        s.delete_chat = lambda cookie, cid: self.fail("不能删自己的当前会话")
        self.assertEqual(s.fresh_chat_for_card("ck", 1, active_chat="active"),
                         (None, "active_chat_reused"))


class ChatHasHistoryTest(unittest.TestCase):
    """notes/058：复用的会话可能是「空壳」，只有卡片开场没有 user 消息。"""

    def setUp(self):
        self.old = s.fetch_chat_messages
        self.messages = None
        s.fetch_chat_messages = lambda cookie, cid: (self.messages, "")

    def tearDown(self):
        s.fetch_chat_messages = self.old

    def test_only_opening_is_not_history(self):
        self.messages = [{"role": "assistant", "content": "卡片开场"}]
        self.assertEqual(s.chat_has_history("ck", "c1"), (False, ""))

    def test_user_message_counts_as_history(self):
        self.messages = [{"role": "assistant", "content": "卡片开场"},
                         {"role": "user", "content": "继续"}]
        self.assertEqual(s.chat_has_history("ck", "c1"), (True, ""))

    def test_read_failure_is_none(self):
        self.messages = None
        has_hist, _ = s.chat_has_history("ck", "c1")
        self.assertIsNone(has_hist)


class RecentTurnsTest(unittest.TestCase):
    def test_last_assistant_keeps_tail(self):
        tail = "停在玄关：她把门反锁，回头看你。"
        hist = [{"role": "user", "content": "u" * 300},
                {"role": "assistant", "content": "开头标记" + "b" * 4000 + tail}]
        txt = s.recent_turns_text(hist)
        self.assertIn(tail, txt, "最后一条 assistant 必须保留结尾")
        self.assertNotIn("开头标记", txt, "最后一条 assistant 只留结尾，不留开头")

    def test_user_message_keeps_head_and_tail(self):
        txt = s.recent_turns_text([{"role": "user", "content": "头" + "中" * 2000 + "尾"}])
        self.assertTrue(txt.startswith("用户：头"))
        self.assertTrue(txt.endswith("尾"))
        self.assertIn("……", txt)


class ClipTest(unittest.TestCase):
    def test_short_untouched(self):
        self.assertEqual(s._clip_mid("abc", 10), "abc")

    def test_head_and_tail(self):
        out = s._clip_mid("A" * 100 + "B" * 100, 60)
        self.assertTrue(out.startswith("A"))
        self.assertTrue(out.endswith("B"))
        self.assertLessEqual(len(out), 62)


class SystemReminderStripTest(unittest.TestCase):
    """上游注入 <system-reminder> 场景追踪块，正文里不该露字面标签（notes/063）。"""

    def test_block_removed(self):
        txt = "星屑。* <system-reminder>\n```yaml\n当前场景要素: x\n```\n</system-reminder> 你的拇指"
        out = s._strip_system_reminder(txt)
        self.assertNotIn("system-reminder", out)
        self.assertNotIn("当前场景要素", out)
        self.assertIn("星屑", out)
        self.assertIn("你的拇指", out)

    def test_unclosed_tail_cut(self):
        out = s._strip_system_reminder("正文 <system-reminder> 未闭合")
        self.assertNotIn("system-reminder", out)
        self.assertEqual(out, "正文 ")

    def test_no_block_untouched(self):
        self.assertEqual(s._strip_system_reminder("普通正文"), "普通正文")


if __name__ == "__main__":
    unittest.main()
