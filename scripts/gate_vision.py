# scripts/gate_vision.py —— 多终点拖拽验证码求解
#
# 图像结构（实测 320x180）:
#   背景 = (216,227,232) 浅蓝灰   <- 也是通道本体色
#   通道边缘 = (185,201,210)
#   起点 = 白色实心圆 (255,255,255)，位于 data-start-x/y (左中)
#   终点 = (134,91,107) 暗红圆环，共 7 个左右
#   干扰 = 绿/米色斜条 (238,243,244)/(244,242,236) 横切部分支路，被切到的支路即"断开的终点"
#
# 判定逻辑:
#   1) 以起点圆心为种子，在通道色上做带权最短路（通道色=1，被遮挡/异色=60）
#   2) 对每个终点圆心求路径代价，代价最小者 = 真正连通的终点
#   3) 路径抽稀成 {x,y,t}，t 递增（默认 28ms/点），点数 >= 10 满足前端阈值
import sys
import json
import heapq
import math

from PIL import Image, ImageDraw

CHANNEL = (216, 227, 232)
EDGE = (185, 201, 210)
RED = (134, 91, 107)
DARK = (78, 105, 119)
GREEN = (73, 119, 108)
WHITE = (255, 255, 255)

COST_ON = 1
COST_OFF = 10000
STEP_PX = 2
STEP_MS = 10
MAX_POINTS = 470


def near(c, ref, tol):
    return abs(c[0] - ref[0]) <= tol and abs(c[1] - ref[1]) <= tol and abs(c[2] - ref[2]) <= tol


def channel_cost(im):
    w, h = im.size
    px = im.load()
    cost = [COST_OFF] * (w * h)
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if (near(c, CHANNEL, 6) or near(c, EDGE, 12) or near(c, RED, 26)
                    or near(c, WHITE, 6) or near(c, GREEN, 20) or near(c, DARK, 18)):
                cost[y * w + x] = COST_ON
    return cost


def red_blobs(im, tol=26, min_px=120):
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    blobs = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if seen[i] or not near(px[x, y], RED, tol):
                continue
            stack = [(x, y)]
            seen[i] = 1
            xs = ys = n = 0
            while stack:
                cx, cy = stack.pop()
                xs += cx
                ys += cy
                n += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            ni = ny * w + nx
                            if not seen[ni] and near(px[nx, ny], RED, tol):
                                seen[ni] = 1
                                stack.append((nx, ny))
            if n >= min_px:
                blobs.append((xs / float(n), ys / float(n), n))
    return blobs


def start_point(im):
    """找白色起点圆：白色像素重心；找不到就用 (35,90)。"""
    w, h = im.size
    px = im.load()
    xs = ys = n = 0
    for y in range(h):
        for x in range(w):
            if near(px[x, y], WHITE, 6):
                xs += x
                ys += y
                n += 1
    if n:
        return (int(xs / n), int(ys / n))
    return (35, 90)


def dijkstra(cost, w, h, src):
    INF = float("inf")
    dist = [INF] * (w * h)
    prev = [-1] * (w * h)
    si = src[1] * w + src[0]
    dist[si] = 0
    pq = [(0, si)]
    while pq:
        d, cur = heapq.heappop(pq)
        if d > dist[cur]:
            continue
        cx, cy = cur % w, cur // w
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nx, ny = cx + dx, cy + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            ni = ny * w + nx
            step = cost[ni] * (1.414 if dx and dy else 1.0)
            nd = d + step
            if nd < dist[ni]:
                dist[ni] = nd
                prev[ni] = cur
                heapq.heappush(pq, (nd, ni))
    return dist, prev


def extract(prev, w, target):
    ti = target[1] * w + target[0]
    if prev[ti] == -1 and ti != prev[0]:
        pass
    path = []
    cur = ti
    guard = 0
    while cur != -1 and guard < 100000:
        path.append((cur % w, cur // w))
        cur = prev[cur]
        guard += 1
    return path[::-1]


def simplify(path, n):
    if len(path) <= n:
        return path
    step = (len(path) - 1) / float(n - 1)
    return [path[int(round(i * step))] for i in range(n)]


def solve(img_path, debug_path=None):
    im = Image.open(img_path).convert("RGB")
    w, h = im.size
    cost = channel_cost(im)
    sx, sy = start_point(im)
    # 起点圆本身是白色(=COST_OFF)，把起点一圈强制设成可通行，避免最短路被卡在圆心
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            nx, ny = sx + dx, sy + dy
            if 0 <= nx < w and 0 <= ny < h:
                cost[ny * w + nx] = COST_ON

    dist, prev = dijkstra(cost, w, h, (sx, sy))
    blobs = red_blobs(im)
    scored = []
    for bx, by, n in blobs:
        bx_i, by_i = int(round(bx)), int(round(by))
        best = float("inf")
        for dy in range(-6, 7):
            for dx in range(-6, 7):
                nx, ny = bx_i + dx, by_i + dy
                if 0 <= nx < w and 0 <= ny < h:
                    best = min(best, dist[ny * w + nx])
        scored.append((best, bx_i, by_i, n))
    scored.sort()

    print("start:", (sx, sy), "| endpoints (cost asc):")
    for s in scored:
        print("   cost=%8.1f  at=(%3d,%3d)  px=%d" % s)

    if not scored:
        return None
    best_cost, bx, by, _ = scored[0]
    path = extract(prev, w, (bx, by))
    dense = [path[0]]
    for pt in path[1:]:
        if (pt[0] - dense[-1][0]) ** 2 + (pt[1] - dense[-1][1]) ** 2 >= STEP_PX ** 2:
            dense.append(pt)
    if dense[-1] != path[-1]:
        dense.append(path[-1])
    path = dense[-MAX_POINTS:]
    trace = [{"x": round(x, 1), "y": round(y, 1), "t": i * STEP_MS} for i, (x, y) in enumerate(path)]

    if debug_path:
        dbg = im.copy()
        d = ImageDraw.Draw(dbg)
        d.line(path, fill=(0, 0, 255), width=2)
        d.ellipse([sx - 10, sy - 10, sx + 10, sy + 10], outline=(0, 255, 0), width=2)
        d.ellipse([bx - 12, by - 12, bx + 12, by + 12], outline=(255, 0, 0), width=3)
        dbg.save(debug_path)
        print("debug ->", debug_path)

    return trace


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "captures/captcha.png"
    dbg = sys.argv[2] if len(sys.argv) > 2 else "out/gate_solved.png"
    tr = solve(src, dbg)
    print("TRACE=" + json.dumps(tr, ensure_ascii=False))
