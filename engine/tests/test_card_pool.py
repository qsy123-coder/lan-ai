import io
import json
import os
import sys
import tempfile
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server as s


class CardPoolTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.path = os.path.join(self.tmp, "cards.json")
        self.old = {k: os.environ.get(k) for k in ("CARDS_FILE", "CARD_POOL_LIMIT")}
        os.environ["CARDS_FILE"] = self.path
        os.environ["CARD_POOL_LIMIT"] = "4"

    def tearDown(self):
        for k, v in self.old.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v

    def write(self, rows):
        with io.open(self.path, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False)

    def test_popular_then_newest_then_fallback(self):
        self.write([
            {"id": 1, "name": "old-hot", "popularity": 100, "likes": 5,
             "publishedAt": "2025-01-01T00:00:00Z"},
            {"id": 2, "name": "new-cold", "popularity": 1, "likes": 1,
             "publishedAt": "2026-11-01T00:00:00Z"},
            {"id": 3, "name": "mid", "popularity": 50, "likes": 9,
             "publishedAt": "2026-06-01T00:00:00Z"},
            {"id": 4, "name": "newest", "popularity": 0, "likes": 0,
             "publishedAt": "2026-11-10T00:00:00Z"},
        ])
        ids = s.card_candidates()
        # 70% × 4 = 2 张按热度：1、3；再按最新补到 4：4、2
        self.assertEqual(ids[:4], [1, 3, 4, 2])
        self.assertEqual(ids[4:], list(s.FALLBACK_CARDS))

    def test_missing_file_falls_back(self):
        os.environ["CARDS_FILE"] = os.path.join(self.tmp, "nope.json")
        self.assertEqual(s.card_candidates(), list(s.FALLBACK_CARDS))

    def test_reloads_on_change(self):
        self.write([{"id": 10, "name": "a", "popularity": 1,
                     "publishedAt": "2026-01-01T00:00:00Z"}])
        self.assertEqual(s.card_candidates()[0], 10)
        time.sleep(0.02)
        self.write([{"id": 11, "name": "b", "popularity": 2,
                     "publishedAt": "2026-02-01T00:00:00Z"}])
        self.assertEqual(s.card_candidates()[0], 11)

    def test_skips_rows_without_name(self):
        self.write([
            {"id": 20, "name": "", "popularity": 99},
            {"id": 21, "name": "ok", "popularity": 1,
             "publishedAt": "2026-01-01T00:00:00Z"},
        ])
        self.assertEqual(s.card_candidates()[0], 21)


if __name__ == "__main__":
    unittest.main()
