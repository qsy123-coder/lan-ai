# -*- coding: utf-8 -*-
"""新版验证码解算：深青灰轮廓 + 膨胀 + 单连通 BFS 求最远点。

离线验证: python cap_solve2.py cap_now.png [out.png]
"""
import collections
import math
import sys

from PIL import Image, ImageDraw

D = (78, 105, 119)      # 通道轮廓
G = (73, 119, 108)      # 起点绿
BG = (216, 227, 232)
WHITE = (243, 240, 241)


def eq(p, c, t=25):
    return abs(p[0] - c[0]) <= t and abs(p[1] - c[1]) <= t and abs(p[2] - c[2]) <= t


def build_mask(im, dilate=3):
    w, h = im.size
    px = im.load()
    raw = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            # 轮廓色 或 近白主体（但要排除大面积纯背景）
            if eq(p, D, 24) or (p[0] > 236 and p[1] > 232 and abs(p[2] - p[0]) < 10):
                raw[y][x] = True
    # 膨胀
    mask = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if not raw[y][x]:
                continue
            for dy in range(-dilate, dilate + 1):
                for dx in range(-dilate, dilate + 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w:
                        mask[ny][nx] = True
    return mask


def start_point(im):
    """起点固定在左侧圆环中心（页面 CSS --start 固定位置）"""
    return 35, 90


def bfs_far(mask, start, w, h):
    # 找到离 start 最近的 mask 点作为入口
    cand = [(x, y) for y in range(max(0, start[1] - 30), min(h, start[1] + 30))
            for x in range(max(0, start[0] - 30), min(w, start[0] + 30)) if mask[y][x]]
    if not cand:
        return None, None
    entry = min(cand, key=lambda p: math.hypot(p[0] - start[0], p[1] - start[1]))
    dist = {entry: 0}
    prev = {entry: None}
    q = collections.deque([entry])
    far = entry
    while q:
        x, y = q.popleft()
        if dist[(x, y)] > dist[far]:
            far = (x, y)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            np_ = (x + dx, y + dy)
            if 0 <= np_[1] < h and 0 <= np_[0] < w and mask[np_[1]][np_[0]] and np_ not in dist:
                dist[np_] = dist[(x, y)] + 1
                prev[np_] = (x, y)
                q.append(np_)
    # 回溯路径
    path = []
    cur = far
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return far, path


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "cap_now.png"
    out = sys.argv[2] if len(sys.argv) > 2 else "cap_solved.png"
    im = Image.open(src).convert("RGB")
    w, h = im.size
    mask = build_mask(im)
    sp = start_point(im)
    far, path = bfs_far(mask, sp, w, h)
    print("size", (w, h), "start", sp, "far", far, "pathlen", len(path) if path else 0)
    draw = ImageDraw.Draw(im)
    if path:
        for i in range(len(path) - 1):
            draw.line([path[i], path[i + 1]], fill=(255, 0, 0), width=1)
        draw.ellipse([far[0] - 4, far[1] - 4, far[0] + 4, far[1] + 4], outline=(0, 200, 0), width=2)
    draw.ellipse([sp[0] - 4, sp[1] - 4, sp[0] + 4, sp[1] + 4], outline=(0, 0, 255), width=2)
    im.save(out)
    print("saved", out)


if __name__ == "__main__":
    main()
