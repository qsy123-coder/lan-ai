# -*- coding: utf-8 -*-
"""
dzmm.ai「多终点拖拽路径」验证码求解器

题意：图上有多个红色圆（终点候选），只有一条连续通道真正连到其中一个。
白色长条只是视觉遮挡，通道在遮挡下仍然连续 —— 路径必须连续，不能跳线。

判据（关键）：
  真终点的特征是「通道段的一个端点贴着红圆」（通道终止于圆）。
  干扰圆只是被通道从旁边穿过，段端点不会贴着它。
  多个候选时取离起点更远的段端点。

路径：
  逐步膨胀通道 mask，直到起点与终点连通，再跑 BFS 最短路 —— 全程连续。
"""
import collections
import io as _io
import math

from PIL import Image

D = (78, 105, 119)
G = (73, 119, 108)
RC = (143, 87, 98)
START = (35, 90)


def eq(p, c, t=25):
    return abs(p[0] - c[0]) <= t and abs(p[1] - c[1]) <= t and abs(p[2] - c[2]) <= t


def _mask(pimg, color, tol=25):
    w, h = pimg.size
    px = pimg.load()
    m = [[False] * w for _ in range(h)]
    for y in range(h):
        row = m[y]
        for x in range(w):
            if eq(px[x, y], color, tol):
                row[x] = True
    return m


def _dilate(mask, radius):
    h = len(mask)
    w = len(mask[0])
    if radius <= 0:
        return [r[:] for r in mask]
    out = [[False] * w for _ in range(h)]
    ii = [[0] * (w + 1) for _ in range(h + 1)]
    for y in range(h):
        s = 0
        row = mask[y]
        for x in range(w):
            if row[x]:
                s += 1
            ii[y + 1][x + 1] = ii[y][x + 1] + s
    for y in range(h):
        y0 = max(0, y - radius)
        y1 = min(h, y + radius + 1)
        for x in range(w):
            x0 = max(0, x - radius)
            x1 = min(w, x + radius + 1)
            out[y][x] = (ii[y1][x1] - ii[y0][x1] - ii[y1][x0] + ii[y0][x0]) > 0
    return out


def _components(mask, min_size=25):
    h = len(mask)
    w = len(mask[0])
    seen = [[False] * w for _ in range(h)]
    comps = []
    for y in range(h):
        for x in range(w):
            if not mask[y][x] or seen[y][x]:
                continue
            q = collections.deque([(x, y)])
            seen[y][x] = True
            comp = []
            while q:
                cx, cy = q.popleft()
                comp.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            if len(comp) >= min_size:
                comps.append(comp)
    return comps


def _bfs(comp, start_pt):
    cs = set(comp)
    if start_pt not in cs:
        return {}, None, 0
    q = collections.deque([start_pt])
    dm = {start_pt: 0}
    far, fd = start_pt, 0
    while q:
        x, y = q.popleft()
        d = dm[(x, y)]
        if d > fd:
            far, fd = (x, y), d
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                np = (x + dx, y + dy)
                if np in cs and np not in dm:
                    dm[np] = d + 1
                    q.append(np)
    return dm, far, fd


def _seg_endpoints(comp):
    a = comp[0]
    _, b, _ = _bfs(comp, a)
    _, c, _ = _bfs(comp, b)
    return b, c


def _path_in(mask, start, goal):
    h = len(mask)
    w = len(mask[0])
    sx, sy = start
    gx, gy = goal

    def ok(x, y):
        return 0 <= x < w and 0 <= y < h and mask[y][x]

    if not ok(sx, sy) or not ok(gx, gy):
        return None
    q = collections.deque([(sx, sy)])
    par = {(sx, sy): None}
    while q:
        x, y = q.popleft()
        if (x, y) == (gx, gy):
            break
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nx, ny = x + dx, y + dy
            if ok(nx, ny) and (nx, ny) not in par:
                par[(nx, ny)] = (x, y)
                q.append((nx, ny))
    if (gx, gy) not in par:
        return None
    out = []
    cur = (gx, gy)
    while cur is not None:
        out.append(cur)
        cur = par[cur]
    out.reverse()
    return out


def _nearest(mask, pt, maxr=45):
    w = len(mask[0])
    h = len(mask)
    x0, y0 = pt
    for r in range(0, maxr + 1):
        best = None
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                if max(abs(dx), abs(dy)) != r:
                    continue
                x, y = x0 + dx, y0 + dy
                if 0 <= x < w and 0 <= y < h and mask[y][x]:
                    d = math.hypot(dx, dy)
                    if best is None or d < best[0]:
                        best = (d, (x, y))
        if best:
            return best[1]
    return None


