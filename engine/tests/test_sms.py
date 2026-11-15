import io
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sms


class SmsTest(unittest.TestCase):
    def test_mock_writes_outbox(self):
        with tempfile.TemporaryDirectory() as d:
            ok, detail = sms.send_code("+8613800138000", "123456", d, "login")
            self.assertTrue(ok)
            self.assertEqual(detail, "mock")
            path = os.path.join(d, "sms_outbox.jsonl")
            self.assertTrue(os.path.exists(path))
            rec = json.loads(io.open(path, encoding="utf-8").read().strip())
            self.assertEqual(rec["phone"], "+8613800138000")
            self.assertEqual(rec["code"], "123456")
            self.assertIn("123456", rec["text"])

    def test_mask_phone(self):
        self.assertEqual(sms.mask_phone("+8613800138000"), "+86****000")
        self.assertEqual(sms.mask_phone("12345"), "12***")


if __name__ == "__main__":
    unittest.main()
