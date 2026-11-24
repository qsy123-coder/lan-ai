# -*- coding: utf-8 -*-
"""
dzmm.ai 设备指纹 hash 算法 BW() 的 Python 复刻
源码位置: assets/DEqP6rsA.js (bundle.js)

JS 原码:
  function lPe(e){return new TextEncoder().encode(e).buffer}
  function LW(e){e^=e>>>16;e=Math.imul(e,2246822507);e^=e>>>13;e=Math.imul(e,3266489909);e^=e>>>16;return e>>>0}
  var RW=new Uint32Array([597399067,2869860233,951274213,2716044179]);
  function zW(e,t){return e<<t|e>>>32-t}
  function uPe(e,t){...}  # 主循环，16 字节一块
  function dPe(e,t){...}  # 尾部 1..15 字节
  function fPe(e,t){...}  # 长度混合 + LW 混淆
  function BW(e,t=0){ ... n=new Uint32Array([t,t,t,t]); uPe;dPe;fPe; return 小端16字节转hex }
"""
import struct

RW = (597399067, 2869860233, 951274213, 2716044179)
M32 = 0xFFFFFFFF


def _imul(a, b):
    """Math.imul: 32 位有符号乘法，返回有符号结果"""
    r = (a & M32) * (b & M32) & M32
    return r - 0x100000000 if r & 0x80000000 else r


def _to_u32(x):
    return x & M32


def _rotl(x, n):
    x &= M32
    return ((x << n) | (x >> (32 - n))) & M32


def _lw(e):
    e &= M32
    e ^= e >> 16
    e = _imul(e, 2246822507) & M32
    e ^= e >> 13
    e = _imul(e, 3266489909) & M32
    e ^= e >> 16
    return e & M32


def bw(data, seed=0):
    """data: str 或 bytes"""
    if isinstance(data, str):
        buf = data.encode("utf-8")
    else:
        buf = bytes(data)
    n_bytes = len(buf)
    t = [seed & M32, seed & M32, seed & M32, seed & M32]

    # ---- uPe: 每 16 字节一块 ----
    nblk = n_bytes // 16
    for i in range(nblk):
        w = list(struct.unpack_from("<4I", buf, i * 16))

        w[0] = _to_u32(_imul(w[0], RW[0]))
        w[0] = _rotl(w[0], 15)
        w[0] = _to_u32(_imul(w[0], RW[1]))
        t[0] = _to_u32(t[0] ^ w[0])
        t[0] = _rotl(t[0], 19)
        t[0] = _to_u32(t[0] + t[1])
        t[0] = _to_u32(_imul(t[0], 5) + 1444728091)

        w[1] = _to_u32(_imul(w[1], RW[1]))
        w[1] = _rotl(w[1], 16)
        w[1] = _to_u32(_imul(w[1], RW[2]))
        t[1] = _to_u32(t[1] ^ w[1])
        t[1] = _rotl(t[1], 17)
        t[1] = _to_u32(t[1] + t[2])
        t[1] = _to_u32(_imul(t[1], 5) + 197830471)

        w[2] = _to_u32(_imul(w[2], RW[2]))
        w[2] = _rotl(w[2], 17)
        w[2] = _to_u32(_imul(w[2], RW[3]))
        t[2] = _to_u32(t[2] ^ w[2])
        t[2] = _rotl(t[2], 15)
        t[2] = _to_u32(t[2] + t[3])
        t[2] = _to_u32(_imul(t[2], 5) + 2530024501)

        w[3] = _to_u32(_imul(w[3], RW[3]))
        w[3] = _rotl(w[3], 18)
        w[3] = _to_u32(_imul(w[3], RW[0]))
        t[3] = _to_u32(t[3] ^ w[3])
        t[3] = _rotl(t[3], 13)
        t[3] = _to_u32(t[3] + t[0])
        t[3] = _to_u32(_imul(t[3], 5) + 850148119)

    # ---- dPe: 尾部 ----
    rem = n_bytes - nblk * 16
    if rem:
        a = buf[nblk * 16:]
        i0 = i1 = i2 = i3 = 0
        # switch 落穿语义：从 case r 一直往下执行
        if rem >= 15:
            i3 ^= a[14] << 16
        if rem >= 14:
            i3 ^= a[13] << 8
        if rem >= 13:
            i3 ^= a[12]
            i3 = _to_u32(_imul(i3, RW[3]))
            i3 = _rotl(i3, 18)
            i3 = _to_u32(_imul(i3, RW[0]))
            t[3] = _to_u32(t[3] ^ i3)
        if rem >= 12:
            i2 ^= a[11] << 24
        if rem >= 11:
            i2 ^= a[10] << 16
        if rem >= 10:
            i2 ^= a[9] << 8
        if rem >= 9:
            i2 ^= a[8]
            i2 = _to_u32(_imul(i2, RW[2]))
            i2 = _rotl(i2, 17)
            i2 = _to_u32(_imul(i2, RW[3]))
            t[2] = _to_u32(t[2] ^ i2)
        if rem >= 8:
            i1 ^= a[7] << 24
        if rem >= 7:
            i1 ^= a[6] << 16
        if rem >= 6:
            i1 ^= a[5] << 8
        if rem >= 5:
            i1 ^= a[4]
            i1 = _to_u32(_imul(i1, RW[1]))
            i1 = _rotl(i1, 16)
            i1 = _to_u32(_imul(i1, RW[2]))
            t[1] = _to_u32(t[1] ^ i1)
        if rem >= 4:
            i0 ^= a[3] << 24
        if rem >= 3:
            i0 ^= a[2] << 16
        if rem >= 2:
            i0 ^= a[1] << 8
        if rem >= 1:
            i0 ^= a[0]
            i0 = _to_u32(_imul(i0, RW[0]))
            i0 = _rotl(i0, 15)
            i0 = _to_u32(_imul(i0, RW[1]))
            t[0] = _to_u32(t[0] ^ i0)

    # ---- fPe: 长度混合 ----
    ln = n_bytes & M32
    t[0] = _to_u32(t[0] ^ ln)
    t[1] = _to_u32(t[1] ^ ln)
    t[2] = _to_u32(t[2] ^ ln)
    t[3] = _to_u32(t[3] ^ ln)
    t[0] = _to_u32(t[0] + t[1])
    t[0] = _to_u32(t[0] + t[2])
    t[0] = _to_u32(t[0] + t[3])
    t[1] = _to_u32(t[1] + t[0])
    t[2] = _to_u32(t[2] + t[0])
    t[3] = _to_u32(t[3] + t[0])
    t[0] = _lw(t[0])
    t[1] = _lw(t[1])
    t[2] = _lw(t[2])
    t[3] = _lw(t[3])
    t[0] = _to_u32(t[0] + t[1])
    t[0] = _to_u32(t[0] + t[2])
    t[0] = _to_u32(t[0] + t[3])
    t[1] = _to_u32(t[1] + t[0])
    t[2] = _to_u32(t[2] + t[0])
    t[3] = _to_u32(t[3] + t[0])

    return struct.pack("<4I", t[0], t[1], t[2], t[3]).hex()


if __name__ == "__main__":
    import json
    import sys

    # 用真实抓包数据自检
    try:
        d = json.load(open("fp_template.json", encoding="utf-8"))
        data = d["fp"]["data"]
        expect = d["fp"]["hash"]
        payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        got = bw(payload)
        print("期望:", expect)
        print("实算:", got)
        print("一致:", got == expect)
    except FileNotFoundError:
        print("缺少 fp_template.json")