def find_circles(pimg, min_area=180):
    w, h = pimg.size
    px = pimg.load()
    reds = set()
    for y in range(h):
        for x in range(w):
            if eq(px[x, y], RC, 25):
                reds.add((x, y))
    seen = set()
    out = []
    for p in reds:
        if p in seen:
            continue
        q = collections.deque([p])
        seen.add(p)
        comp = []
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    np = (x + dx, y + dy)
                    if np in reds and np not in seen:
                        seen.add(np)
                        q.append(np)
        if len(comp) >= min_area:
            xs = [c[0] for c in comp]
            ys = [c[1] for c in comp]
            out.append({"c": (sum(xs) // len(xs), sum(ys) // len(ys)),
                        "area": len(comp),
                        "r": max(max(xs) - min(xs), max(ys) - min(ys)) / 2.0})
    return out


def solve(img_bytes, prefer_idx=0):
    pimg = Image.open(_io.BytesIO(img_bytes)).convert("RGB")
    w, h = pimg.size
    ch = _mask(pimg, D, 25)
    gr = _mask(pimg, G, 25)
    channel = [[ch[y][x] or gr[y][x] for x in range(w)] for y in range(h)]

    start = _nearest(channel, START, 25)
    if not start:
        return None, {"err": "no_start"}

    comps = _components(channel, 25)
    if not comps:
        return None, {"err": "no_channel"}

    best, start_i = 1e9, None
    for i, c in enumerate(comps):
        d = min(math.hypot(p[0] - start[0], p[1] - start[1]) for p in c)
        if d < best:
            best, start_i = d, i
    if start_i is None:
        return None, {"err": "no_start_comp"}

    seg_eps = [_seg_endpoints(c) for c in comps]
    dm_start, _, _ = _bfs(comps[start_i], start)

    circles = find_circles(pimg)
    if not circles:
        return None, {"err": "no_circles"}

    cands = []
    for ci in circles:
        cx, cy = ci["c"]
        rad = max(8.0, ci["r"])
        for si, (e1, e2) in enumerate(seg_eps):
            for e in (e1, e2):
                dd = math.hypot(e[0] - cx, e[1] - cy)
                if dd <= rad + 8:
                    reach = dm_start.get(e, -1) if si == start_i else 10 ** 6
                    cands.append({"circle": (cx, cy), "seg": si, "end": e,
                                  "d": dd, "reach": reach, "area": ci["area"]})

    if not cands:
        for ci in circles:
            cx, cy = ci["c"]
            bd, be, bs = 1e9, None, None
            for si, (e1, e2) in enumerate(seg_eps):
                for e in (e1, e2):
                    dd = math.hypot(e[0] - cx, e[1] - cy)
                    if dd < bd:
                        bd, be, bs = dd, e, si
            if be:
                cands.append({"circle": (cx, cy), "seg": bs, "end": be,
                              "d": bd, "reach": 10 ** 6, "area": ci["area"]})

    if not cands:
        return None, {"err": "no_candidate"}

    # 通道末端 = 离起点最远的段端点（排除起点自身段，避免取到起点）
    far_eps = []
    for si, (e1, e2) in enumerate(seg_eps):
        for e in (e1, e2):
            d = math.hypot(e[0] - start[0], e[1] - start[1])
            if d > 25:  # 排除起点附近的端
                far_eps.append((d, e, si))
    if not far_eps:
        far_eps = [(math.hypot(e[0] - start[0], e[1] - start[1]), e, si)
                   for si, (e1, e2) in enumerate(seg_eps) for e in (e1, e2)]
    far_eps.sort(key=lambda t: -t[0])
    # 在候选里优先：端点离该圆最近
    cand_by_circle = {}
    for c in cands:
        cand_by_circle.setdefault(c["circle"], []).append(c)
    # 候选全集：图上所有红圆（按 x 降序），供轮换覆盖
    cand_list = sorted(set(c["c"] for c in circles), key=lambda p: -p[0])
    # 用最远若干端点综合打分
    best_circle, best_score = None, 1e9
    for circle, lst in cand_by_circle.items():
        score = min(c["d"] for c in lst)
        # 越靠右、离通道末端越近越好
        right_bonus = -0.02 * circle[0]
        best_end = min(lst, key=lambda c: c["d"])
        tail_d = math.hypot(best_end["end"][0] - far_eps[0][1][0],
                            best_end["end"][1] - far_eps[0][1][1])
        total = score + 0.35 * tail_d + right_bonus
        if total < best_score:
            best_score, best_circle = total, circle
    # 主判据 + 候选轮换：prefer_idx 用于在多次换题中覆盖不同终点
    goal = best_circle
    if prefer_idx and cand_list:
        others = [c for c in cand_list if c != best_circle]
        if others:
            goal = others[(prefer_idx - 1) % len(others)]

    path, used = None, None
    for r in (2, 4, 6, 8, 10, 12, 14, 16):
        dmask = _dilate(channel, r)
        gpt = _nearest(dmask, goal, 35)
        if not gpt:
            continue
        p = _path_in(dmask, start, gpt)
        if p:
            path, used = p, r
            break
    if not path:
        return None, {"err": "no_path", "goal": goal}

    path = [(START[0], START[1])] + path + [goal]
    pts = [path[0]]
    for i in range(1, len(path)):
        if i % 2 == 0 or i == len(path) - 1:
            pts.append(path[i])

    meta = {"start": start, "goal": goal, "dilate": used, "points": len(pts),
            "segments": len(comps), "cands": len(cands), "prefer_idx": prefer_idx,
            "cand_list": cand_list,
            "circles": [c["c"] for c in circles]}
    return pts, meta


if __name__ == "__main__":
    import sys
    for fn in sys.argv[1:]:
        try:
            data = open(fn, "rb").read()
        except Exception as e:
            print(fn, "read err", e)
            continue
        path, meta = solve(data)
        print(fn, "->", ("OK %d pts" % len(path)) if path else "FAIL", meta)
