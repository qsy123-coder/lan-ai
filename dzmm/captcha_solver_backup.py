# -*- coding: utf-8 -*-
"""
dzmm.ai「多终点拖拽路径」验证码求解器（连续路径版）

核心：验证码要求「沿唯一连续的完整通道拖到它连接的终点」。
白色长条只是视觉遮挡，通道在遮挡下仍然连续 —— 所以路径必须连续，
不能在不同通道段之间跳线。

算法：
1. 提取通道色像素（深青灰 78,105,119 / 起点绿 73,119,108）
2. 识别红色终点圆；真终点 = 通道末端指向的那个圆
3. 逐步膨胀通道 mask（3→5→7...），直到起点与终点连通
4. 在膨胀 mask 上跑 BFS 最短路 —— 路径连续、贴合通道走向
5. 可选：路径点吸附回最近的真实通道像素，减少遮挡区偏移
"""
import collections
import io as _io
import math

from PIL import Image, ImageFilter

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
    """方形结构元素膨胀"""
    if radius <= 0:
        return [r[:] for r in mask]
    h = len(mask)
    w = len(mask[0])
    out = [[False] * w for _ in range(h)]
    # 积分图加速
    ii = [[0] * (w + 1) for _ in range(h + 1)]
    for y in range(h):
        s = 0
        row = mask[y]
        for x in range(w):
            s += 1 if row[x] else 0
            ii[y + 1][x + 1] = ii[y][x + 1] + s
    for y in range(h):
        y0 = max(0, y - radius)
        y1 = min(h, y + radius + 1)
        for x in range(w):
            x0 = max(0, x - radius)
            x1 = min(w, x + radius + 1)
            total = ii[y1][x1] - ii[y0][x1] - ii[y1][x0] + ii[y0][x0]
            out[y][x] = total > 0
    return out


def _bfs_path(mask, start, goal):
    """8 邻域 BFS 最短路，返回点列表"""
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
    path = []
    cur = (gx, gy)
    while cur is not None:
        path.append(cur)
        cur = par[cur]
    path.reverse()
    return path


def _ring_segments(channel, cx, cy, r0=10, r1=16, step=3):
    """统计红圆外环上「通道像素」的连通段数
    真终点：通道从一侧进入并终止 -> 1 段
    穿过型：通道横穿 -> 2 段
    """
    w = len(channel[0]); h = len(channel)
    flags = []
    for ang in range(0, 360, step):
        found = False
        for r in range(r0, r1 + 1):
            x = int(cx + r * math.cos(math.radians(ang)))
            y = int(cy + r * math.sin(math.radians(ang)))
            if 0 <= x < w and 0 <= y < h and channel[y][x]:
                found = True
                break
        flags.append(found)
    n = len(flags)
    if not any(flags):
        return 0
    if all(flags):
        return 1
    # 从第一个 False 之后开始数段（处理环形）
    runs = 0
    for i in range(n):
        if flags[i] and not flags[i - 1]:
            runs += 1
    return runs


def _nearest(mask, pt, maxr=40):
    """mask 中离 pt 最近的 True 点"""
    w = len(mask[0])
    h = len(mask)
    x0, y0 = pt
    best = None
    for r in range(0, maxr + 1):
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
    circles = []
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
            cx = sum(p[0] for p in comp) // len(comp)
            cy = sum(p[1] for p in comp) // len(comp)
            circles.append((cx, cy, len(comp)))
    return circles


def solve(img_bytes):
    """
    返回 (path, meta) 或 (None, meta)
    path: [(x,y), ...] 图片坐标，连续
    """
    pimg = Image.open(_io.BytesIO(img_bytes)).convert("RGB")
    w, h = pimg.size

    ch = _mask(pimg, D, 25)
    gr = _mask(pimg, G, 25)
    channel = [[ch[y][x] or gr[y][x] for x in range(w)] for y in range(h)]

    # 起点：START 附近最近的通道像素
    start = _nearest(channel, START, 25)
    if not start:
        return None, {"err": "no_start"}

    circles = find_circles(pimg)
    if not circles:
        return None, {"err": "no_circles"}

    # 真终点判据：通道线「伸进」红圆内部（圆内 r<=11 有通道像素最多）
    # 干扰终点是空心闭合圆，通道只擦边不进入
    scored = []
    for (cx, cy, area) in circles:
        inside = 0
        for r in range(0, 12):
            for ang in range(0, 360, 4):
                x = int(cx + r * math.cos(math.radians(ang)))
                y = int(cy + r * math.sin(math.radians(ang)))
                if 0 <= x < w and 0 <= y < h and channel[y][x]:
                    inside += 1
        segs = _ring_segments(channel, cx, cy)
        scored.append((inside, (cx, cy), area, segs, inside))
    scored.sort(key=lambda s: -s[0])
    inside_best, goal, garea = scored[0][4], scored[0][1], scored[0][2]
    goal_d = 0.0
    # 若没有圆内有通道（极端情况），退回「离通道最远端点最近」
    if inside_best < 8:
        d3 = _dilate(channel, 3)
        far = None
        q = collections.deque([start])
        dm = {start: 0}
        while q:
            x, y = q.popleft()
            for dx in range(-1, 2):
                for dy in range(-1, 2):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and d3[ny][nx] and (nx, ny) not in dm:
                        dm[(nx, ny)] = dm[(x, y)] + 1
                        q.append((nx, ny))
        if dm:
            far = max(dm.items(), key=lambda kv: kv[1])[0]
            cand = sorted((math.hypot(far[0] - c[0], far[1] - c[1]), (c[0], c[1])) for c in circles)
            goal = cand[0][1]
            goal_d = cand[0][0]

    # 逐步膨胀直到 start 与 goal 连通，然后 BFS 最短路（连续）
    path = None
    used_r = None
    for r in (3, 5, 7, 9, 11, 13, 15, 17, 19):
        dmask = _dilate(channel, r)
        gpt = _nearest(dmask, goal, 30)
        if not gpt:
            continue
        p = _bfs_path(dmask, start, gpt)
        if p:
            path = p
            used_r = r
            break
    if not path:
        return None, {"err": "no_path", "goal": goal, "goal_d": goal_d}

    # 收尾：延伸到红圆中心
    path = [(START[0], START[1])] + path + [goal]

    # 抽稀（每 2 像素一个点，保证连续且事件不过密）
    pts = [path[0]]
    for i in range(1, len(path)):
        if i % 2 == 0 or i == len(path) - 1:
            pts.append(path[i])

    meta = {
        "start": start,
        "goal": goal,
        "goal_inside": inside_best,
        "goal_dist": round(goal_d, 1),
        "dilate": used_r,
        "points": len(pts),
        "circles": [(c[0], c[1]) for c in circles],
    }
    return pts, meta


if __name__ == "__main__":
    import sys
    for fn in sys.argv[1:]:
        data = open(fn, "rb").read()
        path, meta = solve(data)
        print(fn, "->", ("OK %d pts" % len(path)) if path else "FAIL", meta)
