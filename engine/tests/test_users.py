import datetime
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import users as u


class UserTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.tmp.name, "users.json")

    def tearDown(self):
        self.tmp.cleanup()

    def test_register_grant_and_login(self):
        user, token, err = u.register(self.path, "a@b.com", "password123", "阿澜")
        self.assertIsNone(err)
        self.assertEqual(user["credit"], 100.0)
        self.assertTrue(token)
        # 邮箱不区分大小写
        user2, token2, err2 = u.register(self.path, "A@B.com", "password123")
        self.assertIsNotNone(err2)
        me = u.session_user(self.path, token)
        self.assertEqual(me["email"], "a@b.com")
        login_user, login_token, login_err = u.login(self.path, "a@b.com", "password123")
        self.assertIsNone(login_err)
        self.assertEqual(login_user["id"], user["id"])
        self.assertIsNotNone(login_token)
        bad, _, bad_err = u.login(self.path, "a@b.com", "wrongpass")
        self.assertIsNone(bad)
        self.assertIsNotNone(bad_err)

    def test_validation(self):
        _, _, err = u.register(self.path, "not-an-email", "password123")
        self.assertIn("邮箱", err)
        _, _, err = u.register(self.path, "a@b.com", "short")
        self.assertIn("8", err)

    def test_charge_and_ledger(self):
        user, token, _ = u.register(self.path, "a@b.com", "password123")
        charged = u.charge(self.path, user["id"], 2.1, "生成扣费")
        self.assertAlmostEqual(charged["credit"], 97.9, places=2)
        me, rows = u.ledger(self.path, token)
        self.assertEqual(me["credit"], 97.9)
        self.assertEqual(rows[0]["type"], "charge")
        self.assertEqual(rows[0]["amount"], -2.1)
        self.assertEqual(rows[-1]["type"], "grant")

    def test_prepay_insufficient(self):
        user, _, _ = u.register(self.path, "a@b.com", "password123")
        ok, bal, err = u.prepay(self.path, user["id"], 3.2)
        self.assertTrue(ok)
        self.assertAlmostEqual(bal, 96.8, places=2)
        u.charge(self.path, user["id"], 96.0)
        ok2, bal2, err2 = u.prepay(self.path, user["id"], 3.2)
        self.assertFalse(ok2)
        self.assertIn("积分不足", err2)
        self.assertAlmostEqual(bal2, 0.8, places=2)

    def test_recharge(self):
        _, token, _ = u.register(self.path, "a@b.com", "password123")
        user, entry, err = u.recharge(self.path, token, 137, "演示充值")
        self.assertIsNone(err)
        self.assertAlmostEqual(user["credit"], 237.0, places=2)
        self.assertEqual(entry["type"], "recharge")
        bad, _, err2 = u.recharge(self.path, token, -1)
        self.assertIsNone(bad)
        self.assertIsNotNone(err2)

    def test_logout(self):
        _, token, _ = u.register(self.path, "a@b.com", "password123")
        self.assertIsNotNone(u.session_user(self.path, token))
        u.logout(self.path, token)
        self.assertIsNone(u.session_user(self.path, token))

    def test_vip_levels(self):
        user, token, _ = u.register(self.path, "a@b.com", "password123")
        self.assertEqual(user["vip"], 0)
        u1, _, err = u.recharge(self.path, token, 137)
        self.assertIsNone(err)
        self.assertEqual(u1["vip"], 1)
        u2, _, _ = u.recharge(self.path, token, 2055)
        self.assertEqual(u2["vip"], 2)
        u3, _, _ = u.recharge(self.path, token, 10958)
        self.assertEqual(u3["vip"], 3)

    def test_checkin_once_per_day(self):
        _, token, _ = u.register(self.path, "a@b.com", "password123")
        user, entry, err, streak = u.checkin(self.path, token)
        self.assertIsNone(err)
        self.assertEqual(streak, 1)
        self.assertEqual(entry["amount"], 5.0)
        self.assertEqual(entry["type"], "checkin")
        self.assertEqual(user["credit"], 105.0)
        user2, entry2, err2, streak2 = u.checkin(self.path, token)
        self.assertIsNone(user2)
        self.assertIn("已经签到", err2)
        self.assertEqual(streak2, 1)
        user3, state = u.checkin_status(self.path, token)
        self.assertTrue(state["checkedToday"])
        self.assertEqual(state["streak"], 1)

    def test_checkin_seventh_day_bonus(self):
        user, token, _ = u.register(self.path, "a@b.com", "password123")
        data = u.load(self.path)
        today = datetime.date.fromisoformat(u._today())
        for i in range(1, 7):
            day = (today - datetime.timedelta(days=i)).isoformat()
            u._add_entry(data, user["id"], "checkin", 5, "第%d天" % (7 - i), day=day)
        u.save(self.path, data)
        _, state = u.checkin_status(self.path, token)
        self.assertFalse(state["checkedToday"])
        self.assertEqual(state["streak"], 6)
        self.assertEqual(state["rewardNext"], 25.0)
        user2, entry, err, streak = u.checkin(self.path, token)
        self.assertIsNone(err)
        self.assertEqual(streak, 7)
        self.assertEqual(entry["amount"], 25.0)
        self.assertEqual(user2["credit"], 100.0 + 30.0 + 25.0)


if __name__ == "__main__":
    unittest.main()
