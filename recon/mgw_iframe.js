const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './BaseView-8_BRKLue.js',
      './BaseView-DqguL7wP.css',
      './MenuView-D2BLHDHE.js',
      './MenuView-hvn0g-oS.css',
      './CenterView-DRqmOSpv.js',
      './CenterView-D0xa6ZQ6.css',
      './ChangePassView-Bw55j2eT.js',
      './Head-DYDfOq9b.js',
      './Head-BomkisWy.css',
      './ChangePassView-CS3NoNyz.css',
      './CouponView-DcGlN4kF.js',
      './ptbcz_yhj-ChtdFJJC.js',
      './CouponView-BwVPqi_K.css',
      './GuideView-CLN_RE8Q.js',
      './GuideView-0uDdyk-2.css',
      './PayView-DkZC27cd.js',
      './v3-infinite-loading.es-BPQ9cEji.js',
      './v3-infinite-loading-C33VokCe.css',
      './coin_bind_ptb-DTBM0faN.js',
      './coin_bind_ptb-BRZpBe_k.css',
      './ptb-BHVRf92K.js',
      './PayView-CvMDFShk.css',
      './PTBPayView-CQu-P7Zt.js',
      './PTBPayView-CN8-3npT.css',
      './BillView-BF1N0mGj.js',
      './vue3-tabs.common-BoJbuHpk.js',
      './BillView-C7C7XfR2.css',
      './BillDetailView-DjqwdW2y.js',
      './BillDetailView-CgeB-cqr.css',
      './NewsView-CIlKCgpa.js',
      './NewsView-Tq1Rbvrd.css',
      './NewsDetailView-DRIIwkPf.js',
      './NewsDetailView-C8-77nwt.css',
      './DialogView-p8JFcPkQ.js',
      './DialogView-BvPAiLHv.css',
    ]),
) => i.map((i) => d[i]);
(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver((s) => {
    for (const o of s)
      if (o.type === 'childList')
        for (const i of o.addedNodes) i.tagName === 'LINK' && i.rel === 'modulepreload' && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(s) {
    const o = {};
    return (
      s.integrity && (o.integrity = s.integrity),
      s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === 'use-credentials'
        ? (o.credentials = 'include')
        : s.crossOrigin === 'anonymous'
          ? (o.credentials = 'omit')
          : (o.credentials = 'same-origin'),
      o
    );
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const o = n(s);
    fetch(s.href, o);
  }
})();
/**
 * @vue/shared v3.5.13
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/ /*! #__NO_SIDE_EFFECTS__ */ function Fs(e) {
  const t = Object.create(null);
  for (const n of e.split(',')) t[n] = 1;
  return (n) => n in t;
}
const ge = {},
  Mn = [],
  mt = () => {},
  qf = () => !1,
  kr = (e) =>
    e.charCodeAt(0) === 111 &&
    e.charCodeAt(1) === 110 &&
    (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
  Ii = (e) => e.startsWith('onUpdate:'),
  Pe = Object.assign,
  Mi = (e, t) => {
    const n = e.indexOf(t);
    n > -1 && e.splice(n, 1);
  },
  jf = Object.prototype.hasOwnProperty,
  be = (e, t) => jf.call(e, t),
  se = Array.isArray,
  Hn = (e) => Jn(e) === '[object Map]',
  Dn = (e) => Jn(e) === '[object Set]',
  Pa = (e) => Jn(e) === '[object Date]',
  Kf = (e) => Jn(e) === '[object RegExp]',
  ae = (e) => typeof e == 'function',
  Te = (e) => typeof e == 'string',
  Ct = (e) => typeof e == 'symbol',
  Fe = (e) => e !== null && typeof e == 'object',
  Hi = (e) => (Fe(e) || ae(e)) && ae(e.then) && ae(e.catch),
  Zc = Object.prototype.toString,
  Jn = (e) => Zc.call(e),
  Gf = (e) => Jn(e).slice(8, -1),
  Ps = (e) => Jn(e) === '[object Object]',
  Ui = (e) => Te(e) && e !== 'NaN' && e[0] !== '-' && '' + parseInt(e, 10) === e,
  Un = Fs(
    ',key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted',
  ),
  Ss = (e) => {
    const t = Object.create(null);
    return (n) => t[n] || (t[n] = e(n));
  },
  zf = /-(\w)/g,
  Je = Ss((e) => e.replace(zf, (t, n) => (n ? n.toUpperCase() : ''))),
  Yf = /\B([A-Z])/g,
  lt = Ss((e) => e.replace(Yf, '-$1').toLowerCase()),
  Ts = Ss((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  ts = Ss((e) => (e ? `on${Ts(e)}` : '')),
  st = (e, t) => !Object.is(e, t),
  $n = (e, ...t) => {
    for (let n = 0; n < e.length; n++) e[n](...t);
  },
  el = (e, t, n, r = !1) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, writable: r, value: n });
  },
  cs = (e) => {
    const t = parseFloat(e);
    return isNaN(t) ? e : t;
  },
  ls = (e) => {
    const t = Te(e) ? Number(e) : NaN;
    return isNaN(t) ? e : t;
  };
let Sa;
const Rs = () =>
    Sa ||
    (Sa =
      typeof globalThis < 'u'
        ? globalThis
        : typeof self < 'u'
          ? self
          : typeof window < 'u'
            ? window
            : typeof global < 'u'
              ? global
              : {}),
  Xf =
    'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol',
  Qf = Fs(Xf);
function ws(e) {
  if (se(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const r = e[n],
        s = Te(r) ? td(r) : ws(r);
      if (s) for (const o in s) t[o] = s[o];
    }
    return t;
  } else if (Te(e) || Fe(e)) return e;
}
const Jf = /;(?![^(]*\))/g,
  Zf = /:([^]+)/,
  ed = /\/\*[^]*?\*\//g;
function td(e) {
  const t = {};
  return (
    e
      .replace(ed, '')
      .split(Jf)
      .forEach((n) => {
        if (n) {
          const r = n.split(Zf);
          r.length > 1 && (t[r[0].trim()] = r[1].trim());
        }
      }),
    t
  );
}
function ks(e) {
  let t = '';
  if (Te(e)) t = e;
  else if (se(e))
    for (let n = 0; n < e.length; n++) {
      const r = ks(e[n]);
      r && (t += r + ' ');
    }
  else if (Fe(e)) for (const n in e) e[n] && (t += n + ' ');
  return t.trim();
}
function A_(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return t && !Te(t) && (e.class = ks(t)), n && (e.style = ws(n)), e;
}
const nd = 'itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly',
  rd = Fs(nd);
function tl(e) {
  return !!e || e === '';
}
function sd(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let r = 0; n && r < e.length; r++) n = ln(e[r], t[r]);
  return n;
}
function ln(e, t) {
  if (e === t) return !0;
  let n = Pa(e),
    r = Pa(t);
  if (n || r) return n && r ? e.getTime() === t.getTime() : !1;
  if (((n = Ct(e)), (r = Ct(t)), n || r)) return e === t;
  if (((n = se(e)), (r = se(t)), n || r)) return n && r ? sd(e, t) : !1;
  if (((n = Fe(e)), (r = Fe(t)), n || r)) {
    if (!n || !r) return !1;
    const s = Object.keys(e).length,
      o = Object.keys(t).length;
    if (s !== o) return !1;
    for (const i in e) {
      const a = e.hasOwnProperty(i),
        c = t.hasOwnProperty(i);
      if ((a && !c) || (!a && c) || !ln(e[i], t[i])) return !1;
    }
  }
  return String(e) === String(t);
}
function Os(e, t) {
  return e.findIndex((n) => ln(n, t));
}
const nl = (e) => !!(e && e.__v_isRef === !0),
  od = (e) =>
    Te(e)
      ? e
      : e == null
        ? ''
        : se(e) || (Fe(e) && (e.toString === Zc || !ae(e.toString)))
          ? nl(e)
            ? od(e.value)
            : JSON.stringify(e, rl, 2)
          : String(e),
  rl = (e, t) =>
    nl(t)
      ? rl(e, t.value)
      : Hn(t)
        ? {
            [`Map(${t.size})`]: [...t.entries()].reduce(
              (n, [r, s], o) => ((n[Qs(r, o) + ' =>'] = s), n),
              {},
            ),
          }
        : Dn(t)
          ? { [`Set(${t.size})`]: [...t.values()].map((n) => Qs(n)) }
          : Ct(t)
            ? Qs(t)
            : Fe(t) && !se(t) && !Ps(t)
              ? String(t)
              : t,
  Qs = (e, t = '') => {
    var n;
    return Ct(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e;
  };
/**
 * @vue/reactivity v3.5.13
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/ let rt;
class sl {
  constructor(t = !1) {
    (this.detached = t),
      (this._active = !0),
      (this.effects = []),
      (this.cleanups = []),
      (this._isPaused = !1),
      (this.parent = rt),
      !t && rt && (this.index = (rt.scopes || (rt.scopes = [])).push(this) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes) for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].pause();
    }
  }
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes) for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = rt;
      try {
        return (rt = this), t();
      } finally {
        rt = n;
      }
    }
  }
  on() {
    rt = this;
  }
  off() {
    rt = this.parent;
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, r;
      for (n = 0, r = this.effects.length; n < r; n++) this.effects[n].stop();
      for (this.effects.length = 0, n = 0, r = this.cleanups.length; n < r; n++) this.cleanups[n]();
      if (((this.cleanups.length = 0), this.scopes)) {
        for (n = 0, r = this.scopes.length; n < r; n++) this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const s = this.parent.scopes.pop();
        s && s !== this && ((this.parent.scopes[this.index] = s), (s.index = this.index));
      }
      this.parent = void 0;
    }
  }
}
function $i(e) {
  return new sl(e);
}
function ol() {
  return rt;
}
function id(e, t = !1) {
  rt && rt.cleanups.push(e);
}
let Se;
const Js = new WeakSet();
class us {
  constructor(t) {
    (this.fn = t),
      (this.deps = void 0),
      (this.depsTail = void 0),
      (this.flags = 5),
      (this.next = void 0),
      (this.cleanup = void 0),
      (this.scheduler = void 0),
      rt && rt.active && rt.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && ((this.flags &= -65), Js.has(this) && (Js.delete(this), this.trigger()));
  }
  notify() {
    (this.flags & 2 && !(this.flags & 32)) || this.flags & 8 || al(this);
  }
  run() {
    if (!(this.flags & 1)) return this.fn();
    (this.flags |= 2), Ta(this), cl(this);
    const t = Se,
      n = bt;
    (Se = this), (bt = !0);
    try {
      return this.fn();
    } finally {
      ll(this), (Se = t), (bt = n), (this.flags &= -3);
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep) qi(t);
      (this.deps = this.depsTail = void 0),
        Ta(this),
        this.onStop && this.onStop(),
        (this.flags &= -2);
    }
  }
  trigger() {
    this.flags & 64 ? Js.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  runIfDirty() {
    ei(this) && this.run();
  }
  get dirty() {
    return ei(this);
  }
}
let il = 0,
  lr,
  ur;
function al(e, t = !1) {
  if (((e.flags |= 8), t)) {
    (e.next = ur), (ur = e);
    return;
  }
  (e.next = lr), (lr = e);
}
function Vi() {
  il++;
}
function Wi() {
  if (--il > 0) return;
  if (ur) {
    let t = ur;
    for (ur = void 0; t; ) {
      const n = t.next;
      (t.next = void 0), (t.flags &= -9), (t = n);
    }
  }
  let e;
  for (; lr; ) {
    let t = lr;
    for (lr = void 0; t; ) {
      const n = t.next;
      if (((t.next = void 0), (t.flags &= -9), t.flags & 1))
        try {
          t.trigger();
        } catch (r) {
          e || (e = r);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function cl(e) {
  for (let t = e.deps; t; t = t.nextDep)
    (t.version = -1), (t.prevActiveLink = t.dep.activeLink), (t.dep.activeLink = t);
}
function ll(e) {
  let t,
    n = e.depsTail,
    r = n;
  for (; r; ) {
    const s = r.prevDep;
    r.version === -1 ? (r === n && (n = s), qi(r), ad(r)) : (t = r),
      (r.dep.activeLink = r.prevActiveLink),
      (r.prevActiveLink = void 0),
      (r = s);
  }
  (e.deps = t), (e.depsTail = n);
}
function ei(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (
      t.dep.version !== t.version ||
      (t.dep.computed && (ul(t.dep.computed) || t.dep.version !== t.version))
    )
      return !0;
  return !!e._dirty;
}
function ul(e) {
  if ((e.flags & 4 && !(e.flags & 16)) || ((e.flags &= -17), e.globalVersion === _r)) return;
  e.globalVersion = _r;
  const t = e.dep;
  if (((e.flags |= 2), t.version > 0 && !e.isSSR && e.deps && !ei(e))) {
    e.flags &= -3;
    return;
  }
  const n = Se,
    r = bt;
  (Se = e), (bt = !0);
  try {
    cl(e);
    const s = e.fn(e._value);
    (t.version === 0 || st(s, e._value)) && ((e._value = s), t.version++);
  } catch (s) {
    throw (t.version++, s);
  } finally {
    (Se = n), (bt = r), ll(e), (e.flags &= -3);
  }
}
function qi(e, t = !1) {
  const { dep: n, prevSub: r, nextSub: s } = e;
  if (
    (r && ((r.nextSub = s), (e.prevSub = void 0)),
    s && ((s.prevSub = r), (e.nextSub = void 0)),
    n.subs === e && ((n.subs = r), !r && n.computed))
  ) {
    n.computed.flags &= -5;
    for (let o = n.computed.deps; o; o = o.nextDep) qi(o, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function ad(e) {
  const { prevDep: t, nextDep: n } = e;
  t && ((t.nextDep = n), (e.prevDep = void 0)), n && ((n.prevDep = t), (e.nextDep = void 0));
}
function B_(e, t) {
  e.effect instanceof us && (e = e.effect.fn);
  const n = new us(e);
  t && Pe(n, t);
  try {
    n.run();
  } catch (s) {
    throw (n.stop(), s);
  }
  const r = n.run.bind(n);
  return (r.effect = n), r;
}
function D_(e) {
  e.effect.stop();
}
let bt = !0;
const fl = [];
function dn() {
  fl.push(bt), (bt = !1);
}
function hn() {
  const e = fl.pop();
  bt = e === void 0 ? !0 : e;
}
function Ta(e) {
  const { cleanup: t } = e;
  if (((e.cleanup = void 0), t)) {
    const n = Se;
    Se = void 0;
    try {
      t();
    } finally {
      Se = n;
    }
  }
}
let _r = 0;
class cd {
  constructor(t, n) {
    (this.sub = t),
      (this.dep = n),
      (this.version = n.version),
      (this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0);
  }
}
class Ls {
  constructor(t) {
    (this.computed = t),
      (this.version = 0),
      (this.activeLink = void 0),
      (this.subs = void 0),
      (this.map = void 0),
      (this.key = void 0),
      (this.sc = 0);
  }
  track(t) {
    if (!Se || !bt || Se === this.computed) return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Se)
      (n = this.activeLink = new cd(Se, this)),
        Se.deps
          ? ((n.prevDep = Se.depsTail), (Se.depsTail.nextDep = n), (Se.depsTail = n))
          : (Se.deps = Se.depsTail = n),
        dl(n);
    else if (n.version === -1 && ((n.version = this.version), n.nextDep)) {
      const r = n.nextDep;
      (r.prevDep = n.prevDep),
        n.prevDep && (n.prevDep.nextDep = r),
        (n.prevDep = Se.depsTail),
        (n.nextDep = void 0),
        (Se.depsTail.nextDep = n),
        (Se.depsTail = n),
        Se.deps === n && (Se.deps = r);
    }
    return n;
  }
  trigger(t) {
    this.version++, _r++, this.notify(t);
  }
  notify(t) {
    Vi();
    try {
      for (let n = this.subs; n; n = n.prevSub) n.sub.notify() && n.sub.dep.notify();
    } finally {
      Wi();
    }
  }
}
function dl(e) {
  if ((e.dep.sc++, e.sub.flags & 4)) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep) dl(r);
    }
    const n = e.dep.subs;
    n !== e && ((e.prevSub = n), n && (n.nextSub = e)), (e.dep.subs = e);
  }
}
const fs = new WeakMap(),
  En = Symbol(''),
  ti = Symbol(''),
  vr = Symbol('');
function Ye(e, t, n) {
  if (bt && Se) {
    let r = fs.get(e);
    r || fs.set(e, (r = new Map()));
    let s = r.get(n);
    s || (r.set(n, (s = new Ls())), (s.map = r), (s.key = n)), s.track();
  }
}
function It(e, t, n, r, s, o) {
  const i = fs.get(e);
  if (!i) {
    _r++;
    return;
  }
  const a = (c) => {
    c && c.trigger();
  };
  if ((Vi(), t === 'clear')) i.forEach(a);
  else {
    const c = se(e),
      l = c && Ui(n);
    if (c && n === 'length') {
      const u = Number(r);
      i.forEach((f, d) => {
        (d === 'length' || d === vr || (!Ct(d) && d >= u)) && a(f);
      });
    } else
      switch (((n !== void 0 || i.has(void 0)) && a(i.get(n)), l && a(i.get(vr)), t)) {
        case 'add':
          c ? l && a(i.get('length')) : (a(i.get(En)), Hn(e) && a(i.get(ti)));
          break;
        case 'delete':
          c || (a(i.get(En)), Hn(e) && a(i.get(ti)));
          break;
        case 'set':
          Hn(e) && a(i.get(En));
          break;
      }
  }
  Wi();
}
function ld(e, t) {
  const n = fs.get(e);
  return n && n.get(t);
}
function Tn(e) {
  const t = ve(e);
  return t === e ? t : (Ye(t, 'iterate', vr), _t(e) ? t : t.map(Xe));
}
function Ns(e) {
  return Ye((e = ve(e)), 'iterate', vr), e;
}
const ud = {
  __proto__: null,
  [Symbol.iterator]() {
    return Zs(this, Symbol.iterator, Xe);
  },
  concat(...e) {
    return Tn(this).concat(...e.map((t) => (se(t) ? Tn(t) : t)));
  },
  entries() {
    return Zs(this, 'entries', (e) => ((e[1] = Xe(e[1])), e));
  },
  every(e, t) {
    return Ot(this, 'every', e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ot(this, 'filter', e, t, (n) => n.map(Xe), arguments);
  },
  find(e, t) {
    return Ot(this, 'find', e, t, Xe, arguments);
  },
  findIndex(e, t) {
    return Ot(this, 'findIndex', e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ot(this, 'findLast', e, t, Xe, arguments);
  },
  findLastIndex(e, t) {
    return Ot(this, 'findLastIndex', e, t, void 0, arguments);
  },
  forEach(e, t) {
    return Ot(this, 'forEach', e, t, void 0, arguments);
  },
  includes(...e) {
    return eo(this, 'includes', e);
  },
  indexOf(...e) {
    return eo(this, 'indexOf', e);
  },
  join(e) {
    return Tn(this).join(e);
  },
  lastIndexOf(...e) {
    return eo(this, 'lastIndexOf', e);
  },
  map(e, t) {
    return Ot(this, 'map', e, t, void 0, arguments);
  },
  pop() {
    return nr(this, 'pop');
  },
  push(...e) {
    return nr(this, 'push', e);
  },
  reduce(e, ...t) {
    return Ra(this, 'reduce', e, t);
  },
  reduceRight(e, ...t) {
    return Ra(this, 'reduceRight', e, t);
  },
  shift() {
    return nr(this, 'shift');
  },
  some(e, t) {
    return Ot(this, 'some', e, t, void 0, arguments);
  },
  splice(...e) {
    return nr(this, 'splice', e);
  },
  toReversed() {
    return Tn(this).toReversed();
  },
  toSorted(e) {
    return Tn(this).toSorted(e);
  },
  toSpliced(...e) {
    return Tn(this).toSpliced(...e);
  },
  unshift(...e) {
    return nr(this, 'unshift', e);
  },
  values() {
    return Zs(this, 'values', Xe);
  },
};
function Zs(e, t, n) {
  const r = Ns(e),
    s = r[t]();
  return (
    r !== e &&
      !_t(e) &&
      ((s._next = s.next),
      (s.next = () => {
        const o = s._next();
        return o.value && (o.value = n(o.value)), o;
      })),
    s
  );
}
const fd = Array.prototype;
function Ot(e, t, n, r, s, o) {
  const i = Ns(e),
    a = i !== e && !_t(e),
    c = i[t];
  if (c !== fd[t]) {
    const f = c.apply(e, o);
    return a ? Xe(f) : f;
  }
  let l = n;
  i !== e &&
    (a
      ? (l = function (f, d) {
          return n.call(this, Xe(f), d, e);
        })
      : n.length > 2 &&
        (l = function (f, d) {
          return n.call(this, f, d, e);
        }));
  const u = c.call(i, l, r);
  return a && s ? s(u) : u;
}
function Ra(e, t, n, r) {
  const s = Ns(e);
  let o = n;
  return (
    s !== e &&
      (_t(e)
        ? n.length > 3 &&
          (o = function (i, a, c) {
            return n.call(this, i, a, c, e);
          })
        : (o = function (i, a, c) {
            return n.call(this, i, Xe(a), c, e);
          })),
    s[t](o, ...r)
  );
}
function eo(e, t, n) {
  const r = ve(e);
  Ye(r, 'iterate', vr);
  const s = r[t](...n);
  return (s === -1 || s === !1) && ji(n[0]) ? ((n[0] = ve(n[0])), r[t](...n)) : s;
}
function nr(e, t, n = []) {
  dn(), Vi();
  const r = ve(e)[t].apply(e, n);
  return Wi(), hn(), r;
}
const dd = Fs('__proto__,__v_isRef,__isVue'),
  hl = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => e !== 'arguments' && e !== 'caller')
      .map((e) => Symbol[e])
      .filter(Ct),
  );
function hd(e) {
  Ct(e) || (e = String(e));
  const t = ve(this);
  return Ye(t, 'has', e), t.hasOwnProperty(e);
}
class xl {
  constructor(t = !1, n = !1) {
    (this._isReadonly = t), (this._isShallow = n);
  }
  get(t, n, r) {
    if (n === '__v_skip') return t.__v_skip;
    const s = this._isReadonly,
      o = this._isShallow;
    if (n === '__v_isReactive') return !s;
    if (n === '__v_isReadonly') return s;
    if (n === '__v_isShallow') return o;
    if (n === '__v_raw')
      return r === (s ? (o ? yl : vl) : o ? _l : ml).get(t) ||
        Object.getPrototypeOf(t) === Object.getPrototypeOf(r)
        ? t
        : void 0;
    const i = se(t);
    if (!s) {
      let c;
      if (i && (c = ud[n])) return c;
      if (n === 'hasOwnProperty') return hd;
    }
    const a = Reflect.get(t, n, Le(t) ? t : r);
    return (Ct(n) ? hl.has(n) : dd(n)) || (s || Ye(t, 'get', n), o)
      ? a
      : Le(a)
        ? i && Ui(n)
          ? a
          : a.value
        : Fe(a)
          ? s
            ? bl(a)
            : Or(a)
          : a;
  }
}
class pl extends xl {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, r, s) {
    let o = t[n];
    if (!this._isShallow) {
      const c = Cn(o);
      if ((!_t(r) && !Cn(r) && ((o = ve(o)), (r = ve(r))), !se(t) && Le(o) && !Le(r)))
        return c ? !1 : ((o.value = r), !0);
    }
    const i = se(t) && Ui(n) ? Number(n) < t.length : be(t, n),
      a = Reflect.set(t, n, r, Le(t) ? t : s);
    return t === ve(s) && (i ? st(r, o) && It(t, 'set', n, r) : It(t, 'add', n, r)), a;
  }
  deleteProperty(t, n) {
    const r = be(t, n);
    t[n];
    const s = Reflect.deleteProperty(t, n);
    return s && r && It(t, 'delete', n, void 0), s;
  }
  has(t, n) {
    const r = Reflect.has(t, n);
    return (!Ct(n) || !hl.has(n)) && Ye(t, 'has', n), r;
  }
  ownKeys(t) {
    return Ye(t, 'iterate', se(t) ? 'length' : En), Reflect.ownKeys(t);
  }
}
class gl extends xl {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const xd = new pl(),
  pd = new gl(),
  gd = new pl(!0),
  md = new gl(!0),
  ni = (e) => e,
  $r = (e) => Reflect.getPrototypeOf(e);
function _d(e, t, n) {
  return function (...r) {
    const s = this.__v_raw,
      o = ve(s),
      i = Hn(o),
      a = e === 'entries' || (e === Symbol.iterator && i),
      c = e === 'keys' && i,
      l = s[e](...r),
      u = n ? ni : t ? ri : Xe;
    return (
      !t && Ye(o, 'iterate', c ? ti : En),
      {
        next() {
          const { value: f, done: d } = l.next();
          return d ? { value: f, done: d } : { value: a ? [u(f[0]), u(f[1])] : u(f), done: d };
        },
        [Symbol.iterator]() {
          return this;
        },
      }
    );
  };
}
function Vr(e) {
  return function (...t) {
    return e === 'delete' ? !1 : e === 'clear' ? void 0 : this;
  };
}
function vd(e, t) {
  const n = {
    get(s) {
      const o = this.__v_raw,
        i = ve(o),
        a = ve(s);
      e || (st(s, a) && Ye(i, 'get', s), Ye(i, 'get', a));
      const { has: c } = $r(i),
        l = t ? ni : e ? ri : Xe;
      if (c.call(i, s)) return l(o.get(s));
      if (c.call(i, a)) return l(o.get(a));
      o !== i && o.get(s);
    },
    get size() {
      const s = this.__v_raw;
      return !e && Ye(ve(s), 'iterate', En), Reflect.get(s, 'size', s);
    },
    has(s) {
      const o = this.__v_raw,
        i = ve(o),
        a = ve(s);
      return (
        e || (st(s, a) && Ye(i, 'has', s), Ye(i, 'has', a)),
        s === a ? o.has(s) : o.has(s) || o.has(a)
      );
    },
    forEach(s, o) {
      const i = this,
        a = i.__v_raw,
        c = ve(a),
        l = t ? ni : e ? ri : Xe;
      return !e && Ye(c, 'iterate', En), a.forEach((u, f) => s.call(o, l(u), l(f), i));
    },
  };
  return (
    Pe(
      n,
      e
        ? { add: Vr('add'), set: Vr('set'), delete: Vr('delete'), clear: Vr('clear') }
        : {
            add(s) {
              !t && !_t(s) && !Cn(s) && (s = ve(s));
              const o = ve(this);
              return $r(o).has.call(o, s) || (o.add(s), It(o, 'add', s, s)), this;
            },
            set(s, o) {
              !t && !_t(o) && !Cn(o) && (o = ve(o));
              const i = ve(this),
                { has: a, get: c } = $r(i);
              let l = a.call(i, s);
              l || ((s = ve(s)), (l = a.call(i, s)));
              const u = c.call(i, s);
              return i.set(s, o), l ? st(o, u) && It(i, 'set', s, o) : It(i, 'add', s, o), this;
            },
            delete(s) {
              const o = ve(this),
                { has: i, get: a } = $r(o);
              let c = i.call(o, s);
              c || ((s = ve(s)), (c = i.call(o, s))), a && a.call(o, s);
              const l = o.delete(s);
              return c && It(o, 'delete', s, void 0), l;
            },
            clear() {
              const s = ve(this),
                o = s.size !== 0,
                i = s.clear();
              return o && It(s, 'clear', void 0, void 0), i;
            },
          },
    ),
    ['keys', 'values', 'entries', Symbol.iterator].forEach((s) => {
      n[s] = _d(s, e, t);
    }),
    n
  );
}
function Is(e, t) {
  const n = vd(e, t);
  return (r, s, o) =>
    s === '__v_isReactive'
      ? !e
      : s === '__v_isReadonly'
        ? e
        : s === '__v_raw'
          ? r
          : Reflect.get(be(n, s) && s in r ? n : r, s, o);
}
const yd = { get: Is(!1, !1) },
  Ed = { get: Is(!1, !0) },
  bd = { get: Is(!0, !1) },
  Cd = { get: Is(!0, !0) },
  ml = new WeakMap(),
  _l = new WeakMap(),
  vl = new WeakMap(),
  yl = new WeakMap();
function Ad(e) {
  switch (e) {
    case 'Object':
    case 'Array':
      return 1;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return 2;
    default:
      return 0;
  }
}
function Bd(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Ad(Gf(e));
}
function Or(e) {
  return Cn(e) ? e : Ms(e, !1, xd, yd, ml);
}
function El(e) {
  return Ms(e, !1, gd, Ed, _l);
}
function bl(e) {
  return Ms(e, !0, pd, bd, vl);
}
function F_(e) {
  return Ms(e, !0, md, Cd, yl);
}
function Ms(e, t, n, r, s) {
  if (!Fe(e) || (e.__v_raw && !(t && e.__v_isReactive))) return e;
  const o = s.get(e);
  if (o) return o;
  const i = Bd(e);
  if (i === 0) return e;
  const a = new Proxy(e, i === 2 ? r : n);
  return s.set(e, a), a;
}
function Vt(e) {
  return Cn(e) ? Vt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Cn(e) {
  return !!(e && e.__v_isReadonly);
}
function _t(e) {
  return !!(e && e.__v_isShallow);
}
function ji(e) {
  return e ? !!e.__v_raw : !1;
}
function ve(e) {
  const t = e && e.__v_raw;
  return t ? ve(t) : e;
}
function Ki(e) {
  return !be(e, '__v_skip') && Object.isExtensible(e) && el(e, '__v_skip', !0), e;
}
const Xe = (e) => (Fe(e) ? Or(e) : e),
  ri = (e) => (Fe(e) ? bl(e) : e);
function Le(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Wt(e) {
  return Cl(e, !1);
}
function Gi(e) {
  return Cl(e, !0);
}
function Cl(e, t) {
  return Le(e) ? e : new Dd(e, t);
}
class Dd {
  constructor(t, n) {
    (this.dep = new Ls()),
      (this.__v_isRef = !0),
      (this.__v_isShallow = !1),
      (this._rawValue = n ? t : ve(t)),
      (this._value = n ? t : Xe(t)),
      (this.__v_isShallow = n);
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue,
      r = this.__v_isShallow || _t(t) || Cn(t);
    (t = r ? t : ve(t)),
      st(t, n) && ((this._rawValue = t), (this._value = r ? t : Xe(t)), this.dep.trigger());
  }
}
function P_(e) {
  e.dep && e.dep.trigger();
}
function qt(e) {
  return Le(e) ? e.value : e;
}
function S_(e) {
  return ae(e) ? e() : qt(e);
}
const Fd = {
  get: (e, t, n) => (t === '__v_raw' ? e : qt(Reflect.get(e, t, n))),
  set: (e, t, n, r) => {
    const s = e[t];
    return Le(s) && !Le(n) ? ((s.value = n), !0) : Reflect.set(e, t, n, r);
  },
};
function Al(e) {
  return Vt(e) ? e : new Proxy(e, Fd);
}
class Pd {
  constructor(t) {
    (this.__v_isRef = !0), (this._value = void 0);
    const n = (this.dep = new Ls()),
      { get: r, set: s } = t(n.track.bind(n), n.trigger.bind(n));
    (this._get = r), (this._set = s);
  }
  get value() {
    return (this._value = this._get());
  }
  set value(t) {
    this._set(t);
  }
}
function Sd(e) {
  return new Pd(e);
}
function Td(e) {
  const t = se(e) ? new Array(e.length) : {};
  for (const n in e) t[n] = Bl(e, n);
  return t;
}
class Rd {
  constructor(t, n, r) {
    (this._object = t),
      (this._key = n),
      (this._defaultValue = r),
      (this.__v_isRef = !0),
      (this._value = void 0);
  }
  get value() {
    const t = this._object[this._key];
    return (this._value = t === void 0 ? this._defaultValue : t);
  }
  set value(t) {
    this._object[this._key] = t;
  }
  get dep() {
    return ld(ve(this._object), this._key);
  }
}
class wd {
  constructor(t) {
    (this._getter = t), (this.__v_isRef = !0), (this.__v_isReadonly = !0), (this._value = void 0);
  }
  get value() {
    return (this._value = this._getter());
  }
}
function T_(e, t, n) {
  return Le(e) ? e : ae(e) ? new wd(e) : Fe(e) && arguments.length > 1 ? Bl(e, t, n) : Wt(e);
}
function Bl(e, t, n) {
  const r = e[t];
  return Le(r) ? r : new Rd(e, t, n);
}
class kd {
  constructor(t, n, r) {
    (this.fn = t),
      (this.setter = n),
      (this._value = void 0),
      (this.dep = new Ls(this)),
      (this.__v_isRef = !0),
      (this.deps = void 0),
      (this.depsTail = void 0),
      (this.flags = 16),
      (this.globalVersion = _r - 1),
      (this.next = void 0),
      (this.effect = this),
      (this.__v_isReadonly = !n),
      (this.isSSR = r);
  }
  notify() {
    if (((this.flags |= 16), !(this.flags & 8) && Se !== this)) return al(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return ul(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Od(e, t, n = !1) {
  let r, s;
  return ae(e) ? (r = e) : ((r = e.get), (s = e.set)), new kd(r, s, n);
}
const R_ = { GET: 'get', HAS: 'has', ITERATE: 'iterate' },
  w_ = { SET: 'set', ADD: 'add', DELETE: 'delete', CLEAR: 'clear' },
  Wr = {},
  ds = new WeakMap();
let tn;
function k_() {
  return tn;
}
function Ld(e, t = !1, n = tn) {
  if (n) {
    let r = ds.get(n);
    r || ds.set(n, (r = [])), r.push(e);
  }
}
function Nd(e, t, n = ge) {
  const { immediate: r, deep: s, once: o, scheduler: i, augmentJob: a, call: c } = n,
    l = (x) => (s ? x : _t(x) || s === !1 || s === 0 ? Mt(x, 1) : Mt(x));
  let u,
    f,
    d,
    p,
    m = !1,
    v = !1;
  if (
    (Le(e)
      ? ((f = () => e.value), (m = _t(e)))
      : Vt(e)
        ? ((f = () => l(e)), (m = !0))
        : se(e)
          ? ((v = !0),
            (m = e.some((x) => Vt(x) || _t(x))),
            (f = () =>
              e.map((x) => {
                if (Le(x)) return x.value;
                if (Vt(x)) return l(x);
                if (ae(x)) return c ? c(x, 2) : x();
              })))
          : ae(e)
            ? t
              ? (f = c ? () => c(e, 2) : e)
              : (f = () => {
                  if (d) {
                    dn();
                    try {
                      d();
                    } finally {
                      hn();
                    }
                  }
                  const x = tn;
                  tn = u;
                  try {
                    return c ? c(e, 3, [p]) : e(p);
                  } finally {
                    tn = x;
                  }
                })
            : (f = mt),
    t && s)
  ) {
    const x = f,
      y = s === !0 ? 1 / 0 : s;
    f = () => Mt(x(), y);
  }
  const E = ol(),
    _ = () => {
      u.stop(), E && E.active && Mi(E.effects, u);
    };
  if (o && t) {
    const x = t;
    t = (...y) => {
      x(...y), _();
    };
  }
  let g = v ? new Array(e.length).fill(Wr) : Wr;
  const h = (x) => {
    if (!(!(u.flags & 1) || (!u.dirty && !x)))
      if (t) {
        const y = u.run();
        if (s || m || (v ? y.some((C, A) => st(C, g[A])) : st(y, g))) {
          d && d();
          const C = tn;
          tn = u;
          try {
            const A = [y, g === Wr ? void 0 : v && g[0] === Wr ? [] : g, p];
            c ? c(t, 3, A) : t(...A), (g = y);
          } finally {
            tn = C;
          }
        }
      } else u.run();
  };
  return (
    a && a(h),
    (u = new us(f)),
    (u.scheduler = i ? () => i(h, !1) : h),
    (p = (x) => Ld(x, !1, u)),
    (d = u.onStop =
      () => {
        const x = ds.get(u);
        if (x) {
          if (c) c(x, 4);
          else for (const y of x) y();
          ds.delete(u);
        }
      }),
    t ? (r ? h(!0) : (g = u.run())) : i ? i(h.bind(null, !0), !0) : u.run(),
    (_.pause = u.pause.bind(u)),
    (_.resume = u.resume.bind(u)),
    (_.stop = _),
    _
  );
}
function Mt(e, t = 1 / 0, n) {
  if (t <= 0 || !Fe(e) || e.__v_skip || ((n = n || new Set()), n.has(e))) return e;
  if ((n.add(e), t--, Le(e))) Mt(e.value, t, n);
  else if (se(e)) for (let r = 0; r < e.length; r++) Mt(e[r], t, n);
  else if (Dn(e) || Hn(e))
    e.forEach((r) => {
      Mt(r, t, n);
    });
  else if (Ps(e)) {
    for (const r in e) Mt(e[r], t, n);
    for (const r of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, r) && Mt(e[r], t, n);
  }
  return e;
}
/**
 * @vue/runtime-core v3.5.13
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/ const Dl = [];
function Id(e) {
  Dl.push(e);
}
function Md() {
  Dl.pop();
}
function O_(e, t) {}
const L_ = {
    SETUP_FUNCTION: 0,
    0: 'SETUP_FUNCTION',
    RENDER_FUNCTION: 1,
    1: 'RENDER_FUNCTION',
    NATIVE_EVENT_HANDLER: 5,
    5: 'NATIVE_EVENT_HANDLER',
    COMPONENT_EVENT_HANDLER: 6,
    6: 'COMPONENT_EVENT_HANDLER',
    VNODE_HOOK: 7,
    7: 'VNODE_HOOK',
    DIRECTIVE_HOOK: 8,
    8: 'DIRECTIVE_HOOK',
    TRANSITION_HOOK: 9,
    9: 'TRANSITION_HOOK',
    APP_ERROR_HANDLER: 10,
    10: 'APP_ERROR_HANDLER',
    APP_WARN_HANDLER: 11,
    11: 'APP_WARN_HANDLER',
    FUNCTION_REF: 12,
    12: 'FUNCTION_REF',
    ASYNC_COMPONENT_LOADER: 13,
    13: 'ASYNC_COMPONENT_LOADER',
    SCHEDULER: 14,
    14: 'SCHEDULER',
    COMPONENT_UPDATE: 15,
    15: 'COMPONENT_UPDATE',
    APP_UNMOUNT_CLEANUP: 16,
    16: 'APP_UNMOUNT_CLEANUP',
  },
  Hd = {
    sp: 'serverPrefetch hook',
    bc: 'beforeCreate hook',
    c: 'created hook',
    bm: 'beforeMount hook',
    m: 'mounted hook',
    bu: 'beforeUpdate hook',
    u: 'updated',
    bum: 'beforeUnmount hook',
    um: 'unmounted hook',
    a: 'activated hook',
    da: 'deactivated hook',
    ec: 'errorCaptured hook',
    rtc: 'renderTracked hook',
    rtg: 'renderTriggered hook',
    0: 'setup function',
    1: 'render function',
    2: 'watcher getter',
    3: 'watcher callback',
    4: 'watcher cleanup function',
    5: 'native event handler',
    6: 'component event handler',
    7: 'vnode hook',
    8: 'directive hook',
    9: 'transition hook',
    10: 'app errorHandler',
    11: 'app warnHandler',
    12: 'ref function',
    13: 'async component loader',
    14: 'scheduler flush',
    15: 'component update',
    16: 'app unmount cleanup function',
  };
function Lr(e, t, n, r) {
  try {
    return r ? e(...r) : e();
  } catch (s) {
    Zn(s, t, n);
  }
}
function At(e, t, n, r) {
  if (ae(e)) {
    const s = Lr(e, t, n, r);
    return (
      s &&
        Hi(s) &&
        s.catch((o) => {
          Zn(o, t, n);
        }),
      s
    );
  }
  if (se(e)) {
    const s = [];
    for (let o = 0; o < e.length; o++) s.push(At(e[o], t, n, r));
    return s;
  }
}
function Zn(e, t, n, r = !0) {
  const s = t ? t.vnode : null,
    { errorHandler: o, throwUnhandledErrorInProduction: i } = (t && t.appContext.config) || ge;
  if (t) {
    let a = t.parent;
    const c = t.proxy,
      l = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; a; ) {
      const u = a.ec;
      if (u) {
        for (let f = 0; f < u.length; f++) if (u[f](e, c, l) === !1) return;
      }
      a = a.parent;
    }
    if (o) {
      dn(), Lr(o, null, 10, [e, c, l]), hn();
      return;
    }
  }
  Ud(e, n, s, r, i);
}
function Ud(e, t, n, r = !0, s = !1) {
  if (s) throw e;
  console.error(e);
}
const ot = [];
let Tt = -1;
const Vn = [];
let nn = null,
  kn = 0;
const Fl = Promise.resolve();
let hs = null;
function Nr(e) {
  const t = hs || Fl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function $d(e) {
  let t = Tt + 1,
    n = ot.length;
  for (; t < n; ) {
    const r = (t + n) >>> 1,
      s = ot[r],
      o = yr(s);
    o < e || (o === e && s.flags & 2) ? (t = r + 1) : (n = r);
  }
  return t;
}
function zi(e) {
  if (!(e.flags & 1)) {
    const t = yr(e),
      n = ot[ot.length - 1];
    !n || (!(e.flags & 2) && t >= yr(n)) ? ot.push(e) : ot.splice($d(t), 0, e),
      (e.flags |= 1),
      Pl();
  }
}
function Pl() {
  hs || (hs = Fl.then(Sl));
}
function xs(e) {
  se(e)
    ? Vn.push(...e)
    : nn && e.id === -1
      ? nn.splice(kn + 1, 0, e)
      : e.flags & 1 || (Vn.push(e), (e.flags |= 1)),
    Pl();
}
function wa(e, t, n = Tt + 1) {
  for (; n < ot.length; n++) {
    const r = ot[n];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid) continue;
      ot.splice(n, 1), n--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function ps(e) {
  if (Vn.length) {
    const t = [...new Set(Vn)].sort((n, r) => yr(n) - yr(r));
    if (((Vn.length = 0), nn)) {
      nn.push(...t);
      return;
    }
    for (nn = t, kn = 0; kn < nn.length; kn++) {
      const n = nn[kn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), (n.flags &= -2);
    }
    (nn = null), (kn = 0);
  }
}
const yr = (e) => (e.id == null ? (e.flags & 2 ? -1 : 1 / 0) : e.id);
function Sl(e) {
  try {
    for (Tt = 0; Tt < ot.length; Tt++) {
      const t = ot[Tt];
      t &&
        !(t.flags & 8) &&
        (t.flags & 4 && (t.flags &= -2), Lr(t, t.i, t.i ? 15 : 14), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Tt < ot.length; Tt++) {
      const t = ot[Tt];
      t && (t.flags &= -2);
    }
    (Tt = -1), (ot.length = 0), ps(), (hs = null), (ot.length || Vn.length) && Sl();
  }
}
let On,
  qr = [];
function Tl(e, t) {
  var n, r;
  (On = e),
    On
      ? ((On.enabled = !0), qr.forEach(({ event: s, args: o }) => On.emit(s, ...o)), (qr = []))
      : typeof window < 'u' &&
          window.HTMLElement &&
          !(
            (r = (n = window.navigator) == null ? void 0 : n.userAgent) != null &&
            r.includes('jsdom')
          )
        ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((o) => {
            Tl(o, t);
          }),
          setTimeout(() => {
            On || ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null), (qr = []));
          }, 3e3))
        : (qr = []);
}
let We = null,
  Hs = null;
function Er(e) {
  const t = We;
  return (We = e), (Hs = (e && e.type.__scopeId) || null), t;
}
function N_(e) {
  Hs = e;
}
function I_() {
  Hs = null;
}
const M_ = (e) => Rl;
function Rl(e, t = We, n) {
  if (!t || e._n) return e;
  const r = (...s) => {
    r._d && Ka(-1);
    const o = Er(t);
    let i;
    try {
      i = e(...s);
    } finally {
      Er(o), r._d && Ka(1);
    }
    return i;
  };
  return (r._n = !0), (r._c = !0), (r._d = !0), r;
}
function H_(e, t) {
  if (We === null) return e;
  const n = Hr(We),
    r = e.dirs || (e.dirs = []);
  for (let s = 0; s < t.length; s++) {
    let [o, i, a, c = ge] = t[s];
    o &&
      (ae(o) && (o = { mounted: o, updated: o }),
      o.deep && Mt(i),
      r.push({ dir: o, instance: n, value: i, oldValue: void 0, arg: a, modifiers: c }));
  }
  return e;
}
function Rt(e, t, n, r) {
  const s = e.dirs,
    o = t && t.dirs;
  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    o && (a.oldValue = o[i].value);
    let c = a.dir[r];
    c && (dn(), At(c, n, 8, [e.el, a, e, t]), hn());
  }
}
const wl = Symbol('_vte'),
  kl = (e) => e.__isTeleport,
  fr = (e) => e && (e.disabled || e.disabled === ''),
  ka = (e) => e && (e.defer || e.defer === ''),
  Oa = (e) => typeof SVGElement < 'u' && e instanceof SVGElement,
  La = (e) => typeof MathMLElement == 'function' && e instanceof MathMLElement,
  si = (e, t) => {
    const n = e && e.to;
    return Te(n) ? (t ? t(n) : null) : n;
  },
  Ol = {
    name: 'Teleport',
    __isTeleport: !0,
    process(e, t, n, r, s, o, i, a, c, l) {
      const {
          mc: u,
          pc: f,
          pbc: d,
          o: { insert: p, querySelector: m, createText: v, createComment: E },
        } = l,
        _ = fr(t.props);
      let { shapeFlag: g, children: h, dynamicChildren: x } = t;
      if (e == null) {
        const y = (t.el = v('')),
          C = (t.anchor = v(''));
        p(y, n, r), p(C, n, r);
        const A = (D, b) => {
            g & 16 && (s && s.isCE && (s.ce._teleportTarget = D), u(h, D, b, s, o, i, a, c));
          },
          w = () => {
            const D = (t.target = si(t.props, m)),
              b = Ll(D, t, v, p);
            D &&
              (i !== 'svg' && Oa(D) ? (i = 'svg') : i !== 'mathml' && La(D) && (i = 'mathml'),
              _ || (A(D, b), ns(t, !1)));
          };
        _ && (A(n, C), ns(t, !0)),
          ka(t.props)
            ? Ue(() => {
                w(), (t.el.__isMounted = !0);
              }, o)
            : w();
      } else {
        if (ka(t.props) && !e.el.__isMounted) {
          Ue(() => {
            Ol.process(e, t, n, r, s, o, i, a, c, l), delete e.el.__isMounted;
          }, o);
          return;
        }
        (t.el = e.el), (t.targetStart = e.targetStart);
        const y = (t.anchor = e.anchor),
          C = (t.target = e.target),
          A = (t.targetAnchor = e.targetAnchor),
          w = fr(e.props),
          D = w ? n : C,
          b = w ? y : A;
        if (
          (i === 'svg' || Oa(C) ? (i = 'svg') : (i === 'mathml' || La(C)) && (i = 'mathml'),
          x
            ? (d(e.dynamicChildren, x, D, s, o, i, a), sa(e, t, !0))
            : c || f(e, t, D, b, s, o, i, a, !1),
          _)
        )
          w
            ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to)
            : jr(t, n, y, l, 1);
        else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
          const F = (t.target = si(t.props, m));
          F && jr(t, F, null, l, 0);
        } else w && jr(t, C, A, l, 1);
        ns(t, _);
      }
    },
    remove(e, t, n, { um: r, o: { remove: s } }, o) {
      const {
        shapeFlag: i,
        children: a,
        anchor: c,
        targetStart: l,
        targetAnchor: u,
        target: f,
        props: d,
      } = e;
      if ((f && (s(l), s(u)), o && s(c), i & 16)) {
        const p = o || !fr(d);
        for (let m = 0; m < a.length; m++) {
          const v = a[m];
          r(v, t, n, p, !!v.dynamicChildren);
        }
      }
    },
    move: jr,
    hydrate: Vd,
  };
function jr(e, t, n, { o: { insert: r }, m: s }, o = 2) {
  o === 0 && r(e.targetAnchor, t, n);
  const { el: i, anchor: a, shapeFlag: c, children: l, props: u } = e,
    f = o === 2;
  if ((f && r(i, t, n), (!f || fr(u)) && c & 16))
    for (let d = 0; d < l.length; d++) s(l[d], t, n, 2);
  f && r(a, t, n);
}
function Vd(
  e,
  t,
  n,
  r,
  s,
  o,
  { o: { nextSibling: i, parentNode: a, querySelector: c, insert: l, createText: u } },
  f,
) {
  const d = (t.target = si(t.props, c));
  if (d) {
    const p = fr(t.props),
      m = d._lpa || d.firstChild;
    if (t.shapeFlag & 16)
      if (p)
        (t.anchor = f(i(e), t, a(e), n, r, s, o)),
          (t.targetStart = m),
          (t.targetAnchor = m && i(m));
      else {
        t.anchor = i(e);
        let v = m;
        for (; v; ) {
          if (v && v.nodeType === 8) {
            if (v.data === 'teleport start anchor') t.targetStart = v;
            else if (v.data === 'teleport anchor') {
              (t.targetAnchor = v), (d._lpa = t.targetAnchor && i(t.targetAnchor));
              break;
            }
          }
          v = i(v);
        }
        t.targetAnchor || Ll(d, t, u, l), f(m && i(m), t, d, n, r, s, o);
      }
    ns(t, p);
  }
  return t.anchor && i(t.anchor);
}
const U_ = Ol;
function ns(e, t) {
  const n = e.ctx;
  if (n && n.ut) {
    let r, s;
    for (
      t ? ((r = e.el), (s = e.anchor)) : ((r = e.targetStart), (s = e.targetAnchor));
      r && r !== s;

    )
      r.nodeType === 1 && r.setAttribute('data-v-owner', n.uid), (r = r.nextSibling);
    n.ut();
  }
}
function Ll(e, t, n, r) {
  const s = (t.targetStart = n('')),
    o = (t.targetAnchor = n(''));
  return (s[wl] = o), e && (r(s, e), r(o, e)), o;
}
const rn = Symbol('_leaveCb'),
  Kr = Symbol('_enterCb');
function Nl() {
  const e = { isMounted: !1, isLeaving: !1, isUnmounting: !1, leavingVNodes: new Map() };
  return (
    Fn(() => {
      e.isMounted = !0;
    }),
    Ji(() => {
      e.isUnmounting = !0;
    }),
    e
  );
}
const pt = [Function, Array],
  Il = {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    onBeforeEnter: pt,
    onEnter: pt,
    onAfterEnter: pt,
    onEnterCancelled: pt,
    onBeforeLeave: pt,
    onLeave: pt,
    onAfterLeave: pt,
    onLeaveCancelled: pt,
    onBeforeAppear: pt,
    onAppear: pt,
    onAfterAppear: pt,
    onAppearCancelled: pt,
  },
  Ml = (e) => {
    const t = e.subTree;
    return t.component ? Ml(t.component) : t;
  },
  Wd = {
    name: 'BaseTransition',
    props: Il,
    setup(e, { slots: t }) {
      const n = Ze(),
        r = Nl();
      return () => {
        const s = t.default && Yi(t.default(), !0);
        if (!s || !s.length) return;
        const o = Hl(s),
          i = ve(e),
          { mode: a } = i;
        if (r.isLeaving) return to(o);
        const c = Na(o);
        if (!c) return to(o);
        let l = br(c, i, r, n, (f) => (l = f));
        c.type !== $e && un(c, l);
        let u = n.subTree && Na(n.subTree);
        if (u && u.type !== $e && !yt(c, u) && Ml(n).type !== $e) {
          let f = br(u, i, r, n);
          if ((un(u, f), a === 'out-in' && c.type !== $e))
            return (
              (r.isLeaving = !0),
              (f.afterLeave = () => {
                (r.isLeaving = !1),
                  n.job.flags & 8 || n.update(),
                  delete f.afterLeave,
                  (u = void 0);
              }),
              to(o)
            );
          a === 'in-out' && c.type !== $e
            ? (f.delayLeave = (d, p, m) => {
                const v = Ul(r, u);
                (v[String(u.key)] = u),
                  (d[rn] = () => {
                    p(), (d[rn] = void 0), delete l.delayedLeave, (u = void 0);
                  }),
                  (l.delayedLeave = () => {
                    m(), delete l.delayedLeave, (u = void 0);
                  });
              })
            : (u = void 0);
        } else u && (u = void 0);
        return o;
      };
    },
  };
function Hl(e) {
  let t = e[0];
  if (e.length > 1) {
    for (const n of e)
      if (n.type !== $e) {
        t = n;
        break;
      }
  }
  return t;
}
const qd = Wd;
function Ul(e, t) {
  const { leavingVNodes: n } = e;
  let r = n.get(t.type);
  return r || ((r = Object.create(null)), n.set(t.type, r)), r;
}
function br(e, t, n, r, s) {
  const {
      appear: o,
      mode: i,
      persisted: a = !1,
      onBeforeEnter: c,
      onEnter: l,
      onAfterEnter: u,
      onEnterCancelled: f,
      onBeforeLeave: d,
      onLeave: p,
      onAfterLeave: m,
      onLeaveCancelled: v,
      onBeforeAppear: E,
      onAppear: _,
      onAfterAppear: g,
      onAppearCancelled: h,
    } = t,
    x = String(e.key),
    y = Ul(n, e),
    C = (D, b) => {
      D && At(D, r, 9, b);
    },
    A = (D, b) => {
      const F = b[1];
      C(D, b), se(D) ? D.every((T) => T.length <= 1) && F() : D.length <= 1 && F();
    },
    w = {
      mode: i,
      persisted: a,
      beforeEnter(D) {
        let b = c;
        if (!n.isMounted)
          if (o) b = E || c;
          else return;
        D[rn] && D[rn](!0);
        const F = y[x];
        F && yt(e, F) && F.el[rn] && F.el[rn](), C(b, [D]);
      },
      enter(D) {
        let b = l,
          F = u,
          T = f;
        if (!n.isMounted)
          if (o) (b = _ || l), (F = g || u), (T = h || f);
          else return;
        let O = !1;
        const Y = (D[Kr] = (J) => {
          O ||
            ((O = !0),
            J ? C(T, [D]) : C(F, [D]),
            w.delayedLeave && w.delayedLeave(),
            (D[Kr] = void 0));
        });
        b ? A(b, [D, Y]) : Y();
      },
      leave(D, b) {
        const F = String(e.key);
        if ((D[Kr] && D[Kr](!0), n.isUnmounting)) return b();
        C(d, [D]);
        let T = !1;
        const O = (D[rn] = (Y) => {
          T ||
            ((T = !0), b(), Y ? C(v, [D]) : C(m, [D]), (D[rn] = void 0), y[F] === e && delete y[F]);
        });
        (y[F] = e), p ? A(p, [D, O]) : O();
      },
      clone(D) {
        const b = br(D, t, n, r, s);
        return s && s(b), b;
      },
    };
  return w;
}
function to(e) {
  if (Ir(e)) return (e = Kt(e)), (e.children = null), e;
}
function Na(e) {
  if (!Ir(e)) return kl(e.type) && e.children ? Hl(e.children) : e;
  const { shapeFlag: t, children: n } = e;
  if (n) {
    if (t & 16) return n[0];
    if (t & 32 && ae(n.default)) return n.default();
  }
}
function un(e, t) {
  e.shapeFlag & 6 && e.component
    ? ((e.transition = t), un(e.component.subTree, t))
    : e.shapeFlag & 128
      ? ((e.ssContent.transition = t.clone(e.ssContent)),
        (e.ssFallback.transition = t.clone(e.ssFallback)))
      : (e.transition = t);
}
function Yi(e, t = !1, n) {
  let r = [],
    s = 0;
  for (let o = 0; o < e.length; o++) {
    let i = e[o];
    const a = n == null ? i.key : String(n) + String(i.key != null ? i.key : o);
    i.type === Ne
      ? (i.patchFlag & 128 && s++, (r = r.concat(Yi(i.children, t, a))))
      : (t || i.type !== $e) && r.push(a != null ? Kt(i, { key: a }) : i);
  }
  if (s > 1) for (let o = 0; o < r.length; o++) r[o].patchFlag = -2;
  return r;
}
/*! #__NO_SIDE_EFFECTS__ */ function Gt(e, t) {
  return ae(e) ? Pe({ name: e.name }, t, { setup: e }) : e;
}
function $_() {
  const e = Ze();
  return e ? (e.appContext.config.idPrefix || 'v') + '-' + e.ids[0] + e.ids[1]++ : '';
}
function Xi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + '-', 0, 0];
}
function V_(e) {
  const t = Ze(),
    n = Gi(null);
  if (t) {
    const s = t.refs === ge ? (t.refs = {}) : t.refs;
    Object.defineProperty(s, e, { enumerable: !0, get: () => n.value, set: (o) => (n.value = o) });
  }
  return n;
}
function Cr(e, t, n, r, s = !1) {
  if (se(e)) {
    e.forEach((m, v) => Cr(m, t && (se(t) ? t[v] : t), n, r, s));
    return;
  }
  if (an(r) && !s) {
    r.shapeFlag & 512 &&
      r.type.__asyncResolved &&
      r.component.subTree.component &&
      Cr(e, t, n, r.component.subTree);
    return;
  }
  const o = r.shapeFlag & 4 ? Hr(r.component) : r.el,
    i = s ? null : o,
    { i: a, r: c } = e,
    l = t && t.r,
    u = a.refs === ge ? (a.refs = {}) : a.refs,
    f = a.setupState,
    d = ve(f),
    p = f === ge ? () => !1 : (m) => be(d, m);
  if (
    (l != null &&
      l !== c &&
      (Te(l) ? ((u[l] = null), p(l) && (f[l] = null)) : Le(l) && (l.value = null)),
    ae(c))
  )
    Lr(c, a, 12, [i, u]);
  else {
    const m = Te(c),
      v = Le(c);
    if (m || v) {
      const E = () => {
        if (e.f) {
          const _ = m ? (p(c) ? f[c] : u[c]) : c.value;
          s
            ? se(_) && Mi(_, o)
            : se(_)
              ? _.includes(o) || _.push(o)
              : m
                ? ((u[c] = [o]), p(c) && (f[c] = u[c]))
                : ((c.value = [o]), e.k && (u[e.k] = c.value));
        } else m ? ((u[c] = i), p(c) && (f[c] = i)) : v && ((c.value = i), e.k && (u[e.k] = i));
      };
      i ? ((E.id = -1), Ue(E, n)) : E();
    }
  }
}
let Ia = !1;
const Rn = () => {
    Ia || (console.error('Hydration completed but contains mismatches.'), (Ia = !0));
  },
  jd = (e) => e.namespaceURI.includes('svg') && e.tagName !== 'foreignObject',
  Kd = (e) => e.namespaceURI.includes('MathML'),
  Gr = (e) => {
    if (e.nodeType === 1) {
      if (jd(e)) return 'svg';
      if (Kd(e)) return 'mathml';
    }
  },
  In = (e) => e.nodeType === 8;
function Gd(e) {
  const {
      mt: t,
      p: n,
      o: {
        patchProp: r,
        createText: s,
        nextSibling: o,
        parentNode: i,
        remove: a,
        insert: c,
        createComment: l,
      },
    } = e,
    u = (h, x) => {
      if (!x.hasChildNodes()) {
        n(null, h, x), ps(), (x._vnode = h);
        return;
      }
      f(x.firstChild, h, null, null, null), ps(), (x._vnode = h);
    },
    f = (h, x, y, C, A, w = !1) => {
      w = w || !!x.dynamicChildren;
      const D = In(h) && h.data === '[',
        b = () => v(h, x, y, C, A, D),
        { type: F, ref: T, shapeFlag: O, patchFlag: Y } = x;
      let J = h.nodeType;
      (x.el = h), Y === -2 && ((w = !1), (x.dynamicChildren = null));
      let q = null;
      switch (F) {
        case cn:
          J !== 3
            ? x.children === ''
              ? (c((x.el = s('')), i(h), h), (q = h))
              : (q = b())
            : (h.data !== x.children && (Rn(), (h.data = x.children)), (q = o(h)));
          break;
        case $e:
          g(h)
            ? ((q = o(h)), _((x.el = h.content.firstChild), h, y))
            : J !== 8 || D
              ? (q = b())
              : (q = o(h));
          break;
        case qn:
          if ((D && ((h = o(h)), (J = h.nodeType)), J === 1 || J === 3)) {
            q = h;
            const Z = !x.children.length;
            for (let X = 0; X < x.staticCount; X++)
              Z && (x.children += q.nodeType === 1 ? q.outerHTML : q.data),
                X === x.staticCount - 1 && (x.anchor = q),
                (q = o(q));
            return D ? o(q) : q;
          } else b();
          break;
        case Ne:
          D ? (q = m(h, x, y, C, A, w)) : (q = b());
          break;
        default:
          if (O & 1)
            (J !== 1 || x.type.toLowerCase() !== h.tagName.toLowerCase()) && !g(h)
              ? (q = b())
              : (q = d(h, x, y, C, A, w));
          else if (O & 6) {
            x.slotScopeIds = A;
            const Z = i(h);
            if (
              (D
                ? (q = E(h))
                : In(h) && h.data === 'teleport start'
                  ? (q = E(h, h.data, 'teleport end'))
                  : (q = o(h)),
              t(x, Z, null, y, C, Gr(Z), w),
              an(x) && !x.type.__asyncResolved)
            ) {
              let X;
              D
                ? ((X = he(Ne)), (X.anchor = q ? q.previousSibling : Z.lastChild))
                : (X = h.nodeType === 3 ? xu('') : he('div')),
                (X.el = h),
                (x.component.subTree = X);
            }
          } else
            O & 64
              ? J !== 8
                ? (q = b())
                : (q = x.type.hydrate(h, x, y, C, A, w, e, p))
              : O & 128 && (q = x.type.hydrate(h, x, y, C, Gr(i(h)), A, w, e, f));
      }
      return T != null && Cr(T, null, C, x), q;
    },
    d = (h, x, y, C, A, w) => {
      w = w || !!x.dynamicChildren;
      const { type: D, props: b, patchFlag: F, shapeFlag: T, dirs: O, transition: Y } = x,
        J = D === 'input' || D === 'option';
      if (J || F !== -1) {
        O && Rt(x, null, y, 'created');
        let q = !1;
        if (g(h)) {
          q = ru(null, Y) && y && y.vnode.props && y.vnode.props.appear;
          const X = h.content.firstChild;
          q && Y.beforeEnter(X), _(X, h, y), (x.el = h = X);
        }
        if (T & 16 && !(b && (b.innerHTML || b.textContent))) {
          let X = p(h.firstChild, x, h, y, C, A, w);
          for (; X; ) {
            zr(h, 1) || Rn();
            const ie = X;
            (X = X.nextSibling), a(ie);
          }
        } else if (T & 8) {
          let X = x.children;
          X[0] ===
            `
` &&
            (h.tagName === 'PRE' || h.tagName === 'TEXTAREA') &&
            (X = X.slice(1)),
            h.textContent !== X && (zr(h, 0) || Rn(), (h.textContent = x.children));
        }
        if (b) {
          if (J || !w || F & 48) {
            const X = h.tagName.includes('-');
            for (const ie in b)
              ((J && (ie.endsWith('value') || ie === 'indeterminate')) ||
                (kr(ie) && !Un(ie)) ||
                ie[0] === '.' ||
                X) &&
                r(h, ie, null, b[ie], void 0, y);
          } else if (b.onClick) r(h, 'onClick', null, b.onClick, void 0, y);
          else if (F & 4 && Vt(b.style)) for (const X in b.style) b.style[X];
        }
        let Z;
        (Z = b && b.onVnodeBeforeMount) && at(Z, y, x),
          O && Rt(x, null, y, 'beforeMount'),
          ((Z = b && b.onVnodeMounted) || O || q) &&
            lu(() => {
              Z && at(Z, y, x), q && Y.enter(h), O && Rt(x, null, y, 'mounted');
            }, C);
      }
      return h.nextSibling;
    },
    p = (h, x, y, C, A, w, D) => {
      D = D || !!x.dynamicChildren;
      const b = x.children,
        F = b.length;
      for (let T = 0; T < F; T++) {
        const O = D ? b[T] : (b[T] = ct(b[T])),
          Y = O.type === cn;
        h
          ? (Y &&
              !D &&
              T + 1 < F &&
              ct(b[T + 1]).type === cn &&
              (c(s(h.data.slice(O.children.length)), y, o(h)), (h.data = O.children)),
            (h = f(h, O, C, A, w, D)))
          : Y && !O.children
            ? c((O.el = s('')), y)
            : (zr(y, 1) || Rn(), n(null, O, y, null, C, A, Gr(y), w));
      }
      return h;
    },
    m = (h, x, y, C, A, w) => {
      const { slotScopeIds: D } = x;
      D && (A = A ? A.concat(D) : D);
      const b = i(h),
        F = p(o(h), x, b, y, C, A, w);
      return F && In(F) && F.data === ']'
        ? o((x.anchor = F))
        : (Rn(), c((x.anchor = l(']')), b, F), F);
    },
    v = (h, x, y, C, A, w) => {
      if ((zr(h.parentElement, 1) || Rn(), (x.el = null), w)) {
        const F = E(h);
        for (;;) {
          const T = o(h);
          if (T && T !== F) a(T);
          else break;
        }
      }
      const D = o(h),
        b = i(h);
      return a(h), n(null, x, b, D, y, C, Gr(b), A), y && ((y.vnode.el = x.el), Ws(y, x.el)), D;
    },
    E = (h, x = '[', y = ']') => {
      let C = 0;
      for (; h; )
        if (((h = o(h)), h && In(h) && (h.data === x && C++, h.data === y))) {
          if (C === 0) return o(h);
          C--;
        }
      return h;
    },
    _ = (h, x, y) => {
      const C = x.parentNode;
      C && C.replaceChild(h, x);
      let A = y;
      for (; A; ) A.vnode.el === x && (A.vnode.el = A.subTree.el = h), (A = A.parent);
    },
    g = (h) => h.nodeType === 1 && h.tagName === 'TEMPLATE';
  return [u, f];
}
const Ma = 'data-allow-mismatch',
  zd = { 0: 'text', 1: 'children', 2: 'class', 3: 'style', 4: 'attribute' };
function zr(e, t) {
  if (t === 0 || t === 1) for (; e && !e.hasAttribute(Ma); ) e = e.parentElement;
  const n = e && e.getAttribute(Ma);
  if (n == null) return !1;
  if (n === '') return !0;
  {
    const r = n.split(',');
    return t === 0 && r.includes('children') ? !0 : n.split(',').includes(zd[t]);
  }
}
const Yd = Rs().requestIdleCallback || ((e) => setTimeout(e, 1)),
  Xd = Rs().cancelIdleCallback || ((e) => clearTimeout(e)),
  W_ =
    (e = 1e4) =>
    (t) => {
      const n = Yd(t, { timeout: e });
      return () => Xd(n);
    };
function Qd(e) {
  const { top: t, left: n, bottom: r, right: s } = e.getBoundingClientRect(),
    { innerHeight: o, innerWidth: i } = window;
  return ((t > 0 && t < o) || (r > 0 && r < o)) && ((n > 0 && n < i) || (s > 0 && s < i));
}
const q_ = (e) => (t, n) => {
    const r = new IntersectionObserver((s) => {
      for (const o of s)
        if (o.isIntersecting) {
          r.disconnect(), t();
          break;
        }
    }, e);
    return (
      n((s) => {
        if (s instanceof Element) {
          if (Qd(s)) return t(), r.disconnect(), !1;
          r.observe(s);
        }
      }),
      () => r.disconnect()
    );
  },
  j_ = (e) => (t) => {
    if (e) {
      const n = matchMedia(e);
      if (n.matches) t();
      else
        return (
          n.addEventListener('change', t, { once: !0 }), () => n.removeEventListener('change', t)
        );
    }
  },
  K_ =
    (e = []) =>
    (t, n) => {
      Te(e) && (e = [e]);
      let r = !1;
      const s = (i) => {
          r || ((r = !0), o(), t(), i.target.dispatchEvent(new i.constructor(i.type, i)));
        },
        o = () => {
          n((i) => {
            for (const a of e) i.removeEventListener(a, s);
          });
        };
      return (
        n((i) => {
          for (const a of e) i.addEventListener(a, s, { once: !0 });
        }),
        o
      );
    };
function Jd(e, t) {
  if (In(e) && e.data === '[') {
    let n = 1,
      r = e.nextSibling;
    for (; r; ) {
      if (r.nodeType === 1) {
        if (t(r) === !1) break;
      } else if (In(r))
        if (r.data === ']') {
          if (--n === 0) break;
        } else r.data === '[' && n++;
      r = r.nextSibling;
    }
  } else t(e);
}
const an = (e) => !!e.type.__asyncLoader;
/*! #__NO_SIDE_EFFECTS__ */ function G_(e) {
  ae(e) && (e = { loader: e });
  const {
    loader: t,
    loadingComponent: n,
    errorComponent: r,
    delay: s = 200,
    hydrate: o,
    timeout: i,
    suspensible: a = !0,
    onError: c,
  } = e;
  let l = null,
    u,
    f = 0;
  const d = () => (f++, (l = null), p()),
    p = () => {
      let m;
      return (
        l ||
        (m = l =
          t()
            .catch((v) => {
              if (((v = v instanceof Error ? v : new Error(String(v))), c))
                return new Promise((E, _) => {
                  c(
                    v,
                    () => E(d()),
                    () => _(v),
                    f + 1,
                  );
                });
              throw v;
            })
            .then((v) =>
              m !== l && l
                ? l
                : (v && (v.__esModule || v[Symbol.toStringTag] === 'Module') && (v = v.default),
                  (u = v),
                  v),
            ))
      );
    };
  return Gt({
    name: 'AsyncComponentWrapper',
    __asyncLoader: p,
    __asyncHydrate(m, v, E) {
      const _ = o
        ? () => {
            const g = o(E, (h) => Jd(m, h));
            g && (v.bum || (v.bum = [])).push(g);
          }
        : E;
      u ? _() : p().then(() => !v.isUnmounted && _());
    },
    get __asyncResolved() {
      return u;
    },
    setup() {
      const m = Ve;
      if ((Xi(m), u)) return () => no(u, m);
      const v = (h) => {
        (l = null), Zn(h, m, 13, !r);
      };
      if ((a && m.suspense) || jn)
        return p()
          .then((h) => () => no(h, m))
          .catch((h) => (v(h), () => (r ? he(r, { error: h }) : null)));
      const E = Wt(!1),
        _ = Wt(),
        g = Wt(!!s);
      return (
        s &&
          setTimeout(() => {
            g.value = !1;
          }, s),
        i != null &&
          setTimeout(() => {
            if (!E.value && !_.value) {
              const h = new Error(`Async component timed out after ${i}ms.`);
              v(h), (_.value = h);
            }
          }, i),
        p()
          .then(() => {
            (E.value = !0), m.parent && Ir(m.parent.vnode) && m.parent.update();
          })
          .catch((h) => {
            v(h), (_.value = h);
          }),
        () => {
          if (E.value && u) return no(u, m);
          if (_.value && r) return he(r, { error: _.value });
          if (n && !g.value) return he(n);
        }
      );
    },
  });
}
function no(e, t) {
  const { ref: n, props: r, children: s, ce: o } = t.vnode,
    i = he(e, r, s);
  return (i.ref = n), (i.ce = o), delete t.vnode.ce, i;
}
const Ir = (e) => e.type.__isKeepAlive,
  Zd = {
    name: 'KeepAlive',
    __isKeepAlive: !0,
    props: {
      include: [String, RegExp, Array],
      exclude: [String, RegExp, Array],
      max: [String, Number],
    },
    setup(e, { slots: t }) {
      const n = Ze(),
        r = n.ctx;
      if (!r.renderer)
        return () => {
          const g = t.default && t.default();
          return g && g.length === 1 ? g[0] : g;
        };
      const s = new Map(),
        o = new Set();
      let i = null;
      const a = n.suspense,
        {
          renderer: {
            p: c,
            m: l,
            um: u,
            o: { createElement: f },
          },
        } = r,
        d = f('div');
      (r.activate = (g, h, x, y, C) => {
        const A = g.component;
        l(g, h, x, 0, a),
          c(A.vnode, g, h, x, A, a, y, g.slotScopeIds, C),
          Ue(() => {
            (A.isDeactivated = !1), A.a && $n(A.a);
            const w = g.props && g.props.onVnodeMounted;
            w && at(w, A.parent, g);
          }, a);
      }),
        (r.deactivate = (g) => {
          const h = g.component;
          ms(h.m),
            ms(h.a),
            l(g, d, null, 1, a),
            Ue(() => {
              h.da && $n(h.da);
              const x = g.props && g.props.onVnodeUnmounted;
              x && at(x, h.parent, g), (h.isDeactivated = !0);
            }, a);
        });
      function p(g) {
        ro(g), u(g, n, a, !0);
      }
      function m(g) {
        s.forEach((h, x) => {
          const y = gi(h.type);
          y && !g(y) && v(x);
        });
      }
      function v(g) {
        const h = s.get(g);
        h && (!i || !yt(h, i)) ? p(h) : i && ro(i), s.delete(g), o.delete(g);
      }
      wt(
        () => [e.include, e.exclude],
        ([g, h]) => {
          g && m((x) => ar(g, x)), h && m((x) => !ar(h, x));
        },
        { flush: 'post', deep: !0 },
      );
      let E = null;
      const _ = () => {
        E != null &&
          (_s(n.subTree.type)
            ? Ue(() => {
                s.set(E, Yr(n.subTree));
              }, n.subTree.suspense)
            : s.set(E, Yr(n.subTree)));
      };
      return (
        Fn(_),
        Qi(_),
        Ji(() => {
          s.forEach((g) => {
            const { subTree: h, suspense: x } = n,
              y = Yr(h);
            if (g.type === y.type && g.key === y.key) {
              ro(y);
              const C = y.component.da;
              C && Ue(C, x);
              return;
            }
            p(g);
          });
        }),
        () => {
          if (((E = null), !t.default)) return (i = null);
          const g = t.default(),
            h = g[0];
          if (g.length > 1) return (i = null), g;
          if (!jt(h) || (!(h.shapeFlag & 4) && !(h.shapeFlag & 128))) return (i = null), h;
          let x = Yr(h);
          if (x.type === $e) return (i = null), x;
          const y = x.type,
            C = gi(an(x) ? x.type.__asyncResolved || {} : y),
            { include: A, exclude: w, max: D } = e;
          if ((A && (!C || !ar(A, C))) || (w && C && ar(w, C)))
            return (x.shapeFlag &= -257), (i = x), h;
          const b = x.key == null ? y : x.key,
            F = s.get(b);
          return (
            x.el && ((x = Kt(x)), h.shapeFlag & 128 && (h.ssContent = x)),
            (E = b),
            F
              ? ((x.el = F.el),
                (x.component = F.component),
                x.transition && un(x, x.transition),
                (x.shapeFlag |= 512),
                o.delete(b),
                o.add(b))
              : (o.add(b), D && o.size > parseInt(D, 10) && v(o.values().next().value)),
            (x.shapeFlag |= 256),
            (i = x),
            _s(h.type) ? h : x
          );
        }
      );
    },
  },
  z_ = Zd;
function ar(e, t) {
  return se(e)
    ? e.some((n) => ar(n, t))
    : Te(e)
      ? e.split(',').includes(t)
      : Kf(e)
        ? ((e.lastIndex = 0), e.test(t))
        : !1;
}
function eh(e, t) {
  $l(e, 'a', t);
}
function th(e, t) {
  $l(e, 'da', t);
}
function $l(e, t, n = Ve) {
  const r =
    e.__wdc ||
    (e.__wdc = () => {
      let s = n;
      for (; s; ) {
        if (s.isDeactivated) return;
        s = s.parent;
      }
      return e();
    });
  if ((Us(t, r, n), n)) {
    let s = n.parent;
    for (; s && s.parent; ) Ir(s.parent.vnode) && nh(r, t, n, s), (s = s.parent);
  }
}
function nh(e, t, n, r) {
  const s = Us(t, e, r, !0);
  $s(() => {
    Mi(r[t], s);
  }, n);
}
function ro(e) {
  (e.shapeFlag &= -257), (e.shapeFlag &= -513);
}
function Yr(e) {
  return e.shapeFlag & 128 ? e.ssContent : e;
}
function Us(e, t, n = Ve, r = !1) {
  if (n) {
    const s = n[e] || (n[e] = []),
      o =
        t.__weh ||
        (t.__weh = (...i) => {
          dn();
          const a = Bn(n),
            c = At(t, n, e, i);
          return a(), hn(), c;
        });
    return r ? s.unshift(o) : s.push(o), o;
  }
}
const zt =
    (e) =>
    (t, n = Ve) => {
      (!jn || e === 'sp') && Us(e, (...r) => t(...r), n);
    },
  rh = zt('bm'),
  Fn = zt('m'),
  Vl = zt('bu'),
  Qi = zt('u'),
  Ji = zt('bum'),
  $s = zt('um'),
  sh = zt('sp'),
  oh = zt('rtg'),
  ih = zt('rtc');
function ah(e, t = Ve) {
  Us('ec', e, t);
}
const Zi = 'components',
  ch = 'directives';
function lh(e, t) {
  return ea(Zi, e, !0, t) || e;
}
const Wl = Symbol.for('v-ndc');
function Y_(e) {
  return Te(e) ? ea(Zi, e, !1) || e : e || Wl;
}
function X_(e) {
  return ea(ch, e);
}
function ea(e, t, n = !0, r = !1) {
  const s = We || Ve;
  if (s) {
    const o = s.type;
    if (e === Zi) {
      const a = gi(o, !1);
      if (a && (a === t || a === Je(t) || a === Ts(Je(t)))) return o;
    }
    const i = Ha(s[e] || o[e], t) || Ha(s.appContext[e], t);
    return !i && r ? o : i;
  }
}
function Ha(e, t) {
  return e && (e[t] || e[Je(t)] || e[Ts(Je(t))]);
}
function Q_(e, t, n, r) {
  let s;
  const o = n && n[r],
    i = se(e);
  if (i || Te(e)) {
    const a = i && Vt(e);
    let c = !1;
    a && ((c = !_t(e)), (e = Ns(e))), (s = new Array(e.length));
    for (let l = 0, u = e.length; l < u; l++) s[l] = t(c ? Xe(e[l]) : e[l], l, void 0, o && o[l]);
  } else if (typeof e == 'number') {
    s = new Array(e);
    for (let a = 0; a < e; a++) s[a] = t(a + 1, a, void 0, o && o[a]);
  } else if (Fe(e))
    if (e[Symbol.iterator]) s = Array.from(e, (a, c) => t(a, c, void 0, o && o[c]));
    else {
      const a = Object.keys(e);
      s = new Array(a.length);
      for (let c = 0, l = a.length; c < l; c++) {
        const u = a[c];
        s[c] = t(e[u], u, c, o && o[c]);
      }
    }
  else s = [];
  return n && (n[r] = s), s;
}
function J_(e, t) {
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    if (se(r)) for (let s = 0; s < r.length; s++) e[r[s].name] = r[s].fn;
    else
      r &&
        (e[r.name] = r.key
          ? (...s) => {
              const o = r.fn(...s);
              return o && (o.key = r.key), o;
            }
          : r.fn);
  }
  return e;
}
function Z_(e, t, n = {}, r, s) {
  if (We.ce || (We.parent && an(We.parent) && We.parent.ce))
    return t !== 'default' && (n.name = t), Dr(), fi(Ne, null, [he('slot', n, r && r())], 64);
  let o = e[t];
  o && o._c && (o._d = !1), Dr();
  const i = o && ta(o(n)),
    a = n.key || (i && i.key),
    c = fi(
      Ne,
      { key: (a && !Ct(a) ? a : `_${t}`) + (!i && r ? '_fb' : '') },
      i || (r ? r() : []),
      i && e._ === 1 ? 64 : -2,
    );
  return !s && c.scopeId && (c.slotScopeIds = [c.scopeId + '-s']), o && o._c && (o._d = !0), c;
}
function ta(e) {
  return e.some((t) => (jt(t) ? !(t.type === $e || (t.type === Ne && !ta(t.children))) : !0))
    ? e
    : null;
}
function ev(e, t) {
  const n = {};
  for (const r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : ts(r)] = e[r];
  return n;
}
const oi = (e) => (e ? (mu(e) ? Hr(e) : oi(e.parent)) : null),
  dr = Pe(Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => oi(e.parent),
    $root: (e) => oi(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => na(e),
    $forceUpdate: (e) =>
      e.f ||
      (e.f = () => {
        zi(e.update);
      }),
    $nextTick: (e) => e.n || (e.n = Nr.bind(e.proxy)),
    $watch: (e) => Rh.bind(e),
  }),
  so = (e, t) => e !== ge && !e.__isScriptSetup && be(e, t),
  ii = {
    get({ _: e }, t) {
      if (t === '__v_skip') return !0;
      const {
        ctx: n,
        setupState: r,
        data: s,
        props: o,
        accessCache: i,
        type: a,
        appContext: c,
      } = e;
      let l;
      if (t[0] !== '$') {
        const p = i[t];
        if (p !== void 0)
          switch (p) {
            case 1:
              return r[t];
            case 2:
              return s[t];
            case 4:
              return n[t];
            case 3:
              return o[t];
          }
        else {
          if (so(r, t)) return (i[t] = 1), r[t];
          if (s !== ge && be(s, t)) return (i[t] = 2), s[t];
          if ((l = e.propsOptions[0]) && be(l, t)) return (i[t] = 3), o[t];
          if (n !== ge && be(n, t)) return (i[t] = 4), n[t];
          ai && (i[t] = 0);
        }
      }
      const u = dr[t];
      let f, d;
      if (u) return t === '$attrs' && Ye(e.attrs, 'get', ''), u(e);
      if ((f = a.__cssModules) && (f = f[t])) return f;
      if (n !== ge && be(n, t)) return (i[t] = 4), n[t];
      if (((d = c.config.globalProperties), be(d, t))) return d[t];
    },
    set({ _: e }, t, n) {
      const { data: r, setupState: s, ctx: o } = e;
      return so(s, t)
        ? ((s[t] = n), !0)
        : r !== ge && be(r, t)
          ? ((r[t] = n), !0)
          : be(e.props, t) || (t[0] === '$' && t.slice(1) in e)
            ? !1
            : ((o[t] = n), !0);
    },
    has(
      { _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: s, propsOptions: o } },
      i,
    ) {
      let a;
      return (
        !!n[i] ||
        (e !== ge && be(e, i)) ||
        so(t, i) ||
        ((a = o[0]) && be(a, i)) ||
        be(r, i) ||
        be(dr, i) ||
        be(s.config.globalProperties, i)
      );
    },
    defineProperty(e, t, n) {
      return (
        n.get != null ? (e._.accessCache[t] = 0) : be(n, 'value') && this.set(e, t, n.value, null),
        Reflect.defineProperty(e, t, n)
      );
    },
  },
  uh = Pe({}, ii, {
    get(e, t) {
      if (t !== Symbol.unscopables) return ii.get(e, t, e);
    },
    has(e, t) {
      return t[0] !== '_' && !Qf(t);
    },
  });
function tv() {
  return null;
}
function nv() {
  return null;
}
function rv(e) {}
function sv(e) {}
function ov() {
  return null;
}
function iv() {}
function av(e, t) {
  return null;
}
function cv() {
  return ql().slots;
}
function lv() {
  return ql().attrs;
}
function ql() {
  const e = Ze();
  return e.setupContext || (e.setupContext = yu(e));
}
function Ar(e) {
  return se(e) ? e.reduce((t, n) => ((t[n] = null), t), {}) : e;
}
function uv(e, t) {
  const n = Ar(e);
  for (const r in t) {
    if (r.startsWith('__skip')) continue;
    let s = n[r];
    s
      ? se(s) || ae(s)
        ? (s = n[r] = { type: s, default: t[r] })
        : (s.default = t[r])
      : s === null && (s = n[r] = { default: t[r] }),
      s && t[`__skip_${r}`] && (s.skipFactory = !0);
  }
  return n;
}
function fv(e, t) {
  return !e || !t ? e || t : se(e) && se(t) ? e.concat(t) : Pe({}, Ar(e), Ar(t));
}
function dv(e, t) {
  const n = {};
  for (const r in e)
    t.includes(r) || Object.defineProperty(n, r, { enumerable: !0, get: () => e[r] });
  return n;
}
function hv(e) {
  const t = Ze();
  let n = e();
  return (
    hi(),
    Hi(n) &&
      (n = n.catch((r) => {
        throw (Bn(t), r);
      })),
    [n, () => Bn(t)]
  );
}
let ai = !0;
function fh(e) {
  const t = na(e),
    n = e.proxy,
    r = e.ctx;
  (ai = !1), t.beforeCreate && Ua(t.beforeCreate, e, 'bc');
  const {
    data: s,
    computed: o,
    methods: i,
    watch: a,
    provide: c,
    inject: l,
    created: u,
    beforeMount: f,
    mounted: d,
    beforeUpdate: p,
    updated: m,
    activated: v,
    deactivated: E,
    beforeDestroy: _,
    beforeUnmount: g,
    destroyed: h,
    unmounted: x,
    render: y,
    renderTracked: C,
    renderTriggered: A,
    errorCaptured: w,
    serverPrefetch: D,
    expose: b,
    inheritAttrs: F,
    components: T,
    directives: O,
    filters: Y,
  } = t;
  if ((l && dh(l, r, null), i))
    for (const Z in i) {
      const X = i[Z];
      ae(X) && (r[Z] = X.bind(n));
    }
  if (s) {
    const Z = s.call(n, n);
    Fe(Z) && (e.data = Or(Z));
  }
  if (((ai = !0), o))
    for (const Z in o) {
      const X = o[Z],
        ie = ae(X) ? X.bind(n, n) : ae(X.get) ? X.get.bind(n, n) : mt,
        ce = !ae(X) && ae(X.set) ? X.set.bind(n) : mt,
        $ = Me({ get: ie, set: ce });
      Object.defineProperty(r, Z, {
        enumerable: !0,
        configurable: !0,
        get: () => $.value,
        set: (W) => ($.value = W),
      });
    }
  if (a) for (const Z in a) jl(a[Z], r, n, Z);
  if (c) {
    const Z = ae(c) ? c.call(n) : c;
    Reflect.ownKeys(Z).forEach((X) => {
      rs(X, Z[X]);
    });
  }
  u && Ua(u, e, 'c');
  function q(Z, X) {
    se(X) ? X.forEach((ie) => Z(ie.bind(n))) : X && Z(X.bind(n));
  }
  if (
    (q(rh, f),
    q(Fn, d),
    q(Vl, p),
    q(Qi, m),
    q(eh, v),
    q(th, E),
    q(ah, w),
    q(ih, C),
    q(oh, A),
    q(Ji, g),
    q($s, x),
    q(sh, D),
    se(b))
  )
    if (b.length) {
      const Z = e.exposed || (e.exposed = {});
      b.forEach((X) => {
        Object.defineProperty(Z, X, { get: () => n[X], set: (ie) => (n[X] = ie) });
      });
    } else e.exposed || (e.exposed = {});
  y && e.render === mt && (e.render = y),
    F != null && (e.inheritAttrs = F),
    T && (e.components = T),
    O && (e.directives = O),
    D && Xi(e);
}
function dh(e, t, n = mt) {
  se(e) && (e = ci(e));
  for (const r in e) {
    const s = e[r];
    let o;
    Fe(s)
      ? 'default' in s
        ? (o = dt(s.from || r, s.default, !0))
        : (o = dt(s.from || r))
      : (o = dt(s)),
      Le(o)
        ? Object.defineProperty(t, r, {
            enumerable: !0,
            configurable: !0,
            get: () => o.value,
            set: (i) => (o.value = i),
          })
        : (t[r] = o);
  }
}
function Ua(e, t, n) {
  At(se(e) ? e.map((r) => r.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function jl(e, t, n, r) {
  let s = r.includes('.') ? ou(n, r) : () => n[r];
  if (Te(e)) {
    const o = t[e];
    ae(o) && wt(s, o);
  } else if (ae(e)) wt(s, e.bind(n));
  else if (Fe(e))
    if (se(e)) e.forEach((o) => jl(o, t, n, r));
    else {
      const o = ae(e.handler) ? e.handler.bind(n) : t[e.handler];
      ae(o) && wt(s, o, e);
    }
}
function na(e) {
  const t = e.type,
    { mixins: n, extends: r } = t,
    {
      mixins: s,
      optionsCache: o,
      config: { optionMergeStrategies: i },
    } = e.appContext,
    a = o.get(t);
  let c;
  return (
    a
      ? (c = a)
      : !s.length && !n && !r
        ? (c = t)
        : ((c = {}), s.length && s.forEach((l) => gs(c, l, i, !0)), gs(c, t, i)),
    Fe(t) && o.set(t, c),
    c
  );
}
function gs(e, t, n, r = !1) {
  const { mixins: s, extends: o } = t;
  o && gs(e, o, n, !0), s && s.forEach((i) => gs(e, i, n, !0));
  for (const i in t)
    if (!(r && i === 'expose')) {
      const a = hh[i] || (n && n[i]);
      e[i] = a ? a(e[i], t[i]) : t[i];
    }
  return e;
}
const hh = {
  data: $a,
  props: Va,
  emits: Va,
  methods: cr,
  computed: cr,
  beforeCreate: nt,
  created: nt,
  beforeMount: nt,
  mounted: nt,
  beforeUpdate: nt,
  updated: nt,
  beforeDestroy: nt,
  beforeUnmount: nt,
  destroyed: nt,
  unmounted: nt,
  activated: nt,
  deactivated: nt,
  errorCaptured: nt,
  serverPrefetch: nt,
  components: cr,
  directives: cr,
  watch: ph,
  provide: $a,
  inject: xh,
};
function $a(e, t) {
  return t
    ? e
      ? function () {
          return Pe(ae(e) ? e.call(this, this) : e, ae(t) ? t.call(this, this) : t);
        }
      : t
    : e;
}
function xh(e, t) {
  return cr(ci(e), ci(t));
}
function ci(e) {
  if (se(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
    return t;
  }
  return e;
}
function nt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function cr(e, t) {
  return e ? Pe(Object.create(null), e, t) : t;
}
function Va(e, t) {
  return e
    ? se(e) && se(t)
      ? [...new Set([...e, ...t])]
      : Pe(Object.create(null), Ar(e), Ar(t ?? {}))
    : t;
}
function ph(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Pe(Object.create(null), e);
  for (const r in t) n[r] = nt(e[r], t[r]);
  return n;
}
function Kl() {
  return {
    app: null,
    config: {
      isNativeTag: qf,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}
let gh = 0;
function mh(e, t) {
  return function (r, s = null) {
    ae(r) || (r = Pe({}, r)), s != null && !Fe(s) && (s = null);
    const o = Kl(),
      i = new WeakSet(),
      a = [];
    let c = !1;
    const l = (o.app = {
      _uid: gh++,
      _component: r,
      _props: s,
      _container: null,
      _context: o,
      _instance: null,
      version: Jh,
      get config() {
        return o.config;
      },
      set config(u) {},
      use(u, ...f) {
        return (
          i.has(u) ||
            (u && ae(u.install) ? (i.add(u), u.install(l, ...f)) : ae(u) && (i.add(u), u(l, ...f))),
          l
        );
      },
      mixin(u) {
        return o.mixins.includes(u) || o.mixins.push(u), l;
      },
      component(u, f) {
        return f ? ((o.components[u] = f), l) : o.components[u];
      },
      directive(u, f) {
        return f ? ((o.directives[u] = f), l) : o.directives[u];
      },
      mount(u, f, d) {
        if (!c) {
          const p = l._ceVNode || he(r, s);
          return (
            (p.appContext = o),
            d === !0 ? (d = 'svg') : d === !1 && (d = void 0),
            f && t ? t(p, u) : e(p, u, d),
            (c = !0),
            (l._container = u),
            (u.__vue_app__ = l),
            Hr(p.component)
          );
        }
      },
      onUnmount(u) {
        a.push(u);
      },
      unmount() {
        c && (At(a, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
      },
      provide(u, f) {
        return (o.provides[u] = f), l;
      },
      runWithContext(u) {
        const f = bn;
        bn = l;
        try {
          return u();
        } finally {
          bn = f;
        }
      },
    });
    return l;
  };
}
let bn = null;
function rs(e, t) {
  if (Ve) {
    let n = Ve.provides;
    const r = Ve.parent && Ve.parent.provides;
    r === n && (n = Ve.provides = Object.create(r)), (n[e] = t);
  }
}
function dt(e, t, n = !1) {
  const r = Ve || We;
  if (r || bn) {
    const s = bn
      ? bn._context.provides
      : r
        ? r.parent == null
          ? r.vnode.appContext && r.vnode.appContext.provides
          : r.parent.provides
        : void 0;
    if (s && e in s) return s[e];
    if (arguments.length > 1) return n && ae(t) ? t.call(r && r.proxy) : t;
  }
}
function _h() {
  return !!(Ve || We || bn);
}
const Gl = {},
  zl = () => Object.create(Gl),
  Yl = (e) => Object.getPrototypeOf(e) === Gl;
function vh(e, t, n, r = !1) {
  const s = {},
    o = zl();
  (e.propsDefaults = Object.create(null)), Xl(e, t, s, o);
  for (const i in e.propsOptions[0]) i in s || (s[i] = void 0);
  n ? (e.props = r ? s : El(s)) : e.type.props ? (e.props = s) : (e.props = o), (e.attrs = o);
}
function yh(e, t, n, r) {
  const {
      props: s,
      attrs: o,
      vnode: { patchFlag: i },
    } = e,
    a = ve(s),
    [c] = e.propsOptions;
  let l = !1;
  if ((r || i > 0) && !(i & 16)) {
    if (i & 8) {
      const u = e.vnode.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        let d = u[f];
        if (Vs(e.emitsOptions, d)) continue;
        const p = t[d];
        if (c)
          if (be(o, d)) p !== o[d] && ((o[d] = p), (l = !0));
          else {
            const m = Je(d);
            s[m] = li(c, a, m, p, e, !1);
          }
        else p !== o[d] && ((o[d] = p), (l = !0));
      }
    }
  } else {
    Xl(e, t, s, o) && (l = !0);
    let u;
    for (const f in a)
      (!t || (!be(t, f) && ((u = lt(f)) === f || !be(t, u)))) &&
        (c
          ? n && (n[f] !== void 0 || n[u] !== void 0) && (s[f] = li(c, a, f, void 0, e, !0))
          : delete s[f]);
    if (o !== a) for (const f in o) (!t || !be(t, f)) && (delete o[f], (l = !0));
  }
  l && It(e.attrs, 'set', '');
}
function Xl(e, t, n, r) {
  const [s, o] = e.propsOptions;
  let i = !1,
    a;
  if (t)
    for (let c in t) {
      if (Un(c)) continue;
      const l = t[c];
      let u;
      s && be(s, (u = Je(c)))
        ? !o || !o.includes(u)
          ? (n[u] = l)
          : ((a || (a = {}))[u] = l)
        : Vs(e.emitsOptions, c) || ((!(c in r) || l !== r[c]) && ((r[c] = l), (i = !0)));
    }
  if (o) {
    const c = ve(n),
      l = a || ge;
    for (let u = 0; u < o.length; u++) {
      const f = o[u];
      n[f] = li(s, c, f, l[f], e, !be(l, f));
    }
  }
  return i;
}
function li(e, t, n, r, s, o) {
  const i = e[n];
  if (i != null) {
    const a = be(i, 'default');
    if (a && r === void 0) {
      const c = i.default;
      if (i.type !== Function && !i.skipFactory && ae(c)) {
        const { propsDefaults: l } = s;
        if (n in l) r = l[n];
        else {
          const u = Bn(s);
          (r = l[n] = c.call(null, t)), u();
        }
      } else r = c;
      s.ce && s.ce._setProp(n, r);
    }
    i[0] && (o && !a ? (r = !1) : i[1] && (r === '' || r === lt(n)) && (r = !0));
  }
  return r;
}
const Eh = new WeakMap();
function Ql(e, t, n = !1) {
  const r = n ? Eh : t.propsCache,
    s = r.get(e);
  if (s) return s;
  const o = e.props,
    i = {},
    a = [];
  let c = !1;
  if (!ae(e)) {
    const u = (f) => {
      c = !0;
      const [d, p] = Ql(f, t, !0);
      Pe(i, d), p && a.push(...p);
    };
    !n && t.mixins.length && t.mixins.forEach(u),
      e.extends && u(e.extends),
      e.mixins && e.mixins.forEach(u);
  }
  if (!o && !c) return Fe(e) && r.set(e, Mn), Mn;
  if (se(o))
    for (let u = 0; u < o.length; u++) {
      const f = Je(o[u]);
      Wa(f) && (i[f] = ge);
    }
  else if (o)
    for (const u in o) {
      const f = Je(u);
      if (Wa(f)) {
        const d = o[u],
          p = (i[f] = se(d) || ae(d) ? { type: d } : Pe({}, d)),
          m = p.type;
        let v = !1,
          E = !0;
        if (se(m))
          for (let _ = 0; _ < m.length; ++_) {
            const g = m[_],
              h = ae(g) && g.name;
            if (h === 'Boolean') {
              v = !0;
              break;
            } else h === 'String' && (E = !1);
          }
        else v = ae(m) && m.name === 'Boolean';
        (p[0] = v), (p[1] = E), (v || be(p, 'default')) && a.push(f);
      }
    }
  const l = [i, a];
  return Fe(e) && r.set(e, l), l;
}
function Wa(e) {
  return e[0] !== '$' && !Un(e);
}
const Jl = (e) => e[0] === '_' || e === '$stable',
  ra = (e) => (se(e) ? e.map(ct) : [ct(e)]),
  bh = (e, t, n) => {
    if (t._n) return t;
    const r = Rl((...s) => ra(t(...s)), n);
    return (r._c = !1), r;
  },
  Zl = (e, t, n) => {
    const r = e._ctx;
    for (const s in e) {
      if (Jl(s)) continue;
      const o = e[s];
      if (ae(o)) t[s] = bh(s, o, r);
      else if (o != null) {
        const i = ra(o);
        t[s] = () => i;
      }
    }
  },
  eu = (e, t) => {
    const n = ra(t);
    e.slots.default = () => n;
  },
  tu = (e, t, n) => {
    for (const r in t) (n || r !== '_') && (e[r] = t[r]);
  },
  Ch = (e, t, n) => {
    const r = (e.slots = zl());
    if (e.vnode.shapeFlag & 32) {
      const s = t._;
      s ? (tu(r, t, n), n && el(r, '_', s, !0)) : Zl(t, r);
    } else t && eu(e, t);
  },
  Ah = (e, t, n) => {
    const { vnode: r, slots: s } = e;
    let o = !0,
      i = ge;
    if (r.shapeFlag & 32) {
      const a = t._;
      a ? (n && a === 1 ? (o = !1) : tu(s, t, n)) : ((o = !t.$stable), Zl(t, s)), (i = t);
    } else t && (eu(e, t), (i = { default: 1 }));
    if (o) for (const a in s) !Jl(a) && i[a] == null && delete s[a];
  },
  Ue = lu;
function Bh(e) {
  return nu(e);
}
function Dh(e) {
  return nu(e, Gd);
}
function nu(e, t) {
  const n = Rs();
  n.__VUE__ = !0;
  const {
      insert: r,
      remove: s,
      patchProp: o,
      createElement: i,
      createText: a,
      createComment: c,
      setText: l,
      setElementText: u,
      parentNode: f,
      nextSibling: d,
      setScopeId: p = mt,
      insertStaticContent: m,
    } = e,
    v = (P, R, N, G = null, V = null, B = null, S = void 0, L = null, I = !!R.dynamicChildren) => {
      if (P === R) return;
      P && !yt(P, R) && ((G = H(P)), W(P, V, B, !0), (P = null)),
        R.patchFlag === -2 && ((I = !1), (R.dynamicChildren = null));
      const { type: U, ref: Q, shapeFlag: k } = R;
      switch (U) {
        case cn:
          E(P, R, N, G);
          break;
        case $e:
          _(P, R, N, G);
          break;
        case qn:
          P == null && g(R, N, G, S);
          break;
        case Ne:
          T(P, R, N, G, V, B, S, L, I);
          break;
        default:
          k & 1
            ? y(P, R, N, G, V, B, S, L, I)
            : k & 6
              ? O(P, R, N, G, V, B, S, L, I)
              : (k & 64 || k & 128) && U.process(P, R, N, G, V, B, S, L, I, ne);
      }
      Q != null && V && Cr(Q, P && P.ref, B, R || P, !R);
    },
    E = (P, R, N, G) => {
      if (P == null) r((R.el = a(R.children)), N, G);
      else {
        const V = (R.el = P.el);
        R.children !== P.children && l(V, R.children);
      }
    },
    _ = (P, R, N, G) => {
      P == null ? r((R.el = c(R.children || '')), N, G) : (R.el = P.el);
    },
    g = (P, R, N, G) => {
      [P.el, P.anchor] = m(P.children, R, N, G, P.el, P.anchor);
    },
    h = ({ el: P, anchor: R }, N, G) => {
      let V;
      for (; P && P !== R; ) (V = d(P)), r(P, N, G), (P = V);
      r(R, N, G);
    },
    x = ({ el: P, anchor: R }) => {
      let N;
      for (; P && P !== R; ) (N = d(P)), s(P), (P = N);
      s(R);
    },
    y = (P, R, N, G, V, B, S, L, I) => {
      R.type === 'svg' ? (S = 'svg') : R.type === 'math' && (S = 'mathml'),
        P == null ? C(R, N, G, V, B, S, L, I) : D(P, R, V, B, S, L, I);
    },
    C = (P, R, N, G, V, B, S, L) => {
      let I, U;
      const { props: Q, shapeFlag: k, transition: M, dirs: te } = P;
      if (
        ((I = P.el = i(P.type, B, Q && Q.is, Q)),
        k & 8 ? u(I, P.children) : k & 16 && w(P.children, I, null, G, V, oo(P, B), S, L),
        te && Rt(P, null, G, 'created'),
        A(I, P, P.scopeId, S, G),
        Q)
      ) {
        for (const pe in Q) pe !== 'value' && !Un(pe) && o(I, pe, null, Q[pe], B, G);
        'value' in Q && o(I, 'value', null, Q.value, B), (U = Q.onVnodeBeforeMount) && at(U, G, P);
      }
      te && Rt(P, null, G, 'beforeMount');
      const oe = ru(V, M);
      oe && M.beforeEnter(I),
        r(I, R, N),
        ((U = Q && Q.onVnodeMounted) || oe || te) &&
          Ue(() => {
            U && at(U, G, P), oe && M.enter(I), te && Rt(P, null, G, 'mounted');
          }, V);
    },
    A = (P, R, N, G, V) => {
      if ((N && p(P, N), G)) for (let B = 0; B < G.length; B++) p(P, G[B]);
      if (V) {
        let B = V.subTree;
        if (R === B || (_s(B.type) && (B.ssContent === R || B.ssFallback === R))) {
          const S = V.vnode;
          A(P, S, S.scopeId, S.slotScopeIds, V.parent);
        }
      }
    },
    w = (P, R, N, G, V, B, S, L, I = 0) => {
      for (let U = I; U < P.length; U++) {
        const Q = (P[U] = L ? sn(P[U]) : ct(P[U]));
        v(null, Q, R, N, G, V, B, S, L);
      }
    },
    D = (P, R, N, G, V, B, S) => {
      const L = (R.el = P.el);
      let { patchFlag: I, dynamicChildren: U, dirs: Q } = R;
      I |= P.patchFlag & 16;
      const k = P.props || ge,
        M = R.props || ge;
      let te;
      if (
        (N && _n(N, !1),
        (te = M.onVnodeBeforeUpdate) && at(te, N, R, P),
        Q && Rt(R, P, N, 'beforeUpdate'),
        N && _n(N, !0),
        ((k.innerHTML && M.innerHTML == null) || (k.textContent && M.textContent == null)) &&
          u(L, ''),
        U
          ? b(P.dynamicChildren, U, L, N, G, oo(R, V), B)
          : S || X(P, R, L, null, N, G, oo(R, V), B, !1),
        I > 0)
      ) {
        if (I & 16) F(L, k, M, N, V);
        else if (
          (I & 2 && k.class !== M.class && o(L, 'class', null, M.class, V),
          I & 4 && o(L, 'style', k.style, M.style, V),
          I & 8)
        ) {
          const oe = R.dynamicProps;
          for (let pe = 0; pe < oe.length; pe++) {
            const de = oe[pe],
              Oe = k[de],
              Re = M[de];
            (Re !== Oe || de === 'value') && o(L, de, Oe, Re, V, N);
          }
        }
        I & 1 && P.children !== R.children && u(L, R.children);
      } else !S && U == null && F(L, k, M, N, V);
      ((te = M.onVnodeUpdated) || Q) &&
        Ue(() => {
          te && at(te, N, R, P), Q && Rt(R, P, N, 'updated');
        }, G);
    },
    b = (P, R, N, G, V, B, S) => {
      for (let L = 0; L < R.length; L++) {
        const I = P[L],
          U = R[L],
          Q = I.el && (I.type === Ne || !yt(I, U) || I.shapeFlag & 70) ? f(I.el) : N;
        v(I, U, Q, null, G, V, B, S, !0);
      }
    },
    F = (P, R, N, G, V) => {
      if (R !== N) {
        if (R !== ge) for (const B in R) !Un(B) && !(B in N) && o(P, B, R[B], null, V, G);
        for (const B in N) {
          if (Un(B)) continue;
          const S = N[B],
            L = R[B];
          S !== L && B !== 'value' && o(P, B, L, S, V, G);
        }
        'value' in N && o(P, 'value', R.value, N.value, V);
      }
    },
    T = (P, R, N, G, V, B, S, L, I) => {
      const U = (R.el = P ? P.el : a('')),
        Q = (R.anchor = P ? P.anchor : a(''));
      let { patchFlag: k, dynamicChildren: M, slotScopeIds: te } = R;
      te && (L = L ? L.concat(te) : te),
        P == null
          ? (r(U, N, G), r(Q, N, G), w(R.children || [], N, Q, V, B, S, L, I))
          : k > 0 && k & 64 && M && P.dynamicChildren
            ? (b(P.dynamicChildren, M, N, V, B, S, L),
              (R.key != null || (V && R === V.subTree)) && sa(P, R, !0))
            : X(P, R, N, Q, V, B, S, L, I);
    },
    O = (P, R, N, G, V, B, S, L, I) => {
      (R.slotScopeIds = L),
        P == null
          ? R.shapeFlag & 512
            ? V.ctx.activate(R, N, G, S, I)
            : Y(R, N, G, V, B, S, I)
          : J(P, R, I);
    },
    Y = (P, R, N, G, V, B, S) => {
      const L = (P.component = gu(P, G, V));
      if ((Ir(P) && (L.ctx.renderer = ne), _u(L, !1, S), L.asyncDep)) {
        if ((V && V.registerDep(L, q, S), !P.el)) {
          const I = (L.subTree = he($e));
          _(null, I, R, N);
        }
      } else q(L, P, R, N, V, B, S);
    },
    J = (P, R, N) => {
      const G = (R.component = P.component);
      if (Nh(P, R, N))
        if (G.asyncDep && !G.asyncResolved) {
          Z(G, R, N);
          return;
        } else (G.next = R), G.update();
      else (R.el = P.el), (G.vnode = R);
    },
    q = (P, R, N, G, V, B, S) => {
      const L = () => {
        if (P.isMounted) {
          let { next: k, bu: M, u: te, parent: oe, vnode: pe } = P;
          {
            const et = su(P);
            if (et) {
              k && ((k.el = pe.el), Z(P, k, S)),
                et.asyncDep.then(() => {
                  P.isUnmounted || L();
                });
              return;
            }
          }
          let de = k,
            Oe;
          _n(P, !1),
            k ? ((k.el = pe.el), Z(P, k, S)) : (k = pe),
            M && $n(M),
            (Oe = k.props && k.props.onVnodeBeforeUpdate) && at(Oe, oe, k, pe),
            _n(P, !0);
          const Re = ss(P),
            je = P.subTree;
          (P.subTree = Re),
            v(je, Re, f(je.el), H(je), P, V, B),
            (k.el = Re.el),
            de === null && Ws(P, Re.el),
            te && Ue(te, V),
            (Oe = k.props && k.props.onVnodeUpdated) && Ue(() => at(Oe, oe, k, pe), V);
        } else {
          let k;
          const { el: M, props: te } = R,
            { bm: oe, m: pe, parent: de, root: Oe, type: Re } = P,
            je = an(R);
          if (
            (_n(P, !1),
            oe && $n(oe),
            !je && (k = te && te.onVnodeBeforeMount) && at(k, de, R),
            _n(P, !0),
            M && _e)
          ) {
            const et = () => {
              (P.subTree = ss(P)), _e(M, P.subTree, P, V, null);
            };
            je && Re.__asyncHydrate ? Re.__asyncHydrate(M, P, et) : et();
          } else {
            Oe.ce && Oe.ce._injectChildStyle(Re);
            const et = (P.subTree = ss(P));
            v(null, et, N, G, P, V, B), (R.el = et.el);
          }
          if ((pe && Ue(pe, V), !je && (k = te && te.onVnodeMounted))) {
            const et = R;
            Ue(() => at(k, de, et), V);
          }
          (R.shapeFlag & 256 || (de && an(de.vnode) && de.vnode.shapeFlag & 256)) &&
            P.a &&
            Ue(P.a, V),
            (P.isMounted = !0),
            (R = N = G = null);
        }
      };
      P.scope.on();
      const I = (P.effect = new us(L));
      P.scope.off();
      const U = (P.update = I.run.bind(I)),
        Q = (P.job = I.runIfDirty.bind(I));
      (Q.i = P), (Q.id = P.uid), (I.scheduler = () => zi(Q)), _n(P, !0), U();
    },
    Z = (P, R, N) => {
      R.component = P;
      const G = P.vnode.props;
      (P.vnode = R), (P.next = null), yh(P, R.props, G, N), Ah(P, R.children, N), dn(), wa(P), hn();
    },
    X = (P, R, N, G, V, B, S, L, I = !1) => {
      const U = P && P.children,
        Q = P ? P.shapeFlag : 0,
        k = R.children,
        { patchFlag: M, shapeFlag: te } = R;
      if (M > 0) {
        if (M & 128) {
          ce(U, k, N, G, V, B, S, L, I);
          return;
        } else if (M & 256) {
          ie(U, k, N, G, V, B, S, L, I);
          return;
        }
      }
      te & 8
        ? (Q & 16 && le(U, V, B), k !== U && u(N, k))
        : Q & 16
          ? te & 16
            ? ce(U, k, N, G, V, B, S, L, I)
            : le(U, V, B, !0)
          : (Q & 8 && u(N, ''), te & 16 && w(k, N, G, V, B, S, L, I));
    },
    ie = (P, R, N, G, V, B, S, L, I) => {
      (P = P || Mn), (R = R || Mn);
      const U = P.length,
        Q = R.length,
        k = Math.min(U, Q);
      let M;
      for (M = 0; M < k; M++) {
        const te = (R[M] = I ? sn(R[M]) : ct(R[M]));
        v(P[M], te, N, null, V, B, S, L, I);
      }
      U > Q ? le(P, V, B, !0, !1, k) : w(R, N, G, V, B, S, L, I, k);
    },
    ce = (P, R, N, G, V, B, S, L, I) => {
      let U = 0;
      const Q = R.length;
      let k = P.length - 1,
        M = Q - 1;
      for (; U <= k && U <= M; ) {
        const te = P[U],
          oe = (R[U] = I ? sn(R[U]) : ct(R[U]));
        if (yt(te, oe)) v(te, oe, N, null, V, B, S, L, I);
        else break;
        U++;
      }
      for (; U <= k && U <= M; ) {
        const te = P[k],
          oe = (R[M] = I ? sn(R[M]) : ct(R[M]));
        if (yt(te, oe)) v(te, oe, N, null, V, B, S, L, I);
        else break;
        k--, M--;
      }
      if (U > k) {
        if (U <= M) {
          const te = M + 1,
            oe = te < Q ? R[te].el : G;
          for (; U <= M; ) v(null, (R[U] = I ? sn(R[U]) : ct(R[U])), N, oe, V, B, S, L, I), U++;
        }
      } else if (U > M) for (; U <= k; ) W(P[U], V, B, !0), U++;
      else {
        const te = U,
          oe = U,
          pe = new Map();
        for (U = oe; U <= M; U++) {
          const tt = (R[U] = I ? sn(R[U]) : ct(R[U]));
          tt.key != null && pe.set(tt.key, U);
        }
        let de,
          Oe = 0;
        const Re = M - oe + 1;
        let je = !1,
          et = 0;
        const Yt = new Array(Re);
        for (U = 0; U < Re; U++) Yt[U] = 0;
        for (U = te; U <= k; U++) {
          const tt = P[U];
          if (Oe >= Re) {
            W(tt, V, B, !0);
            continue;
          }
          let xt;
          if (tt.key != null) xt = pe.get(tt.key);
          else
            for (de = oe; de <= M; de++)
              if (Yt[de - oe] === 0 && yt(tt, R[de])) {
                xt = de;
                break;
              }
          xt === void 0
            ? W(tt, V, B, !0)
            : ((Yt[xt - oe] = U + 1),
              xt >= et ? (et = xt) : (je = !0),
              v(tt, R[xt], N, null, V, B, S, L, I),
              Oe++);
        }
        const er = je ? Fh(Yt) : Mn;
        for (de = er.length - 1, U = Re - 1; U >= 0; U--) {
          const tt = oe + U,
            xt = R[tt],
            tr = tt + 1 < Q ? R[tt + 1].el : G;
          Yt[U] === 0
            ? v(null, xt, N, tr, V, B, S, L, I)
            : je && (de < 0 || U !== er[de] ? $(xt, N, tr, 2) : de--);
        }
      }
    },
    $ = (P, R, N, G, V = null) => {
      const { el: B, type: S, transition: L, children: I, shapeFlag: U } = P;
      if (U & 6) {
        $(P.component.subTree, R, N, G);
        return;
      }
      if (U & 128) {
        P.suspense.move(R, N, G);
        return;
      }
      if (U & 64) {
        S.move(P, R, N, ne);
        return;
      }
      if (S === Ne) {
        r(B, R, N);
        for (let k = 0; k < I.length; k++) $(I[k], R, N, G);
        r(P.anchor, R, N);
        return;
      }
      if (S === qn) {
        h(P, R, N);
        return;
      }
      if (G !== 2 && U & 1 && L)
        if (G === 0) L.beforeEnter(B), r(B, R, N), Ue(() => L.enter(B), V);
        else {
          const { leave: k, delayLeave: M, afterLeave: te } = L,
            oe = () => r(B, R, N),
            pe = () => {
              k(B, () => {
                oe(), te && te();
              });
            };
          M ? M(B, oe, pe) : pe();
        }
      else r(B, R, N);
    },
    W = (P, R, N, G = !1, V = !1) => {
      const {
        type: B,
        props: S,
        ref: L,
        children: I,
        dynamicChildren: U,
        shapeFlag: Q,
        patchFlag: k,
        dirs: M,
        cacheIndex: te,
      } = P;
      if (
        (k === -2 && (V = !1),
        L != null && Cr(L, null, N, P, !0),
        te != null && (R.renderCache[te] = void 0),
        Q & 256)
      ) {
        R.ctx.deactivate(P);
        return;
      }
      const oe = Q & 1 && M,
        pe = !an(P);
      let de;
      if ((pe && (de = S && S.onVnodeBeforeUnmount) && at(de, R, P), Q & 6)) ye(P.component, N, G);
      else {
        if (Q & 128) {
          P.suspense.unmount(N, G);
          return;
        }
        oe && Rt(P, null, R, 'beforeUnmount'),
          Q & 64
            ? P.type.remove(P, R, N, ne, G)
            : U && !U.hasOnce && (B !== Ne || (k > 0 && k & 64))
              ? le(U, R, N, !1, !0)
              : ((B === Ne && k & 384) || (!V && Q & 16)) && le(I, R, N),
          G && z(P);
      }
      ((pe && (de = S && S.onVnodeUnmounted)) || oe) &&
        Ue(() => {
          de && at(de, R, P), oe && Rt(P, null, R, 'unmounted');
        }, N);
    },
    z = (P) => {
      const { type: R, el: N, anchor: G, transition: V } = P;
      if (R === Ne) {
        j(N, G);
        return;
      }
      if (R === qn) {
        x(P);
        return;
      }
      const B = () => {
        s(N), V && !V.persisted && V.afterLeave && V.afterLeave();
      };
      if (P.shapeFlag & 1 && V && !V.persisted) {
        const { leave: S, delayLeave: L } = V,
          I = () => S(N, B);
        L ? L(P.el, B, I) : I();
      } else B();
    },
    j = (P, R) => {
      let N;
      for (; P !== R; ) (N = d(P)), s(P), (P = N);
      s(R);
    },
    ye = (P, R, N) => {
      const { bum: G, scope: V, job: B, subTree: S, um: L, m: I, a: U } = P;
      ms(I),
        ms(U),
        G && $n(G),
        V.stop(),
        B && ((B.flags |= 8), W(S, P, R, N)),
        L && Ue(L, R),
        Ue(() => {
          P.isUnmounted = !0;
        }, R),
        R &&
          R.pendingBranch &&
          !R.isUnmounted &&
          P.asyncDep &&
          !P.asyncResolved &&
          P.suspenseId === R.pendingId &&
          (R.deps--, R.deps === 0 && R.resolve());
    },
    le = (P, R, N, G = !1, V = !1, B = 0) => {
      for (let S = B; S < P.length; S++) W(P[S], R, N, G, V);
    },
    H = (P) => {
      if (P.shapeFlag & 6) return H(P.component.subTree);
      if (P.shapeFlag & 128) return P.suspense.next();
      const R = d(P.anchor || P.el),
        N = R && R[wl];
      return N ? d(N) : R;
    };
  let K = !1;
  const ee = (P, R, N) => {
      P == null
        ? R._vnode && W(R._vnode, null, null, !0)
        : v(R._vnode || null, P, R, null, null, null, N),
        (R._vnode = P),
        K || ((K = !0), wa(), ps(), (K = !1));
    },
    ne = { p: v, um: W, m: $, r: z, mt: Y, mc: w, pc: X, pbc: b, n: H, o: e };
  let fe, _e;
  return t && ([fe, _e] = t(ne)), { render: ee, hydrate: fe, createApp: mh(ee, fe) };
}
function oo({ type: e, props: t }, n) {
  return (n === 'svg' && e === 'foreignObject') ||
    (n === 'mathml' && e === 'annotation-xml' && t && t.encoding && t.encoding.includes('html'))
    ? void 0
    : n;
}
function _n({ effect: e, job: t }, n) {
  n ? ((e.flags |= 32), (t.flags |= 4)) : ((e.flags &= -33), (t.flags &= -5));
}
function ru(e, t) {
  return (!e || (e && !e.pendingBranch)) && t && !t.persisted;
}
function sa(e, t, n = !1) {
  const r = e.children,
    s = t.children;
  if (se(r) && se(s))
    for (let o = 0; o < r.length; o++) {
      const i = r[o];
      let a = s[o];
      a.shapeFlag & 1 &&
        !a.dynamicChildren &&
        ((a.patchFlag <= 0 || a.patchFlag === 32) && ((a = s[o] = sn(s[o])), (a.el = i.el)),
        !n && a.patchFlag !== -2 && sa(i, a)),
        a.type === cn && (a.el = i.el);
    }
}
function Fh(e) {
  const t = e.slice(),
    n = [0];
  let r, s, o, i, a;
  const c = e.length;
  for (r = 0; r < c; r++) {
    const l = e[r];
    if (l !== 0) {
      if (((s = n[n.length - 1]), e[s] < l)) {
        (t[r] = s), n.push(r);
        continue;
      }
      for (o = 0, i = n.length - 1; o < i; )
        (a = (o + i) >> 1), e[n[a]] < l ? (o = a + 1) : (i = a);
      l < e[n[o]] && (o > 0 && (t[r] = n[o - 1]), (n[o] = r));
    }
  }
  for (o = n.length, i = n[o - 1]; o-- > 0; ) (n[o] = i), (i = t[i]);
  return n;
}
function su(e) {
  const t = e.subTree.component;
  if (t) return t.asyncDep && !t.asyncResolved ? t : su(t);
}
function ms(e) {
  if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
const Ph = Symbol.for('v-scx'),
  Sh = () => dt(Ph);
function xv(e, t) {
  return Mr(e, null, t);
}
function pv(e, t) {
  return Mr(e, null, { flush: 'post' });
}
function Th(e, t) {
  return Mr(e, null, { flush: 'sync' });
}
function wt(e, t, n) {
  return Mr(e, t, n);
}
function Mr(e, t, n = ge) {
  const { immediate: r, deep: s, flush: o, once: i } = n,
    a = Pe({}, n),
    c = (t && r) || (!t && o !== 'post');
  let l;
  if (jn) {
    if (o === 'sync') {
      const p = Sh();
      l = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!c) {
      const p = () => {};
      return (p.stop = mt), (p.resume = mt), (p.pause = mt), p;
    }
  }
  const u = Ve;
  a.call = (p, m, v) => At(p, u, m, v);
  let f = !1;
  o === 'post'
    ? (a.scheduler = (p) => {
        Ue(p, u && u.suspense);
      })
    : o !== 'sync' &&
      ((f = !0),
      (a.scheduler = (p, m) => {
        m ? p() : zi(p);
      })),
    (a.augmentJob = (p) => {
      t && (p.flags |= 4), f && ((p.flags |= 2), u && ((p.id = u.uid), (p.i = u)));
    });
  const d = Nd(e, t, a);
  return jn && (l ? l.push(d) : c && d()), d;
}
function Rh(e, t, n) {
  const r = this.proxy,
    s = Te(e) ? (e.includes('.') ? ou(r, e) : () => r[e]) : e.bind(r, r);
  let o;
  ae(t) ? (o = t) : ((o = t.handler), (n = t));
  const i = Bn(this),
    a = Mr(s, o.bind(r), n);
  return i(), a;
}
function ou(e, t) {
  const n = t.split('.');
  return () => {
    let r = e;
    for (let s = 0; s < n.length && r; s++) r = r[n[s]];
    return r;
  };
}
function gv(e, t, n = ge) {
  const r = Ze(),
    s = Je(t),
    o = lt(t),
    i = iu(e, s),
    a = Sd((c, l) => {
      let u,
        f = ge,
        d;
      return (
        Th(() => {
          const p = e[s];
          st(u, p) && ((u = p), l());
        }),
        {
          get() {
            return c(), n.get ? n.get(u) : u;
          },
          set(p) {
            const m = n.set ? n.set(p) : p;
            if (!st(m, u) && !(f !== ge && st(p, f))) return;
            const v = r.vnode.props;
            (v &&
              (t in v || s in v || o in v) &&
              (`onUpdate:${t}` in v || `onUpdate:${s}` in v || `onUpdate:${o}` in v)) ||
              ((u = p), l()),
              r.emit(`update:${t}`, m),
              st(p, m) && st(p, f) && !st(m, d) && l(),
              (f = p),
              (d = m);
          },
        }
      );
    });
  return (
    (a[Symbol.iterator] = () => {
      let c = 0;
      return {
        next() {
          return c < 2 ? { value: c++ ? i || ge : a, done: !1 } : { done: !0 };
        },
      };
    }),
    a
  );
}
const iu = (e, t) =>
  t === 'modelValue' || t === 'model-value'
    ? e.modelModifiers
    : e[`${t}Modifiers`] || e[`${Je(t)}Modifiers`] || e[`${lt(t)}Modifiers`];
function wh(e, t, ...n) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || ge;
  let s = n;
  const o = t.startsWith('update:'),
    i = o && iu(r, t.slice(7));
  i && (i.trim && (s = n.map((u) => (Te(u) ? u.trim() : u))), i.number && (s = n.map(cs)));
  let a,
    c = r[(a = ts(t))] || r[(a = ts(Je(t)))];
  !c && o && (c = r[(a = ts(lt(t)))]), c && At(c, e, 6, s);
  const l = r[a + 'Once'];
  if (l) {
    if (!e.emitted) e.emitted = {};
    else if (e.emitted[a]) return;
    (e.emitted[a] = !0), At(l, e, 6, s);
  }
}
function au(e, t, n = !1) {
  const r = t.emitsCache,
    s = r.get(e);
  if (s !== void 0) return s;
  const o = e.emits;
  let i = {},
    a = !1;
  if (!ae(e)) {
    const c = (l) => {
      const u = au(l, t, !0);
      u && ((a = !0), Pe(i, u));
    };
    !n && t.mixins.length && t.mixins.forEach(c),
      e.extends && c(e.extends),
      e.mixins && e.mixins.forEach(c);
  }
  return !o && !a
    ? (Fe(e) && r.set(e, null), null)
    : (se(o) ? o.forEach((c) => (i[c] = null)) : Pe(i, o), Fe(e) && r.set(e, i), i);
}
function Vs(e, t) {
  return !e || !kr(t)
    ? !1
    : ((t = t.slice(2).replace(/Once$/, '')),
      be(e, t[0].toLowerCase() + t.slice(1)) || be(e, lt(t)) || be(e, t));
}
function ss(e) {
  const {
      type: t,
      vnode: n,
      proxy: r,
      withProxy: s,
      propsOptions: [o],
      slots: i,
      attrs: a,
      emit: c,
      render: l,
      renderCache: u,
      props: f,
      data: d,
      setupState: p,
      ctx: m,
      inheritAttrs: v,
    } = e,
    E = Er(e);
  let _, g;
  try {
    if (n.shapeFlag & 4) {
      const x = s || r,
        y = x;
      (_ = ct(l.call(y, x, u, f, p, d, m))), (g = a);
    } else {
      const x = t;
      (_ = ct(x.length > 1 ? x(f, { attrs: a, slots: i, emit: c }) : x(f, null))),
        (g = t.props ? a : Oh(a));
    }
  } catch (x) {
    (hr.length = 0), Zn(x, e, 1), (_ = he($e));
  }
  let h = _;
  if (g && v !== !1) {
    const x = Object.keys(g),
      { shapeFlag: y } = h;
    x.length && y & 7 && (o && x.some(Ii) && (g = Lh(g, o)), (h = Kt(h, g, !1, !0)));
  }
  return (
    n.dirs && ((h = Kt(h, null, !1, !0)), (h.dirs = h.dirs ? h.dirs.concat(n.dirs) : n.dirs)),
    n.transition && un(h, n.transition),
    (_ = h),
    Er(E),
    _
  );
}
function kh(e, t = !0) {
  let n;
  for (let r = 0; r < e.length; r++) {
    const s = e[r];
    if (jt(s)) {
      if (s.type !== $e || s.children === 'v-if') {
        if (n) return;
        n = s;
      }
    } else return;
  }
  return n;
}
const Oh = (e) => {
    let t;
    for (const n in e) (n === 'class' || n === 'style' || kr(n)) && ((t || (t = {}))[n] = e[n]);
    return t;
  },
  Lh = (e, t) => {
    const n = {};
    for (const r in e) (!Ii(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
    return n;
  };
function Nh(e, t, n) {
  const { props: r, children: s, component: o } = e,
    { props: i, children: a, patchFlag: c } = t,
    l = o.emitsOptions;
  if (t.dirs || t.transition) return !0;
  if (n && c >= 0) {
    if (c & 1024) return !0;
    if (c & 16) return r ? qa(r, i, l) : !!i;
    if (c & 8) {
      const u = t.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        const d = u[f];
        if (i[d] !== r[d] && !Vs(l, d)) return !0;
      }
    }
  } else
    return (s || a) && (!a || !a.$stable) ? !0 : r === i ? !1 : r ? (i ? qa(r, i, l) : !0) : !!i;
  return !1;
}
function qa(e, t, n) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length) return !0;
  for (let s = 0; s < r.length; s++) {
    const o = r[s];
    if (t[o] !== e[o] && !Vs(n, o)) return !0;
  }
  return !1;
}
function Ws({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const r = t.subTree;
    if ((r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e))
      ((e = t.vnode).el = n), (t = t.parent);
    else break;
  }
}
const _s = (e) => e.__isSuspense;
let ui = 0;
const Ih = {
    name: 'Suspense',
    __isSuspense: !0,
    process(e, t, n, r, s, o, i, a, c, l) {
      if (e == null) Mh(t, n, r, s, o, i, a, c, l);
      else {
        if (o && o.deps > 0 && !e.suspense.isInFallback) {
          (t.suspense = e.suspense), (t.suspense.vnode = t), (t.el = e.el);
          return;
        }
        Hh(e, t, n, r, s, i, a, c, l);
      }
    },
    hydrate: Uh,
    normalize: $h,
  },
  mv = Ih;
function Br(e, t) {
  const n = e.props && e.props[t];
  ae(n) && n();
}
function Mh(e, t, n, r, s, o, i, a, c) {
  const {
      p: l,
      o: { createElement: u },
    } = c,
    f = u('div'),
    d = (e.suspense = cu(e, s, r, t, f, n, o, i, a, c));
  l(null, (d.pendingBranch = e.ssContent), f, null, r, d, o, i),
    d.deps > 0
      ? (Br(e, 'onPending'),
        Br(e, 'onFallback'),
        l(null, e.ssFallback, t, n, r, null, o, i),
        Wn(d, e.ssFallback))
      : d.resolve(!1, !0);
}
function Hh(e, t, n, r, s, o, i, a, { p: c, um: l, o: { createElement: u } }) {
  const f = (t.suspense = e.suspense);
  (f.vnode = t), (t.el = e.el);
  const d = t.ssContent,
    p = t.ssFallback,
    { activeBranch: m, pendingBranch: v, isInFallback: E, isHydrating: _ } = f;
  if (v)
    (f.pendingBranch = d),
      yt(d, v)
        ? (c(v, d, f.hiddenContainer, null, s, f, o, i, a),
          f.deps <= 0 ? f.resolve() : E && (_ || (c(m, p, n, r, s, null, o, i, a), Wn(f, p))))
        : ((f.pendingId = ui++),
          _ ? ((f.isHydrating = !1), (f.activeBranch = v)) : l(v, s, f),
          (f.deps = 0),
          (f.effects.length = 0),
          (f.hiddenContainer = u('div')),
          E
            ? (c(null, d, f.hiddenContainer, null, s, f, o, i, a),
              f.deps <= 0 ? f.resolve() : (c(m, p, n, r, s, null, o, i, a), Wn(f, p)))
            : m && yt(d, m)
              ? (c(m, d, n, r, s, f, o, i, a), f.resolve(!0))
              : (c(null, d, f.hiddenContainer, null, s, f, o, i, a), f.deps <= 0 && f.resolve()));
  else if (m && yt(d, m)) c(m, d, n, r, s, f, o, i, a), Wn(f, d);
  else if (
    (Br(t, 'onPending'),
    (f.pendingBranch = d),
    d.shapeFlag & 512 ? (f.pendingId = d.component.suspenseId) : (f.pendingId = ui++),
    c(null, d, f.hiddenContainer, null, s, f, o, i, a),
    f.deps <= 0)
  )
    f.resolve();
  else {
    const { timeout: g, pendingId: h } = f;
    g > 0
      ? setTimeout(() => {
          f.pendingId === h && f.fallback(p);
        }, g)
      : g === 0 && f.fallback(p);
  }
}
function cu(e, t, n, r, s, o, i, a, c, l, u = !1) {
  const {
    p: f,
    m: d,
    um: p,
    n: m,
    o: { parentNode: v, remove: E },
  } = l;
  let _;
  const g = Vh(e);
  g && t && t.pendingBranch && ((_ = t.pendingId), t.deps++);
  const h = e.props ? ls(e.props.timeout) : void 0,
    x = o,
    y = {
      vnode: e,
      parent: t,
      parentComponent: n,
      namespace: i,
      container: r,
      hiddenContainer: s,
      deps: 0,
      pendingId: ui++,
      timeout: typeof h == 'number' ? h : -1,
      activeBranch: null,
      pendingBranch: null,
      isInFallback: !u,
      isHydrating: u,
      isUnmounted: !1,
      effects: [],
      resolve(C = !1, A = !1) {
        const {
          vnode: w,
          activeBranch: D,
          pendingBranch: b,
          pendingId: F,
          effects: T,
          parentComponent: O,
          container: Y,
        } = y;
        let J = !1;
        y.isHydrating
          ? (y.isHydrating = !1)
          : C ||
            ((J = D && b.transition && b.transition.mode === 'out-in'),
            J &&
              (D.transition.afterLeave = () => {
                F === y.pendingId && (d(b, Y, o === x ? m(D) : o, 0), xs(T));
              }),
            D && (v(D.el) === Y && (o = m(D)), p(D, O, y, !0)),
            J || d(b, Y, o, 0)),
          Wn(y, b),
          (y.pendingBranch = null),
          (y.isInFallback = !1);
        let q = y.parent,
          Z = !1;
        for (; q; ) {
          if (q.pendingBranch) {
            q.effects.push(...T), (Z = !0);
            break;
          }
          q = q.parent;
        }
        !Z && !J && xs(T),
          (y.effects = []),
          g &&
            t &&
            t.pendingBranch &&
            _ === t.pendingId &&
            (t.deps--, t.deps === 0 && !A && t.resolve()),
          Br(w, 'onResolve');
      },
      fallback(C) {
        if (!y.pendingBranch) return;
        const { vnode: A, activeBranch: w, parentComponent: D, container: b, namespace: F } = y;
        Br(A, 'onFallback');
        const T = m(w),
          O = () => {
            y.isInFallback && (f(null, C, b, T, D, null, F, a, c), Wn(y, C));
          },
          Y = C.transition && C.transition.mode === 'out-in';
        Y && (w.transition.afterLeave = O), (y.isInFallback = !0), p(w, D, null, !0), Y || O();
      },
      move(C, A, w) {
        y.activeBranch && d(y.activeBranch, C, A, w), (y.container = C);
      },
      next() {
        return y.activeBranch && m(y.activeBranch);
      },
      registerDep(C, A, w) {
        const D = !!y.pendingBranch;
        D && y.deps++;
        const b = C.vnode.el;
        C.asyncDep
          .catch((F) => {
            Zn(F, C, 0);
          })
          .then((F) => {
            if (C.isUnmounted || y.isUnmounted || y.pendingId !== C.suspenseId) return;
            C.asyncResolved = !0;
            const { vnode: T } = C;
            xi(C, F, !1), b && (T.el = b);
            const O = !b && C.subTree.el;
            A(C, T, v(b || C.subTree.el), b ? null : m(C.subTree), y, i, w),
              O && E(O),
              Ws(C, T.el),
              D && --y.deps === 0 && y.resolve();
          });
      },
      unmount(C, A) {
        (y.isUnmounted = !0),
          y.activeBranch && p(y.activeBranch, n, C, A),
          y.pendingBranch && p(y.pendingBranch, n, C, A);
      },
    };
  return y;
}
function Uh(e, t, n, r, s, o, i, a, c) {
  const l = (t.suspense = cu(
      t,
      r,
      n,
      e.parentNode,
      document.createElement('div'),
      null,
      s,
      o,
      i,
      a,
      !0,
    )),
    u = c(e, (l.pendingBranch = t.ssContent), n, l, o, i);
  return l.deps === 0 && l.resolve(!1, !0), u;
}
function $h(e) {
  const { shapeFlag: t, children: n } = e,
    r = t & 32;
  (e.ssContent = ja(r ? n.default : n)), (e.ssFallback = r ? ja(n.fallback) : he($e));
}
function ja(e) {
  let t;
  if (ae(e)) {
    const n = An && e._c;
    n && ((e._d = !1), Dr()), (e = e()), n && ((e._d = !0), (t = Qe), uu());
  }
  return (
    se(e) && (e = kh(e)),
    (e = ct(e)),
    t && !e.dynamicChildren && (e.dynamicChildren = t.filter((n) => n !== e)),
    e
  );
}
function lu(e, t) {
  t && t.pendingBranch ? (se(e) ? t.effects.push(...e) : t.effects.push(e)) : xs(e);
}
function Wn(e, t) {
  e.activeBranch = t;
  const { vnode: n, parentComponent: r } = e;
  let s = t.el;
  for (; !s && t.component; ) (t = t.component.subTree), (s = t.el);
  (n.el = s), r && r.subTree === n && ((r.vnode.el = s), Ws(r, s));
}
function Vh(e) {
  const t = e.props && e.props.suspensible;
  return t != null && t !== !1;
}
const Ne = Symbol.for('v-fgt'),
  cn = Symbol.for('v-txt'),
  $e = Symbol.for('v-cmt'),
  qn = Symbol.for('v-stc'),
  hr = [];
let Qe = null;
function Dr(e = !1) {
  hr.push((Qe = e ? null : []));
}
function uu() {
  hr.pop(), (Qe = hr[hr.length - 1] || null);
}
let An = 1;
function Ka(e, t = !1) {
  (An += e), e < 0 && Qe && t && (Qe.hasOnce = !0);
}
function fu(e) {
  return (e.dynamicChildren = An > 0 ? Qe || Mn : null), uu(), An > 0 && Qe && Qe.push(e), e;
}
function Wh(e, t, n, r, s, o) {
  return fu(hu(e, t, n, r, s, o, !0));
}
function fi(e, t, n, r, s) {
  return fu(he(e, t, n, r, s, !0));
}
function jt(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function yt(e, t) {
  return e.type === t.type && e.key === t.key;
}
function _v(e) {}
const du = ({ key: e }) => e ?? null,
  os = ({ ref: e, ref_key: t, ref_for: n }) => (
    typeof e == 'number' && (e = '' + e),
    e != null ? (Te(e) || Le(e) || ae(e) ? { i: We, r: e, k: t, f: !!n } : e) : null
  );
function hu(e, t = null, n = null, r = 0, s = null, o = e === Ne ? 0 : 1, i = !1, a = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && du(t),
    ref: t && os(t),
    scopeId: Hs,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: r,
    dynamicProps: s,
    dynamicChildren: null,
    appContext: null,
    ctx: We,
  };
  return (
    a ? (oa(c, n), o & 128 && e.normalize(c)) : n && (c.shapeFlag |= Te(n) ? 8 : 16),
    An > 0 && !i && Qe && (c.patchFlag > 0 || o & 6) && c.patchFlag !== 32 && Qe.push(c),
    c
  );
}
const he = qh;
function qh(e, t = null, n = null, r = 0, s = null, o = !1) {
  if (((!e || e === Wl) && (e = $e), jt(e))) {
    const a = Kt(e, t, !0);
    return (
      n && oa(a, n),
      An > 0 && !o && Qe && (a.shapeFlag & 6 ? (Qe[Qe.indexOf(e)] = a) : Qe.push(a)),
      (a.patchFlag = -2),
      a
    );
  }
  if ((Xh(e) && (e = e.__vccOpts), t)) {
    t = jh(t);
    let { class: a, style: c } = t;
    a && !Te(a) && (t.class = ks(a)),
      Fe(c) && (ji(c) && !se(c) && (c = Pe({}, c)), (t.style = ws(c)));
  }
  const i = Te(e) ? 1 : _s(e) ? 128 : kl(e) ? 64 : Fe(e) ? 4 : ae(e) ? 2 : 0;
  return hu(e, t, n, r, s, i, o, !0);
}
function jh(e) {
  return e ? (ji(e) || Yl(e) ? Pe({}, e) : e) : null;
}
function Kt(e, t, n = !1, r = !1) {
  const { props: s, ref: o, patchFlag: i, children: a, transition: c } = e,
    l = t ? pu(s || {}, t) : s,
    u = {
      __v_isVNode: !0,
      __v_skip: !0,
      type: e.type,
      props: l,
      key: l && du(l),
      ref: t && t.ref ? (n && o ? (se(o) ? o.concat(os(t)) : [o, os(t)]) : os(t)) : o,
      scopeId: e.scopeId,
      slotScopeIds: e.slotScopeIds,
      children: a,
      target: e.target,
      targetStart: e.targetStart,
      targetAnchor: e.targetAnchor,
      staticCount: e.staticCount,
      shapeFlag: e.shapeFlag,
      patchFlag: t && e.type !== Ne ? (i === -1 ? 16 : i | 16) : i,
      dynamicProps: e.dynamicProps,
      dynamicChildren: e.dynamicChildren,
      appContext: e.appContext,
      dirs: e.dirs,
      transition: c,
      component: e.component,
      suspense: e.suspense,
      ssContent: e.ssContent && Kt(e.ssContent),
      ssFallback: e.ssFallback && Kt(e.ssFallback),
      el: e.el,
      anchor: e.anchor,
      ctx: e.ctx,
      ce: e.ce,
    };
  return c && r && un(u, c.clone(u)), u;
}
function xu(e = ' ', t = 0) {
  return he(cn, null, e, t);
}
function vv(e, t) {
  const n = he(qn, null, e);
  return (n.staticCount = t), n;
}
function yv(e = '', t = !1) {
  return t ? (Dr(), fi($e, null, e)) : he($e, null, e);
}
function ct(e) {
  return e == null || typeof e == 'boolean'
    ? he($e)
    : se(e)
      ? he(Ne, null, e.slice())
      : jt(e)
        ? sn(e)
        : he(cn, null, String(e));
}
function sn(e) {
  return (e.el === null && e.patchFlag !== -1) || e.memo ? e : Kt(e);
}
function oa(e, t) {
  let n = 0;
  const { shapeFlag: r } = e;
  if (t == null) t = null;
  else if (se(t)) n = 16;
  else if (typeof t == 'object')
    if (r & 65) {
      const s = t.default;
      s && (s._c && (s._d = !1), oa(e, s()), s._c && (s._d = !0));
      return;
    } else {
      n = 32;
      const s = t._;
      !s && !Yl(t)
        ? (t._ctx = We)
        : s === 3 && We && (We.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)));
    }
  else
    ae(t)
      ? ((t = { default: t, _ctx: We }), (n = 32))
      : ((t = String(t)), r & 64 ? ((n = 16), (t = [xu(t)])) : (n = 8));
  (e.children = t), (e.shapeFlag |= n);
}
function pu(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    for (const s in r)
      if (s === 'class') t.class !== r.class && (t.class = ks([t.class, r.class]));
      else if (s === 'style') t.style = ws([t.style, r.style]);
      else if (kr(s)) {
        const o = t[s],
          i = r[s];
        i && o !== i && !(se(o) && o.includes(i)) && (t[s] = o ? [].concat(o, i) : i);
      } else s !== '' && (t[s] = r[s]);
  }
  return t;
}
function at(e, t, n, r = null) {
  At(e, t, 7, [n, r]);
}
const Kh = Kl();
let Gh = 0;
function gu(e, t, n) {
  const r = e.type,
    s = (t ? t.appContext : e.appContext) || Kh,
    o = {
      uid: Gh++,
      vnode: e,
      type: r,
      parent: t,
      appContext: s,
      root: null,
      next: null,
      subTree: null,
      effect: null,
      update: null,
      job: null,
      scope: new sl(!0),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: t ? t.provides : Object.create(s.provides),
      ids: t ? t.ids : ['', 0, 0],
      accessCache: null,
      renderCache: [],
      components: null,
      directives: null,
      propsOptions: Ql(r, s),
      emitsOptions: au(r, s),
      emit: null,
      emitted: null,
      propsDefaults: ge,
      inheritAttrs: r.inheritAttrs,
      ctx: ge,
      data: ge,
      props: ge,
      attrs: ge,
      slots: ge,
      refs: ge,
      setupState: ge,
      setupContext: null,
      suspense: n,
      suspenseId: n ? n.pendingId : 0,
      asyncDep: null,
      asyncResolved: !1,
      isMounted: !1,
      isUnmounted: !1,
      isDeactivated: !1,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null,
    };
  return (
    (o.ctx = { _: o }), (o.root = t ? t.root : o), (o.emit = wh.bind(null, o)), e.ce && e.ce(o), o
  );
}
let Ve = null;
const Ze = () => Ve || We;
let vs, di;
{
  const e = Rs(),
    t = (n, r) => {
      let s;
      return (
        (s = e[n]) || (s = e[n] = []),
        s.push(r),
        (o) => {
          s.length > 1 ? s.forEach((i) => i(o)) : s[0](o);
        }
      );
    };
  (vs = t('__VUE_INSTANCE_SETTERS__', (n) => (Ve = n))),
    (di = t('__VUE_SSR_SETTERS__', (n) => (jn = n)));
}
const Bn = (e) => {
    const t = Ve;
    return (
      vs(e),
      e.scope.on(),
      () => {
        e.scope.off(), vs(t);
      }
    );
  },
  hi = () => {
    Ve && Ve.scope.off(), vs(null);
  };
function mu(e) {
  return e.vnode.shapeFlag & 4;
}
let jn = !1;
function _u(e, t = !1, n = !1) {
  t && di(t);
  const { props: r, children: s } = e.vnode,
    o = mu(e);
  vh(e, r, o, t), Ch(e, s, n);
  const i = o ? zh(e, t) : void 0;
  return t && di(!1), i;
}
function zh(e, t) {
  const n = e.type;
  (e.accessCache = Object.create(null)), (e.proxy = new Proxy(e.ctx, ii));
  const { setup: r } = n;
  if (r) {
    dn();
    const s = (e.setupContext = r.length > 1 ? yu(e) : null),
      o = Bn(e),
      i = Lr(r, e, 0, [e.props, s]),
      a = Hi(i);
    if ((hn(), o(), (a || e.sp) && !an(e) && Xi(e), a)) {
      if ((i.then(hi, hi), t))
        return i
          .then((c) => {
            xi(e, c, t);
          })
          .catch((c) => {
            Zn(c, e, 0);
          });
      e.asyncDep = i;
    } else xi(e, i, t);
  } else vu(e, t);
}
function xi(e, t, n) {
  ae(t)
    ? e.type.__ssrInlineRender
      ? (e.ssrRender = t)
      : (e.render = t)
    : Fe(t) && (e.setupState = Al(t)),
    vu(e, n);
}
let ys, pi;
function Ev(e) {
  (ys = e),
    (pi = (t) => {
      t.render._rc && (t.withProxy = new Proxy(t.ctx, uh));
    });
}
const bv = () => !ys;
function vu(e, t, n) {
  const r = e.type;
  if (!e.render) {
    if (!t && ys && !r.render) {
      const s = r.template || na(e).template;
      if (s) {
        const { isCustomElement: o, compilerOptions: i } = e.appContext.config,
          { delimiters: a, compilerOptions: c } = r,
          l = Pe(Pe({ isCustomElement: o, delimiters: a }, i), c);
        r.render = ys(s, l);
      }
    }
    (e.render = r.render || mt), pi && pi(e);
  }
  {
    const s = Bn(e);
    dn();
    try {
      fh(e);
    } finally {
      hn(), s();
    }
  }
}
const Yh = {
  get(e, t) {
    return Ye(e, 'get', ''), e[t];
  },
};
function yu(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return { attrs: new Proxy(e.attrs, Yh), slots: e.slots, emit: e.emit, expose: t };
}
function Hr(e) {
  return e.exposed
    ? e.exposeProxy ||
        (e.exposeProxy = new Proxy(Al(Ki(e.exposed)), {
          get(t, n) {
            if (n in t) return t[n];
            if (n in dr) return dr[n](e);
          },
          has(t, n) {
            return n in t || n in dr;
          },
        }))
    : e.proxy;
}
function gi(e, t = !0) {
  return ae(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
function Xh(e) {
  return ae(e) && '__vccOpts' in e;
}
const Me = (e, t) => Od(e, t, jn);
function Ur(e, t, n) {
  const r = arguments.length;
  return r === 2
    ? Fe(t) && !se(t)
      ? jt(t)
        ? he(e, null, [t])
        : he(e, t)
      : he(e, null, t)
    : (r > 3 ? (n = Array.prototype.slice.call(arguments, 2)) : r === 3 && jt(n) && (n = [n]),
      he(e, t, n));
}
function Cv() {}
function Av(e, t, n, r) {
  const s = n[r];
  if (s && Qh(s, e)) return s;
  const o = t();
  return (o.memo = e.slice()), (o.cacheIndex = r), (n[r] = o);
}
function Qh(e, t) {
  const n = e.memo;
  if (n.length != t.length) return !1;
  for (let r = 0; r < n.length; r++) if (st(n[r], t[r])) return !1;
  return An > 0 && Qe && Qe.push(e), !0;
}
const Jh = '3.5.13',
  Bv = mt,
  Dv = Hd,
  Fv = On,
  Pv = Tl,
  Zh = {
    createComponentInstance: gu,
    setupComponent: _u,
    renderComponentRoot: ss,
    setCurrentRenderingInstance: Er,
    isVNode: jt,
    normalizeVNode: ct,
    getComponentPublicInstance: Hr,
    ensureValidVNode: ta,
    pushWarningContext: Id,
    popWarningContext: Md,
  },
  Sv = Zh,
  Tv = null,
  Rv = null,
  wv = null;
/**
 * @vue/runtime-dom v3.5.13
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/ let mi;
const Ga = typeof window < 'u' && window.trustedTypes;
if (Ga)
  try {
    mi = Ga.createPolicy('vue', { createHTML: (e) => e });
  } catch {}
const Eu = mi ? (e) => mi.createHTML(e) : (e) => e,
  ex = 'http://www.w3.org/2000/svg',
  tx = 'http://www.w3.org/1998/Math/MathML',
  Nt = typeof document < 'u' ? document : null,
  za = Nt && Nt.createElement('template'),
  nx = {
    insert: (e, t, n) => {
      t.insertBefore(e, n || null);
    },
    remove: (e) => {
      const t = e.parentNode;
      t && t.removeChild(e);
    },
    createElement: (e, t, n, r) => {
      const s =
        t === 'svg'
          ? Nt.createElementNS(ex, e)
          : t === 'mathml'
            ? Nt.createElementNS(tx, e)
            : n
              ? Nt.createElement(e, { is: n })
              : Nt.createElement(e);
      return e === 'select' && r && r.multiple != null && s.setAttribute('multiple', r.multiple), s;
    },
    createText: (e) => Nt.createTextNode(e),
    createComment: (e) => Nt.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t;
    },
    setElementText: (e, t) => {
      e.textContent = t;
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => Nt.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, '');
    },
    insertStaticContent(e, t, n, r, s, o) {
      const i = n ? n.previousSibling : t.lastChild;
      if (s && (s === o || s.nextSibling))
        for (; t.insertBefore(s.cloneNode(!0), n), !(s === o || !(s = s.nextSibling)); );
      else {
        za.innerHTML = Eu(
          r === 'svg' ? `<svg>${e}</svg>` : r === 'mathml' ? `<math>${e}</math>` : e,
        );
        const a = za.content;
        if (r === 'svg' || r === 'mathml') {
          const c = a.firstChild;
          for (; c.firstChild; ) a.appendChild(c.firstChild);
          a.removeChild(c);
        }
        t.insertBefore(a, n);
      }
      return [i ? i.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
    },
  },
  Qt = 'transition',
  rr = 'animation',
  Kn = Symbol('_vtc'),
  bu = {
    name: String,
    type: String,
    css: { type: Boolean, default: !0 },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
  },
  Cu = Pe({}, Il, bu),
  rx = (e) => ((e.displayName = 'Transition'), (e.props = Cu), e),
  kv = rx((e, { slots: t }) => Ur(qd, Au(e), t)),
  vn = (e, t = []) => {
    se(e) ? e.forEach((n) => n(...t)) : e && e(...t);
  },
  Ya = (e) => (e ? (se(e) ? e.some((t) => t.length > 1) : e.length > 1) : !1);
function Au(e) {
  const t = {};
  for (const T in e) T in bu || (t[T] = e[T]);
  if (e.css === !1) return t;
  const {
      name: n = 'v',
      type: r,
      duration: s,
      enterFromClass: o = `${n}-enter-from`,
      enterActiveClass: i = `${n}-enter-active`,
      enterToClass: a = `${n}-enter-to`,
      appearFromClass: c = o,
      appearActiveClass: l = i,
      appearToClass: u = a,
      leaveFromClass: f = `${n}-leave-from`,
      leaveActiveClass: d = `${n}-leave-active`,
      leaveToClass: p = `${n}-leave-to`,
    } = e,
    m = sx(s),
    v = m && m[0],
    E = m && m[1],
    {
      onBeforeEnter: _,
      onEnter: g,
      onEnterCancelled: h,
      onLeave: x,
      onLeaveCancelled: y,
      onBeforeAppear: C = _,
      onAppear: A = g,
      onAppearCancelled: w = h,
    } = t,
    D = (T, O, Y, J) => {
      (T._enterCancelled = J), Zt(T, O ? u : a), Zt(T, O ? l : i), Y && Y();
    },
    b = (T, O) => {
      (T._isLeaving = !1), Zt(T, f), Zt(T, p), Zt(T, d), O && O();
    },
    F = (T) => (O, Y) => {
      const J = T ? A : g,
        q = () => D(O, T, Y);
      vn(J, [O, q]),
        Xa(() => {
          Zt(O, T ? c : o), Pt(O, T ? u : a), Ya(J) || Qa(O, r, v, q);
        });
    };
  return Pe(t, {
    onBeforeEnter(T) {
      vn(_, [T]), Pt(T, o), Pt(T, i);
    },
    onBeforeAppear(T) {
      vn(C, [T]), Pt(T, c), Pt(T, l);
    },
    onEnter: F(!1),
    onAppear: F(!0),
    onLeave(T, O) {
      T._isLeaving = !0;
      const Y = () => b(T, O);
      Pt(T, f),
        T._enterCancelled ? (Pt(T, d), _i()) : (_i(), Pt(T, d)),
        Xa(() => {
          T._isLeaving && (Zt(T, f), Pt(T, p), Ya(x) || Qa(T, r, E, Y));
        }),
        vn(x, [T, Y]);
    },
    onEnterCancelled(T) {
      D(T, !1, void 0, !0), vn(h, [T]);
    },
    onAppearCancelled(T) {
      D(T, !0, void 0, !0), vn(w, [T]);
    },
    onLeaveCancelled(T) {
      b(T), vn(y, [T]);
    },
  });
}
function sx(e) {
  if (e == null) return null;
  if (Fe(e)) return [io(e.enter), io(e.leave)];
  {
    const t = io(e);
    return [t, t];
  }
}
function io(e) {
  return ls(e);
}
function Pt(e, t) {
  t.split(/\s+/).forEach((n) => n && e.classList.add(n)), (e[Kn] || (e[Kn] = new Set())).add(t);
}
function Zt(e, t) {
  t.split(/\s+/).forEach((r) => r && e.classList.remove(r));
  const n = e[Kn];
  n && (n.delete(t), n.size || (e[Kn] = void 0));
}
function Xa(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let ox = 0;
function Qa(e, t, n, r) {
  const s = (e._endId = ++ox),
    o = () => {
      s === e._endId && r();
    };
  if (n != null) return setTimeout(o, n);
  const { type: i, timeout: a, propCount: c } = Bu(e, t);
  if (!i) return r();
  const l = i + 'end';
  let u = 0;
  const f = () => {
      e.removeEventListener(l, d), o();
    },
    d = (p) => {
      p.target === e && ++u >= c && f();
    };
  setTimeout(() => {
    u < c && f();
  }, a + 1),
    e.addEventListener(l, d);
}
function Bu(e, t) {
  const n = window.getComputedStyle(e),
    r = (m) => (n[m] || '').split(', '),
    s = r(`${Qt}Delay`),
    o = r(`${Qt}Duration`),
    i = Ja(s, o),
    a = r(`${rr}Delay`),
    c = r(`${rr}Duration`),
    l = Ja(a, c);
  let u = null,
    f = 0,
    d = 0;
  t === Qt
    ? i > 0 && ((u = Qt), (f = i), (d = o.length))
    : t === rr
      ? l > 0 && ((u = rr), (f = l), (d = c.length))
      : ((f = Math.max(i, l)),
        (u = f > 0 ? (i > l ? Qt : rr) : null),
        (d = u ? (u === Qt ? o.length : c.length) : 0));
  const p = u === Qt && /\b(transform|all)(,|$)/.test(r(`${Qt}Property`).toString());
  return { type: u, timeout: f, propCount: d, hasTransform: p };
}
function Ja(e, t) {
  for (; e.length < t.length; ) e = e.concat(e);
  return Math.max(...t.map((n, r) => Za(n) + Za(e[r])));
}
function Za(e) {
  return e === 'auto' ? 0 : Number(e.slice(0, -1).replace(',', '.')) * 1e3;
}
function _i() {
  return document.body.offsetHeight;
}
function ix(e, t, n) {
  const r = e[Kn];
  r && (t = (t ? [t, ...r] : [...r]).join(' ')),
    t == null ? e.removeAttribute('class') : n ? e.setAttribute('class', t) : (e.className = t);
}
const Es = Symbol('_vod'),
  Du = Symbol('_vsh'),
  ax = {
    beforeMount(e, { value: t }, { transition: n }) {
      (e[Es] = e.style.display === 'none' ? '' : e.style.display),
        n && t ? n.beforeEnter(e) : sr(e, t);
    },
    mounted(e, { value: t }, { transition: n }) {
      n && t && n.enter(e);
    },
    updated(e, { value: t, oldValue: n }, { transition: r }) {
      !t != !n &&
        (r
          ? t
            ? (r.beforeEnter(e), sr(e, !0), r.enter(e))
            : r.leave(e, () => {
                sr(e, !1);
              })
          : sr(e, t));
    },
    beforeUnmount(e, { value: t }) {
      sr(e, t);
    },
  };
function sr(e, t) {
  (e.style.display = t ? e[Es] : 'none'), (e[Du] = !t);
}
function cx() {
  ax.getSSRProps = ({ value: e }) => {
    if (!e) return { style: { display: 'none' } };
  };
}
const Fu = Symbol('');
function Ov(e) {
  const t = Ze();
  if (!t) return;
  const n = (t.ut = (s = e(t.proxy)) => {
      Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((o) => bs(o, s));
    }),
    r = () => {
      const s = e(t.proxy);
      t.ce ? bs(t.ce, s) : vi(t.subTree, s), n(s);
    };
  Vl(() => {
    xs(r);
  }),
    Fn(() => {
      wt(r, mt, { flush: 'post' });
      const s = new MutationObserver(r);
      s.observe(t.subTree.el.parentNode, { childList: !0 }), $s(() => s.disconnect());
    });
}
function vi(e, t) {
  if (e.shapeFlag & 128) {
    const n = e.suspense;
    (e = n.activeBranch),
      n.pendingBranch &&
        !n.isHydrating &&
        n.effects.push(() => {
          vi(n.activeBranch, t);
        });
  }
  for (; e.component; ) e = e.component.subTree;
  if (e.shapeFlag & 1 && e.el) bs(e.el, t);
  else if (e.type === Ne) e.children.forEach((n) => vi(n, t));
  else if (e.type === qn) {
    let { el: n, anchor: r } = e;
    for (; n && (bs(n, t), n !== r); ) n = n.nextSibling;
  }
}
function bs(e, t) {
  if (e.nodeType === 1) {
    const n = e.style;
    let r = '';
    for (const s in t) n.setProperty(`--${s}`, t[s]), (r += `--${s}: ${t[s]};`);
    n[Fu] = r;
  }
}
const lx = /(^|;)\s*display\s*:/;
function ux(e, t, n) {
  const r = e.style,
    s = Te(n);
  let o = !1;
  if (n && !s) {
    if (t)
      if (Te(t))
        for (const i of t.split(';')) {
          const a = i.slice(0, i.indexOf(':')).trim();
          n[a] == null && is(r, a, '');
        }
      else for (const i in t) n[i] == null && is(r, i, '');
    for (const i in n) i === 'display' && (o = !0), is(r, i, n[i]);
  } else if (s) {
    if (t !== n) {
      const i = r[Fu];
      i && (n += ';' + i), (r.cssText = n), (o = lx.test(n));
    }
  } else t && e.removeAttribute('style');
  Es in e && ((e[Es] = o ? r.display : ''), e[Du] && (r.display = 'none'));
}
const e0 = /\s*!important$/;
function is(e, t, n) {
  if (se(n)) n.forEach((r) => is(e, t, r));
  else if ((n == null && (n = ''), t.startsWith('--'))) e.setProperty(t, n);
  else {
    const r = fx(e, t);
    e0.test(n) ? e.setProperty(lt(r), n.replace(e0, ''), 'important') : (e[r] = n);
  }
}
const t0 = ['Webkit', 'Moz', 'ms'],
  ao = {};
function fx(e, t) {
  const n = ao[t];
  if (n) return n;
  let r = Je(t);
  if (r !== 'filter' && r in e) return (ao[t] = r);
  r = Ts(r);
  for (let s = 0; s < t0.length; s++) {
    const o = t0[s] + r;
    if (o in e) return (ao[t] = o);
  }
  return t;
}
const n0 = 'http://www.w3.org/1999/xlink';
function r0(e, t, n, r, s, o = rd(t)) {
  r && t.startsWith('xlink:')
    ? n == null
      ? e.removeAttributeNS(n0, t.slice(6, t.length))
      : e.setAttributeNS(n0, t, n)
    : n == null || (o && !tl(n))
      ? e.removeAttribute(t)
      : e.setAttribute(t, o ? '' : Ct(n) ? String(n) : n);
}
function s0(e, t, n, r, s) {
  if (t === 'innerHTML' || t === 'textContent') {
    n != null && (e[t] = t === 'innerHTML' ? Eu(n) : n);
    return;
  }
  const o = e.tagName;
  if (t === 'value' && o !== 'PROGRESS' && !o.includes('-')) {
    const a = o === 'OPTION' ? e.getAttribute('value') || '' : e.value,
      c = n == null ? (e.type === 'checkbox' ? 'on' : '') : String(n);
    (a !== c || !('_value' in e)) && (e.value = c),
      n == null && e.removeAttribute(t),
      (e._value = n);
    return;
  }
  let i = !1;
  if (n === '' || n == null) {
    const a = typeof e[t];
    a === 'boolean'
      ? (n = tl(n))
      : n == null && a === 'string'
        ? ((n = ''), (i = !0))
        : a === 'number' && ((n = 0), (i = !0));
  }
  try {
    e[t] = n;
  } catch {}
  i && e.removeAttribute(s || t);
}
function Ht(e, t, n, r) {
  e.addEventListener(t, n, r);
}
function dx(e, t, n, r) {
  e.removeEventListener(t, n, r);
}
const o0 = Symbol('_vei');
function hx(e, t, n, r, s = null) {
  const o = e[o0] || (e[o0] = {}),
    i = o[t];
  if (r && i) i.value = r;
  else {
    const [a, c] = xx(t);
    if (r) {
      const l = (o[t] = mx(r, s));
      Ht(e, a, l, c);
    } else i && (dx(e, a, i, c), (o[t] = void 0));
  }
}
const i0 = /(?:Once|Passive|Capture)$/;
function xx(e) {
  let t;
  if (i0.test(e)) {
    t = {};
    let r;
    for (; (r = e.match(i0)); )
      (e = e.slice(0, e.length - r[0].length)), (t[r[0].toLowerCase()] = !0);
  }
  return [e[2] === ':' ? e.slice(3) : lt(e.slice(2)), t];
}
let co = 0;
const px = Promise.resolve(),
  gx = () => co || (px.then(() => (co = 0)), (co = Date.now()));
function mx(e, t) {
  const n = (r) => {
    if (!r._vts) r._vts = Date.now();
    else if (r._vts <= n.attached) return;
    At(_x(r, n.value), t, 5, [r]);
  };
  return (n.value = e), (n.attached = gx()), n;
}
function _x(e, t) {
  if (se(t)) {
    const n = e.stopImmediatePropagation;
    return (
      (e.stopImmediatePropagation = () => {
        n.call(e), (e._stopped = !0);
      }),
      t.map((r) => (s) => !s._stopped && r && r(s))
    );
  } else return t;
}
const a0 = (e) =>
    e.charCodeAt(0) === 111 &&
    e.charCodeAt(1) === 110 &&
    e.charCodeAt(2) > 96 &&
    e.charCodeAt(2) < 123,
  vx = (e, t, n, r, s, o) => {
    const i = s === 'svg';
    t === 'class'
      ? ix(e, r, i)
      : t === 'style'
        ? ux(e, n, r)
        : kr(t)
          ? Ii(t) || hx(e, t, n, r, o)
          : (
                t[0] === '.'
                  ? ((t = t.slice(1)), !0)
                  : t[0] === '^'
                    ? ((t = t.slice(1)), !1)
                    : yx(e, t, r, i)
              )
            ? (s0(e, t, r),
              !e.tagName.includes('-') &&
                (t === 'value' || t === 'checked' || t === 'selected') &&
                r0(e, t, r, i, o, t !== 'value'))
            : e._isVueCE && (/[A-Z]/.test(t) || !Te(r))
              ? s0(e, Je(t), r, o, t)
              : (t === 'true-value'
                  ? (e._trueValue = r)
                  : t === 'false-value' && (e._falseValue = r),
                r0(e, t, r, i));
  };
function yx(e, t, n, r) {
  if (r) return !!(t === 'innerHTML' || t === 'textContent' || (t in e && a0(t) && ae(n)));
  if (
    t === 'spellcheck' ||
    t === 'draggable' ||
    t === 'translate' ||
    t === 'form' ||
    (t === 'list' && e.tagName === 'INPUT') ||
    (t === 'type' && e.tagName === 'TEXTAREA')
  )
    return !1;
  if (t === 'width' || t === 'height') {
    const s = e.tagName;
    if (s === 'IMG' || s === 'VIDEO' || s === 'CANVAS' || s === 'SOURCE') return !1;
  }
  return a0(t) && Te(n) ? !1 : t in e;
}
const c0 = {};
/*! #__NO_SIDE_EFFECTS__ */ function Ex(e, t, n) {
  const r = Gt(e, t);
  Ps(r) && Pe(r, t);
  class s extends ia {
    constructor(i) {
      super(r, i, n);
    }
  }
  return (s.def = r), s;
}
/*! #__NO_SIDE_EFFECTS__ */ const Lv = (e, t) => Ex(e, t, Hx),
  bx = typeof HTMLElement < 'u' ? HTMLElement : class {};
class ia extends bx {
  constructor(t, n = {}, r = Ei) {
    super(),
      (this._def = t),
      (this._props = n),
      (this._createApp = r),
      (this._isVueCE = !0),
      (this._instance = null),
      (this._app = null),
      (this._nonce = this._def.nonce),
      (this._connected = !1),
      (this._resolved = !1),
      (this._numberProps = null),
      (this._styleChildren = new WeakSet()),
      (this._ob = null),
      this.shadowRoot && r !== Ei
        ? (this._root = this.shadowRoot)
        : t.shadowRoot !== !1
          ? (this.attachShadow({ mode: 'open' }), (this._root = this.shadowRoot))
          : (this._root = this),
      this._def.__asyncLoader || this._resolveProps(this._def);
  }
  connectedCallback() {
    if (!this.isConnected) return;
    this.shadowRoot || this._parseSlots(), (this._connected = !0);
    let t = this;
    for (; (t = t && (t.parentNode || t.host)); )
      if (t instanceof ia) {
        this._parent = t;
        break;
      }
    this._instance ||
      (this._resolved
        ? (this._setParent(), this._update())
        : t && t._pendingResolve
          ? (this._pendingResolve = t._pendingResolve.then(() => {
              (this._pendingResolve = void 0), this._resolveDef();
            }))
          : this._resolveDef());
  }
  _setParent(t = this._parent) {
    t && ((this._instance.parent = t._instance), (this._instance.provides = t._instance.provides));
  }
  disconnectedCallback() {
    (this._connected = !1),
      Nr(() => {
        this._connected ||
          (this._ob && (this._ob.disconnect(), (this._ob = null)),
          this._app && this._app.unmount(),
          this._instance && (this._instance.ce = void 0),
          (this._app = this._instance = null));
      });
  }
  _resolveDef() {
    if (this._pendingResolve) return;
    for (let r = 0; r < this.attributes.length; r++) this._setAttr(this.attributes[r].name);
    (this._ob = new MutationObserver((r) => {
      for (const s of r) this._setAttr(s.attributeName);
    })),
      this._ob.observe(this, { attributes: !0 });
    const t = (r, s = !1) => {
        (this._resolved = !0), (this._pendingResolve = void 0);
        const { props: o, styles: i } = r;
        let a;
        if (o && !se(o))
          for (const c in o) {
            const l = o[c];
            (l === Number || (l && l.type === Number)) &&
              (c in this._props && (this._props[c] = ls(this._props[c])),
              ((a || (a = Object.create(null)))[Je(c)] = !0));
          }
        (this._numberProps = a),
          s && this._resolveProps(r),
          this.shadowRoot && this._applyStyles(i),
          this._mount(r);
      },
      n = this._def.__asyncLoader;
    n ? (this._pendingResolve = n().then((r) => t((this._def = r), !0))) : t(this._def);
  }
  _mount(t) {
    (this._app = this._createApp(t)),
      t.configureApp && t.configureApp(this._app),
      (this._app._ceVNode = this._createVNode()),
      this._app.mount(this._root);
    const n = this._instance && this._instance.exposed;
    if (n)
      for (const r in n) be(this, r) || Object.defineProperty(this, r, { get: () => qt(n[r]) });
  }
  _resolveProps(t) {
    const { props: n } = t,
      r = se(n) ? n : Object.keys(n || {});
    for (const s of Object.keys(this)) s[0] !== '_' && r.includes(s) && this._setProp(s, this[s]);
    for (const s of r.map(Je))
      Object.defineProperty(this, s, {
        get() {
          return this._getProp(s);
        },
        set(o) {
          this._setProp(s, o, !0, !0);
        },
      });
  }
  _setAttr(t) {
    if (t.startsWith('data-v-')) return;
    const n = this.hasAttribute(t);
    let r = n ? this.getAttribute(t) : c0;
    const s = Je(t);
    n && this._numberProps && this._numberProps[s] && (r = ls(r)), this._setProp(s, r, !1, !0);
  }
  _getProp(t) {
    return this._props[t];
  }
  _setProp(t, n, r = !0, s = !1) {
    if (
      n !== this._props[t] &&
      (n === c0
        ? delete this._props[t]
        : ((this._props[t] = n), t === 'key' && this._app && (this._app._ceVNode.key = n)),
      s && this._instance && this._update(),
      r)
    ) {
      const o = this._ob;
      o && o.disconnect(),
        n === !0
          ? this.setAttribute(lt(t), '')
          : typeof n == 'string' || typeof n == 'number'
            ? this.setAttribute(lt(t), n + '')
            : n || this.removeAttribute(lt(t)),
        o && o.observe(this, { attributes: !0 });
    }
  }
  _update() {
    Mx(this._createVNode(), this._root);
  }
  _createVNode() {
    const t = {};
    this.shadowRoot || (t.onVnodeMounted = t.onVnodeUpdated = this._renderSlots.bind(this));
    const n = he(this._def, Pe(t, this._props));
    return (
      this._instance ||
        (n.ce = (r) => {
          (this._instance = r), (r.ce = this), (r.isCE = !0);
          const s = (o, i) => {
            this.dispatchEvent(
              new CustomEvent(o, Ps(i[0]) ? Pe({ detail: i }, i[0]) : { detail: i }),
            );
          };
          (r.emit = (o, ...i) => {
            s(o, i), lt(o) !== o && s(lt(o), i);
          }),
            this._setParent();
        }),
      n
    );
  }
  _applyStyles(t, n) {
    if (!t) return;
    if (n) {
      if (n === this._def || this._styleChildren.has(n)) return;
      this._styleChildren.add(n);
    }
    const r = this._nonce;
    for (let s = t.length - 1; s >= 0; s--) {
      const o = document.createElement('style');
      r && o.setAttribute('nonce', r), (o.textContent = t[s]), this.shadowRoot.prepend(o);
    }
  }
  _parseSlots() {
    const t = (this._slots = {});
    let n;
    for (; (n = this.firstChild); ) {
      const r = (n.nodeType === 1 && n.getAttribute('slot')) || 'default';
      (t[r] || (t[r] = [])).push(n), this.removeChild(n);
    }
  }
  _renderSlots() {
    const t = (this._teleportTarget || this).querySelectorAll('slot'),
      n = this._instance.type.__scopeId;
    for (let r = 0; r < t.length; r++) {
      const s = t[r],
        o = s.getAttribute('name') || 'default',
        i = this._slots[o],
        a = s.parentNode;
      if (i)
        for (const c of i) {
          if (n && c.nodeType === 1) {
            const l = n + '-s',
              u = document.createTreeWalker(c, 1);
            c.setAttribute(l, '');
            let f;
            for (; (f = u.nextNode()); ) f.setAttribute(l, '');
          }
          a.insertBefore(c, s);
        }
      else for (; s.firstChild; ) a.insertBefore(s.firstChild, s);
      a.removeChild(s);
    }
  }
  _injectChildStyle(t) {
    this._applyStyles(t.styles, t);
  }
  _removeChildStyle(t) {}
}
function Cx(e) {
  const t = Ze(),
    n = t && t.ce;
  return n || null;
}
function Nv() {
  const e = Cx();
  return e && e.shadowRoot;
}
function Iv(e = '$style') {
  {
    const t = Ze();
    if (!t) return ge;
    const n = t.type.__cssModules;
    if (!n) return ge;
    const r = n[e];
    return r || ge;
  }
}
const Pu = new WeakMap(),
  Su = new WeakMap(),
  Cs = Symbol('_moveCb'),
  l0 = Symbol('_enterCb'),
  Ax = (e) => (delete e.props.mode, e),
  Bx = Ax({
    name: 'TransitionGroup',
    props: Pe({}, Cu, { tag: String, moveClass: String }),
    setup(e, { slots: t }) {
      const n = Ze(),
        r = Nl();
      let s, o;
      return (
        Qi(() => {
          if (!s.length) return;
          const i = e.moveClass || `${e.name || 'v'}-move`;
          if (!Tx(s[0].el, n.vnode.el, i)) return;
          s.forEach(Fx), s.forEach(Px);
          const a = s.filter(Sx);
          _i(),
            a.forEach((c) => {
              const l = c.el,
                u = l.style;
              Pt(l, i), (u.transform = u.webkitTransform = u.transitionDuration = '');
              const f = (l[Cs] = (d) => {
                (d && d.target !== l) ||
                  ((!d || /transform$/.test(d.propertyName)) &&
                    (l.removeEventListener('transitionend', f), (l[Cs] = null), Zt(l, i)));
              });
              l.addEventListener('transitionend', f);
            });
        }),
        () => {
          const i = ve(e),
            a = Au(i);
          let c = i.tag || Ne;
          if (((s = []), o))
            for (let l = 0; l < o.length; l++) {
              const u = o[l];
              u.el &&
                u.el instanceof Element &&
                (s.push(u), un(u, br(u, a, r, n)), Pu.set(u, u.el.getBoundingClientRect()));
            }
          o = t.default ? Yi(t.default()) : [];
          for (let l = 0; l < o.length; l++) {
            const u = o[l];
            u.key != null && un(u, br(u, a, r, n));
          }
          return he(c, null, o);
        }
      );
    },
  }),
  Dx = Bx;
function Fx(e) {
  const t = e.el;
  t[Cs] && t[Cs](), t[l0] && t[l0]();
}
function Px(e) {
  Su.set(e, e.el.getBoundingClientRect());
}
function Sx(e) {
  const t = Pu.get(e),
    n = Su.get(e),
    r = t.left - n.left,
    s = t.top - n.top;
  if (r || s) {
    const o = e.el.style;
    return (
      (o.transform = o.webkitTransform = `translate(${r}px,${s}px)`),
      (o.transitionDuration = '0s'),
      e
    );
  }
}
function Tx(e, t, n) {
  const r = e.cloneNode(),
    s = e[Kn];
  s &&
    s.forEach((a) => {
      a.split(/\s+/).forEach((c) => c && r.classList.remove(c));
    }),
    n.split(/\s+/).forEach((a) => a && r.classList.add(a)),
    (r.style.display = 'none');
  const o = t.nodeType === 1 ? t : t.parentNode;
  o.appendChild(r);
  const { hasTransform: i } = Bu(r);
  return o.removeChild(r), i;
}
const fn = (e) => {
  const t = e.props['onUpdate:modelValue'] || !1;
  return se(t) ? (n) => $n(t, n) : t;
};
function Rx(e) {
  e.target.composing = !0;
}
function u0(e) {
  const t = e.target;
  t.composing && ((t.composing = !1), t.dispatchEvent(new Event('input')));
}
const vt = Symbol('_assign'),
  yi = {
    created(e, { modifiers: { lazy: t, trim: n, number: r } }, s) {
      e[vt] = fn(s);
      const o = r || (s.props && s.props.type === 'number');
      Ht(e, t ? 'change' : 'input', (i) => {
        if (i.target.composing) return;
        let a = e.value;
        n && (a = a.trim()), o && (a = cs(a)), e[vt](a);
      }),
        n &&
          Ht(e, 'change', () => {
            e.value = e.value.trim();
          }),
        t || (Ht(e, 'compositionstart', Rx), Ht(e, 'compositionend', u0), Ht(e, 'change', u0));
    },
    mounted(e, { value: t }) {
      e.value = t ?? '';
    },
    beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: s, number: o } }, i) {
      if (((e[vt] = fn(i)), e.composing)) return;
      const a = (o || e.type === 'number') && !/^0\d/.test(e.value) ? cs(e.value) : e.value,
        c = t ?? '';
      a !== c &&
        ((document.activeElement === e &&
          e.type !== 'range' &&
          ((r && t === n) || (s && e.value.trim() === c))) ||
          (e.value = c));
    },
  },
  Tu = {
    deep: !0,
    created(e, t, n) {
      (e[vt] = fn(n)),
        Ht(e, 'change', () => {
          const r = e._modelValue,
            s = Gn(e),
            o = e.checked,
            i = e[vt];
          if (se(r)) {
            const a = Os(r, s),
              c = a !== -1;
            if (o && !c) i(r.concat(s));
            else if (!o && c) {
              const l = [...r];
              l.splice(a, 1), i(l);
            }
          } else if (Dn(r)) {
            const a = new Set(r);
            o ? a.add(s) : a.delete(s), i(a);
          } else i(wu(e, o));
        });
    },
    mounted: f0,
    beforeUpdate(e, t, n) {
      (e[vt] = fn(n)), f0(e, t, n);
    },
  };
function f0(e, { value: t, oldValue: n }, r) {
  e._modelValue = t;
  let s;
  if (se(t)) s = Os(t, r.props.value) > -1;
  else if (Dn(t)) s = t.has(r.props.value);
  else {
    if (t === n) return;
    s = ln(t, wu(e, !0));
  }
  e.checked !== s && (e.checked = s);
}
const Ru = {
    created(e, { value: t }, n) {
      (e.checked = ln(t, n.props.value)),
        (e[vt] = fn(n)),
        Ht(e, 'change', () => {
          e[vt](Gn(e));
        });
    },
    beforeUpdate(e, { value: t, oldValue: n }, r) {
      (e[vt] = fn(r)), t !== n && (e.checked = ln(t, r.props.value));
    },
  },
  wx = {
    deep: !0,
    created(e, { value: t, modifiers: { number: n } }, r) {
      const s = Dn(t);
      Ht(e, 'change', () => {
        const o = Array.prototype.filter
          .call(e.options, (i) => i.selected)
          .map((i) => (n ? cs(Gn(i)) : Gn(i)));
        e[vt](e.multiple ? (s ? new Set(o) : o) : o[0]),
          (e._assigning = !0),
          Nr(() => {
            e._assigning = !1;
          });
      }),
        (e[vt] = fn(r));
    },
    mounted(e, { value: t }) {
      d0(e, t);
    },
    beforeUpdate(e, t, n) {
      e[vt] = fn(n);
    },
    updated(e, { value: t }) {
      e._assigning || d0(e, t);
    },
  };
function d0(e, t) {
  const n = e.multiple,
    r = se(t);
  if (!(n && !r && !Dn(t))) {
    for (let s = 0, o = e.options.length; s < o; s++) {
      const i = e.options[s],
        a = Gn(i);
      if (n)
        if (r) {
          const c = typeof a;
          c === 'string' || c === 'number'
            ? (i.selected = t.some((l) => String(l) === String(a)))
            : (i.selected = Os(t, a) > -1);
        } else i.selected = t.has(a);
      else if (ln(Gn(i), t)) {
        e.selectedIndex !== s && (e.selectedIndex = s);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Gn(e) {
  return '_value' in e ? e._value : e.value;
}
function wu(e, t) {
  const n = t ? '_trueValue' : '_falseValue';
  return n in e ? e[n] : t;
}
const kx = {
  created(e, t, n) {
    Xr(e, t, n, null, 'created');
  },
  mounted(e, t, n) {
    Xr(e, t, n, null, 'mounted');
  },
  beforeUpdate(e, t, n, r) {
    Xr(e, t, n, r, 'beforeUpdate');
  },
  updated(e, t, n, r) {
    Xr(e, t, n, r, 'updated');
  },
};
function ku(e, t) {
  switch (e) {
    case 'SELECT':
      return wx;
    case 'TEXTAREA':
      return yi;
    default:
      switch (t) {
        case 'checkbox':
          return Tu;
        case 'radio':
          return Ru;
        default:
          return yi;
      }
  }
}
function Xr(e, t, n, r, s) {
  const i = ku(e.tagName, n.props && n.props.type)[s];
  i && i(e, t, n, r);
}
function Ox() {
  (yi.getSSRProps = ({ value: e }) => ({ value: e })),
    (Ru.getSSRProps = ({ value: e }, t) => {
      if (t.props && ln(t.props.value, e)) return { checked: !0 };
    }),
    (Tu.getSSRProps = ({ value: e }, t) => {
      if (se(e)) {
        if (t.props && Os(e, t.props.value) > -1) return { checked: !0 };
      } else if (Dn(e)) {
        if (t.props && e.has(t.props.value)) return { checked: !0 };
      } else if (e) return { checked: !0 };
    }),
    (kx.getSSRProps = (e, t) => {
      if (typeof t.type != 'string') return;
      const n = ku(t.type.toUpperCase(), t.props && t.props.type);
      if (n.getSSRProps) return n.getSSRProps(e, t);
    });
}
const Lx = ['ctrl', 'shift', 'alt', 'meta'],
  Nx = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => 'button' in e && e.button !== 0,
    middle: (e) => 'button' in e && e.button !== 1,
    right: (e) => 'button' in e && e.button !== 2,
    exact: (e, t) => Lx.some((n) => e[`${n}Key`] && !t.includes(n)),
  },
  Mv = (e, t) => {
    const n = e._withMods || (e._withMods = {}),
      r = t.join('.');
    return (
      n[r] ||
      (n[r] = (s, ...o) => {
        for (let i = 0; i < t.length; i++) {
          const a = Nx[t[i]];
          if (a && a(s, t)) return;
        }
        return e(s, ...o);
      })
    );
  },
  Ix = {
    esc: 'escape',
    space: ' ',
    up: 'arrow-up',
    left: 'arrow-left',
    right: 'arrow-right',
    down: 'arrow-down',
    delete: 'backspace',
  },
  Hv = (e, t) => {
    const n = e._withKeys || (e._withKeys = {}),
      r = t.join('.');
    return (
      n[r] ||
      (n[r] = (s) => {
        if (!('key' in s)) return;
        const o = lt(s.key);
        if (t.some((i) => i === o || Ix[i] === o)) return e(s);
      })
    );
  },
  Ou = Pe({ patchProp: vx }, nx);
let xr,
  h0 = !1;
function Lu() {
  return xr || (xr = Bh(Ou));
}
function Nu() {
  return (xr = h0 ? xr : Dh(Ou)), (h0 = !0), xr;
}
const Mx = (...e) => {
    Lu().render(...e);
  },
  Uv = (...e) => {
    Nu().hydrate(...e);
  },
  Ei = (...e) => {
    const t = Lu().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (r) => {
        const s = Mu(r);
        if (!s) return;
        const o = t._component;
        !ae(o) && !o.render && !o.template && (o.template = s.innerHTML),
          s.nodeType === 1 && (s.textContent = '');
        const i = n(s, !1, Iu(s));
        return (
          s instanceof Element && (s.removeAttribute('v-cloak'), s.setAttribute('data-v-app', '')),
          i
        );
      }),
      t
    );
  },
  Hx = (...e) => {
    const t = Nu().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (r) => {
        const s = Mu(r);
        if (s) return n(s, !0, Iu(s));
      }),
      t
    );
  };
function Iu(e) {
  if (e instanceof SVGElement) return 'svg';
  if (typeof MathMLElement == 'function' && e instanceof MathMLElement) return 'mathml';
}
function Mu(e) {
  return Te(e) ? document.querySelector(e) : e;
}
let x0 = !1;
const $v = () => {
  x0 || ((x0 = !0), Ox(), cx());
};
/*!
 * vue-router v4.5.0
 * (c) 2024 Eduardo San Martin Morote
 * @license MIT
 */ const Ln = typeof document < 'u';
function Hu(e) {
  return typeof e == 'object' || 'displayName' in e || 'props' in e || '__vccOpts' in e;
}
function Ux(e) {
  return e.__esModule || e[Symbol.toStringTag] === 'Module' || (e.default && Hu(e.default));
}
const Ae = Object.assign;
function lo(e, t) {
  const n = {};
  for (const r in t) {
    const s = t[r];
    n[r] = Bt(s) ? s.map(e) : e(s);
  }
  return n;
}
const pr = () => {},
  Bt = Array.isArray,
  Uu = /#/g,
  $x = /&/g,
  Vx = /\//g,
  Wx = /=/g,
  qx = /\?/g,
  $u = /\+/g,
  jx = /%5B/g,
  Kx = /%5D/g,
  Vu = /%5E/g,
  Gx = /%60/g,
  Wu = /%7B/g,
  zx = /%7C/g,
  qu = /%7D/g,
  Yx = /%20/g;
function aa(e) {
  return encodeURI('' + e)
    .replace(zx, '|')
    .replace(jx, '[')
    .replace(Kx, ']');
}
function Xx(e) {
  return aa(e).replace(Wu, '{').replace(qu, '}').replace(Vu, '^');
}
function bi(e) {
  return aa(e)
    .replace($u, '%2B')
    .replace(Yx, '+')
    .replace(Uu, '%23')
    .replace($x, '%26')
    .replace(Gx, '`')
    .replace(Wu, '{')
    .replace(qu, '}')
    .replace(Vu, '^');
}
function Qx(e) {
  return bi(e).replace(Wx, '%3D');
}
function Jx(e) {
  return aa(e).replace(Uu, '%23').replace(qx, '%3F');
}
function Zx(e) {
  return e == null ? '' : Jx(e).replace(Vx, '%2F');
}
function Fr(e) {
  try {
    return decodeURIComponent('' + e);
  } catch {}
  return '' + e;
}
const ep = /\/$/,
  tp = (e) => e.replace(ep, '');
function uo(e, t, n = '/') {
  let r,
    s = {},
    o = '',
    i = '';
  const a = t.indexOf('#');
  let c = t.indexOf('?');
  return (
    a < c && a >= 0 && (c = -1),
    c > -1 && ((r = t.slice(0, c)), (o = t.slice(c + 1, a > -1 ? a : t.length)), (s = e(o))),
    a > -1 && ((r = r || t.slice(0, a)), (i = t.slice(a, t.length))),
    (r = op(r ?? t, n)),
    { fullPath: r + (o && '?') + o + i, path: r, query: s, hash: Fr(i) }
  );
}
function np(e, t) {
  const n = t.query ? e(t.query) : '';
  return t.path + (n && '?') + n + (t.hash || '');
}
function p0(e, t) {
  return !t || !e.toLowerCase().startsWith(t.toLowerCase()) ? e : e.slice(t.length) || '/';
}
function rp(e, t, n) {
  const r = t.matched.length - 1,
    s = n.matched.length - 1;
  return (
    r > -1 &&
    r === s &&
    zn(t.matched[r], n.matched[s]) &&
    ju(t.params, n.params) &&
    e(t.query) === e(n.query) &&
    t.hash === n.hash
  );
}
function zn(e, t) {
  return (e.aliasOf || e) === (t.aliasOf || t);
}
function ju(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1;
  for (const n in e) if (!sp(e[n], t[n])) return !1;
  return !0;
}
function sp(e, t) {
  return Bt(e) ? g0(e, t) : Bt(t) ? g0(t, e) : e === t;
}
function g0(e, t) {
  return Bt(t)
    ? e.length === t.length && e.every((n, r) => n === t[r])
    : e.length === 1 && e[0] === t;
}
function op(e, t) {
  if (e.startsWith('/')) return e;
  if (!e) return t;
  const n = t.split('/'),
    r = e.split('/'),
    s = r[r.length - 1];
  (s === '..' || s === '.') && r.push('');
  let o = n.length - 1,
    i,
    a;
  for (i = 0; i < r.length; i++)
    if (((a = r[i]), a !== '.'))
      if (a === '..') o > 1 && o--;
      else break;
  return n.slice(0, o).join('/') + '/' + r.slice(i).join('/');
}
const Jt = {
  path: '/',
  name: void 0,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: void 0,
};
var Pr;
(function (e) {
  (e.pop = 'pop'), (e.push = 'push');
})(Pr || (Pr = {}));
var gr;
(function (e) {
  (e.back = 'back'), (e.forward = 'forward'), (e.unknown = '');
})(gr || (gr = {}));
function ip(e) {
  if (!e)
    if (Ln) {
      const t = document.querySelector('base');
      (e = (t && t.getAttribute('href')) || '/'), (e = e.replace(/^\w+:\/\/[^\/]+/, ''));
    } else e = '/';
  return e[0] !== '/' && e[0] !== '#' && (e = '/' + e), tp(e);
}
const ap = /^[^#]+#/;
function cp(e, t) {
  return e.replace(ap, '#') + t;
}
function lp(e, t) {
  const n = document.documentElement.getBoundingClientRect(),
    r = e.getBoundingClientRect();
  return {
    behavior: t.behavior,
    left: r.left - n.left - (t.left || 0),
    top: r.top - n.top - (t.top || 0),
  };
}
const qs = () => ({ left: window.scrollX, top: window.scrollY });
function up(e) {
  let t;
  if ('el' in e) {
    const n = e.el,
      r = typeof n == 'string' && n.startsWith('#'),
      s =
        typeof n == 'string'
          ? r
            ? document.getElementById(n.slice(1))
            : document.querySelector(n)
          : n;
    if (!s) return;
    t = lp(s, e);
  } else t = e;
  'scrollBehavior' in document.documentElement.style
    ? window.scrollTo(t)
    : window.scrollTo(
        t.left != null ? t.left : window.scrollX,
        t.top != null ? t.top : window.scrollY,
      );
}
function m0(e, t) {
  return (history.state ? history.state.position - t : -1) + e;
}
const Ci = new Map();
function fp(e, t) {
  Ci.set(e, t);
}
function dp(e) {
  const t = Ci.get(e);
  return Ci.delete(e), t;
}
let hp = () => location.protocol + '//' + location.host;
function Ku(e, t) {
  const { pathname: n, search: r, hash: s } = t,
    o = e.indexOf('#');
  if (o > -1) {
    let a = s.includes(e.slice(o)) ? e.slice(o).length : 1,
      c = s.slice(a);
    return c[0] !== '/' && (c = '/' + c), p0(c, '');
  }
  return p0(n, e) + r + s;
}
function xp(e, t, n, r) {
  let s = [],
    o = [],
    i = null;
  const a = ({ state: d }) => {
    const p = Ku(e, location),
      m = n.value,
      v = t.value;
    let E = 0;
    if (d) {
      if (((n.value = p), (t.value = d), i && i === m)) {
        i = null;
        return;
      }
      E = v ? d.position - v.position : 0;
    } else r(p);
    s.forEach((_) => {
      _(n.value, m, {
        delta: E,
        type: Pr.pop,
        direction: E ? (E > 0 ? gr.forward : gr.back) : gr.unknown,
      });
    });
  };
  function c() {
    i = n.value;
  }
  function l(d) {
    s.push(d);
    const p = () => {
      const m = s.indexOf(d);
      m > -1 && s.splice(m, 1);
    };
    return o.push(p), p;
  }
  function u() {
    const { history: d } = window;
    d.state && d.replaceState(Ae({}, d.state, { scroll: qs() }), '');
  }
  function f() {
    for (const d of o) d();
    (o = []),
      window.removeEventListener('popstate', a),
      window.removeEventListener('beforeunload', u);
  }
  return (
    window.addEventListener('popstate', a),
    window.addEventListener('beforeunload', u, { passive: !0 }),
    { pauseListeners: c, listen: l, destroy: f }
  );
}
function _0(e, t, n, r = !1, s = !1) {
  return {
    back: e,
    current: t,
    forward: n,
    replaced: r,
    position: window.history.length,
    scroll: s ? qs() : null,
  };
}
function pp(e) {
  const { history: t, location: n } = window,
    r = { value: Ku(e, n) },
    s = { value: t.state };
  s.value ||
    o(
      r.value,
      {
        back: null,
        current: r.value,
        forward: null,
        position: t.length - 1,
        replaced: !0,
        scroll: null,
      },
      !0,
    );
  function o(c, l, u) {
    const f = e.indexOf('#'),
      d = f > -1 ? (n.host && document.querySelector('base') ? e : e.slice(f)) + c : hp() + e + c;
    try {
      t[u ? 'replaceState' : 'pushState'](l, '', d), (s.value = l);
    } catch (p) {
      console.error(p), n[u ? 'replace' : 'assign'](d);
    }
  }
  function i(c, l) {
    const u = Ae({}, t.state, _0(s.value.back, c, s.value.forward, !0), l, {
      position: s.value.position,
    });
    o(c, u, !0), (r.value = c);
  }
  function a(c, l) {
    const u = Ae({}, s.value, t.state, { forward: c, scroll: qs() });
    o(u.current, u, !0);
    const f = Ae({}, _0(r.value, c, null), { position: u.position + 1 }, l);
    o(c, f, !1), (r.value = c);
  }
  return { location: r, state: s, push: a, replace: i };
}
function gp(e) {
  e = ip(e);
  const t = pp(e),
    n = xp(e, t.state, t.location, t.replace);
  function r(o, i = !0) {
    i || n.pauseListeners(), history.go(o);
  }
  const s = Ae({ location: '', base: e, go: r, createHref: cp.bind(null, e) }, t, n);
  return (
    Object.defineProperty(s, 'location', { enumerable: !0, get: () => t.location.value }),
    Object.defineProperty(s, 'state', { enumerable: !0, get: () => t.state.value }),
    s
  );
}
function mp(e) {
  return typeof e == 'string' || (e && typeof e == 'object');
}
function Gu(e) {
  return typeof e == 'string' || typeof e == 'symbol';
}
const zu = Symbol('');
var v0;
(function (e) {
  (e[(e.aborted = 4)] = 'aborted'),
    (e[(e.cancelled = 8)] = 'cancelled'),
    (e[(e.duplicated = 16)] = 'duplicated');
})(v0 || (v0 = {}));
function Yn(e, t) {
  return Ae(new Error(), { type: e, [zu]: !0 }, t);
}
function St(e, t) {
  return e instanceof Error && zu in e && (t == null || !!(e.type & t));
}
const y0 = '[^/]+?',
  _p = { sensitive: !1, strict: !1, start: !0, end: !0 },
  vp = /[.+*?^${}()[\]/\\]/g;
function yp(e, t) {
  const n = Ae({}, _p, t),
    r = [];
  let s = n.start ? '^' : '';
  const o = [];
  for (const l of e) {
    const u = l.length ? [] : [90];
    n.strict && !l.length && (s += '/');
    for (let f = 0; f < l.length; f++) {
      const d = l[f];
      let p = 40 + (n.sensitive ? 0.25 : 0);
      if (d.type === 0) f || (s += '/'), (s += d.value.replace(vp, '\\$&')), (p += 40);
      else if (d.type === 1) {
        const { value: m, repeatable: v, optional: E, regexp: _ } = d;
        o.push({ name: m, repeatable: v, optional: E });
        const g = _ || y0;
        if (g !== y0) {
          p += 10;
          try {
            new RegExp(`(${g})`);
          } catch (x) {
            throw new Error(`Invalid custom RegExp for param "${m}" (${g}): ` + x.message);
          }
        }
        let h = v ? `((?:${g})(?:/(?:${g}))*)` : `(${g})`;
        f || (h = E && l.length < 2 ? `(?:/${h})` : '/' + h),
          E && (h += '?'),
          (s += h),
          (p += 20),
          E && (p += -8),
          v && (p += -20),
          g === '.*' && (p += -50);
      }
      u.push(p);
    }
    r.push(u);
  }
  if (n.strict && n.end) {
    const l = r.length - 1;
    r[l][r[l].length - 1] += 0.7000000000000001;
  }
  n.strict || (s += '/?'), n.end ? (s += '$') : n.strict && !s.endsWith('/') && (s += '(?:/|$)');
  const i = new RegExp(s, n.sensitive ? '' : 'i');
  function a(l) {
    const u = l.match(i),
      f = {};
    if (!u) return null;
    for (let d = 1; d < u.length; d++) {
      const p = u[d] || '',
        m = o[d - 1];
      f[m.name] = p && m.repeatable ? p.split('/') : p;
    }
    return f;
  }
  function c(l) {
    let u = '',
      f = !1;
    for (const d of e) {
      (!f || !u.endsWith('/')) && (u += '/'), (f = !1);
      for (const p of d)
        if (p.type === 0) u += p.value;
        else if (p.type === 1) {
          const { value: m, repeatable: v, optional: E } = p,
            _ = m in l ? l[m] : '';
          if (Bt(_) && !v)
            throw new Error(
              `Provided param "${m}" is an array but it is not repeatable (* or + modifiers)`,
            );
          const g = Bt(_) ? _.join('/') : _;
          if (!g)
            if (E) d.length < 2 && (u.endsWith('/') ? (u = u.slice(0, -1)) : (f = !0));
            else throw new Error(`Missing required param "${m}"`);
          u += g;
        }
    }
    return u || '/';
  }
  return { re: i, score: r, keys: o, parse: a, stringify: c };
}
function Ep(e, t) {
  let n = 0;
  for (; n < e.length && n < t.length; ) {
    const r = t[n] - e[n];
    if (r) return r;
    n++;
  }
  return e.length < t.length
    ? e.length === 1 && e[0] === 80
      ? -1
      : 1
    : e.length > t.length
      ? t.length === 1 && t[0] === 80
        ? 1
        : -1
      : 0;
}
function Yu(e, t) {
  let n = 0;
  const r = e.score,
    s = t.score;
  for (; n < r.length && n < s.length; ) {
    const o = Ep(r[n], s[n]);
    if (o) return o;
    n++;
  }
  if (Math.abs(s.length - r.length) === 1) {
    if (E0(r)) return 1;
    if (E0(s)) return -1;
  }
  return s.length - r.length;
}
function E0(e) {
  const t = e[e.length - 1];
  return e.length > 0 && t[t.length - 1] < 0;
}
const bp = { type: 0, value: '' },
  Cp = /[a-zA-Z0-9_]/;
function Ap(e) {
  if (!e) return [[]];
  if (e === '/') return [[bp]];
  if (!e.startsWith('/')) throw new Error(`Invalid path "${e}"`);
  function t(p) {
    throw new Error(`ERR (${n})/"${l}": ${p}`);
  }
  let n = 0,
    r = n;
  const s = [];
  let o;
  function i() {
    o && s.push(o), (o = []);
  }
  let a = 0,
    c,
    l = '',
    u = '';
  function f() {
    l &&
      (n === 0
        ? o.push({ type: 0, value: l })
        : n === 1 || n === 2 || n === 3
          ? (o.length > 1 &&
              (c === '*' || c === '+') &&
              t(`A repeatable param (${l}) must be alone in its segment. eg: '/:ids+.`),
            o.push({
              type: 1,
              value: l,
              regexp: u,
              repeatable: c === '*' || c === '+',
              optional: c === '*' || c === '?',
            }))
          : t('Invalid state to consume buffer'),
      (l = ''));
  }
  function d() {
    l += c;
  }
  for (; a < e.length; ) {
    if (((c = e[a++]), c === '\\' && n !== 2)) {
      (r = n), (n = 4);
      continue;
    }
    switch (n) {
      case 0:
        c === '/' ? (l && f(), i()) : c === ':' ? (f(), (n = 1)) : d();
        break;
      case 4:
        d(), (n = r);
        break;
      case 1:
        c === '('
          ? (n = 2)
          : Cp.test(c)
            ? d()
            : (f(), (n = 0), c !== '*' && c !== '?' && c !== '+' && a--);
        break;
      case 2:
        c === ')' ? (u[u.length - 1] == '\\' ? (u = u.slice(0, -1) + c) : (n = 3)) : (u += c);
        break;
      case 3:
        f(), (n = 0), c !== '*' && c !== '?' && c !== '+' && a--, (u = '');
        break;
      default:
        t('Unknown state');
        break;
    }
  }
  return n === 2 && t(`Unfinished custom RegExp for param "${l}"`), f(), i(), s;
}
function Bp(e, t, n) {
  const r = yp(Ap(e.path), n),
    s = Ae(r, { record: e, parent: t, children: [], alias: [] });
  return t && !s.record.aliasOf == !t.record.aliasOf && t.children.push(s), s;
}
function Dp(e, t) {
  const n = [],
    r = new Map();
  t = B0({ strict: !1, end: !0, sensitive: !1 }, t);
  function s(f) {
    return r.get(f);
  }
  function o(f, d, p) {
    const m = !p,
      v = C0(f);
    v.aliasOf = p && p.record;
    const E = B0(t, f),
      _ = [v];
    if ('alias' in f) {
      const x = typeof f.alias == 'string' ? [f.alias] : f.alias;
      for (const y of x)
        _.push(
          C0(
            Ae({}, v, {
              components: p ? p.record.components : v.components,
              path: y,
              aliasOf: p ? p.record : v,
            }),
          ),
        );
    }
    let g, h;
    for (const x of _) {
      const { path: y } = x;
      if (d && y[0] !== '/') {
        const C = d.record.path,
          A = C[C.length - 1] === '/' ? '' : '/';
        x.path = d.record.path + (y && A + y);
      }
      if (
        ((g = Bp(x, d, E)),
        p
          ? p.alias.push(g)
          : ((h = h || g), h !== g && h.alias.push(g), m && f.name && !A0(g) && i(f.name)),
        Xu(g) && c(g),
        v.children)
      ) {
        const C = v.children;
        for (let A = 0; A < C.length; A++) o(C[A], g, p && p.children[A]);
      }
      p = p || g;
    }
    return h
      ? () => {
          i(h);
        }
      : pr;
  }
  function i(f) {
    if (Gu(f)) {
      const d = r.get(f);
      d && (r.delete(f), n.splice(n.indexOf(d), 1), d.children.forEach(i), d.alias.forEach(i));
    } else {
      const d = n.indexOf(f);
      d > -1 &&
        (n.splice(d, 1),
        f.record.name && r.delete(f.record.name),
        f.children.forEach(i),
        f.alias.forEach(i));
    }
  }
  function a() {
    return n;
  }
  function c(f) {
    const d = Sp(f, n);
    n.splice(d, 0, f), f.record.name && !A0(f) && r.set(f.record.name, f);
  }
  function l(f, d) {
    let p,
      m = {},
      v,
      E;
    if ('name' in f && f.name) {
      if (((p = r.get(f.name)), !p)) throw Yn(1, { location: f });
      (E = p.record.name),
        (m = Ae(
          b0(
            d.params,
            p.keys
              .filter((h) => !h.optional)
              .concat(p.parent ? p.parent.keys.filter((h) => h.optional) : [])
              .map((h) => h.name),
          ),
          f.params &&
            b0(
              f.params,
              p.keys.map((h) => h.name),
            ),
        )),
        (v = p.stringify(m));
    } else if (f.path != null)
      (v = f.path), (p = n.find((h) => h.re.test(v))), p && ((m = p.parse(v)), (E = p.record.name));
    else {
      if (((p = d.name ? r.get(d.name) : n.find((h) => h.re.test(d.path))), !p))
        throw Yn(1, { location: f, currentLocation: d });
      (E = p.record.name), (m = Ae({}, d.params, f.params)), (v = p.stringify(m));
    }
    const _ = [];
    let g = p;
    for (; g; ) _.unshift(g.record), (g = g.parent);
    return { name: E, path: v, params: m, matched: _, meta: Pp(_) };
  }
  e.forEach((f) => o(f));
  function u() {
    (n.length = 0), r.clear();
  }
  return {
    addRoute: o,
    resolve: l,
    removeRoute: i,
    clearRoutes: u,
    getRoutes: a,
    getRecordMatcher: s,
  };
}
function b0(e, t) {
  const n = {};
  for (const r of t) r in e && (n[r] = e[r]);
  return n;
}
function C0(e) {
  const t = {
    path: e.path,
    redirect: e.redirect,
    name: e.name,
    meta: e.meta || {},
    aliasOf: e.aliasOf,
    beforeEnter: e.beforeEnter,
    props: Fp(e),
    children: e.children || [],
    instances: {},
    leaveGuards: new Set(),
    updateGuards: new Set(),
    enterCallbacks: {},
    components: 'components' in e ? e.components || null : e.component && { default: e.component },
  };
  return Object.defineProperty(t, 'mods', { value: {} }), t;
}
function Fp(e) {
  const t = {},
    n = e.props || !1;
  if ('component' in e) t.default = n;
  else for (const r in e.components) t[r] = typeof n == 'object' ? n[r] : n;
  return t;
}
function A0(e) {
  for (; e; ) {
    if (e.record.aliasOf) return !0;
    e = e.parent;
  }
  return !1;
}
function Pp(e) {
  return e.reduce((t, n) => Ae(t, n.meta), {});
}
function B0(e, t) {
  const n = {};
  for (const r in e) n[r] = r in t ? t[r] : e[r];
  return n;
}
function Sp(e, t) {
  let n = 0,
    r = t.length;
  for (; n !== r; ) {
    const o = (n + r) >> 1;
    Yu(e, t[o]) < 0 ? (r = o) : (n = o + 1);
  }
  const s = Tp(e);
  return s && (r = t.lastIndexOf(s, r - 1)), r;
}
function Tp(e) {
  let t = e;
  for (; (t = t.parent); ) if (Xu(t) && Yu(e, t) === 0) return t;
}
function Xu({ record: e }) {
  return !!(e.name || (e.components && Object.keys(e.components).length) || e.redirect);
}
function Rp(e) {
  const t = {};
  if (e === '' || e === '?') return t;
  const r = (e[0] === '?' ? e.slice(1) : e).split('&');
  for (let s = 0; s < r.length; ++s) {
    const o = r[s].replace($u, ' '),
      i = o.indexOf('='),
      a = Fr(i < 0 ? o : o.slice(0, i)),
      c = i < 0 ? null : Fr(o.slice(i + 1));
    if (a in t) {
      let l = t[a];
      Bt(l) || (l = t[a] = [l]), l.push(c);
    } else t[a] = c;
  }
  return t;
}
function D0(e) {
  let t = '';
  for (let n in e) {
    const r = e[n];
    if (((n = Qx(n)), r == null)) {
      r !== void 0 && (t += (t.length ? '&' : '') + n);
      continue;
    }
    (Bt(r) ? r.map((o) => o && bi(o)) : [r && bi(r)]).forEach((o) => {
      o !== void 0 && ((t += (t.length ? '&' : '') + n), o != null && (t += '=' + o));
    });
  }
  return t;
}
function wp(e) {
  const t = {};
  for (const n in e) {
    const r = e[n];
    r !== void 0 &&
      (t[n] = Bt(r) ? r.map((s) => (s == null ? null : '' + s)) : r == null ? r : '' + r);
  }
  return t;
}
const kp = Symbol(''),
  F0 = Symbol(''),
  js = Symbol(''),
  ca = Symbol(''),
  Ai = Symbol('');
function or() {
  let e = [];
  function t(r) {
    return (
      e.push(r),
      () => {
        const s = e.indexOf(r);
        s > -1 && e.splice(s, 1);
      }
    );
  }
  function n() {
    e = [];
  }
  return { add: t, list: () => e.slice(), reset: n };
}
function on(e, t, n, r, s, o = (i) => i()) {
  const i = r && (r.enterCallbacks[s] = r.enterCallbacks[s] || []);
  return () =>
    new Promise((a, c) => {
      const l = (d) => {
          d === !1
            ? c(Yn(4, { from: n, to: t }))
            : d instanceof Error
              ? c(d)
              : mp(d)
                ? c(Yn(2, { from: t, to: d }))
                : (i && r.enterCallbacks[s] === i && typeof d == 'function' && i.push(d), a());
        },
        u = o(() => e.call(r && r.instances[s], t, n, l));
      let f = Promise.resolve(u);
      e.length < 3 && (f = f.then(l)), f.catch((d) => c(d));
    });
}
function fo(e, t, n, r, s = (o) => o()) {
  const o = [];
  for (const i of e)
    for (const a in i.components) {
      let c = i.components[a];
      if (!(t !== 'beforeRouteEnter' && !i.instances[a]))
        if (Hu(c)) {
          const u = (c.__vccOpts || c)[t];
          u && o.push(on(u, n, r, i, a, s));
        } else {
          let l = c();
          o.push(() =>
            l.then((u) => {
              if (!u) throw new Error(`Couldn't resolve component "${a}" at "${i.path}"`);
              const f = Ux(u) ? u.default : u;
              (i.mods[a] = u), (i.components[a] = f);
              const p = (f.__vccOpts || f)[t];
              return p && on(p, n, r, i, a, s)();
            }),
          );
        }
    }
  return o;
}
function P0(e) {
  const t = dt(js),
    n = dt(ca),
    r = Me(() => {
      const c = qt(e.to);
      return t.resolve(c);
    }),
    s = Me(() => {
      const { matched: c } = r.value,
        { length: l } = c,
        u = c[l - 1],
        f = n.matched;
      if (!u || !f.length) return -1;
      const d = f.findIndex(zn.bind(null, u));
      if (d > -1) return d;
      const p = S0(c[l - 2]);
      return l > 1 && S0(u) === p && f[f.length - 1].path !== p
        ? f.findIndex(zn.bind(null, c[l - 2]))
        : d;
    }),
    o = Me(() => s.value > -1 && Mp(n.params, r.value.params)),
    i = Me(() => s.value > -1 && s.value === n.matched.length - 1 && ju(n.params, r.value.params));
  function a(c = {}) {
    if (Ip(c)) {
      const l = t[qt(e.replace) ? 'replace' : 'push'](qt(e.to)).catch(pr);
      return (
        e.viewTransition &&
          typeof document < 'u' &&
          'startViewTransition' in document &&
          document.startViewTransition(() => l),
        l
      );
    }
    return Promise.resolve();
  }
  return { route: r, href: Me(() => r.value.href), isActive: o, isExactActive: i, navigate: a };
}
function Op(e) {
  return e.length === 1 ? e[0] : e;
}
const Lp = Gt({
    name: 'RouterLink',
    compatConfig: { MODE: 3 },
    props: {
      to: { type: [String, Object], required: !0 },
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      custom: Boolean,
      ariaCurrentValue: { type: String, default: 'page' },
    },
    useLink: P0,
    setup(e, { slots: t }) {
      const n = Or(P0(e)),
        { options: r } = dt(js),
        s = Me(() => ({
          [T0(e.activeClass, r.linkActiveClass, 'router-link-active')]: n.isActive,
          [T0(e.exactActiveClass, r.linkExactActiveClass, 'router-link-exact-active')]:
            n.isExactActive,
        }));
      return () => {
        const o = t.default && Op(t.default(n));
        return e.custom
          ? o
          : Ur(
              'a',
              {
                'aria-current': n.isExactActive ? e.ariaCurrentValue : null,
                href: n.href,
                onClick: n.navigate,
                class: s.value,
              },
              o,
            );
      };
    },
  }),
  Np = Lp;
function Ip(e) {
  if (
    !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) &&
    !e.defaultPrevented &&
    !(e.button !== void 0 && e.button !== 0)
  ) {
    if (e.currentTarget && e.currentTarget.getAttribute) {
      const t = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(t)) return;
    }
    return e.preventDefault && e.preventDefault(), !0;
  }
}
function Mp(e, t) {
  for (const n in t) {
    const r = t[n],
      s = e[n];
    if (typeof r == 'string') {
      if (r !== s) return !1;
    } else if (!Bt(s) || s.length !== r.length || r.some((o, i) => o !== s[i])) return !1;
  }
  return !0;
}
function S0(e) {
  return e ? (e.aliasOf ? e.aliasOf.path : e.path) : '';
}
const T0 = (e, t, n) => e ?? t ?? n,
  Hp = Gt({
    name: 'RouterView',
    inheritAttrs: !1,
    props: { name: { type: String, default: 'default' }, route: Object },
    compatConfig: { MODE: 3 },
    setup(e, { attrs: t, slots: n }) {
      const r = dt(Ai),
        s = Me(() => e.route || r.value),
        o = dt(F0, 0),
        i = Me(() => {
          let l = qt(o);
          const { matched: u } = s.value;
          let f;
          for (; (f = u[l]) && !f.components; ) l++;
          return l;
        }),
        a = Me(() => s.value.matched[i.value]);
      rs(
        F0,
        Me(() => i.value + 1),
      ),
        rs(kp, a),
        rs(Ai, s);
      const c = Wt();
      return (
        wt(
          () => [c.value, a.value, e.name],
          ([l, u, f], [d, p, m]) => {
            u &&
              ((u.instances[f] = l),
              p &&
                p !== u &&
                l &&
                l === d &&
                (u.leaveGuards.size || (u.leaveGuards = p.leaveGuards),
                u.updateGuards.size || (u.updateGuards = p.updateGuards))),
              l && u && (!p || !zn(u, p) || !d) && (u.enterCallbacks[f] || []).forEach((v) => v(l));
          },
          { flush: 'post' },
        ),
        () => {
          const l = s.value,
            u = e.name,
            f = a.value,
            d = f && f.components[u];
          if (!d) return R0(n.default, { Component: d, route: l });
          const p = f.props[u],
            m = p ? (p === !0 ? l.params : typeof p == 'function' ? p(l) : p) : null,
            E = Ur(
              d,
              Ae({}, m, t, {
                onVnodeUnmounted: (_) => {
                  _.component.isUnmounted && (f.instances[u] = null);
                },
                ref: c,
              }),
            );
          return R0(n.default, { Component: E, route: l }) || E;
        }
      );
    },
  });
function R0(e, t) {
  if (!e) return null;
  const n = e(t);
  return n.length === 1 ? n[0] : n;
}
const Qu = Hp;
function Up(e) {
  const t = Dp(e.routes, e),
    n = e.parseQuery || Rp,
    r = e.stringifyQuery || D0,
    s = e.history,
    o = or(),
    i = or(),
    a = or(),
    c = Gi(Jt);
  let l = Jt;
  Ln &&
    e.scrollBehavior &&
    'scrollRestoration' in history &&
    (history.scrollRestoration = 'manual');
  const u = lo.bind(null, (H) => '' + H),
    f = lo.bind(null, Zx),
    d = lo.bind(null, Fr);
  function p(H, K) {
    let ee, ne;
    return Gu(H) ? ((ee = t.getRecordMatcher(H)), (ne = K)) : (ne = H), t.addRoute(ne, ee);
  }
  function m(H) {
    const K = t.getRecordMatcher(H);
    K && t.removeRoute(K);
  }
  function v() {
    return t.getRoutes().map((H) => H.record);
  }
  function E(H) {
    return !!t.getRecordMatcher(H);
  }
  function _(H, K) {
    if (((K = Ae({}, K || c.value)), typeof H == 'string')) {
      const R = uo(n, H, K.path),
        N = t.resolve({ path: R.path }, K),
        G = s.createHref(R.fullPath);
      return Ae(R, N, { params: d(N.params), hash: Fr(R.hash), redirectedFrom: void 0, href: G });
    }
    let ee;
    if (H.path != null) ee = Ae({}, H, { path: uo(n, H.path, K.path).path });
    else {
      const R = Ae({}, H.params);
      for (const N in R) R[N] == null && delete R[N];
      (ee = Ae({}, H, { params: f(R) })), (K.params = f(K.params));
    }
    const ne = t.resolve(ee, K),
      fe = H.hash || '';
    ne.params = u(d(ne.params));
    const _e = np(r, Ae({}, H, { hash: Xx(fe), path: ne.path })),
      P = s.createHref(_e);
    return Ae({ fullPath: _e, hash: fe, query: r === D0 ? wp(H.query) : H.query || {} }, ne, {
      redirectedFrom: void 0,
      href: P,
    });
  }
  function g(H) {
    return typeof H == 'string' ? uo(n, H, c.value.path) : Ae({}, H);
  }
  function h(H, K) {
    if (l !== H) return Yn(8, { from: K, to: H });
  }
  function x(H) {
    return A(H);
  }
  function y(H) {
    return x(Ae(g(H), { replace: !0 }));
  }
  function C(H) {
    const K = H.matched[H.matched.length - 1];
    if (K && K.redirect) {
      const { redirect: ee } = K;
      let ne = typeof ee == 'function' ? ee(H) : ee;
      return (
        typeof ne == 'string' &&
          ((ne = ne.includes('?') || ne.includes('#') ? (ne = g(ne)) : { path: ne }),
          (ne.params = {})),
        Ae({ query: H.query, hash: H.hash, params: ne.path != null ? {} : H.params }, ne)
      );
    }
  }
  function A(H, K) {
    const ee = (l = _(H)),
      ne = c.value,
      fe = H.state,
      _e = H.force,
      P = H.replace === !0,
      R = C(ee);
    if (R)
      return A(
        Ae(g(R), { state: typeof R == 'object' ? Ae({}, fe, R.state) : fe, force: _e, replace: P }),
        K || ee,
      );
    const N = ee;
    N.redirectedFrom = K;
    let G;
    return (
      !_e && rp(r, ne, ee) && ((G = Yn(16, { to: N, from: ne })), $(ne, ne, !0, !1)),
      (G ? Promise.resolve(G) : b(N, ne))
        .catch((V) => (St(V) ? (St(V, 2) ? V : ce(V)) : X(V, N, ne)))
        .then((V) => {
          if (V) {
            if (St(V, 2))
              return A(
                Ae({ replace: P }, g(V.to), {
                  state: typeof V.to == 'object' ? Ae({}, fe, V.to.state) : fe,
                  force: _e,
                }),
                K || N,
              );
          } else V = T(N, ne, !0, P, fe);
          return F(N, ne, V), V;
        })
    );
  }
  function w(H, K) {
    const ee = h(H, K);
    return ee ? Promise.reject(ee) : Promise.resolve();
  }
  function D(H) {
    const K = j.values().next().value;
    return K && typeof K.runWithContext == 'function' ? K.runWithContext(H) : H();
  }
  function b(H, K) {
    let ee;
    const [ne, fe, _e] = $p(H, K);
    ee = fo(ne.reverse(), 'beforeRouteLeave', H, K);
    for (const R of ne)
      R.leaveGuards.forEach((N) => {
        ee.push(on(N, H, K));
      });
    const P = w.bind(null, H, K);
    return (
      ee.push(P),
      le(ee)
        .then(() => {
          ee = [];
          for (const R of o.list()) ee.push(on(R, H, K));
          return ee.push(P), le(ee);
        })
        .then(() => {
          ee = fo(fe, 'beforeRouteUpdate', H, K);
          for (const R of fe)
            R.updateGuards.forEach((N) => {
              ee.push(on(N, H, K));
            });
          return ee.push(P), le(ee);
        })
        .then(() => {
          ee = [];
          for (const R of _e)
            if (R.beforeEnter)
              if (Bt(R.beforeEnter)) for (const N of R.beforeEnter) ee.push(on(N, H, K));
              else ee.push(on(R.beforeEnter, H, K));
          return ee.push(P), le(ee);
        })
        .then(
          () => (
            H.matched.forEach((R) => (R.enterCallbacks = {})),
            (ee = fo(_e, 'beforeRouteEnter', H, K, D)),
            ee.push(P),
            le(ee)
          ),
        )
        .then(() => {
          ee = [];
          for (const R of i.list()) ee.push(on(R, H, K));
          return ee.push(P), le(ee);
        })
        .catch((R) => (St(R, 8) ? R : Promise.reject(R)))
    );
  }
  function F(H, K, ee) {
    a.list().forEach((ne) => D(() => ne(H, K, ee)));
  }
  function T(H, K, ee, ne, fe) {
    const _e = h(H, K);
    if (_e) return _e;
    const P = K === Jt,
      R = Ln ? history.state : {};
    ee &&
      (ne || P
        ? s.replace(H.fullPath, Ae({ scroll: P && R && R.scroll }, fe))
        : s.push(H.fullPath, fe)),
      (c.value = H),
      $(H, K, ee, P),
      ce();
  }
  let O;
  function Y() {
    O ||
      (O = s.listen((H, K, ee) => {
        if (!ye.listening) return;
        const ne = _(H),
          fe = C(ne);
        if (fe) {
          A(Ae(fe, { replace: !0, force: !0 }), ne).catch(pr);
          return;
        }
        l = ne;
        const _e = c.value;
        Ln && fp(m0(_e.fullPath, ee.delta), qs()),
          b(ne, _e)
            .catch((P) =>
              St(P, 12)
                ? P
                : St(P, 2)
                  ? (A(Ae(g(P.to), { force: !0 }), ne)
                      .then((R) => {
                        St(R, 20) && !ee.delta && ee.type === Pr.pop && s.go(-1, !1);
                      })
                      .catch(pr),
                    Promise.reject())
                  : (ee.delta && s.go(-ee.delta, !1), X(P, ne, _e)),
            )
            .then((P) => {
              (P = P || T(ne, _e, !1)),
                P &&
                  (ee.delta && !St(P, 8)
                    ? s.go(-ee.delta, !1)
                    : ee.type === Pr.pop && St(P, 20) && s.go(-1, !1)),
                F(ne, _e, P);
            })
            .catch(pr);
      }));
  }
  let J = or(),
    q = or(),
    Z;
  function X(H, K, ee) {
    ce(H);
    const ne = q.list();
    return ne.length ? ne.forEach((fe) => fe(H, K, ee)) : console.error(H), Promise.reject(H);
  }
  function ie() {
    return Z && c.value !== Jt
      ? Promise.resolve()
      : new Promise((H, K) => {
          J.add([H, K]);
        });
  }
  function ce(H) {
    return Z || ((Z = !H), Y(), J.list().forEach(([K, ee]) => (H ? ee(H) : K())), J.reset()), H;
  }
  function $(H, K, ee, ne) {
    const { scrollBehavior: fe } = e;
    if (!Ln || !fe) return Promise.resolve();
    const _e =
      (!ee && dp(m0(H.fullPath, 0))) ||
      ((ne || !ee) && history.state && history.state.scroll) ||
      null;
    return Nr()
      .then(() => fe(H, K, _e))
      .then((P) => P && up(P))
      .catch((P) => X(P, H, K));
  }
  const W = (H) => s.go(H);
  let z;
  const j = new Set(),
    ye = {
      currentRoute: c,
      listening: !0,
      addRoute: p,
      removeRoute: m,
      clearRoutes: t.clearRoutes,
      hasRoute: E,
      getRoutes: v,
      resolve: _,
      options: e,
      push: x,
      replace: y,
      go: W,
      back: () => W(-1),
      forward: () => W(1),
      beforeEach: o.add,
      beforeResolve: i.add,
      afterEach: a.add,
      onError: q.add,
      isReady: ie,
      install(H) {
        const K = this;
        H.component('RouterLink', Np),
          H.component('RouterView', Qu),
          (H.config.globalProperties.$router = K),
          Object.defineProperty(H.config.globalProperties, '$route', {
            enumerable: !0,
            get: () => qt(c),
          }),
          Ln && !z && c.value === Jt && ((z = !0), x(s.location).catch((fe) => {}));
        const ee = {};
        for (const fe in Jt)
          Object.defineProperty(ee, fe, { get: () => c.value[fe], enumerable: !0 });
        H.provide(js, K), H.provide(ca, El(ee)), H.provide(Ai, c);
        const ne = H.unmount;
        j.add(H),
          (H.unmount = function () {
            j.delete(H),
              j.size < 1 && ((l = Jt), O && O(), (O = null), (c.value = Jt), (z = !1), (Z = !1)),
              ne();
          });
      },
    };
  function le(H) {
    return H.reduce((K, ee) => K.then(() => D(ee)), Promise.resolve());
  }
  return ye;
}
function $p(e, t) {
  const n = [],
    r = [],
    s = [],
    o = Math.max(t.matched.length, e.matched.length);
  for (let i = 0; i < o; i++) {
    const a = t.matched[i];
    a && (e.matched.find((l) => zn(l, a)) ? r.push(a) : n.push(a));
    const c = e.matched[i];
    c && (t.matched.find((l) => zn(l, c)) || s.push(c));
  }
  return [n, r, s];
}
function Vp() {
  return dt(js);
}
function Wp(e) {
  return dt(ca);
}
(function () {
  var e;
  try {
    if (typeof document < 'u') {
      var t = document.createElement('style');
      (t.nonce =
        (e = document.head.querySelector('meta[property=csp-nonce]')) == null ? void 0 : e.content),
        t.appendChild(
          document.createTextNode(
            '.vue-notification-group{display:block;position:fixed;z-index:5000}.vue-notification-wrapper{display:block;overflow:hidden;width:100%;margin:0;padding:0}.notification-title{font-weight:600}.vue-notification-template{display:block;box-sizing:border-box;background:#fff;text-align:left}.vue-notification{display:block;box-sizing:border-box;text-align:left;font-size:12px;padding:10px;margin:0 5px 5px;color:#fff;background:#44a4fc;border-left:5px solid #187FE7}.vue-notification.warn{background:#ffb648;border-left-color:#f48a06}.vue-notification.error{background:#e54d42;border-left-color:#b82e24}.vue-notification.success{background:#68cd86;border-left-color:#42a85f}.vn-fade-enter-active,.vn-fade-leave-active,.vn-fade-move{transition:all .5s}.vn-fade-enter-from,.vn-fade-leave-to{opacity:0}',
          ),
        ),
        document.head.appendChild(t);
    }
  } catch (n) {
    console.error('vite-plugin-css-injected-by-js', n);
  }
})();
const Ju = new Map();
function qp(e) {
  return {
    all: (e = e || new Map()),
    on: function (t, n) {
      var r = e.get(t);
      r ? r.push(n) : e.set(t, [n]);
    },
    off: function (t, n) {
      var r = e.get(t);
      r && (n ? r.splice(r.indexOf(n) >>> 0, 1) : e.set(t, []));
    },
    emit: function (t, n) {
      var r = e.get(t);
      r &&
        r.slice().map(function (s) {
          s(n);
        }),
        (r = e.get('*')) &&
          r.slice().map(function (s) {
            s(t, n);
          });
    },
  };
}
const As = qp(),
  ho = '[-+]?[0-9]*.?[0-9]+',
  w0 = [
    { name: 'px', regexp: new RegExp(`^${ho}px$`) },
    { name: '%', regexp: new RegExp(`^${ho}%$`) },
    { name: 'px', regexp: new RegExp(`^${ho}$`) },
  ],
  jp = (e) => {
    if (e === 'auto') return { type: e, value: 0 };
    for (let t = 0; t < w0.length; t++) {
      const n = w0[t];
      if (n.regexp.test(e)) return { type: n.name, value: parseFloat(e) };
    }
    return { type: '', value: e };
  },
  Kp = (e) => {
    switch (typeof e) {
      case 'number':
        return { type: 'px', value: e };
      case 'string':
        return jp(e);
      default:
        return { type: '', value: e };
    }
  },
  k0 = { x: new Set(['left', 'center', 'right']), y: new Set(['top', 'bottom']) },
  Gp = (
    (e) => () =>
      e++
  )(0),
  zp = (e) => (typeof e != 'string' ? [] : e.split(/\s+/gi).filter(Boolean)),
  Yp = (e) => {
    typeof e == 'string' && (e = zp(e));
    let t = null,
      n = null;
    return (
      e.forEach((r) => {
        k0.y.has(r) && (n = r), k0.x.has(r) && (t = r);
      }),
      { x: t, y: n }
    );
  },
  xo = {
    position: ['top', 'right'],
    cssAnimation: 'vn-fade',
    velocityAnimation: {
      enter: (e) => ({ height: [e.clientHeight, 0], opacity: [1, 0] }),
      leave: { height: 0, opacity: [0, 1] },
    },
  },
  Xp = (e, t) => {
    let n,
      r,
      s = t;
    const o = () => {
        (r = Date.now()), (n = setTimeout(e, s));
      },
      i = () => {
        clearTimeout(n), (s -= Date.now() - r);
      };
    return o(), { start: o, stop: i };
  };
function Qp(e) {
  return (
    typeof e == 'function' || (Object.prototype.toString.call(e) === '[object Object]' && !jt(e))
  );
}
const Qr = { IDLE: 0, DESTROYED: 2 },
  Jp = Gt({
    name: 'notifications',
    props: {
      group: { type: String, default: '' },
      width: { type: [Number, String], default: 300 },
      reverse: { type: Boolean, default: !1 },
      position: { type: [String, Array], default: () => xo.position },
      classes: { type: [String, Array], default: 'vue-notification' },
      animationType: {
        type: String,
        default: 'css',
        validator(e) {
          return e === 'css' || e === 'velocity';
        },
      },
      animation: {
        type: Object,
        default() {
          return xo.velocityAnimation;
        },
      },
      animationName: { type: String, default: xo.cssAnimation },
      speed: { type: Number, default: 300 },
      duration: { type: Number, default: 3e3 },
      delay: { type: Number, default: 0 },
      max: { type: Number, default: 1 / 0 },
      ignoreDuplicates: { type: Boolean, default: !1 },
      closeOnClick: { type: Boolean, default: !0 },
      pauseOnHover: { type: Boolean, default: !1 },
      dangerouslySetInnerHtml: { type: Boolean, default: !1 },
    },
    emits: { click: (e) => !0, destroy: (e) => !0, start: (e) => !0 },
    slots: Object,
    setup: (e, { emit: t, slots: n, expose: r }) => {
      const s = Wt([]),
        o = Ju.get('velocity'),
        i = Me(() => e.animationType === 'velocity'),
        a = Me(() => s.value.filter((D) => D.state !== Qr.DESTROYED)),
        c = Me(() => Kp(e.width)),
        l = Me(() => {
          const { x: D, y: b } = Yp(e.position),
            F = c.value.value,
            T = c.value.type,
            O = { width: F + T };
          return (
            b && (O[b] = '0px'),
            D && (D === 'center' ? (O.left = `calc(50% - ${+F / 2}${T})`) : (O[D] = '0px')),
            O
          );
        }),
        u = Me(() => (i.value ? { onEnter: C, onLeave: A, onAfterLeave: w } : {})),
        f = (D) => {
          t('click', D), e.closeOnClick && g(D);
        },
        d = (D) => {
          var b;
          e.pauseOnHover && ((b = D.timer) == null || b.stop());
        },
        p = (D) => {
          var b;
          e.pauseOnHover && ((b = D.timer) == null || b.start());
        },
        m = (D = {}) => {
          if ((D.group || (D.group = ''), D.data || (D.data = {}), e.group !== D.group)) return;
          if (D.clean || D.clear) {
            x();
            return;
          }
          const b = typeof D.duration == 'number' ? D.duration : e.duration,
            F = typeof D.speed == 'number' ? D.speed : e.speed,
            T = typeof D.ignoreDuplicates == 'boolean' ? D.ignoreDuplicates : e.ignoreDuplicates,
            { title: O, text: Y, type: J, data: q, id: Z } = D,
            X = {
              id: Z || Gp(),
              title: O,
              text: Y,
              type: J,
              state: Qr.IDLE,
              speed: F,
              length: b + 2 * F,
              data: q,
              duplicates: 0,
            };
          b >= 0 && (X.timer = Xp(() => g(X), X.length));
          const ie = 'bottom' in l.value,
            ce = e.reverse ? !ie : ie;
          let $ = -1;
          const W = a.value.find((z) => z.title === D.title && z.text === D.text);
          if (T && W) {
            W.duplicates++;
            return;
          }
          ce
            ? (s.value.push(X), t('start', X), a.value.length > e.max && ($ = 0))
            : (s.value.unshift(X),
              t('start', X),
              a.value.length > e.max && ($ = a.value.length - 1)),
            $ !== -1 && g(a.value[$]);
        },
        v = (D) => {
          h(D);
        },
        E = (D) => ['vue-notification-template', e.classes, D.type || ''],
        _ = (D) => (i.value ? void 0 : { transition: `all ${D.speed}ms` }),
        g = (D) => {
          var b;
          (b = D.timer) == null || b.stop(), (D.state = Qr.DESTROYED), w(), t('destroy', D);
        },
        h = (D) => {
          const b = s.value.find((F) => F.id === D);
          b && g(b);
        },
        x = () => {
          a.value.forEach(g);
        },
        y = (D, b) => {
          var F;
          const T = (F = e.animation) == null ? void 0 : F[D];
          return typeof T == 'function' ? T(b) : T;
        },
        C = (D, b) => {
          const F = y('enter', D);
          o(D, F, { duration: e.speed, complete: b });
        },
        A = (D, b) => {
          const F = y('leave', D);
          o(D, F, { duration: e.speed, complete: b });
        };
      function w() {
        s.value = s.value.filter((D) => D.state !== Qr.DESTROYED);
      }
      return (
        Fn(() => {
          As.on('add', m), As.on('close', v);
        }),
        () => {
          let D;
          return he('div', { class: 'vue-notification-group', style: l.value }, [
            he(
              Dx,
              pu(u.value, { tag: 'div', css: !i.value, name: e.animationName }),
              Qp(
                (D = a.value.map((b) =>
                  he(
                    'div',
                    {
                      key: b.id,
                      class: 'vue-notification-wrapper',
                      style: _(b),
                      'data-id': b.id,
                      onMouseenter: () => d(b),
                      onMouseleave: () => p(b),
                    },
                    [
                      n.body
                        ? n.body({ item: b, class: [e.classes, b.type], close: () => g(b) })
                        : he('div', { class: E(b), onClick: () => f(b) }, [
                            e.dangerouslySetInnerHtml
                              ? he(Ne, null, [
                                  b.title
                                    ? he(
                                        'div',
                                        { class: 'notification-title', innerHTML: b.title },
                                        null,
                                      )
                                    : null,
                                  he(
                                    'div',
                                    { class: 'notification-content', innerHTML: b.text },
                                    null,
                                  ),
                                ])
                              : he(Ne, null, [
                                  b.title
                                    ? he('div', { class: 'notification-title' }, [b.title])
                                    : null,
                                  he('div', { class: 'notification-content' }, [b.text]),
                                ]),
                          ]),
                    ],
                  ),
                )),
              )
                ? D
                : { default: () => [D] },
            ),
          ]);
        }
      );
    },
  }),
  la = (e) => {
    typeof e == 'string' && (e = { title: '', text: e }), typeof e == 'object' && As.emit('add', e);
  };
la.close = (e) => {
  As.emit('close', e);
};
const Zp = () => ({ notify: la }),
  eg = 'Notifications';
function tg(e, t = {}) {
  Object.entries(t).forEach((r) => Ju.set(...r));
  const n = t.name || 'notify';
  (e.config.globalProperties['$' + n] = la), e.component(t.componentName || eg, Jp);
}
const ng = { install: tg };
function Bs() {
  return window.$emitter;
}
var rg = !1;
/*!
 * pinia v2.2.6
 * (c) 2024 Eduardo San Martin Morote
 * @license MIT
 */ let Zu;
const Ks = (e) => (Zu = e),
  ef = Symbol();
function Bi(e) {
  return (
    e &&
    typeof e == 'object' &&
    Object.prototype.toString.call(e) === '[object Object]' &&
    typeof e.toJSON != 'function'
  );
}
var mr;
(function (e) {
  (e.direct = 'direct'), (e.patchObject = 'patch object'), (e.patchFunction = 'patch function');
})(mr || (mr = {}));
function sg() {
  const e = $i(!0),
    t = e.run(() => Wt({}));
  let n = [],
    r = [];
  const s = Ki({
    install(o) {
      Ks(s),
        (s._a = o),
        o.provide(ef, s),
        (o.config.globalProperties.$pinia = s),
        r.forEach((i) => n.push(i)),
        (r = []);
    },
    use(o) {
      return !this._a && !rg ? r.push(o) : n.push(o), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: new Map(),
    state: t,
  });
  return s;
}
const tf = () => {};
function O0(e, t, n, r = tf) {
  e.push(t);
  const s = () => {
    const o = e.indexOf(t);
    o > -1 && (e.splice(o, 1), r());
  };
  return !n && ol() && id(s), s;
}
function wn(e, ...t) {
  e.slice().forEach((n) => {
    n(...t);
  });
}
const og = (e) => e(),
  L0 = Symbol(),
  po = Symbol();
function Di(e, t) {
  e instanceof Map && t instanceof Map
    ? t.forEach((n, r) => e.set(r, n))
    : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
  for (const n in t) {
    if (!t.hasOwnProperty(n)) continue;
    const r = t[n],
      s = e[n];
    Bi(s) && Bi(r) && e.hasOwnProperty(n) && !Le(r) && !Vt(r) ? (e[n] = Di(s, r)) : (e[n] = r);
  }
  return e;
}
const ig = Symbol();
function ag(e) {
  return !Bi(e) || !e.hasOwnProperty(ig);
}
const { assign: en } = Object;
function cg(e) {
  return !!(Le(e) && e.effect);
}
function lg(e, t, n, r) {
  const { state: s, actions: o, getters: i } = t,
    a = n.state.value[e];
  let c;
  function l() {
    a || (n.state.value[e] = s ? s() : {});
    const u = Td(n.state.value[e]);
    return en(
      u,
      o,
      Object.keys(i || {}).reduce(
        (f, d) => (
          (f[d] = Ki(
            Me(() => {
              Ks(n);
              const p = n._s.get(e);
              return i[d].call(p, p);
            }),
          )),
          f
        ),
        {},
      ),
    );
  }
  return (c = nf(e, l, t, n, r, !0)), c;
}
function nf(e, t, n = {}, r, s, o) {
  let i;
  const a = en({ actions: {} }, n),
    c = { deep: !0 };
  let l,
    u,
    f = [],
    d = [],
    p;
  const m = r.state.value[e];
  !o && !m && (r.state.value[e] = {}), Wt({});
  let v;
  function E(w) {
    let D;
    (l = u = !1),
      typeof w == 'function'
        ? (w(r.state.value[e]), (D = { type: mr.patchFunction, storeId: e, events: p }))
        : (Di(r.state.value[e], w),
          (D = { type: mr.patchObject, payload: w, storeId: e, events: p }));
    const b = (v = Symbol());
    Nr().then(() => {
      v === b && (l = !0);
    }),
      (u = !0),
      wn(f, D, r.state.value[e]);
  }
  const _ = o
    ? function () {
        const { state: D } = n,
          b = D ? D() : {};
        this.$patch((F) => {
          en(F, b);
        });
      }
    : tf;
  function g() {
    i.stop(), (f = []), (d = []), r._s.delete(e);
  }
  const h = (w, D = '') => {
      if (L0 in w) return (w[po] = D), w;
      const b = function () {
        Ks(r);
        const F = Array.from(arguments),
          T = [],
          O = [];
        function Y(Z) {
          T.push(Z);
        }
        function J(Z) {
          O.push(Z);
        }
        wn(d, { args: F, name: b[po], store: y, after: Y, onError: J });
        let q;
        try {
          q = w.apply(this && this.$id === e ? this : y, F);
        } catch (Z) {
          throw (wn(O, Z), Z);
        }
        return q instanceof Promise
          ? q.then((Z) => (wn(T, Z), Z)).catch((Z) => (wn(O, Z), Promise.reject(Z)))
          : (wn(T, q), q);
      };
      return (b[L0] = !0), (b[po] = D), b;
    },
    x = {
      _p: r,
      $id: e,
      $onAction: O0.bind(null, d),
      $patch: E,
      $reset: _,
      $subscribe(w, D = {}) {
        const b = O0(f, w, D.detached, () => F()),
          F = i.run(() =>
            wt(
              () => r.state.value[e],
              (T) => {
                (D.flush === 'sync' ? u : l) && w({ storeId: e, type: mr.direct, events: p }, T);
              },
              en({}, c, D),
            ),
          );
        return b;
      },
      $dispose: g,
    },
    y = Or(x);
  r._s.set(e, y);
  const A = ((r._a && r._a.runWithContext) || og)(() =>
    r._e.run(() => (i = $i()).run(() => t({ action: h }))),
  );
  for (const w in A) {
    const D = A[w];
    if ((Le(D) && !cg(D)) || Vt(D))
      o || (m && ag(D) && (Le(D) ? (D.value = m[w]) : Di(D, m[w])), (r.state.value[e][w] = D));
    else if (typeof D == 'function') {
      const b = h(D, w);
      (A[w] = b), (a.actions[w] = D);
    }
  }
  return (
    en(y, A),
    en(ve(y), A),
    Object.defineProperty(y, '$state', {
      get: () => r.state.value[e],
      set: (w) => {
        E((D) => {
          en(D, w);
        });
      },
    }),
    r._p.forEach((w) => {
      en(
        y,
        i.run(() => w({ store: y, app: r._a, pinia: r, options: a })),
      );
    }),
    m && o && n.hydrate && n.hydrate(y.$state, m),
    (l = !0),
    (u = !0),
    y
  );
}
/*! #__NO_SIDE_EFFECTS__ */ function rf(e, t, n) {
  let r, s;
  const o = typeof t == 'function';
  typeof e == 'string' ? ((r = e), (s = o ? n : t)) : ((s = e), (r = e.id));
  function i(a, c) {
    const l = _h();
    return (
      (a = a || (l ? dt(ef, null) : null)),
      a && Ks(a),
      (a = Zu),
      a._s.has(r) || (o ? nf(r, t, s, a) : lg(r, s, a)),
      a._s.get(r)
    );
  }
  return (i.$id = r), i;
}
const ug = (e, t, n, r) => {
    const s = n - e,
      o = r - t;
    return Math.sqrt(s * s + o * o);
  },
  fg = (e) => /^(?=.*[a-zA-Z])[a-zA-Z\d]{6,15}$/.test(e),
  dg = (e) => /^[a-zA-Z\d]{6,15}$/.test(e),
  hg = (e, t) => e === t,
  xg = (e) =>
    e.replace(/\\u[\dA-F]{4}/gi, function (t) {
      return String.fromCharCode(parseInt(t.replace(/\\u/g, ''), 16));
    }),
  pg = (e) => {
    try {
      return btoa(encodeURIComponent(e));
    } catch (t) {
      return console.error('Base64 编码错误:', t), '';
    }
  },
  gg = (e) => {
    try {
      return decodeURIComponent(atob(e));
    } catch (t) {
      return console.error('Base64 解码错误:', t), '';
    }
  },
  mg = (e) => {
    try {
      const t = decodeURIComponent(e),
        n = atob(t),
        r = new Uint8Array(n.length);
      for (let i = 0; i < n.length; i++) r[i] = n.charCodeAt(i);
      const o = new TextDecoder().decode(r);
      return JSON.parse(o);
    } catch (t) {
      return console.error('解码配置失败:', t), null;
    }
  },
  _g = () => navigator.maxTouchPoints <= 0,
  vg = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  yg = () => /Android/.test(navigator.userAgent),
  Eg = () => {
    var e;
    return (
      typeof window.Android < 'u' &&
      ((e = window.Android) == null ? void 0 : e.getData) &&
      window.Android.getData() === 'Shell'
    );
  },
  bg = () => {
    const e = navigator.userAgent.toLowerCase();
    return e.indexOf('safari') !== -1 && e.indexOf('chrome') === -1 && e.indexOf('android') === -1;
  },
  Cg = async (e) =>
    new Promise((t, n) => {
      setTimeout(() => {
        t(null);
      }, e * 1e3);
    }),
  Ag = () => {
    const e = Date.now(),
      t = Math.floor(Math.random() * 1e3);
    return (e.toString() + t.toString().padStart(3, '0')).slice(0, 13);
  },
  Bg = (e) => {
    if (window.Android && window.Android.receiveData)
      window.Android.receiveData(JSON.stringify({ url: e }));
    else
      try {
        const t = window.open(e, '_blank');
        t && (t.opener = null);
      } catch {
        window.location.href = e;
      }
  },
  Dg = () => {
    const e = 'device_id';
    let t = localStorage.getItem(e);
    return t || ((t = n()), localStorage.setItem(e, t)), t;
    function n() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (r) {
        const s = (Math.random() * 16) | 0;
        return (r === 'x' ? s : (s & 3) | 8).toString(16);
      });
    }
  },
  we = {
    distance: ug,
    validateAccount: fg,
    validatePassword: dg,
    validateConfirmPassword: hg,
    decodeUnicode: xg,
    encodeBase64: pg,
    decodeBase64: gg,
    decodeConfig: mg,
    isDesktop: _g,
    isIOS: vg,
    isAndroid: yg,
    isSafari: bg,
    waitForSeconds: Cg,
    generateRandomOrderNumber: Ag,
    isShell: Eg,
    openUrl: Bg,
    getDeviceId: Dg,
  },
  // [DZMM patch 2026-10-01, see docs/security/mgwan-sdk-patches.md]
  // Upstream kept the Mgwan account *and password* in this origin's
  // localStorage ('H5SDK_SECREY', base64 only) to auto-submit the login form
  // on the next visit, so any script on our origin could read it. The password
  // is no longer stored: the host page re-logs in from the platform-issued
  // token instead (src/features/mgwan/lib/sdk-login-store.ts). This runs once
  // when the SDK frame loads: it deletes any stored password right away, keeps
  // only the account name for the login form, and holds the old password in
  // memory for one last auto-login so existing users are not logged out by the
  // migration. Remove once Mgwan ships an SDK that does not persist passwords.
  dzmmLegacyLogin = (() => {
    let e = null;
    try {
      const t = localStorage.getItem('H5SDK_SECREY');
      if (t != null) {
        localStorage.removeItem('H5SDK_SECREY');
        try {
          const n = JSON.parse(gg(t));
          n && typeof n.account == 'string' && n.account
            && (localStorage.setItem('H5SDK_ACCOUNT', n.account),
            typeof n.password == 'string' && n.password && (e = { account: n.account, password: n.password }));
        } catch {}
      }
    } catch {}
    return { value: e };
  })(),
  it = rf('SDK_DATA', {
    state: () => ({
      version: 'v1.42',
      sdkVersion: '3',
      payIP: '',
      env: '',
      quickLogin: !1,
      promoteAccount: '',
      account: '',
      userId: '',
      realRecharge: 0,
      token: '',
      _config: null,
      _dynaConfig: {},
    }),
    getters: {
      isInit() {
        return this._config != null;
      },
      isLogin() {
        return this.userId != '';
      },
      isMP() {
        return this.env == 'mp';
      },
      isPT() {
        return this.env == 'pt';
      },
      isH5() {
        return this.env == '';
      },
      config() {
        return this._config;
      },
      dynaConfig() {
        return this._dynaConfig;
      },
    },
    actions: {
      async waitInit() {
        for (; this._config == null; ) console.log('等待初始化...'), await we.waitForSeconds(0.1);
      },
      setPayIP(e) {
        this.payIP = e;
      },
      setConfig(e) {
        (e.promote_id = e.promote_id || '0'),
          (this._config = e),
          localStorage.getItem('H5SDK_AUTOLOGIN') == null &&
            localStorage.setItem('H5SDK_AUTOLOGIN', '1'),
          console.log(`[H5SDK.version] ${this.version}`);
      },
      setDynaConfig(e) {
        this._dynaConfig = Object.assign(this._dynaConfig, e);
      },
      setToken(e) {
        this.token = e;
      },
      setAutoLogin(e) {
        localStorage.setItem('H5SDK_AUTOLOGIN', e ? '1' : '0'), e || this.clearSecret();
      },
      getAutoLogin() {
        return localStorage.getItem('H5SDK_AUTOLOGIN') === '1';
      },
      setBallHide(e) {
        console.log('setBallHide: ', e), localStorage.setItem('H5SDK_BALLHIDE', e ? '1' : '0');
      },
      getBallHide() {
        return localStorage.getItem('H5SDK_BALLHIDE') === '1';
      },
      // [DZMM patch 2026-10-01] Remembers the account name only; the password
      // argument is ignored on purpose (see dzmmLegacyLogin above).
      saveSecret(e) {
        try {
          e ? localStorage.setItem('H5SDK_ACCOUNT', e) : localStorage.removeItem('H5SDK_ACCOUNT');
        } catch {}
      },
      // [DZMM patch 2026-10-01] Returns the pre-migration credentials once,
      // from memory, then null. Upstream LoginView auto-submits whatever this
      // returns, so it must never return an account without a password.
      getSecret() {
        const e = dzmmLegacyLogin.value;
        return (dzmmLegacyLogin.value = null), e;
      },
      getRememberedAccount() {
        try {
          return localStorage.getItem('H5SDK_ACCOUNT') || '';
        } catch {
          return '';
        }
      },
      clearSecret() {
        dzmmLegacyLogin.value = null;
        try {
          localStorage.removeItem('H5SDK_SECREY'), localStorage.removeItem('H5SDK_ACCOUNT');
        } catch {}
      },
      saveSession(e, t) {
        let { account: n, user_id: r, real_recharge: s, token: o, promote_account: i } = e,
          { quickLogin: a, env: c } = t;
        (this.quickLogin = a || !1),
          (this.env = c || ''),
          (this.promoteAccount = i),
          (this.account = n),
          (this.userId = r),
          (this.realRecharge = s || 0),
          (this.token = o);
      },
      clearSession() {
        (this.quickLogin = !1),
          (this.env = ''),
          (this.promoteAccount = ''),
          (this.account = ''),
          (this.userId = ''),
          (this.token = '');
      },
    },
  });
var ue =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
function Fg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default') ? e.default : e;
}
function Pg(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == 'function') {
    var n = function r() {
      return this instanceof r
        ? Reflect.construct(t, arguments, this.constructor)
        : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return (
    Object.defineProperty(n, '__esModule', { value: !0 }),
    Object.keys(e).forEach(function (r) {
      var s = Object.getOwnPropertyDescriptor(e, r);
      Object.defineProperty(
        n,
        r,
        s.get
          ? s
          : {
              enumerable: !0,
              get: function () {
                return e[r];
              },
            },
      );
    }),
    n
  );
}
var sf = { exports: {} };
function Sg(e) {
  throw new Error(
    'Could not dynamically require "' +
      e +
      '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.',
  );
}
var go = { exports: {} };
const Tg = {},
  Rg = Object.freeze(
    Object.defineProperty({ __proto__: null, default: Tg }, Symbol.toStringTag, {
      value: 'Module',
    }),
  ),
  wg = Pg(Rg);
var N0;
function me() {
  return (
    N0 ||
      ((N0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r();
        })(ue, function () {
          var n =
            n ||
            (function (r, s) {
              var o;
              if (
                (typeof window < 'u' && window.crypto && (o = window.crypto),
                typeof self < 'u' && self.crypto && (o = self.crypto),
                typeof globalThis < 'u' && globalThis.crypto && (o = globalThis.crypto),
                !o && typeof window < 'u' && window.msCrypto && (o = window.msCrypto),
                !o && typeof ue < 'u' && ue.crypto && (o = ue.crypto),
                !o && typeof Sg == 'function')
              )
                try {
                  o = wg;
                } catch {}
              var i = function () {
                  if (o) {
                    if (typeof o.getRandomValues == 'function')
                      try {
                        return o.getRandomValues(new Uint32Array(1))[0];
                      } catch {}
                    if (typeof o.randomBytes == 'function')
                      try {
                        return o.randomBytes(4).readInt32LE();
                      } catch {}
                  }
                  throw new Error(
                    'Native crypto module could not be used to get secure random number.',
                  );
                },
                a =
                  Object.create ||
                  (function () {
                    function g() {}
                    return function (h) {
                      var x;
                      return (g.prototype = h), (x = new g()), (g.prototype = null), x;
                    };
                  })(),
                c = {},
                l = (c.lib = {}),
                u = (l.Base = (function () {
                  return {
                    extend: function (g) {
                      var h = a(this);
                      return (
                        g && h.mixIn(g),
                        (!h.hasOwnProperty('init') || this.init === h.init) &&
                          (h.init = function () {
                            h.$super.init.apply(this, arguments);
                          }),
                        (h.init.prototype = h),
                        (h.$super = this),
                        h
                      );
                    },
                    create: function () {
                      var g = this.extend();
                      return g.init.apply(g, arguments), g;
                    },
                    init: function () {},
                    mixIn: function (g) {
                      for (var h in g) g.hasOwnProperty(h) && (this[h] = g[h]);
                      g.hasOwnProperty('toString') && (this.toString = g.toString);
                    },
                    clone: function () {
                      return this.init.prototype.extend(this);
                    },
                  };
                })()),
                f = (l.WordArray = u.extend({
                  init: function (g, h) {
                    (g = this.words = g || []),
                      h != s ? (this.sigBytes = h) : (this.sigBytes = g.length * 4);
                  },
                  toString: function (g) {
                    return (g || p).stringify(this);
                  },
                  concat: function (g) {
                    var h = this.words,
                      x = g.words,
                      y = this.sigBytes,
                      C = g.sigBytes;
                    if ((this.clamp(), y % 4))
                      for (var A = 0; A < C; A++) {
                        var w = (x[A >>> 2] >>> (24 - (A % 4) * 8)) & 255;
                        h[(y + A) >>> 2] |= w << (24 - ((y + A) % 4) * 8);
                      }
                    else for (var D = 0; D < C; D += 4) h[(y + D) >>> 2] = x[D >>> 2];
                    return (this.sigBytes += C), this;
                  },
                  clamp: function () {
                    var g = this.words,
                      h = this.sigBytes;
                    (g[h >>> 2] &= 4294967295 << (32 - (h % 4) * 8)), (g.length = r.ceil(h / 4));
                  },
                  clone: function () {
                    var g = u.clone.call(this);
                    return (g.words = this.words.slice(0)), g;
                  },
                  random: function (g) {
                    for (var h = [], x = 0; x < g; x += 4) h.push(i());
                    return new f.init(h, g);
                  },
                })),
                d = (c.enc = {}),
                p = (d.Hex = {
                  stringify: function (g) {
                    for (var h = g.words, x = g.sigBytes, y = [], C = 0; C < x; C++) {
                      var A = (h[C >>> 2] >>> (24 - (C % 4) * 8)) & 255;
                      y.push((A >>> 4).toString(16)), y.push((A & 15).toString(16));
                    }
                    return y.join('');
                  },
                  parse: function (g) {
                    for (var h = g.length, x = [], y = 0; y < h; y += 2)
                      x[y >>> 3] |= parseInt(g.substr(y, 2), 16) << (24 - (y % 8) * 4);
                    return new f.init(x, h / 2);
                  },
                }),
                m = (d.Latin1 = {
                  stringify: function (g) {
                    for (var h = g.words, x = g.sigBytes, y = [], C = 0; C < x; C++) {
                      var A = (h[C >>> 2] >>> (24 - (C % 4) * 8)) & 255;
                      y.push(String.fromCharCode(A));
                    }
                    return y.join('');
                  },
                  parse: function (g) {
                    for (var h = g.length, x = [], y = 0; y < h; y++)
                      x[y >>> 2] |= (g.charCodeAt(y) & 255) << (24 - (y % 4) * 8);
                    return new f.init(x, h);
                  },
                }),
                v = (d.Utf8 = {
                  stringify: function (g) {
                    try {
                      return decodeURIComponent(escape(m.stringify(g)));
                    } catch {
                      throw new Error('Malformed UTF-8 data');
                    }
                  },
                  parse: function (g) {
                    return m.parse(unescape(encodeURIComponent(g)));
                  },
                }),
                E = (l.BufferedBlockAlgorithm = u.extend({
                  reset: function () {
                    (this._data = new f.init()), (this._nDataBytes = 0);
                  },
                  _append: function (g) {
                    typeof g == 'string' && (g = v.parse(g)),
                      this._data.concat(g),
                      (this._nDataBytes += g.sigBytes);
                  },
                  _process: function (g) {
                    var h,
                      x = this._data,
                      y = x.words,
                      C = x.sigBytes,
                      A = this.blockSize,
                      w = A * 4,
                      D = C / w;
                    g ? (D = r.ceil(D)) : (D = r.max((D | 0) - this._minBufferSize, 0));
                    var b = D * A,
                      F = r.min(b * 4, C);
                    if (b) {
                      for (var T = 0; T < b; T += A) this._doProcessBlock(y, T);
                      (h = y.splice(0, b)), (x.sigBytes -= F);
                    }
                    return new f.init(h, F);
                  },
                  clone: function () {
                    var g = u.clone.call(this);
                    return (g._data = this._data.clone()), g;
                  },
                  _minBufferSize: 0,
                }));
              l.Hasher = E.extend({
                cfg: u.extend(),
                init: function (g) {
                  (this.cfg = this.cfg.extend(g)), this.reset();
                },
                reset: function () {
                  E.reset.call(this), this._doReset();
                },
                update: function (g) {
                  return this._append(g), this._process(), this;
                },
                finalize: function (g) {
                  g && this._append(g);
                  var h = this._doFinalize();
                  return h;
                },
                blockSize: 16,
                _createHelper: function (g) {
                  return function (h, x) {
                    return new g.init(x).finalize(h);
                  };
                },
                _createHmacHelper: function (g) {
                  return function (h, x) {
                    return new _.HMAC.init(g, x).finalize(h);
                  };
                },
              });
              var _ = (c.algo = {});
              return c;
            })(Math);
          return n;
        });
      })(go)),
    go.exports
  );
}
var mo = { exports: {} },
  I0;
function Gs() {
  return (
    I0 ||
      ((I0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.Base,
                a = o.WordArray,
                c = (s.x64 = {});
              (c.Word = i.extend({
                init: function (l, u) {
                  (this.high = l), (this.low = u);
                },
              })),
                (c.WordArray = i.extend({
                  init: function (l, u) {
                    (l = this.words = l || []),
                      u != r ? (this.sigBytes = u) : (this.sigBytes = l.length * 8);
                  },
                  toX32: function () {
                    for (var l = this.words, u = l.length, f = [], d = 0; d < u; d++) {
                      var p = l[d];
                      f.push(p.high), f.push(p.low);
                    }
                    return a.create(f, this.sigBytes);
                  },
                  clone: function () {
                    for (
                      var l = i.clone.call(this),
                        u = (l.words = this.words.slice(0)),
                        f = u.length,
                        d = 0;
                      d < f;
                      d++
                    )
                      u[d] = u[d].clone();
                    return l;
                  },
                }));
            })(),
            n
          );
        });
      })(mo)),
    mo.exports
  );
}
var _o = { exports: {} },
  M0;
function kg() {
  return (
    M0 ||
      ((M0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function () {
              if (typeof ArrayBuffer == 'function') {
                var r = n,
                  s = r.lib,
                  o = s.WordArray,
                  i = o.init,
                  a = (o.init = function (c) {
                    if (
                      (c instanceof ArrayBuffer && (c = new Uint8Array(c)),
                      (c instanceof Int8Array ||
                        (typeof Uint8ClampedArray < 'u' && c instanceof Uint8ClampedArray) ||
                        c instanceof Int16Array ||
                        c instanceof Uint16Array ||
                        c instanceof Int32Array ||
                        c instanceof Uint32Array ||
                        c instanceof Float32Array ||
                        c instanceof Float64Array) &&
                        (c = new Uint8Array(c.buffer, c.byteOffset, c.byteLength)),
                      c instanceof Uint8Array)
                    ) {
                      for (var l = c.byteLength, u = [], f = 0; f < l; f++)
                        u[f >>> 2] |= c[f] << (24 - (f % 4) * 8);
                      i.call(this, u, l);
                    } else i.apply(this, arguments);
                  });
                a.prototype = o;
              }
            })(),
            n.lib.WordArray
          );
        });
      })(_o)),
    _o.exports
  );
}
var vo = { exports: {} },
  H0;
function Og() {
  return (
    H0 ||
      ((H0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = r.enc;
              (i.Utf16 = i.Utf16BE =
                {
                  stringify: function (c) {
                    for (var l = c.words, u = c.sigBytes, f = [], d = 0; d < u; d += 2) {
                      var p = (l[d >>> 2] >>> (16 - (d % 4) * 8)) & 65535;
                      f.push(String.fromCharCode(p));
                    }
                    return f.join('');
                  },
                  parse: function (c) {
                    for (var l = c.length, u = [], f = 0; f < l; f++)
                      u[f >>> 1] |= c.charCodeAt(f) << (16 - (f % 2) * 16);
                    return o.create(u, l * 2);
                  },
                }),
                (i.Utf16LE = {
                  stringify: function (c) {
                    for (var l = c.words, u = c.sigBytes, f = [], d = 0; d < u; d += 2) {
                      var p = a((l[d >>> 2] >>> (16 - (d % 4) * 8)) & 65535);
                      f.push(String.fromCharCode(p));
                    }
                    return f.join('');
                  },
                  parse: function (c) {
                    for (var l = c.length, u = [], f = 0; f < l; f++)
                      u[f >>> 1] |= a(c.charCodeAt(f) << (16 - (f % 2) * 16));
                    return o.create(u, l * 2);
                  },
                });
              function a(c) {
                return ((c << 8) & 4278255360) | ((c >>> 8) & 16711935);
              }
            })(),
            n.enc.Utf16
          );
        });
      })(vo)),
    vo.exports
  );
}
var yo = { exports: {} },
  U0;
function Pn() {
  return (
    U0 ||
      ((U0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = r.enc;
              i.Base64 = {
                stringify: function (c) {
                  var l = c.words,
                    u = c.sigBytes,
                    f = this._map;
                  c.clamp();
                  for (var d = [], p = 0; p < u; p += 3)
                    for (
                      var m = (l[p >>> 2] >>> (24 - (p % 4) * 8)) & 255,
                        v = (l[(p + 1) >>> 2] >>> (24 - ((p + 1) % 4) * 8)) & 255,
                        E = (l[(p + 2) >>> 2] >>> (24 - ((p + 2) % 4) * 8)) & 255,
                        _ = (m << 16) | (v << 8) | E,
                        g = 0;
                      g < 4 && p + g * 0.75 < u;
                      g++
                    )
                      d.push(f.charAt((_ >>> (6 * (3 - g))) & 63));
                  var h = f.charAt(64);
                  if (h) for (; d.length % 4; ) d.push(h);
                  return d.join('');
                },
                parse: function (c) {
                  var l = c.length,
                    u = this._map,
                    f = this._reverseMap;
                  if (!f) {
                    f = this._reverseMap = [];
                    for (var d = 0; d < u.length; d++) f[u.charCodeAt(d)] = d;
                  }
                  var p = u.charAt(64);
                  if (p) {
                    var m = c.indexOf(p);
                    m !== -1 && (l = m);
                  }
                  return a(c, l, f);
                },
                _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
              };
              function a(c, l, u) {
                for (var f = [], d = 0, p = 0; p < l; p++)
                  if (p % 4) {
                    var m = u[c.charCodeAt(p - 1)] << ((p % 4) * 2),
                      v = u[c.charCodeAt(p)] >>> (6 - (p % 4) * 2),
                      E = m | v;
                    (f[d >>> 2] |= E << (24 - (d % 4) * 8)), d++;
                  }
                return o.create(f, d);
              }
            })(),
            n.enc.Base64
          );
        });
      })(yo)),
    yo.exports
  );
}
var Eo = { exports: {} },
  $0;
function Lg() {
  return (
    $0 ||
      (($0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = r.enc;
              i.Base64url = {
                stringify: function (c, l) {
                  l === void 0 && (l = !0);
                  var u = c.words,
                    f = c.sigBytes,
                    d = l ? this._safe_map : this._map;
                  c.clamp();
                  for (var p = [], m = 0; m < f; m += 3)
                    for (
                      var v = (u[m >>> 2] >>> (24 - (m % 4) * 8)) & 255,
                        E = (u[(m + 1) >>> 2] >>> (24 - ((m + 1) % 4) * 8)) & 255,
                        _ = (u[(m + 2) >>> 2] >>> (24 - ((m + 2) % 4) * 8)) & 255,
                        g = (v << 16) | (E << 8) | _,
                        h = 0;
                      h < 4 && m + h * 0.75 < f;
                      h++
                    )
                      p.push(d.charAt((g >>> (6 * (3 - h))) & 63));
                  var x = d.charAt(64);
                  if (x) for (; p.length % 4; ) p.push(x);
                  return p.join('');
                },
                parse: function (c, l) {
                  l === void 0 && (l = !0);
                  var u = c.length,
                    f = l ? this._safe_map : this._map,
                    d = this._reverseMap;
                  if (!d) {
                    d = this._reverseMap = [];
                    for (var p = 0; p < f.length; p++) d[f.charCodeAt(p)] = p;
                  }
                  var m = f.charAt(64);
                  if (m) {
                    var v = c.indexOf(m);
                    v !== -1 && (u = v);
                  }
                  return a(c, u, d);
                },
                _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
              };
              function a(c, l, u) {
                for (var f = [], d = 0, p = 0; p < l; p++)
                  if (p % 4) {
                    var m = u[c.charCodeAt(p - 1)] << ((p % 4) * 2),
                      v = u[c.charCodeAt(p)] >>> (6 - (p % 4) * 2),
                      E = m | v;
                    (f[d >>> 2] |= E << (24 - (d % 4) * 8)), d++;
                  }
                return o.create(f, d);
              }
            })(),
            n.enc.Base64url
          );
        });
      })(Eo)),
    Eo.exports
  );
}
var bo = { exports: {} },
  V0;
function Sn() {
  return (
    V0 ||
      ((V0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.WordArray,
                a = o.Hasher,
                c = s.algo,
                l = [];
              (function () {
                for (var v = 0; v < 64; v++) l[v] = (r.abs(r.sin(v + 1)) * 4294967296) | 0;
              })();
              var u = (c.MD5 = a.extend({
                _doReset: function () {
                  this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878]);
                },
                _doProcessBlock: function (v, E) {
                  for (var _ = 0; _ < 16; _++) {
                    var g = E + _,
                      h = v[g];
                    v[g] =
                      (((h << 8) | (h >>> 24)) & 16711935) | (((h << 24) | (h >>> 8)) & 4278255360);
                  }
                  var x = this._hash.words,
                    y = v[E + 0],
                    C = v[E + 1],
                    A = v[E + 2],
                    w = v[E + 3],
                    D = v[E + 4],
                    b = v[E + 5],
                    F = v[E + 6],
                    T = v[E + 7],
                    O = v[E + 8],
                    Y = v[E + 9],
                    J = v[E + 10],
                    q = v[E + 11],
                    Z = v[E + 12],
                    X = v[E + 13],
                    ie = v[E + 14],
                    ce = v[E + 15],
                    $ = x[0],
                    W = x[1],
                    z = x[2],
                    j = x[3];
                  ($ = f($, W, z, j, y, 7, l[0])),
                    (j = f(j, $, W, z, C, 12, l[1])),
                    (z = f(z, j, $, W, A, 17, l[2])),
                    (W = f(W, z, j, $, w, 22, l[3])),
                    ($ = f($, W, z, j, D, 7, l[4])),
                    (j = f(j, $, W, z, b, 12, l[5])),
                    (z = f(z, j, $, W, F, 17, l[6])),
                    (W = f(W, z, j, $, T, 22, l[7])),
                    ($ = f($, W, z, j, O, 7, l[8])),
                    (j = f(j, $, W, z, Y, 12, l[9])),
                    (z = f(z, j, $, W, J, 17, l[10])),
                    (W = f(W, z, j, $, q, 22, l[11])),
                    ($ = f($, W, z, j, Z, 7, l[12])),
                    (j = f(j, $, W, z, X, 12, l[13])),
                    (z = f(z, j, $, W, ie, 17, l[14])),
                    (W = f(W, z, j, $, ce, 22, l[15])),
                    ($ = d($, W, z, j, C, 5, l[16])),
                    (j = d(j, $, W, z, F, 9, l[17])),
                    (z = d(z, j, $, W, q, 14, l[18])),
                    (W = d(W, z, j, $, y, 20, l[19])),
                    ($ = d($, W, z, j, b, 5, l[20])),
                    (j = d(j, $, W, z, J, 9, l[21])),
                    (z = d(z, j, $, W, ce, 14, l[22])),
                    (W = d(W, z, j, $, D, 20, l[23])),
                    ($ = d($, W, z, j, Y, 5, l[24])),
                    (j = d(j, $, W, z, ie, 9, l[25])),
                    (z = d(z, j, $, W, w, 14, l[26])),
                    (W = d(W, z, j, $, O, 20, l[27])),
                    ($ = d($, W, z, j, X, 5, l[28])),
                    (j = d(j, $, W, z, A, 9, l[29])),
                    (z = d(z, j, $, W, T, 14, l[30])),
                    (W = d(W, z, j, $, Z, 20, l[31])),
                    ($ = p($, W, z, j, b, 4, l[32])),
                    (j = p(j, $, W, z, O, 11, l[33])),
                    (z = p(z, j, $, W, q, 16, l[34])),
                    (W = p(W, z, j, $, ie, 23, l[35])),
                    ($ = p($, W, z, j, C, 4, l[36])),
                    (j = p(j, $, W, z, D, 11, l[37])),
                    (z = p(z, j, $, W, T, 16, l[38])),
                    (W = p(W, z, j, $, J, 23, l[39])),
                    ($ = p($, W, z, j, X, 4, l[40])),
                    (j = p(j, $, W, z, y, 11, l[41])),
                    (z = p(z, j, $, W, w, 16, l[42])),
                    (W = p(W, z, j, $, F, 23, l[43])),
                    ($ = p($, W, z, j, Y, 4, l[44])),
                    (j = p(j, $, W, z, Z, 11, l[45])),
                    (z = p(z, j, $, W, ce, 16, l[46])),
                    (W = p(W, z, j, $, A, 23, l[47])),
                    ($ = m($, W, z, j, y, 6, l[48])),
                    (j = m(j, $, W, z, T, 10, l[49])),
                    (z = m(z, j, $, W, ie, 15, l[50])),
                    (W = m(W, z, j, $, b, 21, l[51])),
                    ($ = m($, W, z, j, Z, 6, l[52])),
                    (j = m(j, $, W, z, w, 10, l[53])),
                    (z = m(z, j, $, W, J, 15, l[54])),
                    (W = m(W, z, j, $, C, 21, l[55])),
                    ($ = m($, W, z, j, O, 6, l[56])),
                    (j = m(j, $, W, z, ce, 10, l[57])),
                    (z = m(z, j, $, W, F, 15, l[58])),
                    (W = m(W, z, j, $, X, 21, l[59])),
                    ($ = m($, W, z, j, D, 6, l[60])),
                    (j = m(j, $, W, z, q, 10, l[61])),
                    (z = m(z, j, $, W, A, 15, l[62])),
                    (W = m(W, z, j, $, Y, 21, l[63])),
                    (x[0] = (x[0] + $) | 0),
                    (x[1] = (x[1] + W) | 0),
                    (x[2] = (x[2] + z) | 0),
                    (x[3] = (x[3] + j) | 0);
                },
                _doFinalize: function () {
                  var v = this._data,
                    E = v.words,
                    _ = this._nDataBytes * 8,
                    g = v.sigBytes * 8;
                  E[g >>> 5] |= 128 << (24 - (g % 32));
                  var h = r.floor(_ / 4294967296),
                    x = _;
                  (E[(((g + 64) >>> 9) << 4) + 15] =
                    (((h << 8) | (h >>> 24)) & 16711935) | (((h << 24) | (h >>> 8)) & 4278255360)),
                    (E[(((g + 64) >>> 9) << 4) + 14] =
                      (((x << 8) | (x >>> 24)) & 16711935) |
                      (((x << 24) | (x >>> 8)) & 4278255360)),
                    (v.sigBytes = (E.length + 1) * 4),
                    this._process();
                  for (var y = this._hash, C = y.words, A = 0; A < 4; A++) {
                    var w = C[A];
                    C[A] =
                      (((w << 8) | (w >>> 24)) & 16711935) | (((w << 24) | (w >>> 8)) & 4278255360);
                  }
                  return y;
                },
                clone: function () {
                  var v = a.clone.call(this);
                  return (v._hash = this._hash.clone()), v;
                },
              }));
              function f(v, E, _, g, h, x, y) {
                var C = v + ((E & _) | (~E & g)) + h + y;
                return ((C << x) | (C >>> (32 - x))) + E;
              }
              function d(v, E, _, g, h, x, y) {
                var C = v + ((E & g) | (_ & ~g)) + h + y;
                return ((C << x) | (C >>> (32 - x))) + E;
              }
              function p(v, E, _, g, h, x, y) {
                var C = v + (E ^ _ ^ g) + h + y;
                return ((C << x) | (C >>> (32 - x))) + E;
              }
              function m(v, E, _, g, h, x, y) {
                var C = v + (_ ^ (E | ~g)) + h + y;
                return ((C << x) | (C >>> (32 - x))) + E;
              }
              (s.MD5 = a._createHelper(u)), (s.HmacMD5 = a._createHmacHelper(u));
            })(Math),
            n.MD5
          );
        });
      })(bo)),
    bo.exports
  );
}
var Co = { exports: {} },
  W0;
function of() {
  return (
    W0 ||
      ((W0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = s.Hasher,
                a = r.algo,
                c = [],
                l = (a.SHA1 = i.extend({
                  _doReset: function () {
                    this._hash = new o.init([
                      1732584193, 4023233417, 2562383102, 271733878, 3285377520,
                    ]);
                  },
                  _doProcessBlock: function (u, f) {
                    for (
                      var d = this._hash.words,
                        p = d[0],
                        m = d[1],
                        v = d[2],
                        E = d[3],
                        _ = d[4],
                        g = 0;
                      g < 80;
                      g++
                    ) {
                      if (g < 16) c[g] = u[f + g] | 0;
                      else {
                        var h = c[g - 3] ^ c[g - 8] ^ c[g - 14] ^ c[g - 16];
                        c[g] = (h << 1) | (h >>> 31);
                      }
                      var x = ((p << 5) | (p >>> 27)) + _ + c[g];
                      g < 20
                        ? (x += ((m & v) | (~m & E)) + 1518500249)
                        : g < 40
                          ? (x += (m ^ v ^ E) + 1859775393)
                          : g < 60
                            ? (x += ((m & v) | (m & E) | (v & E)) - 1894007588)
                            : (x += (m ^ v ^ E) - 899497514),
                        (_ = E),
                        (E = v),
                        (v = (m << 30) | (m >>> 2)),
                        (m = p),
                        (p = x);
                    }
                    (d[0] = (d[0] + p) | 0),
                      (d[1] = (d[1] + m) | 0),
                      (d[2] = (d[2] + v) | 0),
                      (d[3] = (d[3] + E) | 0),
                      (d[4] = (d[4] + _) | 0);
                  },
                  _doFinalize: function () {
                    var u = this._data,
                      f = u.words,
                      d = this._nDataBytes * 8,
                      p = u.sigBytes * 8;
                    return (
                      (f[p >>> 5] |= 128 << (24 - (p % 32))),
                      (f[(((p + 64) >>> 9) << 4) + 14] = Math.floor(d / 4294967296)),
                      (f[(((p + 64) >>> 9) << 4) + 15] = d),
                      (u.sigBytes = f.length * 4),
                      this._process(),
                      this._hash
                    );
                  },
                  clone: function () {
                    var u = i.clone.call(this);
                    return (u._hash = this._hash.clone()), u;
                  },
                }));
              (r.SHA1 = i._createHelper(l)), (r.HmacSHA1 = i._createHmacHelper(l));
            })(),
            n.SHA1
          );
        });
      })(Co)),
    Co.exports
  );
}
var Ao = { exports: {} },
  q0;
function ua() {
  return (
    q0 ||
      ((q0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.WordArray,
                a = o.Hasher,
                c = s.algo,
                l = [],
                u = [];
              (function () {
                function p(_) {
                  for (var g = r.sqrt(_), h = 2; h <= g; h++) if (!(_ % h)) return !1;
                  return !0;
                }
                function m(_) {
                  return ((_ - (_ | 0)) * 4294967296) | 0;
                }
                for (var v = 2, E = 0; E < 64; )
                  p(v) && (E < 8 && (l[E] = m(r.pow(v, 1 / 2))), (u[E] = m(r.pow(v, 1 / 3))), E++),
                    v++;
              })();
              var f = [],
                d = (c.SHA256 = a.extend({
                  _doReset: function () {
                    this._hash = new i.init(l.slice(0));
                  },
                  _doProcessBlock: function (p, m) {
                    for (
                      var v = this._hash.words,
                        E = v[0],
                        _ = v[1],
                        g = v[2],
                        h = v[3],
                        x = v[4],
                        y = v[5],
                        C = v[6],
                        A = v[7],
                        w = 0;
                      w < 64;
                      w++
                    ) {
                      if (w < 16) f[w] = p[m + w] | 0;
                      else {
                        var D = f[w - 15],
                          b = ((D << 25) | (D >>> 7)) ^ ((D << 14) | (D >>> 18)) ^ (D >>> 3),
                          F = f[w - 2],
                          T = ((F << 15) | (F >>> 17)) ^ ((F << 13) | (F >>> 19)) ^ (F >>> 10);
                        f[w] = b + f[w - 7] + T + f[w - 16];
                      }
                      var O = (x & y) ^ (~x & C),
                        Y = (E & _) ^ (E & g) ^ (_ & g),
                        J =
                          ((E << 30) | (E >>> 2)) ^
                          ((E << 19) | (E >>> 13)) ^
                          ((E << 10) | (E >>> 22)),
                        q =
                          ((x << 26) | (x >>> 6)) ^
                          ((x << 21) | (x >>> 11)) ^
                          ((x << 7) | (x >>> 25)),
                        Z = A + q + O + u[w] + f[w],
                        X = J + Y;
                      (A = C),
                        (C = y),
                        (y = x),
                        (x = (h + Z) | 0),
                        (h = g),
                        (g = _),
                        (_ = E),
                        (E = (Z + X) | 0);
                    }
                    (v[0] = (v[0] + E) | 0),
                      (v[1] = (v[1] + _) | 0),
                      (v[2] = (v[2] + g) | 0),
                      (v[3] = (v[3] + h) | 0),
                      (v[4] = (v[4] + x) | 0),
                      (v[5] = (v[5] + y) | 0),
                      (v[6] = (v[6] + C) | 0),
                      (v[7] = (v[7] + A) | 0);
                  },
                  _doFinalize: function () {
                    var p = this._data,
                      m = p.words,
                      v = this._nDataBytes * 8,
                      E = p.sigBytes * 8;
                    return (
                      (m[E >>> 5] |= 128 << (24 - (E % 32))),
                      (m[(((E + 64) >>> 9) << 4) + 14] = r.floor(v / 4294967296)),
                      (m[(((E + 64) >>> 9) << 4) + 15] = v),
                      (p.sigBytes = m.length * 4),
                      this._process(),
                      this._hash
                    );
                  },
                  clone: function () {
                    var p = a.clone.call(this);
                    return (p._hash = this._hash.clone()), p;
                  },
                }));
              (s.SHA256 = a._createHelper(d)), (s.HmacSHA256 = a._createHmacHelper(d));
            })(Math),
            n.SHA256
          );
        });
      })(Ao)),
    Ao.exports
  );
}
var Bo = { exports: {} },
  j0;
function Ng() {
  return (
    j0 ||
      ((j0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), ua());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = r.algo,
                a = i.SHA256,
                c = (i.SHA224 = a.extend({
                  _doReset: function () {
                    this._hash = new o.init([
                      3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025,
                      1694076839, 3204075428,
                    ]);
                  },
                  _doFinalize: function () {
                    var l = a._doFinalize.call(this);
                    return (l.sigBytes -= 4), l;
                  },
                }));
              (r.SHA224 = a._createHelper(c)), (r.HmacSHA224 = a._createHmacHelper(c));
            })(),
            n.SHA224
          );
        });
      })(Bo)),
    Bo.exports
  );
}
var Do = { exports: {} },
  K0;
function af() {
  return (
    K0 ||
      ((K0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Gs());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.Hasher,
                i = r.x64,
                a = i.Word,
                c = i.WordArray,
                l = r.algo;
              function u() {
                return a.create.apply(a, arguments);
              }
              var f = [
                  u(1116352408, 3609767458),
                  u(1899447441, 602891725),
                  u(3049323471, 3964484399),
                  u(3921009573, 2173295548),
                  u(961987163, 4081628472),
                  u(1508970993, 3053834265),
                  u(2453635748, 2937671579),
                  u(2870763221, 3664609560),
                  u(3624381080, 2734883394),
                  u(310598401, 1164996542),
                  u(607225278, 1323610764),
                  u(1426881987, 3590304994),
                  u(1925078388, 4068182383),
                  u(2162078206, 991336113),
                  u(2614888103, 633803317),
                  u(3248222580, 3479774868),
                  u(3835390401, 2666613458),
                  u(4022224774, 944711139),
                  u(264347078, 2341262773),
                  u(604807628, 2007800933),
                  u(770255983, 1495990901),
                  u(1249150122, 1856431235),
                  u(1555081692, 3175218132),
                  u(1996064986, 2198950837),
                  u(2554220882, 3999719339),
                  u(2821834349, 766784016),
                  u(2952996808, 2566594879),
                  u(3210313671, 3203337956),
                  u(3336571891, 1034457026),
                  u(3584528711, 2466948901),
                  u(113926993, 3758326383),
                  u(338241895, 168717936),
                  u(666307205, 1188179964),
                  u(773529912, 1546045734),
                  u(1294757372, 1522805485),
                  u(1396182291, 2643833823),
                  u(1695183700, 2343527390),
                  u(1986661051, 1014477480),
                  u(2177026350, 1206759142),
                  u(2456956037, 344077627),
                  u(2730485921, 1290863460),
                  u(2820302411, 3158454273),
                  u(3259730800, 3505952657),
                  u(3345764771, 106217008),
                  u(3516065817, 3606008344),
                  u(3600352804, 1432725776),
                  u(4094571909, 1467031594),
                  u(275423344, 851169720),
                  u(430227734, 3100823752),
                  u(506948616, 1363258195),
                  u(659060556, 3750685593),
                  u(883997877, 3785050280),
                  u(958139571, 3318307427),
                  u(1322822218, 3812723403),
                  u(1537002063, 2003034995),
                  u(1747873779, 3602036899),
                  u(1955562222, 1575990012),
                  u(2024104815, 1125592928),
                  u(2227730452, 2716904306),
                  u(2361852424, 442776044),
                  u(2428436474, 593698344),
                  u(2756734187, 3733110249),
                  u(3204031479, 2999351573),
                  u(3329325298, 3815920427),
                  u(3391569614, 3928383900),
                  u(3515267271, 566280711),
                  u(3940187606, 3454069534),
                  u(4118630271, 4000239992),
                  u(116418474, 1914138554),
                  u(174292421, 2731055270),
                  u(289380356, 3203993006),
                  u(460393269, 320620315),
                  u(685471733, 587496836),
                  u(852142971, 1086792851),
                  u(1017036298, 365543100),
                  u(1126000580, 2618297676),
                  u(1288033470, 3409855158),
                  u(1501505948, 4234509866),
                  u(1607167915, 987167468),
                  u(1816402316, 1246189591),
                ],
                d = [];
              (function () {
                for (var m = 0; m < 80; m++) d[m] = u();
              })();
              var p = (l.SHA512 = o.extend({
                _doReset: function () {
                  this._hash = new c.init([
                    new a.init(1779033703, 4089235720),
                    new a.init(3144134277, 2227873595),
                    new a.init(1013904242, 4271175723),
                    new a.init(2773480762, 1595750129),
                    new a.init(1359893119, 2917565137),
                    new a.init(2600822924, 725511199),
                    new a.init(528734635, 4215389547),
                    new a.init(1541459225, 327033209),
                  ]);
                },
                _doProcessBlock: function (m, v) {
                  for (
                    var E = this._hash.words,
                      _ = E[0],
                      g = E[1],
                      h = E[2],
                      x = E[3],
                      y = E[4],
                      C = E[5],
                      A = E[6],
                      w = E[7],
                      D = _.high,
                      b = _.low,
                      F = g.high,
                      T = g.low,
                      O = h.high,
                      Y = h.low,
                      J = x.high,
                      q = x.low,
                      Z = y.high,
                      X = y.low,
                      ie = C.high,
                      ce = C.low,
                      $ = A.high,
                      W = A.low,
                      z = w.high,
                      j = w.low,
                      ye = D,
                      le = b,
                      H = F,
                      K = T,
                      ee = O,
                      ne = Y,
                      fe = J,
                      _e = q,
                      P = Z,
                      R = X,
                      N = ie,
                      G = ce,
                      V = $,
                      B = W,
                      S = z,
                      L = j,
                      I = 0;
                    I < 80;
                    I++
                  ) {
                    var U,
                      Q,
                      k = d[I];
                    if (I < 16) (Q = k.high = m[v + I * 2] | 0), (U = k.low = m[v + I * 2 + 1] | 0);
                    else {
                      var M = d[I - 15],
                        te = M.high,
                        oe = M.low,
                        pe = ((te >>> 1) | (oe << 31)) ^ ((te >>> 8) | (oe << 24)) ^ (te >>> 7),
                        de =
                          ((oe >>> 1) | (te << 31)) ^
                          ((oe >>> 8) | (te << 24)) ^
                          ((oe >>> 7) | (te << 25)),
                        Oe = d[I - 2],
                        Re = Oe.high,
                        je = Oe.low,
                        et = ((Re >>> 19) | (je << 13)) ^ ((Re << 3) | (je >>> 29)) ^ (Re >>> 6),
                        Yt =
                          ((je >>> 19) | (Re << 13)) ^
                          ((je << 3) | (Re >>> 29)) ^
                          ((je >>> 6) | (Re << 26)),
                        er = d[I - 7],
                        tt = er.high,
                        xt = er.low,
                        tr = d[I - 16],
                        Lf = tr.high,
                        ba = tr.low;
                      (U = de + xt),
                        (Q = pe + tt + (U >>> 0 < de >>> 0 ? 1 : 0)),
                        (U = U + Yt),
                        (Q = Q + et + (U >>> 0 < Yt >>> 0 ? 1 : 0)),
                        (U = U + ba),
                        (Q = Q + Lf + (U >>> 0 < ba >>> 0 ? 1 : 0)),
                        (k.high = Q),
                        (k.low = U);
                    }
                    var Nf = (P & N) ^ (~P & V),
                      Ca = (R & G) ^ (~R & B),
                      If = (ye & H) ^ (ye & ee) ^ (H & ee),
                      Mf = (le & K) ^ (le & ne) ^ (K & ne),
                      Hf =
                        ((ye >>> 28) | (le << 4)) ^
                        ((ye << 30) | (le >>> 2)) ^
                        ((ye << 25) | (le >>> 7)),
                      Aa =
                        ((le >>> 28) | (ye << 4)) ^
                        ((le << 30) | (ye >>> 2)) ^
                        ((le << 25) | (ye >>> 7)),
                      Uf =
                        ((P >>> 14) | (R << 18)) ^
                        ((P >>> 18) | (R << 14)) ^
                        ((P << 23) | (R >>> 9)),
                      $f =
                        ((R >>> 14) | (P << 18)) ^
                        ((R >>> 18) | (P << 14)) ^
                        ((R << 23) | (P >>> 9)),
                      Ba = f[I],
                      Vf = Ba.high,
                      Da = Ba.low,
                      ft = L + $f,
                      Xt = S + Uf + (ft >>> 0 < L >>> 0 ? 1 : 0),
                      ft = ft + Ca,
                      Xt = Xt + Nf + (ft >>> 0 < Ca >>> 0 ? 1 : 0),
                      ft = ft + Da,
                      Xt = Xt + Vf + (ft >>> 0 < Da >>> 0 ? 1 : 0),
                      ft = ft + U,
                      Xt = Xt + Q + (ft >>> 0 < U >>> 0 ? 1 : 0),
                      Fa = Aa + Mf,
                      Wf = Hf + If + (Fa >>> 0 < Aa >>> 0 ? 1 : 0);
                    (S = V),
                      (L = B),
                      (V = N),
                      (B = G),
                      (N = P),
                      (G = R),
                      (R = (_e + ft) | 0),
                      (P = (fe + Xt + (R >>> 0 < _e >>> 0 ? 1 : 0)) | 0),
                      (fe = ee),
                      (_e = ne),
                      (ee = H),
                      (ne = K),
                      (H = ye),
                      (K = le),
                      (le = (ft + Fa) | 0),
                      (ye = (Xt + Wf + (le >>> 0 < ft >>> 0 ? 1 : 0)) | 0);
                  }
                  (b = _.low = b + le),
                    (_.high = D + ye + (b >>> 0 < le >>> 0 ? 1 : 0)),
                    (T = g.low = T + K),
                    (g.high = F + H + (T >>> 0 < K >>> 0 ? 1 : 0)),
                    (Y = h.low = Y + ne),
                    (h.high = O + ee + (Y >>> 0 < ne >>> 0 ? 1 : 0)),
                    (q = x.low = q + _e),
                    (x.high = J + fe + (q >>> 0 < _e >>> 0 ? 1 : 0)),
                    (X = y.low = X + R),
                    (y.high = Z + P + (X >>> 0 < R >>> 0 ? 1 : 0)),
                    (ce = C.low = ce + G),
                    (C.high = ie + N + (ce >>> 0 < G >>> 0 ? 1 : 0)),
                    (W = A.low = W + B),
                    (A.high = $ + V + (W >>> 0 < B >>> 0 ? 1 : 0)),
                    (j = w.low = j + L),
                    (w.high = z + S + (j >>> 0 < L >>> 0 ? 1 : 0));
                },
                _doFinalize: function () {
                  var m = this._data,
                    v = m.words,
                    E = this._nDataBytes * 8,
                    _ = m.sigBytes * 8;
                  (v[_ >>> 5] |= 128 << (24 - (_ % 32))),
                    (v[(((_ + 128) >>> 10) << 5) + 30] = Math.floor(E / 4294967296)),
                    (v[(((_ + 128) >>> 10) << 5) + 31] = E),
                    (m.sigBytes = v.length * 4),
                    this._process();
                  var g = this._hash.toX32();
                  return g;
                },
                clone: function () {
                  var m = o.clone.call(this);
                  return (m._hash = this._hash.clone()), m;
                },
                blockSize: 1024 / 32,
              }));
              (r.SHA512 = o._createHelper(p)), (r.HmacSHA512 = o._createHmacHelper(p));
            })(),
            n.SHA512
          );
        });
      })(Do)),
    Do.exports
  );
}
var Fo = { exports: {} },
  G0;
function Ig() {
  return (
    G0 ||
      ((G0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Gs(), af());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.x64,
                o = s.Word,
                i = s.WordArray,
                a = r.algo,
                c = a.SHA512,
                l = (a.SHA384 = c.extend({
                  _doReset: function () {
                    this._hash = new i.init([
                      new o.init(3418070365, 3238371032),
                      new o.init(1654270250, 914150663),
                      new o.init(2438529370, 812702999),
                      new o.init(355462360, 4144912697),
                      new o.init(1731405415, 4290775857),
                      new o.init(2394180231, 1750603025),
                      new o.init(3675008525, 1694076839),
                      new o.init(1203062813, 3204075428),
                    ]);
                  },
                  _doFinalize: function () {
                    var u = c._doFinalize.call(this);
                    return (u.sigBytes -= 16), u;
                  },
                }));
              (r.SHA384 = c._createHelper(l)), (r.HmacSHA384 = c._createHmacHelper(l));
            })(),
            n.SHA384
          );
        });
      })(Fo)),
    Fo.exports
  );
}
var Po = { exports: {} },
  z0;
function Mg() {
  return (
    z0 ||
      ((z0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Gs());
        })(ue, function (n) {
          return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.WordArray,
                a = o.Hasher,
                c = s.x64,
                l = c.Word,
                u = s.algo,
                f = [],
                d = [],
                p = [];
              (function () {
                for (var E = 1, _ = 0, g = 0; g < 24; g++) {
                  f[E + 5 * _] = (((g + 1) * (g + 2)) / 2) % 64;
                  var h = _ % 5,
                    x = (2 * E + 3 * _) % 5;
                  (E = h), (_ = x);
                }
                for (var E = 0; E < 5; E++)
                  for (var _ = 0; _ < 5; _++) d[E + 5 * _] = _ + ((2 * E + 3 * _) % 5) * 5;
                for (var y = 1, C = 0; C < 24; C++) {
                  for (var A = 0, w = 0, D = 0; D < 7; D++) {
                    if (y & 1) {
                      var b = (1 << D) - 1;
                      b < 32 ? (w ^= 1 << b) : (A ^= 1 << (b - 32));
                    }
                    y & 128 ? (y = (y << 1) ^ 113) : (y <<= 1);
                  }
                  p[C] = l.create(A, w);
                }
              })();
              var m = [];
              (function () {
                for (var E = 0; E < 25; E++) m[E] = l.create();
              })();
              var v = (u.SHA3 = a.extend({
                cfg: a.cfg.extend({ outputLength: 512 }),
                _doReset: function () {
                  for (var E = (this._state = []), _ = 0; _ < 25; _++) E[_] = new l.init();
                  this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
                },
                _doProcessBlock: function (E, _) {
                  for (var g = this._state, h = this.blockSize / 2, x = 0; x < h; x++) {
                    var y = E[_ + 2 * x],
                      C = E[_ + 2 * x + 1];
                    (y =
                      (((y << 8) | (y >>> 24)) & 16711935) |
                      (((y << 24) | (y >>> 8)) & 4278255360)),
                      (C =
                        (((C << 8) | (C >>> 24)) & 16711935) |
                        (((C << 24) | (C >>> 8)) & 4278255360));
                    var A = g[x];
                    (A.high ^= C), (A.low ^= y);
                  }
                  for (var w = 0; w < 24; w++) {
                    for (var D = 0; D < 5; D++) {
                      for (var b = 0, F = 0, T = 0; T < 5; T++) {
                        var A = g[D + 5 * T];
                        (b ^= A.high), (F ^= A.low);
                      }
                      var O = m[D];
                      (O.high = b), (O.low = F);
                    }
                    for (var D = 0; D < 5; D++)
                      for (
                        var Y = m[(D + 4) % 5],
                          J = m[(D + 1) % 5],
                          q = J.high,
                          Z = J.low,
                          b = Y.high ^ ((q << 1) | (Z >>> 31)),
                          F = Y.low ^ ((Z << 1) | (q >>> 31)),
                          T = 0;
                        T < 5;
                        T++
                      ) {
                        var A = g[D + 5 * T];
                        (A.high ^= b), (A.low ^= F);
                      }
                    for (var X = 1; X < 25; X++) {
                      var b,
                        F,
                        A = g[X],
                        ie = A.high,
                        ce = A.low,
                        $ = f[X];
                      $ < 32
                        ? ((b = (ie << $) | (ce >>> (32 - $))), (F = (ce << $) | (ie >>> (32 - $))))
                        : ((b = (ce << ($ - 32)) | (ie >>> (64 - $))),
                          (F = (ie << ($ - 32)) | (ce >>> (64 - $))));
                      var W = m[d[X]];
                      (W.high = b), (W.low = F);
                    }
                    var z = m[0],
                      j = g[0];
                    (z.high = j.high), (z.low = j.low);
                    for (var D = 0; D < 5; D++)
                      for (var T = 0; T < 5; T++) {
                        var X = D + 5 * T,
                          A = g[X],
                          ye = m[X],
                          le = m[((D + 1) % 5) + 5 * T],
                          H = m[((D + 2) % 5) + 5 * T];
                        (A.high = ye.high ^ (~le.high & H.high)),
                          (A.low = ye.low ^ (~le.low & H.low));
                      }
                    var A = g[0],
                      K = p[w];
                    (A.high ^= K.high), (A.low ^= K.low);
                  }
                },
                _doFinalize: function () {
                  var E = this._data,
                    _ = E.words;
                  this._nDataBytes * 8;
                  var g = E.sigBytes * 8,
                    h = this.blockSize * 32;
                  (_[g >>> 5] |= 1 << (24 - (g % 32))),
                    (_[((r.ceil((g + 1) / h) * h) >>> 5) - 1] |= 128),
                    (E.sigBytes = _.length * 4),
                    this._process();
                  for (
                    var x = this._state, y = this.cfg.outputLength / 8, C = y / 8, A = [], w = 0;
                    w < C;
                    w++
                  ) {
                    var D = x[w],
                      b = D.high,
                      F = D.low;
                    (b =
                      (((b << 8) | (b >>> 24)) & 16711935) |
                      (((b << 24) | (b >>> 8)) & 4278255360)),
                      (F =
                        (((F << 8) | (F >>> 24)) & 16711935) |
                        (((F << 24) | (F >>> 8)) & 4278255360)),
                      A.push(F),
                      A.push(b);
                  }
                  return new i.init(A, y);
                },
                clone: function () {
                  for (
                    var E = a.clone.call(this), _ = (E._state = this._state.slice(0)), g = 0;
                    g < 25;
                    g++
                  )
                    _[g] = _[g].clone();
                  return E;
                },
              }));
              (s.SHA3 = a._createHelper(v)), (s.HmacSHA3 = a._createHmacHelper(v));
            })(Math),
            n.SHA3
          );
        });
      })(Po)),
    Po.exports
  );
}
var So = { exports: {} },
  Y0;
function Hg() {
  return (
    Y0 ||
      ((Y0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          /** @preserve
			(c) 2012 by Cédric Mesnil. All rights reserved.

			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
			*/ return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.WordArray,
                a = o.Hasher,
                c = s.algo,
                l = i.create([
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3,
                  12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
                  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10,
                  14, 1, 3, 8, 11, 6, 15, 13,
                ]),
                u = i.create([
                  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10,
                  14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
                  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7,
                  6, 2, 13, 14, 0, 3, 9, 11,
                ]),
                f = i.create([
                  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15,
                  7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7,
                  5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13,
                  12, 5, 12, 13, 14, 11, 8, 5, 6,
                ]),
                d = i.create([
                  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9,
                  11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13,
                  7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5,
                  14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
                ]),
                p = i.create([0, 1518500249, 1859775393, 2400959708, 2840853838]),
                m = i.create([1352829926, 1548603684, 1836072691, 2053994217, 0]),
                v = (c.RIPEMD160 = a.extend({
                  _doReset: function () {
                    this._hash = i.create([
                      1732584193, 4023233417, 2562383102, 271733878, 3285377520,
                    ]);
                  },
                  _doProcessBlock: function (C, A) {
                    for (var w = 0; w < 16; w++) {
                      var D = A + w,
                        b = C[D];
                      C[D] =
                        (((b << 8) | (b >>> 24)) & 16711935) |
                        (((b << 24) | (b >>> 8)) & 4278255360);
                    }
                    var F = this._hash.words,
                      T = p.words,
                      O = m.words,
                      Y = l.words,
                      J = u.words,
                      q = f.words,
                      Z = d.words,
                      X,
                      ie,
                      ce,
                      $,
                      W,
                      z,
                      j,
                      ye,
                      le,
                      H;
                    (z = X = F[0]),
                      (j = ie = F[1]),
                      (ye = ce = F[2]),
                      (le = $ = F[3]),
                      (H = W = F[4]);
                    for (var K, w = 0; w < 80; w += 1)
                      (K = (X + C[A + Y[w]]) | 0),
                        w < 16
                          ? (K += E(ie, ce, $) + T[0])
                          : w < 32
                            ? (K += _(ie, ce, $) + T[1])
                            : w < 48
                              ? (K += g(ie, ce, $) + T[2])
                              : w < 64
                                ? (K += h(ie, ce, $) + T[3])
                                : (K += x(ie, ce, $) + T[4]),
                        (K = K | 0),
                        (K = y(K, q[w])),
                        (K = (K + W) | 0),
                        (X = W),
                        (W = $),
                        ($ = y(ce, 10)),
                        (ce = ie),
                        (ie = K),
                        (K = (z + C[A + J[w]]) | 0),
                        w < 16
                          ? (K += x(j, ye, le) + O[0])
                          : w < 32
                            ? (K += h(j, ye, le) + O[1])
                            : w < 48
                              ? (K += g(j, ye, le) + O[2])
                              : w < 64
                                ? (K += _(j, ye, le) + O[3])
                                : (K += E(j, ye, le) + O[4]),
                        (K = K | 0),
                        (K = y(K, Z[w])),
                        (K = (K + H) | 0),
                        (z = H),
                        (H = le),
                        (le = y(ye, 10)),
                        (ye = j),
                        (j = K);
                    (K = (F[1] + ce + le) | 0),
                      (F[1] = (F[2] + $ + H) | 0),
                      (F[2] = (F[3] + W + z) | 0),
                      (F[3] = (F[4] + X + j) | 0),
                      (F[4] = (F[0] + ie + ye) | 0),
                      (F[0] = K);
                  },
                  _doFinalize: function () {
                    var C = this._data,
                      A = C.words,
                      w = this._nDataBytes * 8,
                      D = C.sigBytes * 8;
                    (A[D >>> 5] |= 128 << (24 - (D % 32))),
                      (A[(((D + 64) >>> 9) << 4) + 14] =
                        (((w << 8) | (w >>> 24)) & 16711935) |
                        (((w << 24) | (w >>> 8)) & 4278255360)),
                      (C.sigBytes = (A.length + 1) * 4),
                      this._process();
                    for (var b = this._hash, F = b.words, T = 0; T < 5; T++) {
                      var O = F[T];
                      F[T] =
                        (((O << 8) | (O >>> 24)) & 16711935) |
                        (((O << 24) | (O >>> 8)) & 4278255360);
                    }
                    return b;
                  },
                  clone: function () {
                    var C = a.clone.call(this);
                    return (C._hash = this._hash.clone()), C;
                  },
                }));
              function E(C, A, w) {
                return C ^ A ^ w;
              }
              function _(C, A, w) {
                return (C & A) | (~C & w);
              }
              function g(C, A, w) {
                return (C | ~A) ^ w;
              }
              function h(C, A, w) {
                return (C & w) | (A & ~w);
              }
              function x(C, A, w) {
                return C ^ (A | ~w);
              }
              function y(C, A) {
                return (C << A) | (C >>> (32 - A));
              }
              (s.RIPEMD160 = a._createHelper(v)), (s.HmacRIPEMD160 = a._createHmacHelper(v));
            })(),
            n.RIPEMD160
          );
        });
      })(So)),
    So.exports
  );
}
var To = { exports: {} },
  X0;
function fa() {
  return (
    X0 ||
      ((X0 = 1),
      (function (e, t) {
        (function (n, r) {
          e.exports = r(me());
        })(ue, function (n) {
          (function () {
            var r = n,
              s = r.lib,
              o = s.Base,
              i = r.enc,
              a = i.Utf8,
              c = r.algo;
            c.HMAC = o.extend({
              init: function (l, u) {
                (l = this._hasher = new l.init()), typeof u == 'string' && (u = a.parse(u));
                var f = l.blockSize,
                  d = f * 4;
                u.sigBytes > d && (u = l.finalize(u)), u.clamp();
                for (
                  var p = (this._oKey = u.clone()),
                    m = (this._iKey = u.clone()),
                    v = p.words,
                    E = m.words,
                    _ = 0;
                  _ < f;
                  _++
                )
                  (v[_] ^= 1549556828), (E[_] ^= 909522486);
                (p.sigBytes = m.sigBytes = d), this.reset();
              },
              reset: function () {
                var l = this._hasher;
                l.reset(), l.update(this._iKey);
              },
              update: function (l) {
                return this._hasher.update(l), this;
              },
              finalize: function (l) {
                var u = this._hasher,
                  f = u.finalize(l);
                u.reset();
                var d = u.finalize(this._oKey.clone().concat(f));
                return d;
              },
            });
          })();
        });
      })(To)),
    To.exports
  );
}
var Ro = { exports: {} },
  Q0;
function Ug() {
  return (
    Q0 ||
      ((Q0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), ua(), fa());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.Base,
                i = s.WordArray,
                a = r.algo,
                c = a.SHA256,
                l = a.HMAC,
                u = (a.PBKDF2 = o.extend({
                  cfg: o.extend({ keySize: 128 / 32, hasher: c, iterations: 25e4 }),
                  init: function (f) {
                    this.cfg = this.cfg.extend(f);
                  },
                  compute: function (f, d) {
                    for (
                      var p = this.cfg,
                        m = l.create(p.hasher, f),
                        v = i.create(),
                        E = i.create([1]),
                        _ = v.words,
                        g = E.words,
                        h = p.keySize,
                        x = p.iterations;
                      _.length < h;

                    ) {
                      var y = m.update(d).finalize(E);
                      m.reset();
                      for (var C = y.words, A = C.length, w = y, D = 1; D < x; D++) {
                        (w = m.finalize(w)), m.reset();
                        for (var b = w.words, F = 0; F < A; F++) C[F] ^= b[F];
                      }
                      v.concat(y), g[0]++;
                    }
                    return (v.sigBytes = h * 4), v;
                  },
                }));
              r.PBKDF2 = function (f, d, p) {
                return u.create(p).compute(f, d);
              };
            })(),
            n.PBKDF2
          );
        });
      })(Ro)),
    Ro.exports
  );
}
var wo = { exports: {} },
  J0;
function xn() {
  return (
    J0 ||
      ((J0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), of(), fa());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.Base,
                i = s.WordArray,
                a = r.algo,
                c = a.MD5,
                l = (a.EvpKDF = o.extend({
                  cfg: o.extend({ keySize: 128 / 32, hasher: c, iterations: 1 }),
                  init: function (u) {
                    this.cfg = this.cfg.extend(u);
                  },
                  compute: function (u, f) {
                    for (
                      var d,
                        p = this.cfg,
                        m = p.hasher.create(),
                        v = i.create(),
                        E = v.words,
                        _ = p.keySize,
                        g = p.iterations;
                      E.length < _;

                    ) {
                      d && m.update(d), (d = m.update(u).finalize(f)), m.reset();
                      for (var h = 1; h < g; h++) (d = m.finalize(d)), m.reset();
                      v.concat(d);
                    }
                    return (v.sigBytes = _ * 4), v;
                  },
                }));
              r.EvpKDF = function (u, f, d) {
                return l.create(d).compute(u, f);
              };
            })(),
            n.EvpKDF
          );
        });
      })(wo)),
    wo.exports
  );
}
var ko = { exports: {} },
  Z0;
function Ke() {
  return (
    Z0 ||
      ((Z0 = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), xn());
        })(ue, function (n) {
          n.lib.Cipher ||
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.Base,
                a = o.WordArray,
                c = o.BufferedBlockAlgorithm,
                l = s.enc;
              l.Utf8;
              var u = l.Base64,
                f = s.algo,
                d = f.EvpKDF,
                p = (o.Cipher = c.extend({
                  cfg: i.extend(),
                  createEncryptor: function (b, F) {
                    return this.create(this._ENC_XFORM_MODE, b, F);
                  },
                  createDecryptor: function (b, F) {
                    return this.create(this._DEC_XFORM_MODE, b, F);
                  },
                  init: function (b, F, T) {
                    (this.cfg = this.cfg.extend(T)),
                      (this._xformMode = b),
                      (this._key = F),
                      this.reset();
                  },
                  reset: function () {
                    c.reset.call(this), this._doReset();
                  },
                  process: function (b) {
                    return this._append(b), this._process();
                  },
                  finalize: function (b) {
                    b && this._append(b);
                    var F = this._doFinalize();
                    return F;
                  },
                  keySize: 128 / 32,
                  ivSize: 128 / 32,
                  _ENC_XFORM_MODE: 1,
                  _DEC_XFORM_MODE: 2,
                  _createHelper: (function () {
                    function b(F) {
                      return typeof F == 'string' ? D : C;
                    }
                    return function (F) {
                      return {
                        encrypt: function (T, O, Y) {
                          return b(O).encrypt(F, T, O, Y);
                        },
                        decrypt: function (T, O, Y) {
                          return b(O).decrypt(F, T, O, Y);
                        },
                      };
                    };
                  })(),
                }));
              o.StreamCipher = p.extend({
                _doFinalize: function () {
                  var b = this._process(!0);
                  return b;
                },
                blockSize: 1,
              });
              var m = (s.mode = {}),
                v = (o.BlockCipherMode = i.extend({
                  createEncryptor: function (b, F) {
                    return this.Encryptor.create(b, F);
                  },
                  createDecryptor: function (b, F) {
                    return this.Decryptor.create(b, F);
                  },
                  init: function (b, F) {
                    (this._cipher = b), (this._iv = F);
                  },
                })),
                E = (m.CBC = (function () {
                  var b = v.extend();
                  (b.Encryptor = b.extend({
                    processBlock: function (T, O) {
                      var Y = this._cipher,
                        J = Y.blockSize;
                      F.call(this, T, O, J),
                        Y.encryptBlock(T, O),
                        (this._prevBlock = T.slice(O, O + J));
                    },
                  })),
                    (b.Decryptor = b.extend({
                      processBlock: function (T, O) {
                        var Y = this._cipher,
                          J = Y.blockSize,
                          q = T.slice(O, O + J);
                        Y.decryptBlock(T, O), F.call(this, T, O, J), (this._prevBlock = q);
                      },
                    }));
                  function F(T, O, Y) {
                    var J,
                      q = this._iv;
                    q ? ((J = q), (this._iv = r)) : (J = this._prevBlock);
                    for (var Z = 0; Z < Y; Z++) T[O + Z] ^= J[Z];
                  }
                  return b;
                })()),
                _ = (s.pad = {}),
                g = (_.Pkcs7 = {
                  pad: function (b, F) {
                    for (
                      var T = F * 4,
                        O = T - (b.sigBytes % T),
                        Y = (O << 24) | (O << 16) | (O << 8) | O,
                        J = [],
                        q = 0;
                      q < O;
                      q += 4
                    )
                      J.push(Y);
                    var Z = a.create(J, O);
                    b.concat(Z);
                  },
                  unpad: function (b) {
                    var F = b.words[(b.sigBytes - 1) >>> 2] & 255;
                    b.sigBytes -= F;
                  },
                });
              o.BlockCipher = p.extend({
                cfg: p.cfg.extend({ mode: E, padding: g }),
                reset: function () {
                  var b;
                  p.reset.call(this);
                  var F = this.cfg,
                    T = F.iv,
                    O = F.mode;
                  this._xformMode == this._ENC_XFORM_MODE
                    ? (b = O.createEncryptor)
                    : ((b = O.createDecryptor), (this._minBufferSize = 1)),
                    this._mode && this._mode.__creator == b
                      ? this._mode.init(this, T && T.words)
                      : ((this._mode = b.call(O, this, T && T.words)), (this._mode.__creator = b));
                },
                _doProcessBlock: function (b, F) {
                  this._mode.processBlock(b, F);
                },
                _doFinalize: function () {
                  var b,
                    F = this.cfg.padding;
                  return (
                    this._xformMode == this._ENC_XFORM_MODE
                      ? (F.pad(this._data, this.blockSize), (b = this._process(!0)))
                      : ((b = this._process(!0)), F.unpad(b)),
                    b
                  );
                },
                blockSize: 128 / 32,
              });
              var h = (o.CipherParams = i.extend({
                  init: function (b) {
                    this.mixIn(b);
                  },
                  toString: function (b) {
                    return (b || this.formatter).stringify(this);
                  },
                })),
                x = (s.format = {}),
                y = (x.OpenSSL = {
                  stringify: function (b) {
                    var F,
                      T = b.ciphertext,
                      O = b.salt;
                    return (
                      O ? (F = a.create([1398893684, 1701076831]).concat(O).concat(T)) : (F = T),
                      F.toString(u)
                    );
                  },
                  parse: function (b) {
                    var F,
                      T = u.parse(b),
                      O = T.words;
                    return (
                      O[0] == 1398893684 &&
                        O[1] == 1701076831 &&
                        ((F = a.create(O.slice(2, 4))), O.splice(0, 4), (T.sigBytes -= 16)),
                      h.create({ ciphertext: T, salt: F })
                    );
                  },
                }),
                C = (o.SerializableCipher = i.extend({
                  cfg: i.extend({ format: y }),
                  encrypt: function (b, F, T, O) {
                    O = this.cfg.extend(O);
                    var Y = b.createEncryptor(T, O),
                      J = Y.finalize(F),
                      q = Y.cfg;
                    return h.create({
                      ciphertext: J,
                      key: T,
                      iv: q.iv,
                      algorithm: b,
                      mode: q.mode,
                      padding: q.padding,
                      blockSize: b.blockSize,
                      formatter: O.format,
                    });
                  },
                  decrypt: function (b, F, T, O) {
                    (O = this.cfg.extend(O)), (F = this._parse(F, O.format));
                    var Y = b.createDecryptor(T, O).finalize(F.ciphertext);
                    return Y;
                  },
                  _parse: function (b, F) {
                    return typeof b == 'string' ? F.parse(b, this) : b;
                  },
                })),
                A = (s.kdf = {}),
                w = (A.OpenSSL = {
                  execute: function (b, F, T, O, Y) {
                    if ((O || (O = a.random(64 / 8)), Y))
                      var J = d.create({ keySize: F + T, hasher: Y }).compute(b, O);
                    else var J = d.create({ keySize: F + T }).compute(b, O);
                    var q = a.create(J.words.slice(F), T * 4);
                    return (J.sigBytes = F * 4), h.create({ key: J, iv: q, salt: O });
                  },
                }),
                D = (o.PasswordBasedCipher = C.extend({
                  cfg: C.cfg.extend({ kdf: w }),
                  encrypt: function (b, F, T, O) {
                    O = this.cfg.extend(O);
                    var Y = O.kdf.execute(T, b.keySize, b.ivSize, O.salt, O.hasher);
                    O.iv = Y.iv;
                    var J = C.encrypt.call(this, b, F, Y.key, O);
                    return J.mixIn(Y), J;
                  },
                  decrypt: function (b, F, T, O) {
                    (O = this.cfg.extend(O)), (F = this._parse(F, O.format));
                    var Y = O.kdf.execute(T, b.keySize, b.ivSize, F.salt, O.hasher);
                    O.iv = Y.iv;
                    var J = C.decrypt.call(this, b, F, Y.key, O);
                    return J;
                  },
                }));
            })();
        });
      })(ko)),
    ko.exports
  );
}
var Oo = { exports: {} },
  ec;
function $g() {
  return (
    ec ||
      ((ec = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.mode.CFB = (function () {
              var r = n.lib.BlockCipherMode.extend();
              (r.Encryptor = r.extend({
                processBlock: function (o, i) {
                  var a = this._cipher,
                    c = a.blockSize;
                  s.call(this, o, i, c, a), (this._prevBlock = o.slice(i, i + c));
                },
              })),
                (r.Decryptor = r.extend({
                  processBlock: function (o, i) {
                    var a = this._cipher,
                      c = a.blockSize,
                      l = o.slice(i, i + c);
                    s.call(this, o, i, c, a), (this._prevBlock = l);
                  },
                }));
              function s(o, i, a, c) {
                var l,
                  u = this._iv;
                u ? ((l = u.slice(0)), (this._iv = void 0)) : (l = this._prevBlock),
                  c.encryptBlock(l, 0);
                for (var f = 0; f < a; f++) o[i + f] ^= l[f];
              }
              return r;
            })()),
            n.mode.CFB
          );
        });
      })(Oo)),
    Oo.exports
  );
}
var Lo = { exports: {} },
  tc;
function Vg() {
  return (
    tc ||
      ((tc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.mode.CTR = (function () {
              var r = n.lib.BlockCipherMode.extend(),
                s = (r.Encryptor = r.extend({
                  processBlock: function (o, i) {
                    var a = this._cipher,
                      c = a.blockSize,
                      l = this._iv,
                      u = this._counter;
                    l && ((u = this._counter = l.slice(0)), (this._iv = void 0));
                    var f = u.slice(0);
                    a.encryptBlock(f, 0), (u[c - 1] = (u[c - 1] + 1) | 0);
                    for (var d = 0; d < c; d++) o[i + d] ^= f[d];
                  },
                }));
              return (r.Decryptor = s), r;
            })()),
            n.mode.CTR
          );
        });
      })(Lo)),
    Lo.exports
  );
}
var No = { exports: {} },
  nc;
function Wg() {
  return (
    nc ||
      ((nc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          /** @preserve
           * Counter block mode compatible with  Dr Brian Gladman fileenc.c
           * derived from CryptoJS.mode.CTR
           * Jan Hruby jhruby.web@gmail.com
           */ return (
            (n.mode.CTRGladman = (function () {
              var r = n.lib.BlockCipherMode.extend();
              function s(a) {
                if (((a >> 24) & 255) === 255) {
                  var c = (a >> 16) & 255,
                    l = (a >> 8) & 255,
                    u = a & 255;
                  c === 255
                    ? ((c = 0), l === 255 ? ((l = 0), u === 255 ? (u = 0) : ++u) : ++l)
                    : ++c,
                    (a = 0),
                    (a += c << 16),
                    (a += l << 8),
                    (a += u);
                } else a += 1 << 24;
                return a;
              }
              function o(a) {
                return (a[0] = s(a[0])) === 0 && (a[1] = s(a[1])), a;
              }
              var i = (r.Encryptor = r.extend({
                processBlock: function (a, c) {
                  var l = this._cipher,
                    u = l.blockSize,
                    f = this._iv,
                    d = this._counter;
                  f && ((d = this._counter = f.slice(0)), (this._iv = void 0)), o(d);
                  var p = d.slice(0);
                  l.encryptBlock(p, 0);
                  for (var m = 0; m < u; m++) a[c + m] ^= p[m];
                },
              }));
              return (r.Decryptor = i), r;
            })()),
            n.mode.CTRGladman
          );
        });
      })(No)),
    No.exports
  );
}
var Io = { exports: {} },
  rc;
function qg() {
  return (
    rc ||
      ((rc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.mode.OFB = (function () {
              var r = n.lib.BlockCipherMode.extend(),
                s = (r.Encryptor = r.extend({
                  processBlock: function (o, i) {
                    var a = this._cipher,
                      c = a.blockSize,
                      l = this._iv,
                      u = this._keystream;
                    l && ((u = this._keystream = l.slice(0)), (this._iv = void 0)),
                      a.encryptBlock(u, 0);
                    for (var f = 0; f < c; f++) o[i + f] ^= u[f];
                  },
                }));
              return (r.Decryptor = s), r;
            })()),
            n.mode.OFB
          );
        });
      })(Io)),
    Io.exports
  );
}
var Mo = { exports: {} },
  sc;
function jg() {
  return (
    sc ||
      ((sc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.mode.ECB = (function () {
              var r = n.lib.BlockCipherMode.extend();
              return (
                (r.Encryptor = r.extend({
                  processBlock: function (s, o) {
                    this._cipher.encryptBlock(s, o);
                  },
                })),
                (r.Decryptor = r.extend({
                  processBlock: function (s, o) {
                    this._cipher.decryptBlock(s, o);
                  },
                })),
                r
              );
            })()),
            n.mode.ECB
          );
        });
      })(Mo)),
    Mo.exports
  );
}
var Ho = { exports: {} },
  oc;
function Kg() {
  return (
    oc ||
      ((oc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.pad.AnsiX923 = {
              pad: function (r, s) {
                var o = r.sigBytes,
                  i = s * 4,
                  a = i - (o % i),
                  c = o + a - 1;
                r.clamp(), (r.words[c >>> 2] |= a << (24 - (c % 4) * 8)), (r.sigBytes += a);
              },
              unpad: function (r) {
                var s = r.words[(r.sigBytes - 1) >>> 2] & 255;
                r.sigBytes -= s;
              },
            }),
            n.pad.Ansix923
          );
        });
      })(Ho)),
    Ho.exports
  );
}
var Uo = { exports: {} },
  ic;
function Gg() {
  return (
    ic ||
      ((ic = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.pad.Iso10126 = {
              pad: function (r, s) {
                var o = s * 4,
                  i = o - (r.sigBytes % o);
                r.concat(n.lib.WordArray.random(i - 1)).concat(
                  n.lib.WordArray.create([i << 24], 1),
                );
              },
              unpad: function (r) {
                var s = r.words[(r.sigBytes - 1) >>> 2] & 255;
                r.sigBytes -= s;
              },
            }),
            n.pad.Iso10126
          );
        });
      })(Uo)),
    Uo.exports
  );
}
var $o = { exports: {} },
  ac;
function zg() {
  return (
    ac ||
      ((ac = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.pad.Iso97971 = {
              pad: function (r, s) {
                r.concat(n.lib.WordArray.create([2147483648], 1)), n.pad.ZeroPadding.pad(r, s);
              },
              unpad: function (r) {
                n.pad.ZeroPadding.unpad(r), r.sigBytes--;
              },
            }),
            n.pad.Iso97971
          );
        });
      })($o)),
    $o.exports
  );
}
var Vo = { exports: {} },
  cc;
function Yg() {
  return (
    cc ||
      ((cc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.pad.ZeroPadding = {
              pad: function (r, s) {
                var o = s * 4;
                r.clamp(), (r.sigBytes += o - (r.sigBytes % o || o));
              },
              unpad: function (r) {
                for (var s = r.words, o = r.sigBytes - 1, o = r.sigBytes - 1; o >= 0; o--)
                  if ((s[o >>> 2] >>> (24 - (o % 4) * 8)) & 255) {
                    r.sigBytes = o + 1;
                    break;
                  }
              },
            }),
            n.pad.ZeroPadding
          );
        });
      })(Vo)),
    Vo.exports
  );
}
var Wo = { exports: {} },
  lc;
function Xg() {
  return (
    lc ||
      ((lc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (n.pad.NoPadding = { pad: function () {}, unpad: function () {} }), n.pad.NoPadding
          );
        });
      })(Wo)),
    Wo.exports
  );
}
var qo = { exports: {} },
  uc;
function Qg() {
  return (
    uc ||
      ((uc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Ke());
        })(ue, function (n) {
          return (
            (function (r) {
              var s = n,
                o = s.lib,
                i = o.CipherParams,
                a = s.enc,
                c = a.Hex,
                l = s.format;
              l.Hex = {
                stringify: function (u) {
                  return u.ciphertext.toString(c);
                },
                parse: function (u) {
                  var f = c.parse(u);
                  return i.create({ ciphertext: f });
                },
              };
            })(),
            n.format.Hex
          );
        });
      })(qo)),
    qo.exports
  );
}
var jo = { exports: {} },
  fc;
function Jg() {
  return (
    fc ||
      ((fc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.BlockCipher,
                i = r.algo,
                a = [],
                c = [],
                l = [],
                u = [],
                f = [],
                d = [],
                p = [],
                m = [],
                v = [],
                E = [];
              (function () {
                for (var h = [], x = 0; x < 256; x++)
                  x < 128 ? (h[x] = x << 1) : (h[x] = (x << 1) ^ 283);
                for (var y = 0, C = 0, x = 0; x < 256; x++) {
                  var A = C ^ (C << 1) ^ (C << 2) ^ (C << 3) ^ (C << 4);
                  (A = (A >>> 8) ^ (A & 255) ^ 99), (a[y] = A), (c[A] = y);
                  var w = h[y],
                    D = h[w],
                    b = h[D],
                    F = (h[A] * 257) ^ (A * 16843008);
                  (l[y] = (F << 24) | (F >>> 8)),
                    (u[y] = (F << 16) | (F >>> 16)),
                    (f[y] = (F << 8) | (F >>> 24)),
                    (d[y] = F);
                  var F = (b * 16843009) ^ (D * 65537) ^ (w * 257) ^ (y * 16843008);
                  (p[A] = (F << 24) | (F >>> 8)),
                    (m[A] = (F << 16) | (F >>> 16)),
                    (v[A] = (F << 8) | (F >>> 24)),
                    (E[A] = F),
                    y ? ((y = w ^ h[h[h[b ^ w]]]), (C ^= h[h[C]])) : (y = C = 1);
                }
              })();
              var _ = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
                g = (i.AES = o.extend({
                  _doReset: function () {
                    var h;
                    if (!(this._nRounds && this._keyPriorReset === this._key)) {
                      for (
                        var x = (this._keyPriorReset = this._key),
                          y = x.words,
                          C = x.sigBytes / 4,
                          A = (this._nRounds = C + 6),
                          w = (A + 1) * 4,
                          D = (this._keySchedule = []),
                          b = 0;
                        b < w;
                        b++
                      )
                        b < C
                          ? (D[b] = y[b])
                          : ((h = D[b - 1]),
                            b % C
                              ? C > 6 &&
                                b % C == 4 &&
                                (h =
                                  (a[h >>> 24] << 24) |
                                  (a[(h >>> 16) & 255] << 16) |
                                  (a[(h >>> 8) & 255] << 8) |
                                  a[h & 255])
                              : ((h = (h << 8) | (h >>> 24)),
                                (h =
                                  (a[h >>> 24] << 24) |
                                  (a[(h >>> 16) & 255] << 16) |
                                  (a[(h >>> 8) & 255] << 8) |
                                  a[h & 255]),
                                (h ^= _[(b / C) | 0] << 24)),
                            (D[b] = D[b - C] ^ h));
                      for (var F = (this._invKeySchedule = []), T = 0; T < w; T++) {
                        var b = w - T;
                        if (T % 4) var h = D[b];
                        else var h = D[b - 4];
                        T < 4 || b <= 4
                          ? (F[T] = h)
                          : (F[T] =
                              p[a[h >>> 24]] ^
                              m[a[(h >>> 16) & 255]] ^
                              v[a[(h >>> 8) & 255]] ^
                              E[a[h & 255]]);
                      }
                    }
                  },
                  encryptBlock: function (h, x) {
                    this._doCryptBlock(h, x, this._keySchedule, l, u, f, d, a);
                  },
                  decryptBlock: function (h, x) {
                    var y = h[x + 1];
                    (h[x + 1] = h[x + 3]),
                      (h[x + 3] = y),
                      this._doCryptBlock(h, x, this._invKeySchedule, p, m, v, E, c);
                    var y = h[x + 1];
                    (h[x + 1] = h[x + 3]), (h[x + 3] = y);
                  },
                  _doCryptBlock: function (h, x, y, C, A, w, D, b) {
                    for (
                      var F = this._nRounds,
                        T = h[x] ^ y[0],
                        O = h[x + 1] ^ y[1],
                        Y = h[x + 2] ^ y[2],
                        J = h[x + 3] ^ y[3],
                        q = 4,
                        Z = 1;
                      Z < F;
                      Z++
                    ) {
                      var X =
                          C[T >>> 24] ^
                          A[(O >>> 16) & 255] ^
                          w[(Y >>> 8) & 255] ^
                          D[J & 255] ^
                          y[q++],
                        ie =
                          C[O >>> 24] ^
                          A[(Y >>> 16) & 255] ^
                          w[(J >>> 8) & 255] ^
                          D[T & 255] ^
                          y[q++],
                        ce =
                          C[Y >>> 24] ^
                          A[(J >>> 16) & 255] ^
                          w[(T >>> 8) & 255] ^
                          D[O & 255] ^
                          y[q++],
                        $ =
                          C[J >>> 24] ^
                          A[(T >>> 16) & 255] ^
                          w[(O >>> 8) & 255] ^
                          D[Y & 255] ^
                          y[q++];
                      (T = X), (O = ie), (Y = ce), (J = $);
                    }
                    var X =
                        ((b[T >>> 24] << 24) |
                          (b[(O >>> 16) & 255] << 16) |
                          (b[(Y >>> 8) & 255] << 8) |
                          b[J & 255]) ^
                        y[q++],
                      ie =
                        ((b[O >>> 24] << 24) |
                          (b[(Y >>> 16) & 255] << 16) |
                          (b[(J >>> 8) & 255] << 8) |
                          b[T & 255]) ^
                        y[q++],
                      ce =
                        ((b[Y >>> 24] << 24) |
                          (b[(J >>> 16) & 255] << 16) |
                          (b[(T >>> 8) & 255] << 8) |
                          b[O & 255]) ^
                        y[q++],
                      $ =
                        ((b[J >>> 24] << 24) |
                          (b[(T >>> 16) & 255] << 16) |
                          (b[(O >>> 8) & 255] << 8) |
                          b[Y & 255]) ^
                        y[q++];
                    (h[x] = X), (h[x + 1] = ie), (h[x + 2] = ce), (h[x + 3] = $);
                  },
                  keySize: 256 / 32,
                }));
              r.AES = o._createHelper(g);
            })(),
            n.AES
          );
        });
      })(jo)),
    jo.exports
  );
}
var Ko = { exports: {} },
  dc;
function Zg() {
  return (
    dc ||
      ((dc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.WordArray,
                i = s.BlockCipher,
                a = r.algo,
                c = [
                  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27,
                  19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
                  14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
                ],
                l = [
                  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20,
                  13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46,
                  42, 50, 36, 29, 32,
                ],
                u = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
                f = [
                  {
                    0: 8421888,
                    268435456: 32768,
                    536870912: 8421378,
                    805306368: 2,
                    1073741824: 512,
                    1342177280: 8421890,
                    1610612736: 8389122,
                    1879048192: 8388608,
                    2147483648: 514,
                    2415919104: 8389120,
                    2684354560: 33280,
                    2952790016: 8421376,
                    3221225472: 32770,
                    3489660928: 8388610,
                    3758096384: 0,
                    4026531840: 33282,
                    134217728: 0,
                    402653184: 8421890,
                    671088640: 33282,
                    939524096: 32768,
                    1207959552: 8421888,
                    1476395008: 512,
                    1744830464: 8421378,
                    2013265920: 2,
                    2281701376: 8389120,
                    2550136832: 33280,
                    2818572288: 8421376,
                    3087007744: 8389122,
                    3355443200: 8388610,
                    3623878656: 32770,
                    3892314112: 514,
                    4160749568: 8388608,
                    1: 32768,
                    268435457: 2,
                    536870913: 8421888,
                    805306369: 8388608,
                    1073741825: 8421378,
                    1342177281: 33280,
                    1610612737: 512,
                    1879048193: 8389122,
                    2147483649: 8421890,
                    2415919105: 8421376,
                    2684354561: 8388610,
                    2952790017: 33282,
                    3221225473: 514,
                    3489660929: 8389120,
                    3758096385: 32770,
                    4026531841: 0,
                    134217729: 8421890,
                    402653185: 8421376,
                    671088641: 8388608,
                    939524097: 512,
                    1207959553: 32768,
                    1476395009: 8388610,
                    1744830465: 2,
                    2013265921: 33282,
                    2281701377: 32770,
                    2550136833: 8389122,
                    2818572289: 514,
                    3087007745: 8421888,
                    3355443201: 8389120,
                    3623878657: 0,
                    3892314113: 33280,
                    4160749569: 8421378,
                  },
                  {
                    0: 1074282512,
                    16777216: 16384,
                    33554432: 524288,
                    50331648: 1074266128,
                    67108864: 1073741840,
                    83886080: 1074282496,
                    100663296: 1073758208,
                    117440512: 16,
                    134217728: 540672,
                    150994944: 1073758224,
                    167772160: 1073741824,
                    184549376: 540688,
                    201326592: 524304,
                    218103808: 0,
                    234881024: 16400,
                    251658240: 1074266112,
                    8388608: 1073758208,
                    25165824: 540688,
                    41943040: 16,
                    58720256: 1073758224,
                    75497472: 1074282512,
                    92274688: 1073741824,
                    109051904: 524288,
                    125829120: 1074266128,
                    142606336: 524304,
                    159383552: 0,
                    176160768: 16384,
                    192937984: 1074266112,
                    209715200: 1073741840,
                    226492416: 540672,
                    243269632: 1074282496,
                    260046848: 16400,
                    268435456: 0,
                    285212672: 1074266128,
                    301989888: 1073758224,
                    318767104: 1074282496,
                    335544320: 1074266112,
                    352321536: 16,
                    369098752: 540688,
                    385875968: 16384,
                    402653184: 16400,
                    419430400: 524288,
                    436207616: 524304,
                    452984832: 1073741840,
                    469762048: 540672,
                    486539264: 1073758208,
                    503316480: 1073741824,
                    520093696: 1074282512,
                    276824064: 540688,
                    293601280: 524288,
                    310378496: 1074266112,
                    327155712: 16384,
                    343932928: 1073758208,
                    360710144: 1074282512,
                    377487360: 16,
                    394264576: 1073741824,
                    411041792: 1074282496,
                    427819008: 1073741840,
                    444596224: 1073758224,
                    461373440: 524304,
                    478150656: 0,
                    494927872: 16400,
                    511705088: 1074266128,
                    528482304: 540672,
                  },
                  {
                    0: 260,
                    1048576: 0,
                    2097152: 67109120,
                    3145728: 65796,
                    4194304: 65540,
                    5242880: 67108868,
                    6291456: 67174660,
                    7340032: 67174400,
                    8388608: 67108864,
                    9437184: 67174656,
                    10485760: 65792,
                    11534336: 67174404,
                    12582912: 67109124,
                    13631488: 65536,
                    14680064: 4,
                    15728640: 256,
                    524288: 67174656,
                    1572864: 67174404,
                    2621440: 0,
                    3670016: 67109120,
                    4718592: 67108868,
                    5767168: 65536,
                    6815744: 65540,
                    7864320: 260,
                    8912896: 4,
                    9961472: 256,
                    11010048: 67174400,
                    12058624: 65796,
                    13107200: 65792,
                    14155776: 67109124,
                    15204352: 67174660,
                    16252928: 67108864,
                    16777216: 67174656,
                    17825792: 65540,
                    18874368: 65536,
                    19922944: 67109120,
                    20971520: 256,
                    22020096: 67174660,
                    23068672: 67108868,
                    24117248: 0,
                    25165824: 67109124,
                    26214400: 67108864,
                    27262976: 4,
                    28311552: 65792,
                    29360128: 67174400,
                    30408704: 260,
                    31457280: 65796,
                    32505856: 67174404,
                    17301504: 67108864,
                    18350080: 260,
                    19398656: 67174656,
                    20447232: 0,
                    21495808: 65540,
                    22544384: 67109120,
                    23592960: 256,
                    24641536: 67174404,
                    25690112: 65536,
                    26738688: 67174660,
                    27787264: 65796,
                    28835840: 67108868,
                    29884416: 67109124,
                    30932992: 67174400,
                    31981568: 4,
                    33030144: 65792,
                  },
                  {
                    0: 2151682048,
                    65536: 2147487808,
                    131072: 4198464,
                    196608: 2151677952,
                    262144: 0,
                    327680: 4198400,
                    393216: 2147483712,
                    458752: 4194368,
                    524288: 2147483648,
                    589824: 4194304,
                    655360: 64,
                    720896: 2147487744,
                    786432: 2151678016,
                    851968: 4160,
                    917504: 4096,
                    983040: 2151682112,
                    32768: 2147487808,
                    98304: 64,
                    163840: 2151678016,
                    229376: 2147487744,
                    294912: 4198400,
                    360448: 2151682112,
                    425984: 0,
                    491520: 2151677952,
                    557056: 4096,
                    622592: 2151682048,
                    688128: 4194304,
                    753664: 4160,
                    819200: 2147483648,
                    884736: 4194368,
                    950272: 4198464,
                    1015808: 2147483712,
                    1048576: 4194368,
                    1114112: 4198400,
                    1179648: 2147483712,
                    1245184: 0,
                    1310720: 4160,
                    1376256: 2151678016,
                    1441792: 2151682048,
                    1507328: 2147487808,
                    1572864: 2151682112,
                    1638400: 2147483648,
                    1703936: 2151677952,
                    1769472: 4198464,
                    1835008: 2147487744,
                    1900544: 4194304,
                    1966080: 64,
                    2031616: 4096,
                    1081344: 2151677952,
                    1146880: 2151682112,
                    1212416: 0,
                    1277952: 4198400,
                    1343488: 4194368,
                    1409024: 2147483648,
                    1474560: 2147487808,
                    1540096: 64,
                    1605632: 2147483712,
                    1671168: 4096,
                    1736704: 2147487744,
                    1802240: 2151678016,
                    1867776: 4160,
                    1933312: 2151682048,
                    1998848: 4194304,
                    2064384: 4198464,
                  },
                  {
                    0: 128,
                    4096: 17039360,
                    8192: 262144,
                    12288: 536870912,
                    16384: 537133184,
                    20480: 16777344,
                    24576: 553648256,
                    28672: 262272,
                    32768: 16777216,
                    36864: 537133056,
                    40960: 536871040,
                    45056: 553910400,
                    49152: 553910272,
                    53248: 0,
                    57344: 17039488,
                    61440: 553648128,
                    2048: 17039488,
                    6144: 553648256,
                    10240: 128,
                    14336: 17039360,
                    18432: 262144,
                    22528: 537133184,
                    26624: 553910272,
                    30720: 536870912,
                    34816: 537133056,
                    38912: 0,
                    43008: 553910400,
                    47104: 16777344,
                    51200: 536871040,
                    55296: 553648128,
                    59392: 16777216,
                    63488: 262272,
                    65536: 262144,
                    69632: 128,
                    73728: 536870912,
                    77824: 553648256,
                    81920: 16777344,
                    86016: 553910272,
                    90112: 537133184,
                    94208: 16777216,
                    98304: 553910400,
                    102400: 553648128,
                    106496: 17039360,
                    110592: 537133056,
                    114688: 262272,
                    118784: 536871040,
                    122880: 0,
                    126976: 17039488,
                    67584: 553648256,
                    71680: 16777216,
                    75776: 17039360,
                    79872: 537133184,
                    83968: 536870912,
                    88064: 17039488,
                    92160: 128,
                    96256: 553910272,
                    100352: 262272,
                    104448: 553910400,
                    108544: 0,
                    112640: 553648128,
                    116736: 16777344,
                    120832: 262144,
                    124928: 537133056,
                    129024: 536871040,
                  },
                  {
                    0: 268435464,
                    256: 8192,
                    512: 270532608,
                    768: 270540808,
                    1024: 268443648,
                    1280: 2097152,
                    1536: 2097160,
                    1792: 268435456,
                    2048: 0,
                    2304: 268443656,
                    2560: 2105344,
                    2816: 8,
                    3072: 270532616,
                    3328: 2105352,
                    3584: 8200,
                    3840: 270540800,
                    128: 270532608,
                    384: 270540808,
                    640: 8,
                    896: 2097152,
                    1152: 2105352,
                    1408: 268435464,
                    1664: 268443648,
                    1920: 8200,
                    2176: 2097160,
                    2432: 8192,
                    2688: 268443656,
                    2944: 270532616,
                    3200: 0,
                    3456: 270540800,
                    3712: 2105344,
                    3968: 268435456,
                    4096: 268443648,
                    4352: 270532616,
                    4608: 270540808,
                    4864: 8200,
                    5120: 2097152,
                    5376: 268435456,
                    5632: 268435464,
                    5888: 2105344,
                    6144: 2105352,
                    6400: 0,
                    6656: 8,
                    6912: 270532608,
                    7168: 8192,
                    7424: 268443656,
                    7680: 270540800,
                    7936: 2097160,
                    4224: 8,
                    4480: 2105344,
                    4736: 2097152,
                    4992: 268435464,
                    5248: 268443648,
                    5504: 8200,
                    5760: 270540808,
                    6016: 270532608,
                    6272: 270540800,
                    6528: 270532616,
                    6784: 8192,
                    7040: 2105352,
                    7296: 2097160,
                    7552: 0,
                    7808: 268435456,
                    8064: 268443656,
                  },
                  {
                    0: 1048576,
                    16: 33555457,
                    32: 1024,
                    48: 1049601,
                    64: 34604033,
                    80: 0,
                    96: 1,
                    112: 34603009,
                    128: 33555456,
                    144: 1048577,
                    160: 33554433,
                    176: 34604032,
                    192: 34603008,
                    208: 1025,
                    224: 1049600,
                    240: 33554432,
                    8: 34603009,
                    24: 0,
                    40: 33555457,
                    56: 34604032,
                    72: 1048576,
                    88: 33554433,
                    104: 33554432,
                    120: 1025,
                    136: 1049601,
                    152: 33555456,
                    168: 34603008,
                    184: 1048577,
                    200: 1024,
                    216: 34604033,
                    232: 1,
                    248: 1049600,
                    256: 33554432,
                    272: 1048576,
                    288: 33555457,
                    304: 34603009,
                    320: 1048577,
                    336: 33555456,
                    352: 34604032,
                    368: 1049601,
                    384: 1025,
                    400: 34604033,
                    416: 1049600,
                    432: 1,
                    448: 0,
                    464: 34603008,
                    480: 33554433,
                    496: 1024,
                    264: 1049600,
                    280: 33555457,
                    296: 34603009,
                    312: 1,
                    328: 33554432,
                    344: 1048576,
                    360: 1025,
                    376: 34604032,
                    392: 33554433,
                    408: 34603008,
                    424: 0,
                    440: 34604033,
                    456: 1049601,
                    472: 1024,
                    488: 33555456,
                    504: 1048577,
                  },
                  {
                    0: 134219808,
                    1: 131072,
                    2: 134217728,
                    3: 32,
                    4: 131104,
                    5: 134350880,
                    6: 134350848,
                    7: 2048,
                    8: 134348800,
                    9: 134219776,
                    10: 133120,
                    11: 134348832,
                    12: 2080,
                    13: 0,
                    14: 134217760,
                    15: 133152,
                    2147483648: 2048,
                    2147483649: 134350880,
                    2147483650: 134219808,
                    2147483651: 134217728,
                    2147483652: 134348800,
                    2147483653: 133120,
                    2147483654: 133152,
                    2147483655: 32,
                    2147483656: 134217760,
                    2147483657: 2080,
                    2147483658: 131104,
                    2147483659: 134350848,
                    2147483660: 0,
                    2147483661: 134348832,
                    2147483662: 134219776,
                    2147483663: 131072,
                    16: 133152,
                    17: 134350848,
                    18: 32,
                    19: 2048,
                    20: 134219776,
                    21: 134217760,
                    22: 134348832,
                    23: 131072,
                    24: 0,
                    25: 131104,
                    26: 134348800,
                    27: 134219808,
                    28: 134350880,
                    29: 133120,
                    30: 2080,
                    31: 134217728,
                    2147483664: 131072,
                    2147483665: 2048,
                    2147483666: 134348832,
                    2147483667: 133152,
                    2147483668: 32,
                    2147483669: 134348800,
                    2147483670: 134217728,
                    2147483671: 134219808,
                    2147483672: 134350880,
                    2147483673: 134217760,
                    2147483674: 134219776,
                    2147483675: 0,
                    2147483676: 133120,
                    2147483677: 2080,
                    2147483678: 131104,
                    2147483679: 134350848,
                  },
                ],
                d = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679],
                p = (a.DES = i.extend({
                  _doReset: function () {
                    for (var _ = this._key, g = _.words, h = [], x = 0; x < 56; x++) {
                      var y = c[x] - 1;
                      h[x] = (g[y >>> 5] >>> (31 - (y % 32))) & 1;
                    }
                    for (var C = (this._subKeys = []), A = 0; A < 16; A++) {
                      for (var w = (C[A] = []), D = u[A], x = 0; x < 24; x++)
                        (w[(x / 6) | 0] |= h[(l[x] - 1 + D) % 28] << (31 - (x % 6))),
                          (w[4 + ((x / 6) | 0)] |=
                            h[28 + ((l[x + 24] - 1 + D) % 28)] << (31 - (x % 6)));
                      w[0] = (w[0] << 1) | (w[0] >>> 31);
                      for (var x = 1; x < 7; x++) w[x] = w[x] >>> ((x - 1) * 4 + 3);
                      w[7] = (w[7] << 5) | (w[7] >>> 27);
                    }
                    for (var b = (this._invSubKeys = []), x = 0; x < 16; x++) b[x] = C[15 - x];
                  },
                  encryptBlock: function (_, g) {
                    this._doCryptBlock(_, g, this._subKeys);
                  },
                  decryptBlock: function (_, g) {
                    this._doCryptBlock(_, g, this._invSubKeys);
                  },
                  _doCryptBlock: function (_, g, h) {
                    (this._lBlock = _[g]),
                      (this._rBlock = _[g + 1]),
                      m.call(this, 4, 252645135),
                      m.call(this, 16, 65535),
                      v.call(this, 2, 858993459),
                      v.call(this, 8, 16711935),
                      m.call(this, 1, 1431655765);
                    for (var x = 0; x < 16; x++) {
                      for (
                        var y = h[x], C = this._lBlock, A = this._rBlock, w = 0, D = 0;
                        D < 8;
                        D++
                      )
                        w |= f[D][((A ^ y[D]) & d[D]) >>> 0];
                      (this._lBlock = A), (this._rBlock = C ^ w);
                    }
                    var b = this._lBlock;
                    (this._lBlock = this._rBlock),
                      (this._rBlock = b),
                      m.call(this, 1, 1431655765),
                      v.call(this, 8, 16711935),
                      v.call(this, 2, 858993459),
                      m.call(this, 16, 65535),
                      m.call(this, 4, 252645135),
                      (_[g] = this._lBlock),
                      (_[g + 1] = this._rBlock);
                  },
                  keySize: 64 / 32,
                  ivSize: 64 / 32,
                  blockSize: 64 / 32,
                }));
              function m(_, g) {
                var h = ((this._lBlock >>> _) ^ this._rBlock) & g;
                (this._rBlock ^= h), (this._lBlock ^= h << _);
              }
              function v(_, g) {
                var h = ((this._rBlock >>> _) ^ this._lBlock) & g;
                (this._lBlock ^= h), (this._rBlock ^= h << _);
              }
              r.DES = i._createHelper(p);
              var E = (a.TripleDES = i.extend({
                _doReset: function () {
                  var _ = this._key,
                    g = _.words;
                  if (g.length !== 2 && g.length !== 4 && g.length < 6)
                    throw new Error(
                      'Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.',
                    );
                  var h = g.slice(0, 2),
                    x = g.length < 4 ? g.slice(0, 2) : g.slice(2, 4),
                    y = g.length < 6 ? g.slice(0, 2) : g.slice(4, 6);
                  (this._des1 = p.createEncryptor(o.create(h))),
                    (this._des2 = p.createEncryptor(o.create(x))),
                    (this._des3 = p.createEncryptor(o.create(y)));
                },
                encryptBlock: function (_, g) {
                  this._des1.encryptBlock(_, g),
                    this._des2.decryptBlock(_, g),
                    this._des3.encryptBlock(_, g);
                },
                decryptBlock: function (_, g) {
                  this._des3.decryptBlock(_, g),
                    this._des2.encryptBlock(_, g),
                    this._des1.decryptBlock(_, g);
                },
                keySize: 192 / 32,
                ivSize: 64 / 32,
                blockSize: 64 / 32,
              }));
              r.TripleDES = i._createHelper(E);
            })(),
            n.TripleDES
          );
        });
      })(Ko)),
    Ko.exports
  );
}
var Go = { exports: {} },
  hc;
function em() {
  return (
    hc ||
      ((hc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.StreamCipher,
                i = r.algo,
                a = (i.RC4 = o.extend({
                  _doReset: function () {
                    for (
                      var u = this._key, f = u.words, d = u.sigBytes, p = (this._S = []), m = 0;
                      m < 256;
                      m++
                    )
                      p[m] = m;
                    for (var m = 0, v = 0; m < 256; m++) {
                      var E = m % d,
                        _ = (f[E >>> 2] >>> (24 - (E % 4) * 8)) & 255;
                      v = (v + p[m] + _) % 256;
                      var g = p[m];
                      (p[m] = p[v]), (p[v] = g);
                    }
                    this._i = this._j = 0;
                  },
                  _doProcessBlock: function (u, f) {
                    u[f] ^= c.call(this);
                  },
                  keySize: 256 / 32,
                  ivSize: 0,
                }));
              function c() {
                for (var u = this._S, f = this._i, d = this._j, p = 0, m = 0; m < 4; m++) {
                  (f = (f + 1) % 256), (d = (d + u[f]) % 256);
                  var v = u[f];
                  (u[f] = u[d]), (u[d] = v), (p |= u[(u[f] + u[d]) % 256] << (24 - m * 8));
                }
                return (this._i = f), (this._j = d), p;
              }
              r.RC4 = o._createHelper(a);
              var l = (i.RC4Drop = a.extend({
                cfg: a.cfg.extend({ drop: 192 }),
                _doReset: function () {
                  a._doReset.call(this);
                  for (var u = this.cfg.drop; u > 0; u--) c.call(this);
                },
              }));
              r.RC4Drop = o._createHelper(l);
            })(),
            n.RC4
          );
        });
      })(Go)),
    Go.exports
  );
}
var zo = { exports: {} },
  xc;
function tm() {
  return (
    xc ||
      ((xc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.StreamCipher,
                i = r.algo,
                a = [],
                c = [],
                l = [],
                u = (i.Rabbit = o.extend({
                  _doReset: function () {
                    for (var d = this._key.words, p = this.cfg.iv, m = 0; m < 4; m++)
                      d[m] =
                        (((d[m] << 8) | (d[m] >>> 24)) & 16711935) |
                        (((d[m] << 24) | (d[m] >>> 8)) & 4278255360);
                    var v = (this._X = [
                        d[0],
                        (d[3] << 16) | (d[2] >>> 16),
                        d[1],
                        (d[0] << 16) | (d[3] >>> 16),
                        d[2],
                        (d[1] << 16) | (d[0] >>> 16),
                        d[3],
                        (d[2] << 16) | (d[1] >>> 16),
                      ]),
                      E = (this._C = [
                        (d[2] << 16) | (d[2] >>> 16),
                        (d[0] & 4294901760) | (d[1] & 65535),
                        (d[3] << 16) | (d[3] >>> 16),
                        (d[1] & 4294901760) | (d[2] & 65535),
                        (d[0] << 16) | (d[0] >>> 16),
                        (d[2] & 4294901760) | (d[3] & 65535),
                        (d[1] << 16) | (d[1] >>> 16),
                        (d[3] & 4294901760) | (d[0] & 65535),
                      ]);
                    this._b = 0;
                    for (var m = 0; m < 4; m++) f.call(this);
                    for (var m = 0; m < 8; m++) E[m] ^= v[(m + 4) & 7];
                    if (p) {
                      var _ = p.words,
                        g = _[0],
                        h = _[1],
                        x =
                          (((g << 8) | (g >>> 24)) & 16711935) |
                          (((g << 24) | (g >>> 8)) & 4278255360),
                        y =
                          (((h << 8) | (h >>> 24)) & 16711935) |
                          (((h << 24) | (h >>> 8)) & 4278255360),
                        C = (x >>> 16) | (y & 4294901760),
                        A = (y << 16) | (x & 65535);
                      (E[0] ^= x),
                        (E[1] ^= C),
                        (E[2] ^= y),
                        (E[3] ^= A),
                        (E[4] ^= x),
                        (E[5] ^= C),
                        (E[6] ^= y),
                        (E[7] ^= A);
                      for (var m = 0; m < 4; m++) f.call(this);
                    }
                  },
                  _doProcessBlock: function (d, p) {
                    var m = this._X;
                    f.call(this),
                      (a[0] = m[0] ^ (m[5] >>> 16) ^ (m[3] << 16)),
                      (a[1] = m[2] ^ (m[7] >>> 16) ^ (m[5] << 16)),
                      (a[2] = m[4] ^ (m[1] >>> 16) ^ (m[7] << 16)),
                      (a[3] = m[6] ^ (m[3] >>> 16) ^ (m[1] << 16));
                    for (var v = 0; v < 4; v++)
                      (a[v] =
                        (((a[v] << 8) | (a[v] >>> 24)) & 16711935) |
                        (((a[v] << 24) | (a[v] >>> 8)) & 4278255360)),
                        (d[p + v] ^= a[v]);
                  },
                  blockSize: 128 / 32,
                  ivSize: 64 / 32,
                }));
              function f() {
                for (var d = this._X, p = this._C, m = 0; m < 8; m++) c[m] = p[m];
                (p[0] = (p[0] + 1295307597 + this._b) | 0),
                  (p[1] = (p[1] + 3545052371 + (p[0] >>> 0 < c[0] >>> 0 ? 1 : 0)) | 0),
                  (p[2] = (p[2] + 886263092 + (p[1] >>> 0 < c[1] >>> 0 ? 1 : 0)) | 0),
                  (p[3] = (p[3] + 1295307597 + (p[2] >>> 0 < c[2] >>> 0 ? 1 : 0)) | 0),
                  (p[4] = (p[4] + 3545052371 + (p[3] >>> 0 < c[3] >>> 0 ? 1 : 0)) | 0),
                  (p[5] = (p[5] + 886263092 + (p[4] >>> 0 < c[4] >>> 0 ? 1 : 0)) | 0),
                  (p[6] = (p[6] + 1295307597 + (p[5] >>> 0 < c[5] >>> 0 ? 1 : 0)) | 0),
                  (p[7] = (p[7] + 3545052371 + (p[6] >>> 0 < c[6] >>> 0 ? 1 : 0)) | 0),
                  (this._b = p[7] >>> 0 < c[7] >>> 0 ? 1 : 0);
                for (var m = 0; m < 8; m++) {
                  var v = d[m] + p[m],
                    E = v & 65535,
                    _ = v >>> 16,
                    g = ((((E * E) >>> 17) + E * _) >>> 15) + _ * _,
                    h = (((v & 4294901760) * v) | 0) + (((v & 65535) * v) | 0);
                  l[m] = g ^ h;
                }
                (d[0] =
                  (l[0] + ((l[7] << 16) | (l[7] >>> 16)) + ((l[6] << 16) | (l[6] >>> 16))) | 0),
                  (d[1] = (l[1] + ((l[0] << 8) | (l[0] >>> 24)) + l[7]) | 0),
                  (d[2] =
                    (l[2] + ((l[1] << 16) | (l[1] >>> 16)) + ((l[0] << 16) | (l[0] >>> 16))) | 0),
                  (d[3] = (l[3] + ((l[2] << 8) | (l[2] >>> 24)) + l[1]) | 0),
                  (d[4] =
                    (l[4] + ((l[3] << 16) | (l[3] >>> 16)) + ((l[2] << 16) | (l[2] >>> 16))) | 0),
                  (d[5] = (l[5] + ((l[4] << 8) | (l[4] >>> 24)) + l[3]) | 0),
                  (d[6] =
                    (l[6] + ((l[5] << 16) | (l[5] >>> 16)) + ((l[4] << 16) | (l[4] >>> 16))) | 0),
                  (d[7] = (l[7] + ((l[6] << 8) | (l[6] >>> 24)) + l[5]) | 0);
              }
              r.Rabbit = o._createHelper(u);
            })(),
            n.Rabbit
          );
        });
      })(zo)),
    zo.exports
  );
}
var Yo = { exports: {} },
  pc;
function nm() {
  return (
    pc ||
      ((pc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.StreamCipher,
                i = r.algo,
                a = [],
                c = [],
                l = [],
                u = (i.RabbitLegacy = o.extend({
                  _doReset: function () {
                    var d = this._key.words,
                      p = this.cfg.iv,
                      m = (this._X = [
                        d[0],
                        (d[3] << 16) | (d[2] >>> 16),
                        d[1],
                        (d[0] << 16) | (d[3] >>> 16),
                        d[2],
                        (d[1] << 16) | (d[0] >>> 16),
                        d[3],
                        (d[2] << 16) | (d[1] >>> 16),
                      ]),
                      v = (this._C = [
                        (d[2] << 16) | (d[2] >>> 16),
                        (d[0] & 4294901760) | (d[1] & 65535),
                        (d[3] << 16) | (d[3] >>> 16),
                        (d[1] & 4294901760) | (d[2] & 65535),
                        (d[0] << 16) | (d[0] >>> 16),
                        (d[2] & 4294901760) | (d[3] & 65535),
                        (d[1] << 16) | (d[1] >>> 16),
                        (d[3] & 4294901760) | (d[0] & 65535),
                      ]);
                    this._b = 0;
                    for (var E = 0; E < 4; E++) f.call(this);
                    for (var E = 0; E < 8; E++) v[E] ^= m[(E + 4) & 7];
                    if (p) {
                      var _ = p.words,
                        g = _[0],
                        h = _[1],
                        x =
                          (((g << 8) | (g >>> 24)) & 16711935) |
                          (((g << 24) | (g >>> 8)) & 4278255360),
                        y =
                          (((h << 8) | (h >>> 24)) & 16711935) |
                          (((h << 24) | (h >>> 8)) & 4278255360),
                        C = (x >>> 16) | (y & 4294901760),
                        A = (y << 16) | (x & 65535);
                      (v[0] ^= x),
                        (v[1] ^= C),
                        (v[2] ^= y),
                        (v[3] ^= A),
                        (v[4] ^= x),
                        (v[5] ^= C),
                        (v[6] ^= y),
                        (v[7] ^= A);
                      for (var E = 0; E < 4; E++) f.call(this);
                    }
                  },
                  _doProcessBlock: function (d, p) {
                    var m = this._X;
                    f.call(this),
                      (a[0] = m[0] ^ (m[5] >>> 16) ^ (m[3] << 16)),
                      (a[1] = m[2] ^ (m[7] >>> 16) ^ (m[5] << 16)),
                      (a[2] = m[4] ^ (m[1] >>> 16) ^ (m[7] << 16)),
                      (a[3] = m[6] ^ (m[3] >>> 16) ^ (m[1] << 16));
                    for (var v = 0; v < 4; v++)
                      (a[v] =
                        (((a[v] << 8) | (a[v] >>> 24)) & 16711935) |
                        (((a[v] << 24) | (a[v] >>> 8)) & 4278255360)),
                        (d[p + v] ^= a[v]);
                  },
                  blockSize: 128 / 32,
                  ivSize: 64 / 32,
                }));
              function f() {
                for (var d = this._X, p = this._C, m = 0; m < 8; m++) c[m] = p[m];
                (p[0] = (p[0] + 1295307597 + this._b) | 0),
                  (p[1] = (p[1] + 3545052371 + (p[0] >>> 0 < c[0] >>> 0 ? 1 : 0)) | 0),
                  (p[2] = (p[2] + 886263092 + (p[1] >>> 0 < c[1] >>> 0 ? 1 : 0)) | 0),
                  (p[3] = (p[3] + 1295307597 + (p[2] >>> 0 < c[2] >>> 0 ? 1 : 0)) | 0),
                  (p[4] = (p[4] + 3545052371 + (p[3] >>> 0 < c[3] >>> 0 ? 1 : 0)) | 0),
                  (p[5] = (p[5] + 886263092 + (p[4] >>> 0 < c[4] >>> 0 ? 1 : 0)) | 0),
                  (p[6] = (p[6] + 1295307597 + (p[5] >>> 0 < c[5] >>> 0 ? 1 : 0)) | 0),
                  (p[7] = (p[7] + 3545052371 + (p[6] >>> 0 < c[6] >>> 0 ? 1 : 0)) | 0),
                  (this._b = p[7] >>> 0 < c[7] >>> 0 ? 1 : 0);
                for (var m = 0; m < 8; m++) {
                  var v = d[m] + p[m],
                    E = v & 65535,
                    _ = v >>> 16,
                    g = ((((E * E) >>> 17) + E * _) >>> 15) + _ * _,
                    h = (((v & 4294901760) * v) | 0) + (((v & 65535) * v) | 0);
                  l[m] = g ^ h;
                }
                (d[0] =
                  (l[0] + ((l[7] << 16) | (l[7] >>> 16)) + ((l[6] << 16) | (l[6] >>> 16))) | 0),
                  (d[1] = (l[1] + ((l[0] << 8) | (l[0] >>> 24)) + l[7]) | 0),
                  (d[2] =
                    (l[2] + ((l[1] << 16) | (l[1] >>> 16)) + ((l[0] << 16) | (l[0] >>> 16))) | 0),
                  (d[3] = (l[3] + ((l[2] << 8) | (l[2] >>> 24)) + l[1]) | 0),
                  (d[4] =
                    (l[4] + ((l[3] << 16) | (l[3] >>> 16)) + ((l[2] << 16) | (l[2] >>> 16))) | 0),
                  (d[5] = (l[5] + ((l[4] << 8) | (l[4] >>> 24)) + l[3]) | 0),
                  (d[6] =
                    (l[6] + ((l[5] << 16) | (l[5] >>> 16)) + ((l[4] << 16) | (l[4] >>> 16))) | 0),
                  (d[7] = (l[7] + ((l[6] << 8) | (l[6] >>> 24)) + l[5]) | 0);
              }
              r.RabbitLegacy = o._createHelper(u);
            })(),
            n.RabbitLegacy
          );
        });
      })(Yo)),
    Yo.exports
  );
}
var Xo = { exports: {} },
  gc;
function rm() {
  return (
    gc ||
      ((gc = 1),
      (function (e, t) {
        (function (n, r, s) {
          e.exports = r(me(), Pn(), Sn(), xn(), Ke());
        })(ue, function (n) {
          return (
            (function () {
              var r = n,
                s = r.lib,
                o = s.BlockCipher,
                i = r.algo;
              const a = 16,
                c = [
                  608135816, 2242054355, 320440878, 57701188, 2752067618, 698298832, 137296536,
                  3964562569, 1160258022, 953160567, 3193202383, 887688300, 3232508343, 3380367581,
                  1065670069, 3041331479, 2450970073, 2306472731,
                ],
                l = [
                  [
                    3509652390, 2564797868, 805139163, 3491422135, 3101798381, 1780907670,
                    3128725573, 4046225305, 614570311, 3012652279, 134345442, 2240740374,
                    1667834072, 1901547113, 2757295779, 4103290238, 227898511, 1921955416,
                    1904987480, 2182433518, 2069144605, 3260701109, 2620446009, 720527379,
                    3318853667, 677414384, 3393288472, 3101374703, 2390351024, 1614419982,
                    1822297739, 2954791486, 3608508353, 3174124327, 2024746970, 1432378464,
                    3864339955, 2857741204, 1464375394, 1676153920, 1439316330, 715854006,
                    3033291828, 289532110, 2706671279, 2087905683, 3018724369, 1668267050,
                    732546397, 1947742710, 3462151702, 2609353502, 2950085171, 1814351708,
                    2050118529, 680887927, 999245976, 1800124847, 3300911131, 1713906067,
                    1641548236, 4213287313, 1216130144, 1575780402, 4018429277, 3917837745,
                    3693486850, 3949271944, 596196993, 3549867205, 258830323, 2213823033, 772490370,
                    2760122372, 1774776394, 2652871518, 566650946, 4142492826, 1728879713,
                    2882767088, 1783734482, 3629395816, 2517608232, 2874225571, 1861159788,
                    326777828, 3124490320, 2130389656, 2716951837, 967770486, 1724537150,
                    2185432712, 2364442137, 1164943284, 2105845187, 998989502, 3765401048,
                    2244026483, 1075463327, 1455516326, 1322494562, 910128902, 469688178,
                    1117454909, 936433444, 3490320968, 3675253459, 1240580251, 122909385,
                    2157517691, 634681816, 4142456567, 3825094682, 3061402683, 2540495037, 79693498,
                    3249098678, 1084186820, 1583128258, 426386531, 1761308591, 1047286709,
                    322548459, 995290223, 1845252383, 2603652396, 3431023940, 2942221577,
                    3202600964, 3727903485, 1712269319, 422464435, 3234572375, 1170764815,
                    3523960633, 3117677531, 1434042557, 442511882, 3600875718, 1076654713,
                    1738483198, 4213154764, 2393238008, 3677496056, 1014306527, 4251020053,
                    793779912, 2902807211, 842905082, 4246964064, 1395751752, 1040244610,
                    2656851899, 3396308128, 445077038, 3742853595, 3577915638, 679411651,
                    2892444358, 2354009459, 1767581616, 3150600392, 3791627101, 3102740896,
                    284835224, 4246832056, 1258075500, 768725851, 2589189241, 3069724005,
                    3532540348, 1274779536, 3789419226, 2764799539, 1660621633, 3471099624,
                    4011903706, 913787905, 3497959166, 737222580, 2514213453, 2928710040,
                    3937242737, 1804850592, 3499020752, 2949064160, 2386320175, 2390070455,
                    2415321851, 4061277028, 2290661394, 2416832540, 1336762016, 1754252060,
                    3520065937, 3014181293, 791618072, 3188594551, 3933548030, 2332172193,
                    3852520463, 3043980520, 413987798, 3465142937, 3030929376, 4245938359,
                    2093235073, 3534596313, 375366246, 2157278981, 2479649556, 555357303,
                    3870105701, 2008414854, 3344188149, 4221384143, 3956125452, 2067696032,
                    3594591187, 2921233993, 2428461, 544322398, 577241275, 1471733935, 610547355,
                    4027169054, 1432588573, 1507829418, 2025931657, 3646575487, 545086370, 48609733,
                    2200306550, 1653985193, 298326376, 1316178497, 3007786442, 2064951626,
                    458293330, 2589141269, 3591329599, 3164325604, 727753846, 2179363840, 146436021,
                    1461446943, 4069977195, 705550613, 3059967265, 3887724982, 4281599278,
                    3313849956, 1404054877, 2845806497, 146425753, 1854211946,
                  ],
                  [
                    1266315497, 3048417604, 3681880366, 3289982499, 290971e4, 1235738493,
                    2632868024, 2414719590, 3970600049, 1771706367, 1449415276, 3266420449,
                    422970021, 1963543593, 2690192192, 3826793022, 1062508698, 1531092325,
                    1804592342, 2583117782, 2714934279, 4024971509, 1294809318, 4028980673,
                    1289560198, 2221992742, 1669523910, 35572830, 157838143, 1052438473, 1016535060,
                    1802137761, 1753167236, 1386275462, 3080475397, 2857371447, 1040679964,
                    2145300060, 2390574316, 1461121720, 2956646967, 4031777805, 4028374788,
                    33600511, 2920084762, 1018524850, 629373528, 3691585981, 3515945977, 2091462646,
                    2486323059, 586499841, 988145025, 935516892, 3367335476, 2599673255, 2839830854,
                    265290510, 3972581182, 2759138881, 3795373465, 1005194799, 847297441, 406762289,
                    1314163512, 1332590856, 1866599683, 4127851711, 750260880, 613907577,
                    1450815602, 3165620655, 3734664991, 3650291728, 3012275730, 3704569646,
                    1427272223, 778793252, 1343938022, 2676280711, 2052605720, 1946737175,
                    3164576444, 3914038668, 3967478842, 3682934266, 1661551462, 3294938066,
                    4011595847, 840292616, 3712170807, 616741398, 312560963, 711312465, 1351876610,
                    322626781, 1910503582, 271666773, 2175563734, 1594956187, 70604529, 3617834859,
                    1007753275, 1495573769, 4069517037, 2549218298, 2663038764, 504708206,
                    2263041392, 3941167025, 2249088522, 1514023603, 1998579484, 1312622330,
                    694541497, 2582060303, 2151582166, 1382467621, 776784248, 2618340202,
                    3323268794, 2497899128, 2784771155, 503983604, 4076293799, 907881277, 423175695,
                    432175456, 1378068232, 4145222326, 3954048622, 3938656102, 3820766613,
                    2793130115, 2977904593, 26017576, 3274890735, 3194772133, 1700274565,
                    1756076034, 4006520079, 3677328699, 720338349, 1533947780, 354530856, 688349552,
                    3973924725, 1637815568, 332179504, 3949051286, 53804574, 2852348879, 3044236432,
                    1282449977, 3583942155, 3416972820, 4006381244, 1617046695, 2628476075,
                    3002303598, 1686838959, 431878346, 2686675385, 1700445008, 1080580658,
                    1009431731, 832498133, 3223435511, 2605976345, 2271191193, 2516031870,
                    1648197032, 4164389018, 2548247927, 300782431, 375919233, 238389289, 3353747414,
                    2531188641, 2019080857, 1475708069, 455242339, 2609103871, 448939670,
                    3451063019, 1395535956, 2413381860, 1841049896, 1491858159, 885456874,
                    4264095073, 4001119347, 1565136089, 3898914787, 1108368660, 540939232,
                    1173283510, 2745871338, 3681308437, 4207628240, 3343053890, 4016749493,
                    1699691293, 1103962373, 3625875870, 2256883143, 3830138730, 1031889488,
                    3479347698, 1535977030, 4236805024, 3251091107, 2132092099, 1774941330,
                    1199868427, 1452454533, 157007616, 2904115357, 342012276, 595725824, 1480756522,
                    206960106, 497939518, 591360097, 863170706, 2375253569, 3596610801, 1814182875,
                    2094937945, 3421402208, 1082520231, 3463918190, 2785509508, 435703966,
                    3908032597, 1641649973, 2842273706, 3305899714, 1510255612, 2148256476,
                    2655287854, 3276092548, 4258621189, 236887753, 3681803219, 274041037,
                    1734335097, 3815195456, 3317970021, 1899903192, 1026095262, 4050517792,
                    356393447, 2410691914, 3873677099, 3682840055,
                  ],
                  [
                    3913112168, 2491498743, 4132185628, 2489919796, 1091903735, 1979897079,
                    3170134830, 3567386728, 3557303409, 857797738, 1136121015, 1342202287,
                    507115054, 2535736646, 337727348, 3213592640, 1301675037, 2528481711,
                    1895095763, 1721773893, 3216771564, 62756741, 2142006736, 835421444, 2531993523,
                    1442658625, 3659876326, 2882144922, 676362277, 1392781812, 170690266,
                    3921047035, 1759253602, 3611846912, 1745797284, 664899054, 1329594018,
                    3901205900, 3045908486, 2062866102, 2865634940, 3543621612, 3464012697,
                    1080764994, 553557557, 3656615353, 3996768171, 991055499, 499776247, 1265440854,
                    648242737, 3940784050, 980351604, 3713745714, 1749149687, 3396870395,
                    4211799374, 3640570775, 1161844396, 3125318951, 1431517754, 545492359,
                    4268468663, 3499529547, 1437099964, 2702547544, 3433638243, 2581715763,
                    2787789398, 1060185593, 1593081372, 2418618748, 4260947970, 69676912,
                    2159744348, 86519011, 2512459080, 3838209314, 1220612927, 3339683548, 133810670,
                    1090789135, 1078426020, 1569222167, 845107691, 3583754449, 4072456591,
                    1091646820, 628848692, 1613405280, 3757631651, 526609435, 236106946, 48312990,
                    2942717905, 3402727701, 1797494240, 859738849, 992217954, 4005476642,
                    2243076622, 3870952857, 3732016268, 765654824, 3490871365, 2511836413,
                    1685915746, 3888969200, 1414112111, 2273134842, 3281911079, 4080962846,
                    172450625, 2569994100, 980381355, 4109958455, 2819808352, 2716589560,
                    2568741196, 3681446669, 3329971472, 1835478071, 660984891, 3704678404,
                    4045999559, 3422617507, 3040415634, 1762651403, 1719377915, 3470491036,
                    2693910283, 3642056355, 3138596744, 1364962596, 2073328063, 1983633131,
                    926494387, 3423689081, 2150032023, 4096667949, 1749200295, 3328846651,
                    309677260, 2016342300, 1779581495, 3079819751, 111262694, 1274766160, 443224088,
                    298511866, 1025883608, 3806446537, 1145181785, 168956806, 3641502830,
                    3584813610, 1689216846, 3666258015, 3200248200, 1692713982, 2646376535,
                    4042768518, 1618508792, 1610833997, 3523052358, 4130873264, 2001055236,
                    3610705100, 2202168115, 4028541809, 2961195399, 1006657119, 2006996926,
                    3186142756, 1430667929, 3210227297, 1314452623, 4074634658, 4101304120,
                    2273951170, 1399257539, 3367210612, 3027628629, 1190975929, 2062231137,
                    2333990788, 2221543033, 2438960610, 1181637006, 548689776, 2362791313,
                    3372408396, 3104550113, 3145860560, 296247880, 1970579870, 3078560182,
                    3769228297, 1714227617, 3291629107, 3898220290, 166772364, 1251581989,
                    493813264, 448347421, 195405023, 2709975567, 677966185, 3703036547, 1463355134,
                    2715995803, 1338867538, 1343315457, 2802222074, 2684532164, 233230375,
                    2599980071, 2000651841, 3277868038, 1638401717, 4028070440, 3237316320, 6314154,
                    819756386, 300326615, 590932579, 1405279636, 3267499572, 3150704214, 2428286686,
                    3959192993, 3461946742, 1862657033, 1266418056, 963775037, 2089974820,
                    2263052895, 1917689273, 448879540, 3550394620, 3981727096, 150775221,
                    3627908307, 1303187396, 508620638, 2975983352, 2726630617, 1817252668,
                    1876281319, 1457606340, 908771278, 3720792119, 3617206836, 2455994898,
                    1729034894, 1080033504,
                  ],
                  [
                    976866871, 3556439503, 2881648439, 1522871579, 1555064734, 1336096578,
                    3548522304, 2579274686, 3574697629, 3205460757, 3593280638, 3338716283,
                    3079412587, 564236357, 2993598910, 1781952180, 1464380207, 3163844217,
                    3332601554, 1699332808, 1393555694, 1183702653, 3581086237, 1288719814,
                    691649499, 2847557200, 2895455976, 3193889540, 2717570544, 1781354906,
                    1676643554, 2592534050, 3230253752, 1126444790, 2770207658, 2633158820,
                    2210423226, 2615765581, 2414155088, 3127139286, 673620729, 2805611233,
                    1269405062, 4015350505, 3341807571, 4149409754, 1057255273, 2012875353,
                    2162469141, 2276492801, 2601117357, 993977747, 3918593370, 2654263191,
                    753973209, 36408145, 2530585658, 25011837, 3520020182, 2088578344, 530523599,
                    2918365339, 1524020338, 1518925132, 3760827505, 3759777254, 1202760957,
                    3985898139, 3906192525, 674977740, 4174734889, 2031300136, 2019492241,
                    3983892565, 4153806404, 3822280332, 352677332, 2297720250, 60907813, 90501309,
                    3286998549, 1016092578, 2535922412, 2839152426, 457141659, 509813237,
                    4120667899, 652014361, 1966332200, 2975202805, 55981186, 2327461051, 676427537,
                    3255491064, 2882294119, 3433927263, 1307055953, 942726286, 933058658,
                    2468411793, 3933900994, 4215176142, 1361170020, 2001714738, 2830558078,
                    3274259782, 1222529897, 1679025792, 2729314320, 3714953764, 1770335741,
                    151462246, 3013232138, 1682292957, 1483529935, 471910574, 1539241949, 458788160,
                    3436315007, 1807016891, 3718408830, 978976581, 1043663428, 3165965781,
                    1927990952, 4200891579, 2372276910, 3208408903, 3533431907, 1412390302,
                    2931980059, 4132332400, 1947078029, 3881505623, 4168226417, 2941484381,
                    1077988104, 1320477388, 886195818, 18198404, 3786409e3, 2509781533, 112762804,
                    3463356488, 1866414978, 891333506, 18488651, 661792760, 1628790961, 3885187036,
                    3141171499, 876946877, 2693282273, 1372485963, 791857591, 2686433993,
                    3759982718, 3167212022, 3472953795, 2716379847, 445679433, 3561995674,
                    3504004811, 3574258232, 54117162, 3331405415, 2381918588, 3769707343,
                    4154350007, 1140177722, 4074052095, 668550556, 3214352940, 367459370, 261225585,
                    2610173221, 4209349473, 3468074219, 3265815641, 314222801, 3066103646,
                    3808782860, 282218597, 3406013506, 3773591054, 379116347, 1285071038, 846784868,
                    2669647154, 3771962079, 3550491691, 2305946142, 453669953, 1268987020,
                    3317592352, 3279303384, 3744833421, 2610507566, 3859509063, 266596637,
                    3847019092, 517658769, 3462560207, 3443424879, 370717030, 4247526661,
                    2224018117, 4143653529, 4112773975, 2788324899, 2477274417, 1456262402,
                    2901442914, 1517677493, 1846949527, 2295493580, 3734397586, 2176403920,
                    1280348187, 1908823572, 3871786941, 846861322, 1172426758, 3287448474,
                    3383383037, 1655181056, 3139813346, 901632758, 1897031941, 2986607138,
                    3066810236, 3447102507, 1393639104, 373351379, 950779232, 625454576, 3124240540,
                    4148612726, 2007998917, 544563296, 2244738638, 2330496472, 2058025392,
                    1291430526, 424198748, 50039436, 29584100, 3605783033, 2429876329, 2791104160,
                    1057563949, 3255363231, 3075367218, 3463963227, 1469046755, 985887462,
                  ],
                ];
              var u = { pbox: [], sbox: [] };
              function f(E, _) {
                let g = (_ >> 24) & 255,
                  h = (_ >> 16) & 255,
                  x = (_ >> 8) & 255,
                  y = _ & 255,
                  C = E.sbox[0][g] + E.sbox[1][h];
                return (C = C ^ E.sbox[2][x]), (C = C + E.sbox[3][y]), C;
              }
              function d(E, _, g) {
                let h = _,
                  x = g,
                  y;
                for (let C = 0; C < a; ++C)
                  (h = h ^ E.pbox[C]), (x = f(E, h) ^ x), (y = h), (h = x), (x = y);
                return (
                  (y = h),
                  (h = x),
                  (x = y),
                  (x = x ^ E.pbox[a]),
                  (h = h ^ E.pbox[a + 1]),
                  { left: h, right: x }
                );
              }
              function p(E, _, g) {
                let h = _,
                  x = g,
                  y;
                for (let C = a + 1; C > 1; --C)
                  (h = h ^ E.pbox[C]), (x = f(E, h) ^ x), (y = h), (h = x), (x = y);
                return (
                  (y = h),
                  (h = x),
                  (x = y),
                  (x = x ^ E.pbox[1]),
                  (h = h ^ E.pbox[0]),
                  { left: h, right: x }
                );
              }
              function m(E, _, g) {
                for (let A = 0; A < 4; A++) {
                  E.sbox[A] = [];
                  for (let w = 0; w < 256; w++) E.sbox[A][w] = l[A][w];
                }
                let h = 0;
                for (let A = 0; A < a + 2; A++) (E.pbox[A] = c[A] ^ _[h]), h++, h >= g && (h = 0);
                let x = 0,
                  y = 0,
                  C = 0;
                for (let A = 0; A < a + 2; A += 2)
                  (C = d(E, x, y)),
                    (x = C.left),
                    (y = C.right),
                    (E.pbox[A] = x),
                    (E.pbox[A + 1] = y);
                for (let A = 0; A < 4; A++)
                  for (let w = 0; w < 256; w += 2)
                    (C = d(E, x, y)),
                      (x = C.left),
                      (y = C.right),
                      (E.sbox[A][w] = x),
                      (E.sbox[A][w + 1] = y);
                return !0;
              }
              var v = (i.Blowfish = o.extend({
                _doReset: function () {
                  if (this._keyPriorReset !== this._key) {
                    var E = (this._keyPriorReset = this._key),
                      _ = E.words,
                      g = E.sigBytes / 4;
                    m(u, _, g);
                  }
                },
                encryptBlock: function (E, _) {
                  var g = d(u, E[_], E[_ + 1]);
                  (E[_] = g.left), (E[_ + 1] = g.right);
                },
                decryptBlock: function (E, _) {
                  var g = p(u, E[_], E[_ + 1]);
                  (E[_] = g.left), (E[_ + 1] = g.right);
                },
                blockSize: 64 / 32,
                keySize: 128 / 32,
                ivSize: 64 / 32,
              }));
              r.Blowfish = o._createHelper(v);
            })(),
            n.Blowfish
          );
        });
      })(Xo)),
    Xo.exports
  );
}
(function (e, t) {
  (function (n, r, s) {
    e.exports = r(
      me(),
      Gs(),
      kg(),
      Og(),
      Pn(),
      Lg(),
      Sn(),
      of(),
      ua(),
      Ng(),
      af(),
      Ig(),
      Mg(),
      Hg(),
      fa(),
      Ug(),
      xn(),
      Ke(),
      $g(),
      Vg(),
      Wg(),
      qg(),
      jg(),
      Kg(),
      Gg(),
      zg(),
      Yg(),
      Xg(),
      Qg(),
      Jg(),
      Zg(),
      em(),
      tm(),
      nm(),
      rm(),
    );
  })(ue, function (n) {
    return n;
  });
})(sf);
var sm = sf.exports;
const om = Fg(sm),
  mc = rf('SDK_API', {
    state: () => ({
      _config: {},
      payWayData: null,
      payItemData: null,
      couponsData: null,
      orderno: null,
      payUrl: null,
    }),
    getters: {
      config() {
        return this._config;
      },
    },
    actions: {
      setConfig(e) {
        this._config = e;
      },
      async requestPayIP() {
        let e = it();
        try {
          const n = await (await fetch('https://api.ipify.org?format=json')).json();
          e.setPayIP(n.ip);
        } catch (t) {
          e.setPayIP(''), console.log('[requestPayIP] Error:', t);
        }
      },
      async requestOAuthParams() {
        return new Promise((e, t) => {
          let n = it();
          const r = {},
            s = `${this.config.gameurl}/sdk/user/oauth_param`;
          this._sendPostRequest(s, r)
            .then((o) => {
              const i = atob(o),
                a = JSON.parse(i);
              (a.msg = we.decodeUnicode(a.msg)),
                console.log('[api]<<<<< ', s, a),
                a.code === 200 ? (n.setDynaConfig(a.data), e(a)) : t(new Error(a.msg));
            })
            .catch((o) => {
              console.log('登录失败'), t(o);
            });
        });
      },
      async requestLogin(e) {
        return new Promise((t, n) => {
          let r = it(),
            { account: s, password: o } = e;
          const i = { account: s, password: o },
            a = `${this.config.gameurl}/sdk/User/user_login`;
          this._sendPostRequest(a, i)
            .then((c) => {
              const l = atob(c),
                u = JSON.parse(l);
              (u.msg = we.decodeUnicode(u.msg)),
                console.log('[api]<<<<< ', a, u),
                u.code === 200
                  ? (r.saveSecret(s, o),
                    console.log('登录成功'),
                    t(u),
                    Bs().emit('internal', { type: 'afterLogin', data: u }))
                  : (console.log('登录失败'), n(new Error(u.msg)));
            })
            .catch((c) => {
              console.log('登录失败'), n(c);
            });
        });
      },
      async requestLogout(e) {
        let t = it();
        return (
          this.requestOfflineAnnounce(),
          new Promise((n, r) => {
            t.setAutoLogin(!0), e.clear && t.clearSecret(), n({});
          })
        );
      },
      async requestRegister(e) {
        return new Promise((t, n) => {
          let r = it(),
            { account: s, password: o, confirmPassword: i } = e;
          const a = {
              promote_account: '自然注册',
              account: s,
              password: o,
              repassword: i,
              type: '1',
            },
            c = `${this.config.gameurl}/sdk/User/register`;
          this._sendPostRequest(c, a)
            .then((l) => {
              const u = atob(l),
                f = JSON.parse(u);
              (f.msg = we.decodeUnicode(f.msg)),
                console.log('[api]<<<<< ', c, f),
                f.code === 200
                  ? (r.saveSecret(s, o),
                    console.log('注册成功'),
                    t(f),
                    Bs().emit('internal', { type: 'afterLogin', data: f }))
                  : (console.log('注册失败'), n(new Error(f.msg)));
            })
            .catch((l) => {
              console.log('注册失败'), n(l);
            });
        });
      },
      async requestCenterUserInfo() {
        return new Promise((e, t) => {
          const n = `${this.config.gameurl}/sdk/center/getUserInfo`;
          this._sendPostRequest(n, {})
            .then((r) => {
              const s = atob(r),
                o = JSON.parse(s);
              (o.msg = we.decodeUnicode(o.msg)),
                console.log('[api]<<<<< ', n, o),
                o.code === 200 ? e(o) : t(new Error(o.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      async requestChangePass(e) {
        return new Promise((t, n) => {
          let r = it(),
            { oldPass: s, newPass: o } = e;
          const i = { code_type: 'pwd', old_password: s, password: o },
            a = `${this.config.gameurl}/sdk/User/user_update_data`;
          this._sendPostRequest(a, i)
            .then((c) => {
              const l = atob(c),
                u = JSON.parse(l);
              (u.msg = we.decodeUnicode(u.msg)),
                console.log('[api]<<<<< ', a, u),
                u.code === 200 ? (r.saveSecret(r.account, o), t(u)) : n(new Error(u.msg));
            })
            .catch((c) => {
              n(c);
            });
        });
      },
      async requestPayWay() {
        return new Promise((e, t) => {
          it();
          const n = {},
            r = `${this.config.gameurl}/sdk/pay/get_pay_way`;
          this._sendPostRequest(r, n)
            .then((s) => {
              const o = atob(s),
                i = JSON.parse(o);
              (i.msg = we.decodeUnicode(i.msg)),
                console.log('[api]<<<<< ', r, i),
                i.code === 200
                  ? ((this.payWayData = i.data
                      .sort((a, c) => c.sort - a.sort)
                      .map((a) => {
                        const c = {
                          name: a.name,
                          code: a.code,
                          state: a.state,
                          icon: a.icon,
                          balance: 0,
                          ptb_balance: 0,
                          gift_balance: 0,
                        };
                        return (
                          a.code == 'ptb' &&
                            ((c.balance = a.balance != null ? parseFloat(a.balance) : 0),
                            (c.ptb_balance = a.ptb_balance != null ? parseFloat(a.ptb_balance) : 0),
                            (c.gift_balance =
                              a.gift_balance != null ? parseFloat(a.gift_balance) : 0)),
                          c
                        );
                      })),
                    console.log('拉取支付供应商列表成功', this.payWayData),
                    e(i))
                  : (console.log('拉取支付供应商列表失败'), t(new Error(i.msg)));
            })
            .catch((s) => {
              console.log('拉取支付供应商列表失败'), t(s);
            });
        });
      },
      async requestPayItem() {
        return new Promise((e, t) => {
          const n = {},
            r = `${this.config.gameurl}/sdk/pay/get_ptb_pay_config`;
          this._sendPostRequest(r, n)
            .then((s) => {
              const o = atob(s),
                i = JSON.parse(o);
              (i.msg = we.decodeUnicode(i.msg)),
                console.log('[api]<<<<< ', i),
                i.code === 200
                  ? ((this.payItemData = i.data),
                    console.log('拉取支付项目列表成功', this.payItemData),
                    e(i))
                  : (console.log('拉取支付项目列表失败'), t(new Error(i.msg)));
            })
            .catch((s) => {
              console.log('拉取支付项目列表失败'), t(s);
            });
        });
      },
      async requestCouponList() {
        return new Promise((e, t) => {
          const r = { user_id: it().userId },
            s = `${this.config.gameurl}/sdk/pay/get_coupon`;
          this._sendPostRequest(s, r)
            .then((o) => {
              const i = atob(o),
                a = JSON.parse(i);
              (a.msg = we.decodeUnicode(a.msg)),
                console.log('[api]<<<<< ', s, a),
                a.code === 200
                  ? ((this.couponsData = a.data),
                    console.log('拉取优惠券列表成功', this.couponsData),
                    e(a))
                  : (console.log('拉取优惠券列表失败'), t(new Error(a.msg)));
            })
            .catch((o) => {
              console.log('拉取优惠券列表失败'), t(o);
            });
        });
      },
      async requestH5Pay(e) {
        return new Promise((t, n) => {
          let r = it();
          const s = r.token,
            o = r.userId,
            i = r.account;
          let { body: a, price: c, title: l, order_sn: u, pay_way: f, code: d, coupon_id: p } = e;
          const m = {
            device_name: this._config.device_name,
            equipment_num: '',
            game_id: this._config.gameid,
            server_id: this._config.gameid,
            game_name: this._config.gamename,
            server_name: this._config.gamename,
            promote_id: this._config.promote_id,
            sdk_version: r.sdkVersion,
            game_appid: this._config.gameappid,
            account: i,
            game_player_name: i,
            game_player_id: o,
            role_level: o,
            small_id: o,
            user_id: o,
            code: d,
            extend: u,
            extra_param: '',
            body: a,
            price: c,
            title: l,
            card_id: p,
            token: s,
            pay_way: f,
          };
          this._sendPostRequest(this.config.gameurl + '/sdk/pay/h5_pay', m)
            .then((v) => {
              const E = atob(v),
                _ = JSON.parse(E);
              (_.msg = we.decodeUnicode(_.msg)),
                console.log('[api]<<<<< ', _),
                _.code === 200
                  ? (console.log('下单成功'), t(_))
                  : (console.log('下单失败'), n(new Error(_.msg)));
            })
            .catch((v) => {
              console.log('下单失败'), n(v);
            });
        });
      },
      async requestOrdenoRestart(e) {
        return new Promise((t, n) => {
          let { orderno: r } = e;
          const s = { orderno: r };
          this._sendPostRequest(this.config.gameurl + '/sdk/pay/get_orderno_restart', s)
            .then((o) => {
              const i = atob(o),
                a = JSON.parse(i);
              (a.msg = we.decodeUnicode(a.msg)), console.log('[api]<<<<< ', a), t(a);
            })
            .catch((o) => {
              console.log('查询订单失败'), n(o);
            });
        });
      },
      async requestBills(e) {
        return new Promise((t, n) => {
          let { account: r, type: s, page: o, pageSize: i } = e;
          const a = { account: r, type: s, p: o, row: i },
            c = `${this.config.gameurl}/sdk/center/balance_record`;
          this._sendPostRequest(c, a)
            .then((l) => {
              const u = atob(l),
                f = JSON.parse(u);
              (f.msg = we.decodeUnicode(f.msg)), console.log('[api]<<<<< ', c, f), t(f);
            })
            .catch((l) => {
              console.log('查询订单列表失败: ' + l.message), n(l);
            });
        });
      },
      async requestDirectBuyBills(e) {
        return new Promise((t, n) => {
          let { account: r, type: s, page: o, pageSize: i } = e;
          const a = { account: r, p: o, row: i },
            c = `${this.config.gameurl}/sdk/center/h5_spend`;
          this._sendPostRequest(c, a)
            .then((l) => {
              const u = atob(l),
                f = JSON.parse(u);
              (f.msg = we.decodeUnicode(f.msg)), console.log('[api]<<<<< ', c, f), t(f);
            })
            .catch((l) => {
              console.log('查询订单列表失败: ' + l.message), n(l);
            });
        });
      },
      async requestBillDetail(e) {
        return new Promise((t, n) => {
          let { user_id: r, order_id: s } = e;
          const o = { p: r, pay_order_number: s },
            i = `${this.config.gameurl}/sdk/center/balance_record_detail`;
          this._sendPostRequest(i, o)
            .then((a) => {
              const c = atob(a),
                l = JSON.parse(c);
              (l.msg = we.decodeUnicode(l.msg)), console.log('[api]<<<<< ', i, l), t(l);
            })
            .catch((a) => {
              console.log('查询订单详情失败: ' + a.message), n(a);
            });
        });
      },
      async requestDirectBuyBillDetail(e) {
        return new Promise((t, n) => {
          let { user_id: r, order_id: s } = e;
          const o = { p: r, pay_order_number: s },
            i = `${this.config.gameurl}/sdk/center/h5_spend_detail`;
          this._sendPostRequest(i, o)
            .then((a) => {
              const c = atob(a),
                l = JSON.parse(c);
              (l.msg = we.decodeUnicode(l.msg)), console.log('[api]<<<<< ', i, l), t(l);
            })
            .catch((a) => {
              console.log('查询订单详情失败: ' + a.message), n(a);
            });
        });
      },
      async requestArticles() {
        return new Promise((e, t) => {
          const n = {};
          this._sendPostRequest(this.config.gameurl + '/sdk/center/get_article', n)
            .then((r) => {
              const s = atob(r),
                o = JSON.parse(s);
              (o.msg = we.decodeUnicode(o.msg)),
                console.log('[api]<<<<< ', o),
                o.code === 200 ? e(o) : t(new Error(o.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      async requestArticleDetail(e) {
        return new Promise((t, n) => {
          const r = { ...e };
          this._sendPostRequest(this.config.gameurl + '/sdk/center/get_article_detail', r)
            .then((s) => {
              const o = atob(s),
                i = JSON.parse(o);
              (i.msg = we.decodeUnicode(i.msg)),
                console.log('[api]<<<<< ', i),
                i.code === 200 ? t(i) : n(new Error(i.msg));
            })
            .catch((s) => {
              n(s);
            });
        });
      },
      async requestOfflineAnnounce() {
        return new Promise((e, t) => {
          const n = { state: '1' };
          this._sendPostRequest(this.config.gameurl + '/sdk/user/get_down_time', n)
            .then((r) => {
              const s = atob(r),
                o = JSON.parse(s);
              (o.msg = we.decodeUnicode(o.msg)),
                console.log('[api]<<<<< ', o),
                o.code === 200 ? e(o) : t(new Error(o.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      async requestUploadRole(e) {
        return new Promise((t, n) => {
          let {
            serverId: r,
            serverName: s,
            roleId: o,
            roleName: i,
            roleLevel: a,
            roleCombat: c,
          } = e;
          const l = {
            server_id: r,
            server_name: s,
            game_player_id: o,
            game_player_name: i,
            role_level: a,
            combat_number: c,
          };
          this._sendPostRequest(this.config.gameurl + '/sdk/user/save_user_play_info', l)
            .then((u) => {
              const f = atob(u),
                d = JSON.parse(f);
              (d.msg = we.decodeUnicode(d.msg)),
                console.log('[api]<<<<< ', d),
                d.code === 200 ? t(d) : n(new Error(d.msg));
            })
            .catch((u) => {
              n(u);
            });
        });
      },
      async requestGamePrice() {
        return new Promise((e, t) => {
          const n = {};
          this._sendPostRequest(this.config.gameurl + '/sdk/user/get_game_price', n)
            .then((r) => {
              const s = atob(r),
                o = JSON.parse(s);
              (o.msg = we.decodeUnicode(o.msg)),
                console.log('[api]<<<<< ', o),
                o.code === 200 ? e(o) : t(new Error(o.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      async requestGamePay() {
        return new Promise((e, t) => {
          const n = {};
          this._sendPostRequestWithNoEncode(this.config.gameurl + '/sdk/user/game_is_pay', n)
            .then((r) => {
              const o = JSON.parse(r);
              o.msg = we.decodeUnicode(o.msg);
              let i = {};
              (i.code = o.code),
                (i.msg = o.msg),
                (i.data = {}),
                delete o.code,
                delete o.msg,
                (i.data = Object.assign(i.data, o)),
                console.log('[api]<<<<< ', i),
                i.code === 0 ? e(i) : t(new Error(i.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      async requestGamePayInner() {
        return new Promise((e, t) => {
          const n = {};
          this._sendPostRequest(this.config.gameurl + '/sdk/user/game_is_pay_inner', n)
            .then((r) => {
              const s = atob(r),
                o = JSON.parse(s);
              (o.msg = we.decodeUnicode(o.msg)),
                console.log('[api]<<<<< ', o),
                o.code === 200 ? e(o) : t(new Error(o.msg));
            })
            .catch((r) => {
              t(r);
            });
        });
      },
      _sendPostRequestWithNoEncode(e, t) {
        const n = this._sortWithNoEncodeParams(e, t);
        return fetch(e, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: n,
        })
          .then((r) => r.text())
          .catch((r) => {
            throw (console.log('[api]++++++ ', { error: r }), r);
          });
      },
      _sortWithNoEncodeParams(e, t) {
        let n = it(),
          r = {
            game_id: this.config.gameid,
            game_appid: this.config.gameappid,
            game_name: this.config.gamename,
            device_name: this.config.device_name,
            promote_id: this.config.promote_id,
          };
        return (
          t.account ? (r.account = t.account) : n.account && (r.account = n.account),
          n.userId && (r.user_id = n.userId),
          n.token && (r.token = n.token),
          n.sdkVersion && (r.sdk_version = n.sdkVersion),
          (t = Object.assign(t, r)),
          JSON.stringify(t)
        );
      },
      _sendPostRequest(e, t) {
        const n = this._sortAndEncodeParams(e, t);
        return fetch(e, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: n })
          .then((r) => r.text())
          .catch((r) => {
            throw (console.log('[api]++++++ ', { error: r }), r);
          });
      },
      _sortAndEncodeParams(e, t) {
        let n = it(),
          r = {
            game_id: this.config.gameid,
            game_appid: this.config.gameappid,
            game_name: this.config.gamename,
            device_name: this.config.device_name,
            promote_id: this.config.promote_id,
          };
        t.account ? (r.account = t.account) : n.account && (r.account = n.account),
          n.userId && (r.user_id = n.userId),
          n.token && (r.token = n.token),
          n.sdkVersion && (r.sdk_version = n.sdkVersion),
          (t = Object.assign(t, r));
        var s = Object.entries(t);
        s.sort(function (d, p) {
          return d[0].localeCompare(p[0]);
        });
        var o = {},
          i = '';
        s.forEach(function (d) {
          var p = d[0].trim(),
            m = d[1];
          (o[p] = m), (i += m);
        });
        var a = om.MD5(i.trim() + this.config.accesskey).toString();
        (o.md5_sign = a), console.log('[api]>>>>> ', e, o);
        var c = JSON.stringify(o),
          l = new TextEncoder(),
          u = l.encode(c),
          f = btoa(String.fromCharCode.apply(null, u));
        return f;
      },
    },
  });
function im() {
  return window.$messager;
}
const am = Gt({
    __name: 'App',
    setup(e) {
      const t = Vp(),
        n = Wp(),
        r = Bs(),
        s = Zp(),
        o = mc(),
        i = it(),
        a = im();
      t.afterEach((F, T, O) => {
        St(O) ||
          (console.log('[afterEach]', F.name, T.name),
          F.name === void 0 || F.name === 'base' ? a.visibleResult(!1) : a.visibleResult(!0));
      }),
        r.on('internal', (F) => {
          let { type: T, data: O } = F;
          switch (T) {
            case 'login':
              c();
              break;
            case 'quickLogin':
              l(O);
              break;
            case 'register':
              u();
              break;
            case 'logout':
              g(O);
              break;
            case 'clear':
              h(O);
              break;
            case 'pay':
              x(O);
              break;
            case 'ptbpay':
              y(O);
              break;
            case 'uploadRole':
              C(O);
              break;
            case 'gamePrice':
              A();
              break;
            case 'gamePay':
              w();
              break;
            case 'close':
              f();
              break;
            case 'menuOpen':
              d();
              break;
            case 'guideOpen':
              E();
              break;
            case 'billOpen':
              p();
              break;
            case 'couponOpen':
              m();
              break;
            case 'newsOpen':
              v();
              break;
            case 'afterLogin':
              D(O);
              break;
            case 'goto':
              _(O);
              break;
          }
        });
      const c = () => {
          if (i.isMP) {
            s.notify({ type: 'error', text: '当前环境为`小程序`，不支持登录框登录！' });
            return;
          }
          if (i.isPT) {
            s.notify({ type: 'error', text: '当前环境为`平台`，不支持登录框登录！' });
            return;
          }
          _('/login');
        },
        l = (F) => {
          let T = { quickLogin: !0, env: F.env || '' };
          delete F.env;
          let O = { data: F, options: T };
          a.loginResult(O, !0), r.emit('internal', { type: 'afterLogin', data: O });
        },
        u = () => {
          _('/register');
        },
        f = () => {
          _('/');
        },
        d = () => {
          i.isLogin && _('/menu');
        },
        p = () => {
          i.isLogin && _('/bill');
        },
        m = (F) => {
          i.isLogin && _('/coupon');
        },
        v = () => {
          i.isLogin && _('/news');
        },
        E = () => {
          _('/guide');
        },
        _ = (F) => {
          n.path !== F && t.replace(F);
        },
        g = async (F) => {
          if (i.isLogin)
            try {
              await o.requestLogout(F);
            } catch {
              console.log('发起`requestLogout`失败，不过已强制退出');
            } finally {
              i.clearSession(),
                a.logoutResult({}, !0),
                s.notify({ type: 'success', text: '登出成功' }),
                f();
            }
        },
        h = async (F) => {
          if (i.isLogin)
            try {
              await o.requestLogout(F);
            } catch {
              console.log('发起`requestLogout`失败，不过已强制退出');
            } finally {
              i.clearSession(),
                a.logoutResult({}, !0),
                s.notify({ type: 'error', text: '您的登录状态已失效，请重新登录' }),
                f();
            }
        },
        x = (F) => {
          if (!i.isLogin) return;
          let T = '1';
          if (F.code) {
            if (F.code !== '3') {
              s.notify({ type: 'error', text: '单机购买参数错误！' });
              return;
            }
            T = F.code;
          }
          t.replace({
            path: '/pay',
            query: {
              body: F.body,
              price: F.price,
              title: F.title,
              user_id: F.user_id,
              order_sn: F.order_sn,
              account: F.account,
              code: T,
            },
          });
        },
        y = (F) => {
          i.isLogin &&
            t.replace({
              path: '/ptbpay',
              query: {
                title: F.title,
                body: F.body,
                price: F.price,
                order_sn: F.order_sn,
                user_id: F.user_id,
                account: F.account,
              },
            });
        },
        C = async (F) => {
          if (i.isLogin)
            try {
              let T = await o.requestUploadRole(F);
              a.uploadRoleResult(T, !0);
            } catch (T) {
              a.uploadRoleResult({ msg: T.message }, !1),
                s.notify({ type: 'error', text: '发起`requestUploadRole`失败:' + T.message });
            }
        },
        A = async () => {
          if (i.isLogin)
            try {
              let F = await o.requestGamePrice();
              a.gamePriceResult(F, !0);
            } catch (F) {
              a.gamePriceResult({ msg: F.message }, !1),
                s.notify({ type: 'error', text: '发起`requestGamePrice`失败:' + F.message });
            }
        },
        w = async () => {
          if (i.isLogin)
            try {
              let F = await o.requestGamePay();
              a.gamePayResult(F, !0);
            } catch (F) {
              a.gamePayResult({ msg: F.message }, !1),
                s.notify({ type: 'error', text: '发起`requestGamePay`失败:' + F.message });
            }
        },
        D = async (F) => {
          let T = it();
          T.saveSession(F.data, F.options || {});
          let O = `${T.config.gamename}-${T.promoteAccount}-${T.config.device_name}-${T.userId}-${T.realRecharge}`;
          a.chatNameResult(O), f();
          try {
            let Y = await o.requestGamePayInner();
            Y.data && Y.data.is_pay !== 1 && (a.showResult(!1), _('/dialog'));
          } catch (Y) {
            console.log(`[afterLogin]请求游戏信息错误: ${Y.message}`),
              alert('查询游戏信息失败：' + Y.message),
              location.reload();
          }
        },
        b = () => {
          const T = new URLSearchParams(window.location.search).get('c');
          if (T == null) {
            s.notify({ type: 'error', text: '异常配置:' + T });
            return;
          }
          let O = null;
          try {
            (O = we.decodeConfig(T)), console.log('[decodeConfig]', O);
          } catch (q) {
            s.notify({ type: 'error', text: '解析配置失败:' + q.message });
            return;
          }
          it().setConfig(O), mc().setConfig(O), f();
        };
      return (
        Fn(async () => {
          {
            b();
            let F = [o.requestOAuthParams()];
            Promise.all(F).then(() => {
              let T = i.dynaConfig.kf_website_id || '';
              a.initResult({ websiteId: T });
            });
          }
        }),
        (F, T) => {
          const O = lh('notifications');
          return (
            Dr(),
            Wh(
              Ne,
              null,
              [
                he(qt(Qu), { class: 'router-view' }),
                he(O, { position: 'top center', duration: 2e3, classes: 'vue-notification2' }),
              ],
              64,
            )
          );
        }
      );
    },
  }),
  cm = (e, t) => {
    const n = e.__vccOpts || e;
    for (const [r, s] of t) n[r] = s;
    return n;
  },
  lm = cm(am, [['__scopeId', 'data-v-12ab7d3e']]),
  um = 'modulepreload',
  fm = function (e, t) {
    return new URL(e, t).href;
  },
  _c = {},
  Ge = function (t, n, r) {
    let s = Promise.resolve();
    if (n && n.length > 0) {
      const i = document.getElementsByTagName('link'),
        a = document.querySelector('meta[property=csp-nonce]'),
        c = (a == null ? void 0 : a.nonce) || (a == null ? void 0 : a.getAttribute('nonce'));
      s = Promise.allSettled(
        n.map((l) => {
          if (((l = fm(l, r)), l in _c)) return;
          _c[l] = !0;
          const u = l.endsWith('.css'),
            f = u ? '[rel="stylesheet"]' : '';
          if (!!r)
            for (let m = i.length - 1; m >= 0; m--) {
              const v = i[m];
              if (v.href === l && (!u || v.rel === 'stylesheet')) return;
            }
          else if (document.querySelector(`link[href="${l}"]${f}`)) return;
          const p = document.createElement('link');
          if (
            ((p.rel = u ? 'stylesheet' : um),
            u || (p.as = 'script'),
            (p.crossOrigin = ''),
            (p.href = l),
            c && p.setAttribute('nonce', c),
            document.head.appendChild(p),
            u)
          )
            return new Promise((m, v) => {
              p.addEventListener('load', m),
                p.addEventListener('error', () => v(new Error(`Unable to preload CSS for ${l}`)));
            });
        }),
      );
    }
    function o(i) {
      const a = new Event('vite:preloadError', { cancelable: !0 });
      if (((a.payload = i), window.dispatchEvent(a), !a.defaultPrevented)) throw i;
    }
    return s.then((i) => {
      for (const a of i || []) a.status === 'rejected' && o(a.reason);
      return t().catch(o);
    });
  },
  dm = Up({
    history: gp('/'),
    routes: [
      {
        path: '/',
        name: 'base',
        component: () =>
          Ge(() => import('./BaseView-8_BRKLue.js'), __vite__mapDeps([0, 1]), import.meta.url),
      },
      {
        path: '/login',
        name: 'login',
        component: () => Ge(() => import('./LoginView-LkV28bU9.js'), [], import.meta.url),
      },
      {
        path: '/register',
        name: 'register',
        component: () => Ge(() => import('./RegisterView-DAGkDSxV.js'), [], import.meta.url),
      },
      {
        path: '/menu',
        name: 'menu',
        component: () =>
          Ge(() => import('./MenuView-D2BLHDHE.js'), __vite__mapDeps([2, 3]), import.meta.url),
      },
      {
        path: '/center',
        name: 'center',
        component: () =>
          Ge(() => import('./CenterView-DRqmOSpv.js'), __vite__mapDeps([4, 5]), import.meta.url),
      },
      {
        path: '/changePass',
        name: 'changePass',
        component: () =>
          Ge(
            () => import('./ChangePassView-Bw55j2eT.js'),
            __vite__mapDeps([6, 7, 8, 9]),
            import.meta.url,
          ),
      },
      {
        path: '/coupon',
        name: 'coupon',
        component: () =>
          Ge(
            () => import('./CouponView-DcGlN4kF.js'),
            __vite__mapDeps([10, 7, 8, 11, 12]),
            import.meta.url,
          ),
      },
      {
        path: '/guide',
        name: 'guide',
        component: () =>
          Ge(() => import('./GuideView-CLN_RE8Q.js'), __vite__mapDeps([13, 14]), import.meta.url),
      },
      {
        path: '/pay',
        name: 'pay',
        component: () =>
          Ge(
            () => import('./PayView-DkZC27cd.js'),
            __vite__mapDeps([15, 16, 17, 18, 7, 8, 19, 20, 21]),
            import.meta.url,
          ),
      },
      {
        path: '/ptbpay',
        name: 'ptbpay',
        component: () =>
          Ge(
            () => import('./PTBPayView-CQu-P7Zt.js'),
            __vite__mapDeps([22, 20, 7, 8, 18, 19, 16, 17, 11, 23]),
            import.meta.url,
          ),
      },
      {
        path: '/bill',
        name: 'bill',
        component: () =>
          Ge(
            () => import('./BillView-BF1N0mGj.js'),
            __vite__mapDeps([24, 7, 8, 16, 17, 20, 25, 26]),
            import.meta.url,
          ),
      },
      {
        path: '/bill-detail',
        name: 'billDetail',
        component: () =>
          Ge(
            () => import('./BillDetailView-DjqwdW2y.js'),
            __vite__mapDeps([27, 7, 8, 20, 28]),
            import.meta.url,
          ),
      },
      {
        path: '/news',
        name: 'news',
        component: () =>
          Ge(
            () => import('./NewsView-CIlKCgpa.js'),
            __vite__mapDeps([29, 25, 7, 8, 30]),
            import.meta.url,
          ),
      },
      {
        path: '/news-detail/:id',
        name: 'newsDetail',
        component: () =>
          Ge(
            () => import('./NewsDetailView-DRIIwkPf.js'),
            __vite__mapDeps([31, 7, 8, 32]),
            import.meta.url,
          ),
      },
      {
        path: '/dialog',
        name: 'dialog',
        component: () =>
          Ge(() => import('./DialogView-p8JFcPkQ.js'), __vite__mapDeps([33, 34]), import.meta.url),
      },
      {
        path: '/test',
        name: 'test',
        component: () => Ge(() => import('./TestView-B1PNdzS3.js'), [], import.meta.url),
      },
    ],
  });
function hm(e) {
  return {
    all: (e = e || new Map()),
    on: function (t, n) {
      var r = e.get(t);
      r ? r.push(n) : e.set(t, [n]);
    },
    off: function (t, n) {
      var r = e.get(t);
      r && (n ? r.splice(r.indexOf(n) >>> 0, 1) : e.set(t, []));
    },
    emit: function (t, n) {
      var r = e.get(t);
      r &&
        r.slice().map(function (s) {
          s(n);
        }),
        (r = e.get('*')) &&
          r.slice().map(function (s) {
            s(t, n);
          });
    },
  };
}
class xm {
  setup() {
    (this.currentOrigin = window.location.origin), (this.emitter = Bs()), this._bindListeners();
  }
  initResult(t) {
    let r = { type: 'init', data: t };
    this._call(r);
  }
  visibleResult(t) {
    let r = { type: 'visible', data: { value: t } };
    this._call(r);
  }
  hideResult(t) {
    let r = { type: 'hide', data: { value: t } };
    this._call(r);
  }
  showResult(t) {
    let r = { type: 'show', data: { value: t } };
    this._call(r);
  }
  chatOpenResult(t) {
    let r = { type: 'chatOpen', data: { value: t } };
    this._call(r);
  }
  chatNameResult(t) {
    let r = { type: 'chatName', data: { value: t } };
    this._call(r);
  }
  openUrlResult(t) {
    let r = { type: 'openUrl', data: { value: t } };
    this._call(r);
  }
  loginResult(t, n) {
    let s = { type: `login_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  logoutResult(t, n) {
    let s = { type: `logout_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  payResult(t, n) {
    let s = { type: `pay_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  uploadRoleResult(t, n) {
    let s = { type: `uploadRole_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  gamePriceResult(t, n) {
    let s = { type: `gamePrice_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  gamePayResult(t, n) {
    let s = { type: `gamePay_${n ? 'succ' : 'fail'}`, data: t };
    this._call(s);
  }
  _bindListeners() {
    window.addEventListener(
      'message',
      (t) => {
        if (t.origin === this.currentOrigin && typeof t.data == 'string') {
          let n = JSON.parse(t.data);
          this._onCall(n);
        }
      },
      !1,
    );
  }
  _call(t) {
    console.log('[inernal:call]', t),
      window.parent.postMessage(JSON.stringify(t), this.currentOrigin);
  }
  _onCall(t) {
    console.log('[inernal:onCall]', t), this.emitter.emit('internal', t);
  }
}
function pm() {
  return new xm();
}
/*!
 * shared v11.1.12
 * (c) 2025 kazuya kawaguchi
 * Released under the MIT License.
 */ function gm(e, t) {
  typeof console < 'u' && (console.warn('[intlify] ' + e), t && console.warn(t.stack));
}
const Ds = typeof window < 'u',
  pn = (e, t = !1) => (t ? Symbol.for(e) : Symbol(e)),
  mm = (e, t, n) => _m({ l: e, k: t, s: n }),
  _m = (e) =>
    JSON.stringify(e)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
      .replace(/\u0027/g, '\\u0027'),
  He = (e) => typeof e == 'number' && isFinite(e),
  vm = (e) => da(e) === '[object Date]',
  Xn = (e) => da(e) === '[object RegExp]',
  zs = (e) => xe(e) && Object.keys(e).length === 0,
  qe = Object.assign,
  ym = Object.create,
  De = (e = null) => ym(e);
let vc;
const yn = () =>
  vc ||
  (vc =
    typeof globalThis < 'u'
      ? globalThis
      : typeof self < 'u'
        ? self
        : typeof window < 'u'
          ? window
          : typeof global < 'u'
            ? global
            : De());
function yc(e) {
  return e
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\//g, '&#x2F;')
    .replace(/=/g, '&#x3D;');
}
function Ec(e) {
  return e
    .replace(/&(?![a-zA-Z0-9#]{2,6};)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function Em(e) {
  return (
    (e = e.replace(/(\w+)\s*=\s*"([^"]*)"/g, (r, s, o) => `${s}="${Ec(o)}"`)),
    (e = e.replace(/(\w+)\s*=\s*'([^']*)'/g, (r, s, o) => `${s}='${Ec(o)}'`)),
    /\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi.test(e) &&
      (e = e.replace(/(\s+)(on)(\w+\s*=)/gi, '$1&#111;n$3')),
    [
      /(\s+(?:href|src|action|formaction)\s*=\s*["']?)\s*javascript:/gi,
      /(style\s*=\s*["'][^"']*url\s*\(\s*)javascript:/gi,
    ].forEach((r) => {
      e = e.replace(r, '$1javascript&#58;');
    }),
    e
  );
}
const bm = Object.prototype.hasOwnProperty;
function Et(e, t) {
  return bm.call(e, t);
}
const Ie = Array.isArray,
  ke = (e) => typeof e == 'function',
  re = (e) => typeof e == 'string',
  Ee = (e) => typeof e == 'boolean',
  Ce = (e) => e !== null && typeof e == 'object',
  Cm = (e) => Ce(e) && ke(e.then) && ke(e.catch),
  cf = Object.prototype.toString,
  da = (e) => cf.call(e),
  xe = (e) => da(e) === '[object Object]',
  Am = (e) =>
    e == null ? '' : Ie(e) || (xe(e) && e.toString === cf) ? JSON.stringify(e, null, 2) : String(e);
function ha(e, t = '') {
  return e.reduce((n, r, s) => (s === 0 ? n + r : n + t + r), '');
}
const Jr = (e) => !Ce(e) || Ie(e);
function as(e, t) {
  if (Jr(e) || Jr(t)) throw new Error('Invalid value');
  const n = [{ src: e, des: t }];
  for (; n.length; ) {
    const { src: r, des: s } = n.pop();
    Object.keys(r).forEach((o) => {
      o !== '__proto__' &&
        (Ce(r[o]) && !Ce(s[o]) && (s[o] = Array.isArray(r[o]) ? [] : De()),
        Jr(s[o]) || Jr(r[o]) ? (s[o] = r[o]) : n.push({ src: r[o], des: s[o] }));
    });
  }
}
/*!
 * message-compiler v11.1.12
 * (c) 2025 kazuya kawaguchi
 * Released under the MIT License.
 */ function Bm(e, t, n) {
  return { line: e, column: t, offset: n };
}
function Fi(e, t, n) {
  return { start: e, end: t };
}
const Be = {
    EXPECTED_TOKEN: 1,
    INVALID_TOKEN_IN_PLACEHOLDER: 2,
    UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER: 3,
    UNKNOWN_ESCAPE_SEQUENCE: 4,
    INVALID_UNICODE_ESCAPE_SEQUENCE: 5,
    UNBALANCED_CLOSING_BRACE: 6,
    UNTERMINATED_CLOSING_BRACE: 7,
    EMPTY_PLACEHOLDER: 8,
    NOT_ALLOW_NEST_PLACEHOLDER: 9,
    INVALID_LINKED_FORMAT: 10,
    MUST_HAVE_MESSAGES_IN_PLURAL: 11,
    UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
    UNEXPECTED_EMPTY_LINKED_KEY: 13,
    UNEXPECTED_LEXICAL_ANALYSIS: 14,
    UNHANDLED_CODEGEN_NODE_TYPE: 15,
    UNHANDLED_MINIFIER_NODE_TYPE: 16,
  },
  Dm = 17;
function Ys(e, t, n = {}) {
  const { domain: r, messages: s, args: o } = n,
    i = e,
    a = new SyntaxError(String(i));
  return (a.code = e), t && (a.location = t), (a.domain = r), a;
}
function Fm(e) {
  throw e;
}
const Dt = ' ',
  Pm = '\r',
  ze = `
`,
  Sm = '\u2028',
  Tm = '\u2029';
function Rm(e) {
  const t = e;
  let n = 0,
    r = 1,
    s = 1,
    o = 0;
  const i = (A) => t[A] === Pm && t[A + 1] === ze,
    a = (A) => t[A] === ze,
    c = (A) => t[A] === Tm,
    l = (A) => t[A] === Sm,
    u = (A) => i(A) || a(A) || c(A) || l(A),
    f = () => n,
    d = () => r,
    p = () => s,
    m = () => o,
    v = (A) => (i(A) || c(A) || l(A) ? ze : t[A]),
    E = () => v(n),
    _ = () => v(n + o);
  function g() {
    return (o = 0), u(n) && (r++, (s = 0)), i(n) && n++, n++, s++, t[n];
  }
  function h() {
    return i(n + o) && o++, o++, t[n + o];
  }
  function x() {
    (n = 0), (r = 1), (s = 1), (o = 0);
  }
  function y(A = 0) {
    o = A;
  }
  function C() {
    const A = n + o;
    for (; A !== n; ) g();
    o = 0;
  }
  return {
    index: f,
    line: d,
    column: p,
    peekOffset: m,
    charAt: v,
    currentChar: E,
    currentPeek: _,
    next: g,
    peek: h,
    reset: x,
    resetPeek: y,
    skipToPeek: C,
  };
}
const Lt = void 0,
  wm = '.',
  bc = "'",
  km = 'tokenizer';
function Om(e, t = {}) {
  const n = t.location !== !1,
    r = Rm(e),
    s = () => r.index(),
    o = () => Bm(r.line(), r.column(), r.index()),
    i = o(),
    a = s(),
    c = {
      currentType: 13,
      offset: a,
      startLoc: i,
      endLoc: i,
      lastType: 13,
      lastOffset: a,
      lastStartLoc: i,
      lastEndLoc: i,
      braceNest: 0,
      inLinked: !1,
      text: '',
    },
    l = () => c,
    { onError: u } = t;
  function f(B, S, L, ...I) {
    const U = l();
    if (((S.column += L), (S.offset += L), u)) {
      const Q = n ? Fi(U.startLoc, S) : null,
        k = Ys(B, Q, { domain: km, args: I });
      u(k);
    }
  }
  function d(B, S, L) {
    (B.endLoc = o()), (B.currentType = S);
    const I = { type: S };
    return n && (I.loc = Fi(B.startLoc, B.endLoc)), L != null && (I.value = L), I;
  }
  const p = (B) => d(B, 13);
  function m(B, S) {
    return B.currentChar() === S ? (B.next(), S) : (f(Be.EXPECTED_TOKEN, o(), 0, S), '');
  }
  function v(B) {
    let S = '';
    for (; B.currentPeek() === Dt || B.currentPeek() === ze; ) (S += B.currentPeek()), B.peek();
    return S;
  }
  function E(B) {
    const S = v(B);
    return B.skipToPeek(), S;
  }
  function _(B) {
    if (B === Lt) return !1;
    const S = B.charCodeAt(0);
    return (S >= 97 && S <= 122) || (S >= 65 && S <= 90) || S === 95;
  }
  function g(B) {
    if (B === Lt) return !1;
    const S = B.charCodeAt(0);
    return S >= 48 && S <= 57;
  }
  function h(B, S) {
    const { currentType: L } = S;
    if (L !== 2) return !1;
    v(B);
    const I = _(B.currentPeek());
    return B.resetPeek(), I;
  }
  function x(B, S) {
    const { currentType: L } = S;
    if (L !== 2) return !1;
    v(B);
    const I = B.currentPeek() === '-' ? B.peek() : B.currentPeek(),
      U = g(I);
    return B.resetPeek(), U;
  }
  function y(B, S) {
    const { currentType: L } = S;
    if (L !== 2) return !1;
    v(B);
    const I = B.currentPeek() === bc;
    return B.resetPeek(), I;
  }
  function C(B, S) {
    const { currentType: L } = S;
    if (L !== 7) return !1;
    v(B);
    const I = B.currentPeek() === '.';
    return B.resetPeek(), I;
  }
  function A(B, S) {
    const { currentType: L } = S;
    if (L !== 8) return !1;
    v(B);
    const I = _(B.currentPeek());
    return B.resetPeek(), I;
  }
  function w(B, S) {
    const { currentType: L } = S;
    if (!(L === 7 || L === 11)) return !1;
    v(B);
    const I = B.currentPeek() === ':';
    return B.resetPeek(), I;
  }
  function D(B, S) {
    const { currentType: L } = S;
    if (L !== 9) return !1;
    const I = () => {
        const Q = B.currentPeek();
        return Q === '{'
          ? _(B.peek())
          : Q === '@' || Q === '|' || Q === ':' || Q === '.' || Q === Dt || !Q
            ? !1
            : Q === ze
              ? (B.peek(), I())
              : F(B, !1);
      },
      U = I();
    return B.resetPeek(), U;
  }
  function b(B) {
    v(B);
    const S = B.currentPeek() === '|';
    return B.resetPeek(), S;
  }
  function F(B, S = !0) {
    const L = (U = !1, Q = '') => {
        const k = B.currentPeek();
        return k === '{' || k === '@' || !k
          ? U
          : k === '|'
            ? !(Q === Dt || Q === ze)
            : k === Dt
              ? (B.peek(), L(!0, Dt))
              : k === ze
                ? (B.peek(), L(!0, ze))
                : !0;
      },
      I = L();
    return S && B.resetPeek(), I;
  }
  function T(B, S) {
    const L = B.currentChar();
    return L === Lt ? Lt : S(L) ? (B.next(), L) : null;
  }
  function O(B) {
    const S = B.charCodeAt(0);
    return (
      (S >= 97 && S <= 122) || (S >= 65 && S <= 90) || (S >= 48 && S <= 57) || S === 95 || S === 36
    );
  }
  function Y(B) {
    return T(B, O);
  }
  function J(B) {
    const S = B.charCodeAt(0);
    return (
      (S >= 97 && S <= 122) ||
      (S >= 65 && S <= 90) ||
      (S >= 48 && S <= 57) ||
      S === 95 ||
      S === 36 ||
      S === 45
    );
  }
  function q(B) {
    return T(B, J);
  }
  function Z(B) {
    const S = B.charCodeAt(0);
    return S >= 48 && S <= 57;
  }
  function X(B) {
    return T(B, Z);
  }
  function ie(B) {
    const S = B.charCodeAt(0);
    return (S >= 48 && S <= 57) || (S >= 65 && S <= 70) || (S >= 97 && S <= 102);
  }
  function ce(B) {
    return T(B, ie);
  }
  function $(B) {
    let S = '',
      L = '';
    for (; (S = X(B)); ) L += S;
    return L;
  }
  function W(B) {
    let S = '';
    for (;;) {
      const L = B.currentChar();
      if (L === '{' || L === '}' || L === '@' || L === '|' || !L) break;
      if (L === Dt || L === ze)
        if (F(B)) (S += L), B.next();
        else {
          if (b(B)) break;
          (S += L), B.next();
        }
      else (S += L), B.next();
    }
    return S;
  }
  function z(B) {
    E(B);
    let S = '',
      L = '';
    for (; (S = q(B)); ) L += S;
    const I = B.currentChar();
    if (I && I !== '}' && I !== Lt && I !== Dt && I !== ze && I !== '　') {
      const U = ne(B);
      return f(Be.INVALID_TOKEN_IN_PLACEHOLDER, o(), 0, L + U), L + U;
    }
    return B.currentChar() === Lt && f(Be.UNTERMINATED_CLOSING_BRACE, o(), 0), L;
  }
  function j(B) {
    E(B);
    let S = '';
    return (
      B.currentChar() === '-' ? (B.next(), (S += `-${$(B)}`)) : (S += $(B)),
      B.currentChar() === Lt && f(Be.UNTERMINATED_CLOSING_BRACE, o(), 0),
      S
    );
  }
  function ye(B) {
    return B !== bc && B !== ze;
  }
  function le(B) {
    E(B), m(B, "'");
    let S = '',
      L = '';
    for (; (S = T(B, ye)); ) S === '\\' ? (L += H(B)) : (L += S);
    const I = B.currentChar();
    return I === ze || I === Lt
      ? (f(Be.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, o(), 0),
        I === ze && (B.next(), m(B, "'")),
        L)
      : (m(B, "'"), L);
  }
  function H(B) {
    const S = B.currentChar();
    switch (S) {
      case '\\':
      case "'":
        return B.next(), `\\${S}`;
      case 'u':
        return K(B, S, 4);
      case 'U':
        return K(B, S, 6);
      default:
        return f(Be.UNKNOWN_ESCAPE_SEQUENCE, o(), 0, S), '';
    }
  }
  function K(B, S, L) {
    m(B, S);
    let I = '';
    for (let U = 0; U < L; U++) {
      const Q = ce(B);
      if (!Q) {
        f(Be.INVALID_UNICODE_ESCAPE_SEQUENCE, o(), 0, `\\${S}${I}${B.currentChar()}`);
        break;
      }
      I += Q;
    }
    return `\\${S}${I}`;
  }
  function ee(B) {
    return B !== '{' && B !== '}' && B !== Dt && B !== ze;
  }
  function ne(B) {
    E(B);
    let S = '',
      L = '';
    for (; (S = T(B, ee)); ) L += S;
    return L;
  }
  function fe(B) {
    let S = '',
      L = '';
    for (; (S = Y(B)); ) L += S;
    return L;
  }
  function _e(B) {
    const S = (L) => {
      const I = B.currentChar();
      return I === '{' || I === '@' || I === '|' || I === '(' || I === ')' || !I || I === Dt
        ? L
        : ((L += I), B.next(), S(L));
    };
    return S('');
  }
  function P(B) {
    E(B);
    const S = m(B, '|');
    return E(B), S;
  }
  function R(B, S) {
    let L = null;
    switch (B.currentChar()) {
      case '{':
        return (
          S.braceNest >= 1 && f(Be.NOT_ALLOW_NEST_PLACEHOLDER, o(), 0),
          B.next(),
          (L = d(S, 2, '{')),
          E(B),
          S.braceNest++,
          L
        );
      case '}':
        return (
          S.braceNest > 0 && S.currentType === 2 && f(Be.EMPTY_PLACEHOLDER, o(), 0),
          B.next(),
          (L = d(S, 3, '}')),
          S.braceNest--,
          S.braceNest > 0 && E(B),
          S.inLinked && S.braceNest === 0 && (S.inLinked = !1),
          L
        );
      case '@':
        return (
          S.braceNest > 0 && f(Be.UNTERMINATED_CLOSING_BRACE, o(), 0),
          (L = N(B, S) || p(S)),
          (S.braceNest = 0),
          L
        );
      default: {
        let U = !0,
          Q = !0,
          k = !0;
        if (b(B))
          return (
            S.braceNest > 0 && f(Be.UNTERMINATED_CLOSING_BRACE, o(), 0),
            (L = d(S, 1, P(B))),
            (S.braceNest = 0),
            (S.inLinked = !1),
            L
          );
        if (S.braceNest > 0 && (S.currentType === 4 || S.currentType === 5 || S.currentType === 6))
          return f(Be.UNTERMINATED_CLOSING_BRACE, o(), 0), (S.braceNest = 0), G(B, S);
        if ((U = h(B, S))) return (L = d(S, 4, z(B))), E(B), L;
        if ((Q = x(B, S))) return (L = d(S, 5, j(B))), E(B), L;
        if ((k = y(B, S))) return (L = d(S, 6, le(B))), E(B), L;
        if (!U && !Q && !k)
          return (
            (L = d(S, 12, ne(B))), f(Be.INVALID_TOKEN_IN_PLACEHOLDER, o(), 0, L.value), E(B), L
          );
        break;
      }
    }
    return L;
  }
  function N(B, S) {
    const { currentType: L } = S;
    let I = null;
    const U = B.currentChar();
    switch (
      ((L === 7 || L === 8 || L === 11 || L === 9) &&
        (U === ze || U === Dt) &&
        f(Be.INVALID_LINKED_FORMAT, o(), 0),
      U)
    ) {
      case '@':
        return B.next(), (I = d(S, 7, '@')), (S.inLinked = !0), I;
      case '.':
        return E(B), B.next(), d(S, 8, '.');
      case ':':
        return E(B), B.next(), d(S, 9, ':');
      default:
        return b(B)
          ? ((I = d(S, 1, P(B))), (S.braceNest = 0), (S.inLinked = !1), I)
          : C(B, S) || w(B, S)
            ? (E(B), N(B, S))
            : A(B, S)
              ? (E(B), d(S, 11, fe(B)))
              : D(B, S)
                ? (E(B), U === '{' ? R(B, S) || I : d(S, 10, _e(B)))
                : (L === 7 && f(Be.INVALID_LINKED_FORMAT, o(), 0),
                  (S.braceNest = 0),
                  (S.inLinked = !1),
                  G(B, S));
    }
  }
  function G(B, S) {
    let L = { type: 13 };
    if (S.braceNest > 0) return R(B, S) || p(S);
    if (S.inLinked) return N(B, S) || p(S);
    switch (B.currentChar()) {
      case '{':
        return R(B, S) || p(S);
      case '}':
        return f(Be.UNBALANCED_CLOSING_BRACE, o(), 0), B.next(), d(S, 3, '}');
      case '@':
        return N(B, S) || p(S);
      default: {
        if (b(B)) return (L = d(S, 1, P(B))), (S.braceNest = 0), (S.inLinked = !1), L;
        if (F(B)) return d(S, 0, W(B));
        break;
      }
    }
    return L;
  }
  function V() {
    const { currentType: B, offset: S, startLoc: L, endLoc: I } = c;
    return (
      (c.lastType = B),
      (c.lastOffset = S),
      (c.lastStartLoc = L),
      (c.lastEndLoc = I),
      (c.offset = s()),
      (c.startLoc = o()),
      r.currentChar() === Lt ? d(c, 13) : G(r, c)
    );
  }
  return { nextToken: V, currentOffset: s, currentPosition: o, context: l };
}
const Lm = 'parser',
  Nm = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
function Im(e, t, n) {
  switch (e) {
    case '\\\\':
      return '\\';
    case "\\'":
      return "'";
    default: {
      const r = parseInt(t || n, 16);
      return r <= 55295 || r >= 57344 ? String.fromCodePoint(r) : '�';
    }
  }
}
function Mm(e = {}) {
  const t = e.location !== !1,
    { onError: n } = e;
  function r(_, g, h, x, ...y) {
    const C = _.currentPosition();
    if (((C.offset += x), (C.column += x), n)) {
      const A = t ? Fi(h, C) : null,
        w = Ys(g, A, { domain: Lm, args: y });
      n(w);
    }
  }
  function s(_, g, h) {
    const x = { type: _ };
    return t && ((x.start = g), (x.end = g), (x.loc = { start: h, end: h })), x;
  }
  function o(_, g, h, x) {
    t && ((_.end = g), _.loc && (_.loc.end = h));
  }
  function i(_, g) {
    const h = _.context(),
      x = s(3, h.offset, h.startLoc);
    return (x.value = g), o(x, _.currentOffset(), _.currentPosition()), x;
  }
  function a(_, g) {
    const h = _.context(),
      { lastOffset: x, lastStartLoc: y } = h,
      C = s(5, x, y);
    return (
      (C.index = parseInt(g, 10)), _.nextToken(), o(C, _.currentOffset(), _.currentPosition()), C
    );
  }
  function c(_, g) {
    const h = _.context(),
      { lastOffset: x, lastStartLoc: y } = h,
      C = s(4, x, y);
    return (C.key = g), _.nextToken(), o(C, _.currentOffset(), _.currentPosition()), C;
  }
  function l(_, g) {
    const h = _.context(),
      { lastOffset: x, lastStartLoc: y } = h,
      C = s(9, x, y);
    return (
      (C.value = g.replace(Nm, Im)), _.nextToken(), o(C, _.currentOffset(), _.currentPosition()), C
    );
  }
  function u(_) {
    const g = _.nextToken(),
      h = _.context(),
      { lastOffset: x, lastStartLoc: y } = h,
      C = s(8, x, y);
    return g.type !== 11
      ? (r(_, Be.UNEXPECTED_EMPTY_LINKED_MODIFIER, h.lastStartLoc, 0),
        (C.value = ''),
        o(C, x, y),
        { nextConsumeToken: g, node: C })
      : (g.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, h.lastStartLoc, 0, Ft(g)),
        (C.value = g.value || ''),
        o(C, _.currentOffset(), _.currentPosition()),
        { node: C });
  }
  function f(_, g) {
    const h = _.context(),
      x = s(7, h.offset, h.startLoc);
    return (x.value = g), o(x, _.currentOffset(), _.currentPosition()), x;
  }
  function d(_) {
    const g = _.context(),
      h = s(6, g.offset, g.startLoc);
    let x = _.nextToken();
    if (x.type === 8) {
      const y = u(_);
      (h.modifier = y.node), (x = y.nextConsumeToken || _.nextToken());
    }
    switch (
      (x.type !== 9 && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(x)),
      (x = _.nextToken()),
      x.type === 2 && (x = _.nextToken()),
      x.type)
    ) {
      case 10:
        x.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(x)),
          (h.key = f(_, x.value || ''));
        break;
      case 4:
        x.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(x)),
          (h.key = c(_, x.value || ''));
        break;
      case 5:
        x.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(x)),
          (h.key = a(_, x.value || ''));
        break;
      case 6:
        x.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(x)),
          (h.key = l(_, x.value || ''));
        break;
      default: {
        r(_, Be.UNEXPECTED_EMPTY_LINKED_KEY, g.lastStartLoc, 0);
        const y = _.context(),
          C = s(7, y.offset, y.startLoc);
        return (
          (C.value = ''),
          o(C, y.offset, y.startLoc),
          (h.key = C),
          o(h, y.offset, y.startLoc),
          { nextConsumeToken: x, node: h }
        );
      }
    }
    return o(h, _.currentOffset(), _.currentPosition()), { node: h };
  }
  function p(_) {
    const g = _.context(),
      h = g.currentType === 1 ? _.currentOffset() : g.offset,
      x = g.currentType === 1 ? g.endLoc : g.startLoc,
      y = s(2, h, x);
    y.items = [];
    let C = null;
    do {
      const D = C || _.nextToken();
      switch (((C = null), D.type)) {
        case 0:
          D.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(D)),
            y.items.push(i(_, D.value || ''));
          break;
        case 5:
          D.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(D)),
            y.items.push(a(_, D.value || ''));
          break;
        case 4:
          D.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(D)),
            y.items.push(c(_, D.value || ''));
          break;
        case 6:
          D.value == null && r(_, Be.UNEXPECTED_LEXICAL_ANALYSIS, g.lastStartLoc, 0, Ft(D)),
            y.items.push(l(_, D.value || ''));
          break;
        case 7: {
          const b = d(_);
          y.items.push(b.node), (C = b.nextConsumeToken || null);
          break;
        }
      }
    } while (g.currentType !== 13 && g.currentType !== 1);
    const A = g.currentType === 1 ? g.lastOffset : _.currentOffset(),
      w = g.currentType === 1 ? g.lastEndLoc : _.currentPosition();
    return o(y, A, w), y;
  }
  function m(_, g, h, x) {
    const y = _.context();
    let C = x.items.length === 0;
    const A = s(1, g, h);
    (A.cases = []), A.cases.push(x);
    do {
      const w = p(_);
      C || (C = w.items.length === 0), A.cases.push(w);
    } while (y.currentType !== 13);
    return (
      C && r(_, Be.MUST_HAVE_MESSAGES_IN_PLURAL, h, 0),
      o(A, _.currentOffset(), _.currentPosition()),
      A
    );
  }
  function v(_) {
    const g = _.context(),
      { offset: h, startLoc: x } = g,
      y = p(_);
    return g.currentType === 13 ? y : m(_, h, x, y);
  }
  function E(_) {
    const g = Om(_, qe({}, e)),
      h = g.context(),
      x = s(0, h.offset, h.startLoc);
    return (
      t && x.loc && (x.loc.source = _),
      (x.body = v(g)),
      e.onCacheKey && (x.cacheKey = e.onCacheKey(_)),
      h.currentType !== 13 &&
        r(g, Be.UNEXPECTED_LEXICAL_ANALYSIS, h.lastStartLoc, 0, _[h.offset] || ''),
      o(x, g.currentOffset(), g.currentPosition()),
      x
    );
  }
  return { parse: E };
}
function Ft(e) {
  if (e.type === 13) return 'EOF';
  const t = (e.value || '').replace(/\r?\n/gu, '\\n');
  return t.length > 10 ? t.slice(0, 9) + '…' : t;
}
function Hm(e, t = {}) {
  const n = { ast: e, helpers: new Set() };
  return { context: () => n, helper: (o) => (n.helpers.add(o), o) };
}
function Cc(e, t) {
  for (let n = 0; n < e.length; n++) xa(e[n], t);
}
function xa(e, t) {
  switch (e.type) {
    case 1:
      Cc(e.cases, t), t.helper('plural');
      break;
    case 2:
      Cc(e.items, t);
      break;
    case 6: {
      xa(e.key, t), t.helper('linked'), t.helper('type');
      break;
    }
    case 5:
      t.helper('interpolate'), t.helper('list');
      break;
    case 4:
      t.helper('interpolate'), t.helper('named');
      break;
  }
}
function Um(e, t = {}) {
  const n = Hm(e);
  n.helper('normalize'), e.body && xa(e.body, n);
  const r = n.context();
  e.helpers = Array.from(r.helpers);
}
function $m(e) {
  const t = e.body;
  return t.type === 2 ? Ac(t) : t.cases.forEach((n) => Ac(n)), e;
}
function Ac(e) {
  if (e.items.length === 1) {
    const t = e.items[0];
    (t.type === 3 || t.type === 9) && ((e.static = t.value), delete t.value);
  } else {
    const t = [];
    for (let n = 0; n < e.items.length; n++) {
      const r = e.items[n];
      if (!(r.type === 3 || r.type === 9) || r.value == null) break;
      t.push(r.value);
    }
    if (t.length === e.items.length) {
      e.static = ha(t);
      for (let n = 0; n < e.items.length; n++) {
        const r = e.items[n];
        (r.type === 3 || r.type === 9) && delete r.value;
      }
    }
  }
}
function Nn(e) {
  switch (((e.t = e.type), e.type)) {
    case 0: {
      const t = e;
      Nn(t.body), (t.b = t.body), delete t.body;
      break;
    }
    case 1: {
      const t = e,
        n = t.cases;
      for (let r = 0; r < n.length; r++) Nn(n[r]);
      (t.c = n), delete t.cases;
      break;
    }
    case 2: {
      const t = e,
        n = t.items;
      for (let r = 0; r < n.length; r++) Nn(n[r]);
      (t.i = n), delete t.items, t.static && ((t.s = t.static), delete t.static);
      break;
    }
    case 3:
    case 9:
    case 8:
    case 7: {
      const t = e;
      t.value && ((t.v = t.value), delete t.value);
      break;
    }
    case 6: {
      const t = e;
      Nn(t.key),
        (t.k = t.key),
        delete t.key,
        t.modifier && (Nn(t.modifier), (t.m = t.modifier), delete t.modifier);
      break;
    }
    case 5: {
      const t = e;
      (t.i = t.index), delete t.index;
      break;
    }
    case 4: {
      const t = e;
      (t.k = t.key), delete t.key;
      break;
    }
  }
  delete e.type;
}
function Vm(e, t) {
  const { sourceMap: n, filename: r, breakLineCode: s, needIndent: o } = t,
    i = t.location !== !1,
    a = {
      filename: r,
      code: '',
      column: 1,
      line: 1,
      offset: 0,
      map: void 0,
      breakLineCode: s,
      needIndent: o,
      indentLevel: 0,
    };
  i && e.loc && (a.source = e.loc.source);
  const c = () => a;
  function l(E, _) {
    a.code += E;
  }
  function u(E, _ = !0) {
    const g = _ ? s : '';
    l(o ? g + '  '.repeat(E) : g);
  }
  function f(E = !0) {
    const _ = ++a.indentLevel;
    E && u(_);
  }
  function d(E = !0) {
    const _ = --a.indentLevel;
    E && u(_);
  }
  function p() {
    u(a.indentLevel);
  }
  return {
    context: c,
    push: l,
    indent: f,
    deindent: d,
    newline: p,
    helper: (E) => `_${E}`,
    needIndent: () => a.needIndent,
  };
}
function Wm(e, t) {
  const { helper: n } = e;
  e.push(`${n('linked')}(`),
    Qn(e, t.key),
    t.modifier
      ? (e.push(', '), Qn(e, t.modifier), e.push(', _type'))
      : e.push(', undefined, _type'),
    e.push(')');
}
function qm(e, t) {
  const { helper: n, needIndent: r } = e;
  e.push(`${n('normalize')}([`), e.indent(r());
  const s = t.items.length;
  for (let o = 0; o < s && (Qn(e, t.items[o]), o !== s - 1); o++) e.push(', ');
  e.deindent(r()), e.push('])');
}
function jm(e, t) {
  const { helper: n, needIndent: r } = e;
  if (t.cases.length > 1) {
    e.push(`${n('plural')}([`), e.indent(r());
    const s = t.cases.length;
    for (let o = 0; o < s && (Qn(e, t.cases[o]), o !== s - 1); o++) e.push(', ');
    e.deindent(r()), e.push('])');
  }
}
function Km(e, t) {
  t.body ? Qn(e, t.body) : e.push('null');
}
function Qn(e, t) {
  const { helper: n } = e;
  switch (t.type) {
    case 0:
      Km(e, t);
      break;
    case 1:
      jm(e, t);
      break;
    case 2:
      qm(e, t);
      break;
    case 6:
      Wm(e, t);
      break;
    case 8:
      e.push(JSON.stringify(t.value), t);
      break;
    case 7:
      e.push(JSON.stringify(t.value), t);
      break;
    case 5:
      e.push(`${n('interpolate')}(${n('list')}(${t.index}))`, t);
      break;
    case 4:
      e.push(`${n('interpolate')}(${n('named')}(${JSON.stringify(t.key)}))`, t);
      break;
    case 9:
      e.push(JSON.stringify(t.value), t);
      break;
    case 3:
      e.push(JSON.stringify(t.value), t);
      break;
  }
}
const Gm = (e, t = {}) => {
  const n = re(t.mode) ? t.mode : 'normal',
    r = re(t.filename) ? t.filename : 'message.intl',
    s = !!t.sourceMap,
    o =
      t.breakLineCode != null
        ? t.breakLineCode
        : n === 'arrow'
          ? ';'
          : `
`,
    i = t.needIndent ? t.needIndent : n !== 'arrow',
    a = e.helpers || [],
    c = Vm(e, { mode: n, filename: r, sourceMap: s, breakLineCode: o, needIndent: i });
  c.push(n === 'normal' ? 'function __msg__ (ctx) {' : '(ctx) => {'),
    c.indent(i),
    a.length > 0 &&
      (c.push(
        `const { ${ha(
          a.map((f) => `${f}: _${f}`),
          ', ',
        )} } = ctx`,
      ),
      c.newline()),
    c.push('return '),
    Qn(c, e),
    c.deindent(i),
    c.push('}'),
    delete e.helpers;
  const { code: l, map: u } = c.context();
  return { ast: e, code: l, map: u ? u.toJSON() : void 0 };
};
function zm(e, t = {}) {
  const n = qe({}, t),
    r = !!n.jit,
    s = !!n.minify,
    o = n.optimize == null ? !0 : n.optimize,
    a = Mm(n).parse(e);
  return r ? (o && $m(a), s && Nn(a), { ast: a, code: '' }) : (Um(a, n), Gm(a, n));
}
/*!
 * core-base v11.1.12
 * (c) 2025 kazuya kawaguchi
 * Released under the MIT License.
 */ function Ym() {
  typeof __INTLIFY_PROD_DEVTOOLS__ != 'boolean' && (yn().__INTLIFY_PROD_DEVTOOLS__ = !1),
    typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != 'boolean' &&
      (yn().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1);
}
function kt(e) {
  return Ce(e) && pa(e) === 0 && (Et(e, 'b') || Et(e, 'body'));
}
const lf = ['b', 'body'];
function Xm(e) {
  return gn(e, lf);
}
const uf = ['c', 'cases'];
function Qm(e) {
  return gn(e, uf, []);
}
const ff = ['s', 'static'];
function Jm(e) {
  return gn(e, ff);
}
const df = ['i', 'items'];
function Zm(e) {
  return gn(e, df, []);
}
const hf = ['t', 'type'];
function pa(e) {
  return gn(e, hf);
}
const xf = ['v', 'value'];
function Zr(e, t) {
  const n = gn(e, xf);
  if (n != null) return n;
  throw Sr(t);
}
const pf = ['m', 'modifier'];
function e1(e) {
  return gn(e, pf);
}
const gf = ['k', 'key'];
function t1(e) {
  const t = gn(e, gf);
  if (t) return t;
  throw Sr(6);
}
function gn(e, t, n) {
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    if (Et(e, s) && e[s] != null) return e[s];
  }
  return n;
}
const mf = [...lf, ...uf, ...ff, ...df, ...gf, ...pf, ...xf, ...hf];
function Sr(e) {
  return new Error(`unhandled node type: ${e}`);
}
function Qo(e) {
  return (n) => n1(n, e);
}
function n1(e, t) {
  const n = Xm(t);
  if (n == null) throw Sr(0);
  if (pa(n) === 1) {
    const o = Qm(n);
    return e.plural(o.reduce((i, a) => [...i, Bc(e, a)], []));
  } else return Bc(e, n);
}
function Bc(e, t) {
  const n = Jm(t);
  if (n != null) return e.type === 'text' ? n : e.normalize([n]);
  {
    const r = Zm(t).reduce((s, o) => [...s, Pi(e, o)], []);
    return e.normalize(r);
  }
}
function Pi(e, t) {
  const n = pa(t);
  switch (n) {
    case 3:
      return Zr(t, n);
    case 9:
      return Zr(t, n);
    case 4: {
      const r = t;
      if (Et(r, 'k') && r.k) return e.interpolate(e.named(r.k));
      if (Et(r, 'key') && r.key) return e.interpolate(e.named(r.key));
      throw Sr(n);
    }
    case 5: {
      const r = t;
      if (Et(r, 'i') && He(r.i)) return e.interpolate(e.list(r.i));
      if (Et(r, 'index') && He(r.index)) return e.interpolate(e.list(r.index));
      throw Sr(n);
    }
    case 6: {
      const r = t,
        s = e1(r),
        o = t1(r);
      return e.linked(Pi(e, o), s ? Pi(e, s) : void 0, e.type);
    }
    case 7:
      return Zr(t, n);
    case 8:
      return Zr(t, n);
    default:
      throw new Error(`unhandled node on format message part: ${n}`);
  }
}
const r1 = (e) => e;
let es = De();
function s1(e, t = {}) {
  let n = !1;
  const r = t.onError || Fm;
  return (
    (t.onError = (s) => {
      (n = !0), r(s);
    }),
    { ...zm(e, t), detectError: n }
  );
}
function o1(e, t) {
  if (!__INTLIFY_DROP_MESSAGE_COMPILER__ && re(e)) {
    Ee(t.warnHtmlMessage) && t.warnHtmlMessage;
    const r = (t.onCacheKey || r1)(e),
      s = es[r];
    if (s) return s;
    const { ast: o, detectError: i } = s1(e, { ...t, location: !1, jit: !0 }),
      a = Qo(o);
    return i ? a : (es[r] = a);
  } else {
    const n = e.cacheKey;
    if (n) {
      const r = es[n];
      return r || (es[n] = Qo(e));
    } else return Qo(e);
  }
}
let Tr = null;
function i1(e) {
  Tr = e;
}
function a1(e, t, n) {
  Tr && Tr.emit('i18n:init', { timestamp: Date.now(), i18n: e, version: t, meta: n });
}
const c1 = l1('function:translate');
function l1(e) {
  return (t) => Tr && Tr.emit(e, t);
}
const Ut = {
    INVALID_ARGUMENT: Dm,
    INVALID_DATE_ARGUMENT: 18,
    INVALID_ISO_DATE_ARGUMENT: 19,
    NOT_SUPPORT_NON_STRING_MESSAGE: 20,
    NOT_SUPPORT_LOCALE_PROMISE_VALUE: 21,
    NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: 22,
    NOT_SUPPORT_LOCALE_TYPE: 23,
  },
  u1 = 24;
function $t(e) {
  return Ys(e, null, void 0);
}
function ga(e, t) {
  return t.locale != null ? Dc(t.locale) : Dc(e.locale);
}
let Jo;
function Dc(e) {
  if (re(e)) return e;
  if (ke(e)) {
    if (e.resolvedOnce && Jo != null) return Jo;
    if (e.constructor.name === 'Function') {
      const t = e();
      if (Cm(t)) throw $t(Ut.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
      return (Jo = t);
    } else throw $t(Ut.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
  } else throw $t(Ut.NOT_SUPPORT_LOCALE_TYPE);
}
function f1(e, t, n) {
  return [...new Set([n, ...(Ie(t) ? t : Ce(t) ? Object.keys(t) : re(t) ? [t] : [n])])];
}
function _f(e, t, n) {
  const r = re(n) ? n : Rr,
    s = e;
  s.__localeChainCache || (s.__localeChainCache = new Map());
  let o = s.__localeChainCache.get(r);
  if (!o) {
    o = [];
    let i = [n];
    for (; Ie(i); ) i = Fc(o, i, t);
    const a = Ie(t) || !xe(t) ? t : t.default ? t.default : null;
    (i = re(a) ? [a] : a), Ie(i) && Fc(o, i, !1), s.__localeChainCache.set(r, o);
  }
  return o;
}
function Fc(e, t, n) {
  let r = !0;
  for (let s = 0; s < t.length && Ee(r); s++) {
    const o = t[s];
    re(o) && (r = d1(e, t[s], n));
  }
  return r;
}
function d1(e, t, n) {
  let r;
  const s = t.split('-');
  do {
    const o = s.join('-');
    (r = h1(e, o, n)), s.splice(-1, 1);
  } while (s.length && r === !0);
  return r;
}
function h1(e, t, n) {
  let r = !1;
  if (!e.includes(t) && ((r = !0), t)) {
    r = t[t.length - 1] !== '!';
    const s = t.replace(/!/g, '');
    e.push(s), (Ie(n) || xe(n)) && n[s] && (r = n[s]);
  }
  return r;
}
const mn = [];
mn[0] = { w: [0], i: [3, 0], '[': [4], o: [7] };
mn[1] = { w: [1], '.': [2], '[': [4], o: [7] };
mn[2] = { w: [2], i: [3, 0], 0: [3, 0] };
mn[3] = { i: [3, 0], 0: [3, 0], w: [1, 1], '.': [2, 1], '[': [4, 1], o: [7, 1] };
mn[4] = { "'": [5, 0], '"': [6, 0], '[': [4, 2], ']': [1, 3], o: 8, l: [4, 0] };
mn[5] = { "'": [4, 0], o: 8, l: [5, 0] };
mn[6] = { '"': [4, 0], o: 8, l: [6, 0] };
const x1 = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function p1(e) {
  return x1.test(e);
}
function g1(e) {
  const t = e.charCodeAt(0),
    n = e.charCodeAt(e.length - 1);
  return t === n && (t === 34 || t === 39) ? e.slice(1, -1) : e;
}
function m1(e) {
  if (e == null) return 'o';
  switch (e.charCodeAt(0)) {
    case 91:
    case 93:
    case 46:
    case 34:
    case 39:
      return e;
    case 95:
    case 36:
    case 45:
      return 'i';
    case 9:
    case 10:
    case 13:
    case 160:
    case 65279:
    case 8232:
    case 8233:
      return 'w';
  }
  return 'i';
}
function _1(e) {
  const t = e.trim();
  return e.charAt(0) === '0' && isNaN(parseInt(e)) ? !1 : p1(t) ? g1(t) : '*' + t;
}
function v1(e) {
  const t = [];
  let n = -1,
    r = 0,
    s = 0,
    o,
    i,
    a,
    c,
    l,
    u,
    f;
  const d = [];
  (d[0] = () => {
    i === void 0 ? (i = a) : (i += a);
  }),
    (d[1] = () => {
      i !== void 0 && (t.push(i), (i = void 0));
    }),
    (d[2] = () => {
      d[0](), s++;
    }),
    (d[3] = () => {
      if (s > 0) s--, (r = 4), d[0]();
      else {
        if (((s = 0), i === void 0 || ((i = _1(i)), i === !1))) return !1;
        d[1]();
      }
    });
  function p() {
    const m = e[n + 1];
    if ((r === 5 && m === "'") || (r === 6 && m === '"')) return n++, (a = '\\' + m), d[0](), !0;
  }
  for (; r !== null; )
    if ((n++, (o = e[n]), !(o === '\\' && p()))) {
      if (
        ((c = m1(o)),
        (f = mn[r]),
        (l = f[c] || f.l || 8),
        l === 8 || ((r = l[0]), l[1] !== void 0 && ((u = d[l[1]]), u && ((a = o), u() === !1))))
      )
        return;
      if (r === 7) return t;
    }
}
const Pc = new Map();
function y1(e, t) {
  return Ce(e) ? e[t] : null;
}
function E1(e, t) {
  if (!Ce(e)) return null;
  let n = Pc.get(t);
  if ((n || ((n = v1(t)), n && Pc.set(t, n)), !n)) return null;
  const r = n.length;
  let s = e,
    o = 0;
  for (; o < r; ) {
    const i = n[o];
    if (mf.includes(i) && kt(s)) return null;
    const a = s[i];
    if (a === void 0 || ke(s)) return null;
    (s = a), o++;
  }
  return s;
}
const b1 = '11.1.12',
  Xs = -1,
  Rr = 'en-US',
  Sc = '',
  Tc = (e) => `${e.charAt(0).toLocaleUpperCase()}${e.substr(1)}`;
function C1() {
  return {
    upper: (e, t) =>
      t === 'text' && re(e)
        ? e.toUpperCase()
        : t === 'vnode' && Ce(e) && '__v_isVNode' in e
          ? e.children.toUpperCase()
          : e,
    lower: (e, t) =>
      t === 'text' && re(e)
        ? e.toLowerCase()
        : t === 'vnode' && Ce(e) && '__v_isVNode' in e
          ? e.children.toLowerCase()
          : e,
    capitalize: (e, t) =>
      t === 'text' && re(e)
        ? Tc(e)
        : t === 'vnode' && Ce(e) && '__v_isVNode' in e
          ? Tc(e.children)
          : e,
  };
}
let vf;
function A1(e) {
  vf = e;
}
let yf;
function B1(e) {
  yf = e;
}
let Ef;
function D1(e) {
  Ef = e;
}
let bf = null;
const F1 = (e) => {
    bf = e;
  },
  P1 = () => bf;
let Cf = null;
const Rc = (e) => {
    Cf = e;
  },
  S1 = () => Cf;
let wc = 0;
function T1(e = {}) {
  const t = ke(e.onWarn) ? e.onWarn : gm,
    n = re(e.version) ? e.version : b1,
    r = re(e.locale) || ke(e.locale) ? e.locale : Rr,
    s = ke(r) ? Rr : r,
    o =
      Ie(e.fallbackLocale) ||
      xe(e.fallbackLocale) ||
      re(e.fallbackLocale) ||
      e.fallbackLocale === !1
        ? e.fallbackLocale
        : s,
    i = xe(e.messages) ? e.messages : Zo(s),
    a = xe(e.datetimeFormats) ? e.datetimeFormats : Zo(s),
    c = xe(e.numberFormats) ? e.numberFormats : Zo(s),
    l = qe(De(), e.modifiers, C1()),
    u = e.pluralRules || De(),
    f = ke(e.missing) ? e.missing : null,
    d = Ee(e.missingWarn) || Xn(e.missingWarn) ? e.missingWarn : !0,
    p = Ee(e.fallbackWarn) || Xn(e.fallbackWarn) ? e.fallbackWarn : !0,
    m = !!e.fallbackFormat,
    v = !!e.unresolving,
    E = ke(e.postTranslation) ? e.postTranslation : null,
    _ = xe(e.processor) ? e.processor : null,
    g = Ee(e.warnHtmlMessage) ? e.warnHtmlMessage : !0,
    h = !!e.escapeParameter,
    x = ke(e.messageCompiler) ? e.messageCompiler : vf,
    y = ke(e.messageResolver) ? e.messageResolver : yf || y1,
    C = ke(e.localeFallbacker) ? e.localeFallbacker : Ef || f1,
    A = Ce(e.fallbackContext) ? e.fallbackContext : void 0,
    w = e,
    D = Ce(w.__datetimeFormatters) ? w.__datetimeFormatters : new Map(),
    b = Ce(w.__numberFormatters) ? w.__numberFormatters : new Map(),
    F = Ce(w.__meta) ? w.__meta : {};
  wc++;
  const T = {
    version: n,
    cid: wc,
    locale: r,
    fallbackLocale: o,
    messages: i,
    modifiers: l,
    pluralRules: u,
    missing: f,
    missingWarn: d,
    fallbackWarn: p,
    fallbackFormat: m,
    unresolving: v,
    postTranslation: E,
    processor: _,
    warnHtmlMessage: g,
    escapeParameter: h,
    messageCompiler: x,
    messageResolver: y,
    localeFallbacker: C,
    fallbackContext: A,
    onWarn: t,
    __meta: F,
  };
  return (
    (T.datetimeFormats = a),
    (T.numberFormats = c),
    (T.__datetimeFormatters = D),
    (T.__numberFormatters = b),
    __INTLIFY_PROD_DEVTOOLS__ && a1(T, n, F),
    T
  );
}
const Zo = (e) => ({ [e]: De() });
function ma(e, t, n, r, s) {
  const { missing: o, onWarn: i } = e;
  if (o !== null) {
    const a = o(e, n, t, s);
    return re(a) ? a : t;
  } else return t;
}
function ir(e, t, n) {
  const r = e;
  (r.__localeChainCache = new Map()), e.localeFallbacker(e, n, t);
}
function R1(e, t) {
  return e === t ? !1 : e.split('-')[0] === t.split('-')[0];
}
function w1(e, t) {
  const n = t.indexOf(e);
  if (n === -1) return !1;
  for (let r = n + 1; r < t.length; r++) if (R1(e, t[r])) return !0;
  return !1;
}
function kc(e, ...t) {
  const {
      datetimeFormats: n,
      unresolving: r,
      fallbackLocale: s,
      onWarn: o,
      localeFallbacker: i,
    } = e,
    { __datetimeFormatters: a } = e,
    [c, l, u, f] = Si(...t),
    d = Ee(u.missingWarn) ? u.missingWarn : e.missingWarn;
  Ee(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn;
  const p = !!u.part,
    m = ga(e, u),
    v = i(e, s, m);
  if (!re(c) || c === '') return new Intl.DateTimeFormat(m, f).format(l);
  let E = {},
    _,
    g = null;
  const h = 'datetime format';
  for (let C = 0; C < v.length && ((_ = v[C]), (E = n[_] || {}), (g = E[c]), !xe(g)); C++)
    ma(e, c, _, d, h);
  if (!xe(g) || !re(_)) return r ? Xs : c;
  let x = `${_}__${c}`;
  zs(f) || (x = `${x}__${JSON.stringify(f)}`);
  let y = a.get(x);
  return (
    y || ((y = new Intl.DateTimeFormat(_, qe({}, g, f))), a.set(x, y)),
    p ? y.formatToParts(l) : y.format(l)
  );
}
const Af = [
  'localeMatcher',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
  'formatMatcher',
  'hour12',
  'timeZone',
  'dateStyle',
  'timeStyle',
  'calendar',
  'dayPeriod',
  'numberingSystem',
  'hourCycle',
  'fractionalSecondDigits',
];
function Si(...e) {
  const [t, n, r, s] = e,
    o = De();
  let i = De(),
    a;
  if (re(t)) {
    const c = t.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
    if (!c) throw $t(Ut.INVALID_ISO_DATE_ARGUMENT);
    const l = c[3]
      ? c[3].trim().startsWith('T')
        ? `${c[1].trim()}${c[3].trim()}`
        : `${c[1].trim()}T${c[3].trim()}`
      : c[1].trim();
    a = new Date(l);
    try {
      a.toISOString();
    } catch {
      throw $t(Ut.INVALID_ISO_DATE_ARGUMENT);
    }
  } else if (vm(t)) {
    if (isNaN(t.getTime())) throw $t(Ut.INVALID_DATE_ARGUMENT);
    a = t;
  } else if (He(t)) a = t;
  else throw $t(Ut.INVALID_ARGUMENT);
  return (
    re(n)
      ? (o.key = n)
      : xe(n) &&
        Object.keys(n).forEach((c) => {
          Af.includes(c) ? (i[c] = n[c]) : (o[c] = n[c]);
        }),
    re(r) ? (o.locale = r) : xe(r) && (i = r),
    xe(s) && (i = s),
    [o.key || '', a, o, i]
  );
}
function Oc(e, t, n) {
  const r = e;
  for (const s in n) {
    const o = `${t}__${s}`;
    r.__datetimeFormatters.has(o) && r.__datetimeFormatters.delete(o);
  }
}
function Lc(e, ...t) {
  const { numberFormats: n, unresolving: r, fallbackLocale: s, onWarn: o, localeFallbacker: i } = e,
    { __numberFormatters: a } = e,
    [c, l, u, f] = Ti(...t),
    d = Ee(u.missingWarn) ? u.missingWarn : e.missingWarn;
  Ee(u.fallbackWarn) ? u.fallbackWarn : e.fallbackWarn;
  const p = !!u.part,
    m = ga(e, u),
    v = i(e, s, m);
  if (!re(c) || c === '') return new Intl.NumberFormat(m, f).format(l);
  let E = {},
    _,
    g = null;
  const h = 'number format';
  for (let C = 0; C < v.length && ((_ = v[C]), (E = n[_] || {}), (g = E[c]), !xe(g)); C++)
    ma(e, c, _, d, h);
  if (!xe(g) || !re(_)) return r ? Xs : c;
  let x = `${_}__${c}`;
  zs(f) || (x = `${x}__${JSON.stringify(f)}`);
  let y = a.get(x);
  return (
    y || ((y = new Intl.NumberFormat(_, qe({}, g, f))), a.set(x, y)),
    p ? y.formatToParts(l) : y.format(l)
  );
}
const Bf = [
  'localeMatcher',
  'style',
  'currency',
  'currencyDisplay',
  'currencySign',
  'useGrouping',
  'minimumIntegerDigits',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'compactDisplay',
  'notation',
  'signDisplay',
  'unit',
  'unitDisplay',
  'roundingMode',
  'roundingPriority',
  'roundingIncrement',
  'trailingZeroDisplay',
];
function Ti(...e) {
  const [t, n, r, s] = e,
    o = De();
  let i = De();
  if (!He(t)) throw $t(Ut.INVALID_ARGUMENT);
  const a = t;
  return (
    re(n)
      ? (o.key = n)
      : xe(n) &&
        Object.keys(n).forEach((c) => {
          Bf.includes(c) ? (i[c] = n[c]) : (o[c] = n[c]);
        }),
    re(r) ? (o.locale = r) : xe(r) && (i = r),
    xe(s) && (i = s),
    [o.key || '', a, o, i]
  );
}
function Nc(e, t, n) {
  const r = e;
  for (const s in n) {
    const o = `${t}__${s}`;
    r.__numberFormatters.has(o) && r.__numberFormatters.delete(o);
  }
}
const k1 = (e) => e,
  O1 = (e) => '',
  L1 = 'text',
  N1 = (e) => (e.length === 0 ? '' : ha(e)),
  I1 = Am;
function Ic(e, t) {
  return (e = Math.abs(e)), t === 2 ? (e ? (e > 1 ? 1 : 0) : 1) : e ? Math.min(e, 2) : 0;
}
function M1(e) {
  const t = He(e.pluralIndex) ? e.pluralIndex : -1;
  return e.named && (He(e.named.count) || He(e.named.n))
    ? He(e.named.count)
      ? e.named.count
      : He(e.named.n)
        ? e.named.n
        : t
    : t;
}
function H1(e, t) {
  t.count || (t.count = e), t.n || (t.n = e);
}
function U1(e = {}) {
  const t = e.locale,
    n = M1(e),
    r = Ce(e.pluralRules) && re(t) && ke(e.pluralRules[t]) ? e.pluralRules[t] : Ic,
    s = Ce(e.pluralRules) && re(t) && ke(e.pluralRules[t]) ? Ic : void 0,
    o = (_) => _[r(n, _.length, s)],
    i = e.list || [],
    a = (_) => i[_],
    c = e.named || De();
  He(e.pluralIndex) && H1(n, c);
  const l = (_) => c[_];
  function u(_, g) {
    const h = ke(e.messages) ? e.messages(_, !!g) : Ce(e.messages) ? e.messages[_] : !1;
    return h || (e.parent ? e.parent.message(_) : O1);
  }
  const f = (_) => (e.modifiers ? e.modifiers[_] : k1),
    d = xe(e.processor) && ke(e.processor.normalize) ? e.processor.normalize : N1,
    p = xe(e.processor) && ke(e.processor.interpolate) ? e.processor.interpolate : I1,
    m = xe(e.processor) && re(e.processor.type) ? e.processor.type : L1,
    E = {
      list: a,
      named: l,
      plural: o,
      linked: (_, ...g) => {
        const [h, x] = g;
        let y = 'text',
          C = '';
        g.length === 1
          ? Ce(h)
            ? ((C = h.modifier || C), (y = h.type || y))
            : re(h) && (C = h || C)
          : g.length === 2 && (re(h) && (C = h || C), re(x) && (y = x || y));
        const A = u(_, !0)(E),
          w = y === 'vnode' && Ie(A) && C ? A[0] : A;
        return C ? f(C)(w, y) : w;
      },
      message: u,
      type: m,
      interpolate: p,
      normalize: d,
      values: qe(De(), i, c),
    };
  return E;
}
const Mc = () => '',
  gt = (e) => ke(e);
function Hc(e, ...t) {
  const {
      fallbackFormat: n,
      postTranslation: r,
      unresolving: s,
      messageCompiler: o,
      fallbackLocale: i,
      messages: a,
    } = e,
    [c, l] = Ri(...t),
    u = Ee(l.missingWarn) ? l.missingWarn : e.missingWarn,
    f = Ee(l.fallbackWarn) ? l.fallbackWarn : e.fallbackWarn,
    d = Ee(l.escapeParameter) ? l.escapeParameter : e.escapeParameter,
    p = !!l.resolvedMessage,
    m =
      re(l.default) || Ee(l.default)
        ? Ee(l.default)
          ? o
            ? c
            : () => c
          : l.default
        : n
          ? o
            ? c
            : () => c
          : null,
    v = n || (m != null && (re(m) || ke(m))),
    E = ga(e, l);
  d && $1(l);
  let [_, g, h] = p ? [c, E, a[E] || De()] : Df(e, c, E, i, f, u),
    x = _,
    y = c;
  if (
    (!p && !(re(x) || kt(x) || gt(x)) && v && ((x = m), (y = x)),
    !p && (!(re(x) || kt(x) || gt(x)) || !re(g)))
  )
    return s ? Xs : c;
  let C = !1;
  const A = () => {
      C = !0;
    },
    w = gt(x) ? x : Ff(e, c, g, x, y, A);
  if (C) return x;
  const D = q1(e, g, h, l),
    b = U1(D),
    F = V1(e, w, b);
  let T = r ? r(F, c) : F;
  if ((d && re(T) && (T = Em(T)), __INTLIFY_PROD_DEVTOOLS__)) {
    const O = {
      timestamp: Date.now(),
      key: re(c) ? c : gt(x) ? x.key : '',
      locale: g || (gt(x) ? x.locale : ''),
      format: re(x) ? x : gt(x) ? x.source : '',
      message: T,
    };
    (O.meta = qe({}, e.__meta, P1() || {})), c1(O);
  }
  return T;
}
function $1(e) {
  Ie(e.list)
    ? (e.list = e.list.map((t) => (re(t) ? yc(t) : t)))
    : Ce(e.named) &&
      Object.keys(e.named).forEach((t) => {
        re(e.named[t]) && (e.named[t] = yc(e.named[t]));
      });
}
function Df(e, t, n, r, s, o) {
  const { messages: i, onWarn: a, messageResolver: c, localeFallbacker: l } = e,
    u = l(e, r, n);
  let f = De(),
    d,
    p = null;
  const m = 'translate';
  for (
    let v = 0;
    v < u.length &&
    ((d = u[v]),
    (f = i[d] || De()),
    (p = c(f, t)) === null && (p = f[t]),
    !(re(p) || kt(p) || gt(p)));
    v++
  )
    if (!w1(d, u)) {
      const E = ma(e, t, d, o, m);
      E !== t && (p = E);
    }
  return [p, d, f];
}
function Ff(e, t, n, r, s, o) {
  const { messageCompiler: i, warnHtmlMessage: a } = e;
  if (gt(r)) {
    const l = r;
    return (l.locale = l.locale || n), (l.key = l.key || t), l;
  }
  if (i == null) {
    const l = () => r;
    return (l.locale = n), (l.key = t), l;
  }
  const c = i(r, W1(e, n, s, r, a, o));
  return (c.locale = n), (c.key = t), (c.source = r), c;
}
function V1(e, t, n) {
  return t(n);
}
function Ri(...e) {
  const [t, n, r] = e,
    s = De();
  if (!re(t) && !He(t) && !gt(t) && !kt(t)) throw $t(Ut.INVALID_ARGUMENT);
  const o = He(t) ? String(t) : (gt(t), t);
  return (
    He(n)
      ? (s.plural = n)
      : re(n)
        ? (s.default = n)
        : xe(n) && !zs(n)
          ? (s.named = n)
          : Ie(n) && (s.list = n),
    He(r) ? (s.plural = r) : re(r) ? (s.default = r) : xe(r) && qe(s, r),
    [o, s]
  );
}
function W1(e, t, n, r, s, o) {
  return {
    locale: t,
    key: n,
    warnHtmlMessage: s,
    onError: (i) => {
      throw (o && o(i), i);
    },
    onCacheKey: (i) => mm(t, n, i),
  };
}
function q1(e, t, n, r) {
  const {
      modifiers: s,
      pluralRules: o,
      messageResolver: i,
      fallbackLocale: a,
      fallbackWarn: c,
      missingWarn: l,
      fallbackContext: u,
    } = e,
    d = {
      locale: t,
      modifiers: s,
      pluralRules: o,
      messages: (p, m) => {
        let v = i(n, p);
        if (v == null && (u || m)) {
          const [, , E] = Df(u || e, p, t, a, c, l);
          v = i(E, p);
        }
        if (re(v) || kt(v)) {
          let E = !1;
          const g = Ff(e, p, t, v, p, () => {
            E = !0;
          });
          return E ? Mc : g;
        } else return gt(v) ? v : Mc;
      },
    };
  return (
    e.processor && (d.processor = e.processor),
    r.list && (d.list = r.list),
    r.named && (d.named = r.named),
    He(r.plural) && (d.pluralIndex = r.plural),
    d
  );
}
Ym();
/*!
 * vue-i18n v11.1.12
 * (c) 2025 kazuya kawaguchi
 * Released under the MIT License.
 */ const j1 = '11.1.12';
function K1() {
  typeof __VUE_I18N_FULL_INSTALL__ != 'boolean' && (yn().__VUE_I18N_FULL_INSTALL__ = !0),
    typeof __VUE_I18N_LEGACY_API__ != 'boolean' && (yn().__VUE_I18N_LEGACY_API__ = !0),
    typeof __INTLIFY_DROP_MESSAGE_COMPILER__ != 'boolean' &&
      (yn().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1),
    typeof __INTLIFY_PROD_DEVTOOLS__ != 'boolean' && (yn().__INTLIFY_PROD_DEVTOOLS__ = !1);
}
const ut = {
  UNEXPECTED_RETURN_TYPE: u1,
  INVALID_ARGUMENT: 25,
  MUST_BE_CALL_SETUP_TOP: 26,
  NOT_INSTALLED: 27,
  REQUIRED_VALUE: 28,
  INVALID_VALUE: 29,
  CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: 30,
  NOT_INSTALLED_WITH_PROVIDE: 31,
  UNEXPECTED_ERROR: 32,
  NOT_COMPATIBLE_LEGACY_VUE_I18N: 33,
  NOT_AVAILABLE_COMPOSITION_IN_LEGACY: 34,
};
function ht(e, ...t) {
  return Ys(e, null, void 0);
}
const wi = pn('__translateVNode'),
  ki = pn('__datetimeParts'),
  Oi = pn('__numberParts'),
  Pf = pn('__setPluralRules'),
  Sf = pn('__injectWithOption'),
  Li = pn('__dispose');
function wr(e) {
  if (!Ce(e) || kt(e)) return e;
  for (const t in e)
    if (Et(e, t))
      if (!t.includes('.')) Ce(e[t]) && wr(e[t]);
      else {
        const n = t.split('.'),
          r = n.length - 1;
        let s = e,
          o = !1;
        for (let i = 0; i < r; i++) {
          if (n[i] === '__proto__') throw new Error(`unsafe key: ${n[i]}`);
          if ((n[i] in s || (s[n[i]] = De()), !Ce(s[n[i]]))) {
            o = !0;
            break;
          }
          s = s[n[i]];
        }
        if (
          (o || (kt(s) ? mf.includes(n[r]) || delete e[t] : ((s[n[r]] = e[t]), delete e[t])),
          !kt(s))
        ) {
          const i = s[n[r]];
          Ce(i) && wr(i);
        }
      }
  return e;
}
function _a(e, t) {
  const { messages: n, __i18n: r, messageResolver: s, flatJson: o } = t,
    i = xe(n) ? n : Ie(r) ? De() : { [e]: De() };
  if (
    (Ie(r) &&
      r.forEach((a) => {
        if ('locale' in a && 'resource' in a) {
          const { locale: c, resource: l } = a;
          c ? ((i[c] = i[c] || De()), as(l, i[c])) : as(l, i);
        } else re(a) && as(JSON.parse(a), i);
      }),
    s == null && o)
  )
    for (const a in i) Et(i, a) && wr(i[a]);
  return i;
}
function Tf(e) {
  return e.type;
}
function Rf(e, t, n) {
  let r = Ce(t.messages) ? t.messages : De();
  '__i18nGlobal' in n && (r = _a(e.locale.value, { messages: r, __i18n: n.__i18nGlobal }));
  const s = Object.keys(r);
  s.length &&
    s.forEach((o) => {
      e.mergeLocaleMessage(o, r[o]);
    });
  {
    if (Ce(t.datetimeFormats)) {
      const o = Object.keys(t.datetimeFormats);
      o.length &&
        o.forEach((i) => {
          e.mergeDateTimeFormat(i, t.datetimeFormats[i]);
        });
    }
    if (Ce(t.numberFormats)) {
      const o = Object.keys(t.numberFormats);
      o.length &&
        o.forEach((i) => {
          e.mergeNumberFormat(i, t.numberFormats[i]);
        });
    }
  }
}
function Uc(e) {
  return he(cn, null, e, 0);
}
const $c = '__INTLIFY_META__',
  Vc = () => [],
  G1 = () => !1;
let Wc = 0;
function qc(e) {
  return (t, n, r, s) => e(n, r, Ze() || void 0, s);
}
const z1 = () => {
  const e = Ze();
  let t = null;
  return e && (t = Tf(e)[$c]) ? { [$c]: t } : null;
};
function va(e = {}) {
  const { __root: t, __injectWithOption: n } = e,
    r = t === void 0,
    s = e.flatJson,
    o = Ds ? Wt : Gi;
  let i = Ee(e.inheritLocale) ? e.inheritLocale : !0;
  const a = o(t && i ? t.locale.value : re(e.locale) ? e.locale : Rr),
    c = o(
      t && i
        ? t.fallbackLocale.value
        : re(e.fallbackLocale) ||
            Ie(e.fallbackLocale) ||
            xe(e.fallbackLocale) ||
            e.fallbackLocale === !1
          ? e.fallbackLocale
          : a.value,
    ),
    l = o(_a(a.value, e)),
    u = o(xe(e.datetimeFormats) ? e.datetimeFormats : { [a.value]: {} }),
    f = o(xe(e.numberFormats) ? e.numberFormats : { [a.value]: {} });
  let d = t ? t.missingWarn : Ee(e.missingWarn) || Xn(e.missingWarn) ? e.missingWarn : !0,
    p = t ? t.fallbackWarn : Ee(e.fallbackWarn) || Xn(e.fallbackWarn) ? e.fallbackWarn : !0,
    m = t ? t.fallbackRoot : Ee(e.fallbackRoot) ? e.fallbackRoot : !0,
    v = !!e.fallbackFormat,
    E = ke(e.missing) ? e.missing : null,
    _ = ke(e.missing) ? qc(e.missing) : null,
    g = ke(e.postTranslation) ? e.postTranslation : null,
    h = t ? t.warnHtmlMessage : Ee(e.warnHtmlMessage) ? e.warnHtmlMessage : !0,
    x = !!e.escapeParameter;
  const y = t ? t.modifiers : xe(e.modifiers) ? e.modifiers : {};
  let C = e.pluralRules || (t && t.pluralRules),
    A;
  (A = (() => {
    r && Rc(null);
    const k = {
      version: j1,
      locale: a.value,
      fallbackLocale: c.value,
      messages: l.value,
      modifiers: y,
      pluralRules: C,
      missing: _ === null ? void 0 : _,
      missingWarn: d,
      fallbackWarn: p,
      fallbackFormat: v,
      unresolving: !0,
      postTranslation: g === null ? void 0 : g,
      warnHtmlMessage: h,
      escapeParameter: x,
      messageResolver: e.messageResolver,
      messageCompiler: e.messageCompiler,
      __meta: { framework: 'vue' },
    };
    (k.datetimeFormats = u.value),
      (k.numberFormats = f.value),
      (k.__datetimeFormatters = xe(A) ? A.__datetimeFormatters : void 0),
      (k.__numberFormatters = xe(A) ? A.__numberFormatters : void 0);
    const M = T1(k);
    return r && Rc(M), M;
  })()),
    ir(A, a.value, c.value);
  function D() {
    return [a.value, c.value, l.value, u.value, f.value];
  }
  const b = Me({
      get: () => a.value,
      set: (k) => {
        (A.locale = k), (a.value = k);
      },
    }),
    F = Me({
      get: () => c.value,
      set: (k) => {
        (A.fallbackLocale = k), (c.value = k), ir(A, a.value, k);
      },
    }),
    T = Me(() => l.value),
    O = Me(() => u.value),
    Y = Me(() => f.value);
  function J() {
    return ke(g) ? g : null;
  }
  function q(k) {
    (g = k), (A.postTranslation = k);
  }
  function Z() {
    return E;
  }
  function X(k) {
    k !== null && (_ = qc(k)), (E = k), (A.missing = _);
  }
  const ie = (k, M, te, oe, pe, de) => {
    D();
    let Oe;
    try {
      __INTLIFY_PROD_DEVTOOLS__, r || (A.fallbackContext = t ? S1() : void 0), (Oe = k(A));
    } finally {
      __INTLIFY_PROD_DEVTOOLS__, r || (A.fallbackContext = void 0);
    }
    if ((te !== 'translate exists' && He(Oe) && Oe === Xs) || (te === 'translate exists' && !Oe)) {
      const [Re, je] = M();
      return t && m ? oe(t) : pe(Re);
    } else {
      if (de(Oe)) return Oe;
      throw ht(ut.UNEXPECTED_RETURN_TYPE);
    }
  };
  function ce(...k) {
    return ie(
      (M) => Reflect.apply(Hc, null, [M, ...k]),
      () => Ri(...k),
      'translate',
      (M) => Reflect.apply(M.t, M, [...k]),
      (M) => M,
      (M) => re(M),
    );
  }
  function $(...k) {
    const [M, te, oe] = k;
    if (oe && !Ce(oe)) throw ht(ut.INVALID_ARGUMENT);
    return ce(M, te, qe({ resolvedMessage: !0 }, oe || {}));
  }
  function W(...k) {
    return ie(
      (M) => Reflect.apply(kc, null, [M, ...k]),
      () => Si(...k),
      'datetime format',
      (M) => Reflect.apply(M.d, M, [...k]),
      () => Sc,
      (M) => re(M) || Ie(M),
    );
  }
  function z(...k) {
    return ie(
      (M) => Reflect.apply(Lc, null, [M, ...k]),
      () => Ti(...k),
      'number format',
      (M) => Reflect.apply(M.n, M, [...k]),
      () => Sc,
      (M) => re(M) || Ie(M),
    );
  }
  function j(k) {
    return k.map((M) => (re(M) || He(M) || Ee(M) ? Uc(String(M)) : M));
  }
  const le = { normalize: j, interpolate: (k) => k, type: 'vnode' };
  function H(...k) {
    return ie(
      (M) => {
        let te;
        const oe = M;
        try {
          (oe.processor = le), (te = Reflect.apply(Hc, null, [oe, ...k]));
        } finally {
          oe.processor = null;
        }
        return te;
      },
      () => Ri(...k),
      'translate',
      (M) => M[wi](...k),
      (M) => [Uc(M)],
      (M) => Ie(M),
    );
  }
  function K(...k) {
    return ie(
      (M) => Reflect.apply(Lc, null, [M, ...k]),
      () => Ti(...k),
      'number format',
      (M) => M[Oi](...k),
      Vc,
      (M) => re(M) || Ie(M),
    );
  }
  function ee(...k) {
    return ie(
      (M) => Reflect.apply(kc, null, [M, ...k]),
      () => Si(...k),
      'datetime format',
      (M) => M[ki](...k),
      Vc,
      (M) => re(M) || Ie(M),
    );
  }
  function ne(k) {
    (C = k), (A.pluralRules = C);
  }
  function fe(k, M) {
    return ie(
      () => {
        if (!k) return !1;
        const te = re(M) ? M : a.value,
          oe = R(te),
          pe = A.messageResolver(oe, k);
        return kt(pe) || gt(pe) || re(pe);
      },
      () => [k],
      'translate exists',
      (te) => Reflect.apply(te.te, te, [k, M]),
      G1,
      (te) => Ee(te),
    );
  }
  function _e(k) {
    let M = null;
    const te = _f(A, c.value, a.value);
    for (let oe = 0; oe < te.length; oe++) {
      const pe = l.value[te[oe]] || {},
        de = A.messageResolver(pe, k);
      if (de != null) {
        M = de;
        break;
      }
    }
    return M;
  }
  function P(k) {
    const M = _e(k);
    return M ?? (t ? t.tm(k) || {} : {});
  }
  function R(k) {
    return l.value[k] || {};
  }
  function N(k, M) {
    if (s) {
      const te = { [k]: M };
      for (const oe in te) Et(te, oe) && wr(te[oe]);
      M = te[k];
    }
    (l.value[k] = M), (A.messages = l.value);
  }
  function G(k, M) {
    l.value[k] = l.value[k] || {};
    const te = { [k]: M };
    if (s) for (const oe in te) Et(te, oe) && wr(te[oe]);
    (M = te[k]), as(M, l.value[k]), (A.messages = l.value);
  }
  function V(k) {
    return u.value[k] || {};
  }
  function B(k, M) {
    (u.value[k] = M), (A.datetimeFormats = u.value), Oc(A, k, M);
  }
  function S(k, M) {
    (u.value[k] = qe(u.value[k] || {}, M)), (A.datetimeFormats = u.value), Oc(A, k, M);
  }
  function L(k) {
    return f.value[k] || {};
  }
  function I(k, M) {
    (f.value[k] = M), (A.numberFormats = f.value), Nc(A, k, M);
  }
  function U(k, M) {
    (f.value[k] = qe(f.value[k] || {}, M)), (A.numberFormats = f.value), Nc(A, k, M);
  }
  Wc++,
    t &&
      Ds &&
      (wt(t.locale, (k) => {
        i && ((a.value = k), (A.locale = k), ir(A, a.value, c.value));
      }),
      wt(t.fallbackLocale, (k) => {
        i && ((c.value = k), (A.fallbackLocale = k), ir(A, a.value, c.value));
      }));
  const Q = {
    id: Wc,
    locale: b,
    fallbackLocale: F,
    get inheritLocale() {
      return i;
    },
    set inheritLocale(k) {
      (i = k),
        k &&
          t &&
          ((a.value = t.locale.value), (c.value = t.fallbackLocale.value), ir(A, a.value, c.value));
    },
    get availableLocales() {
      return Object.keys(l.value).sort();
    },
    messages: T,
    get modifiers() {
      return y;
    },
    get pluralRules() {
      return C || {};
    },
    get isGlobal() {
      return r;
    },
    get missingWarn() {
      return d;
    },
    set missingWarn(k) {
      (d = k), (A.missingWarn = d);
    },
    get fallbackWarn() {
      return p;
    },
    set fallbackWarn(k) {
      (p = k), (A.fallbackWarn = p);
    },
    get fallbackRoot() {
      return m;
    },
    set fallbackRoot(k) {
      m = k;
    },
    get fallbackFormat() {
      return v;
    },
    set fallbackFormat(k) {
      (v = k), (A.fallbackFormat = v);
    },
    get warnHtmlMessage() {
      return h;
    },
    set warnHtmlMessage(k) {
      (h = k), (A.warnHtmlMessage = k);
    },
    get escapeParameter() {
      return x;
    },
    set escapeParameter(k) {
      (x = k), (A.escapeParameter = k);
    },
    t: ce,
    getLocaleMessage: R,
    setLocaleMessage: N,
    mergeLocaleMessage: G,
    getPostTranslationHandler: J,
    setPostTranslationHandler: q,
    getMissingHandler: Z,
    setMissingHandler: X,
    [Pf]: ne,
  };
  return (
    (Q.datetimeFormats = O),
    (Q.numberFormats = Y),
    (Q.rt = $),
    (Q.te = fe),
    (Q.tm = P),
    (Q.d = W),
    (Q.n = z),
    (Q.getDateTimeFormat = V),
    (Q.setDateTimeFormat = B),
    (Q.mergeDateTimeFormat = S),
    (Q.getNumberFormat = L),
    (Q.setNumberFormat = I),
    (Q.mergeNumberFormat = U),
    (Q[Sf] = n),
    (Q[wi] = H),
    (Q[ki] = ee),
    (Q[Oi] = K),
    Q
  );
}
function Y1(e) {
  const t = re(e.locale) ? e.locale : Rr,
    n =
      re(e.fallbackLocale) ||
      Ie(e.fallbackLocale) ||
      xe(e.fallbackLocale) ||
      e.fallbackLocale === !1
        ? e.fallbackLocale
        : t,
    r = ke(e.missing) ? e.missing : void 0,
    s = Ee(e.silentTranslationWarn) || Xn(e.silentTranslationWarn) ? !e.silentTranslationWarn : !0,
    o = Ee(e.silentFallbackWarn) || Xn(e.silentFallbackWarn) ? !e.silentFallbackWarn : !0,
    i = Ee(e.fallbackRoot) ? e.fallbackRoot : !0,
    a = !!e.formatFallbackMessages,
    c = xe(e.modifiers) ? e.modifiers : {},
    l = e.pluralizationRules,
    u = ke(e.postTranslation) ? e.postTranslation : void 0,
    f = re(e.warnHtmlInMessage) ? e.warnHtmlInMessage !== 'off' : !0,
    d = !!e.escapeParameterHtml,
    p = Ee(e.sync) ? e.sync : !0;
  let m = e.messages;
  if (xe(e.sharedMessages)) {
    const y = e.sharedMessages;
    m = Object.keys(y).reduce((A, w) => {
      const D = A[w] || (A[w] = {});
      return qe(D, y[w]), A;
    }, m || {});
  }
  const { __i18n: v, __root: E, __injectWithOption: _ } = e,
    g = e.datetimeFormats,
    h = e.numberFormats,
    x = e.flatJson;
  return {
    locale: t,
    fallbackLocale: n,
    messages: m,
    flatJson: x,
    datetimeFormats: g,
    numberFormats: h,
    missing: r,
    missingWarn: s,
    fallbackWarn: o,
    fallbackRoot: i,
    fallbackFormat: a,
    modifiers: c,
    pluralRules: l,
    postTranslation: u,
    warnHtmlMessage: f,
    escapeParameter: d,
    messageResolver: e.messageResolver,
    inheritLocale: p,
    __i18n: v,
    __root: E,
    __injectWithOption: _,
  };
}
function Ni(e = {}) {
  const t = va(Y1(e)),
    { __extender: n } = e,
    r = {
      id: t.id,
      get locale() {
        return t.locale.value;
      },
      set locale(s) {
        t.locale.value = s;
      },
      get fallbackLocale() {
        return t.fallbackLocale.value;
      },
      set fallbackLocale(s) {
        t.fallbackLocale.value = s;
      },
      get messages() {
        return t.messages.value;
      },
      get datetimeFormats() {
        return t.datetimeFormats.value;
      },
      get numberFormats() {
        return t.numberFormats.value;
      },
      get availableLocales() {
        return t.availableLocales;
      },
      get missing() {
        return t.getMissingHandler();
      },
      set missing(s) {
        t.setMissingHandler(s);
      },
      get silentTranslationWarn() {
        return Ee(t.missingWarn) ? !t.missingWarn : t.missingWarn;
      },
      set silentTranslationWarn(s) {
        t.missingWarn = Ee(s) ? !s : s;
      },
      get silentFallbackWarn() {
        return Ee(t.fallbackWarn) ? !t.fallbackWarn : t.fallbackWarn;
      },
      set silentFallbackWarn(s) {
        t.fallbackWarn = Ee(s) ? !s : s;
      },
      get modifiers() {
        return t.modifiers;
      },
      get formatFallbackMessages() {
        return t.fallbackFormat;
      },
      set formatFallbackMessages(s) {
        t.fallbackFormat = s;
      },
      get postTranslation() {
        return t.getPostTranslationHandler();
      },
      set postTranslation(s) {
        t.setPostTranslationHandler(s);
      },
      get sync() {
        return t.inheritLocale;
      },
      set sync(s) {
        t.inheritLocale = s;
      },
      get warnHtmlInMessage() {
        return t.warnHtmlMessage ? 'warn' : 'off';
      },
      set warnHtmlInMessage(s) {
        t.warnHtmlMessage = s !== 'off';
      },
      get escapeParameterHtml() {
        return t.escapeParameter;
      },
      set escapeParameterHtml(s) {
        t.escapeParameter = s;
      },
      get pluralizationRules() {
        return t.pluralRules || {};
      },
      __composer: t,
      t(...s) {
        return Reflect.apply(t.t, t, [...s]);
      },
      rt(...s) {
        return Reflect.apply(t.rt, t, [...s]);
      },
      te(s, o) {
        return t.te(s, o);
      },
      tm(s) {
        return t.tm(s);
      },
      getLocaleMessage(s) {
        return t.getLocaleMessage(s);
      },
      setLocaleMessage(s, o) {
        t.setLocaleMessage(s, o);
      },
      mergeLocaleMessage(s, o) {
        t.mergeLocaleMessage(s, o);
      },
      d(...s) {
        return Reflect.apply(t.d, t, [...s]);
      },
      getDateTimeFormat(s) {
        return t.getDateTimeFormat(s);
      },
      setDateTimeFormat(s, o) {
        t.setDateTimeFormat(s, o);
      },
      mergeDateTimeFormat(s, o) {
        t.mergeDateTimeFormat(s, o);
      },
      n(...s) {
        return Reflect.apply(t.n, t, [...s]);
      },
      getNumberFormat(s) {
        return t.getNumberFormat(s);
      },
      setNumberFormat(s, o) {
        t.setNumberFormat(s, o);
      },
      mergeNumberFormat(s, o) {
        t.mergeNumberFormat(s, o);
      },
    };
  return (r.__extender = n), r;
}
function X1(e, t, n) {
  return {
    beforeCreate() {
      const r = Ze();
      if (!r) throw ht(ut.UNEXPECTED_ERROR);
      const s = this.$options;
      if (s.i18n) {
        const o = s.i18n;
        if ((s.__i18n && (o.__i18n = s.__i18n), (o.__root = t), this === this.$root))
          this.$i18n = jc(e, o);
        else {
          (o.__injectWithOption = !0), (o.__extender = n.__vueI18nExtend), (this.$i18n = Ni(o));
          const i = this.$i18n;
          i.__extender && (i.__disposer = i.__extender(this.$i18n));
        }
      } else if (s.__i18n)
        if (this === this.$root) this.$i18n = jc(e, s);
        else {
          this.$i18n = Ni({
            __i18n: s.__i18n,
            __injectWithOption: !0,
            __extender: n.__vueI18nExtend,
            __root: t,
          });
          const o = this.$i18n;
          o.__extender && (o.__disposer = o.__extender(this.$i18n));
        }
      else this.$i18n = e;
      s.__i18nGlobal && Rf(t, s, s),
        (this.$t = (...o) => this.$i18n.t(...o)),
        (this.$rt = (...o) => this.$i18n.rt(...o)),
        (this.$te = (o, i) => this.$i18n.te(o, i)),
        (this.$d = (...o) => this.$i18n.d(...o)),
        (this.$n = (...o) => this.$i18n.n(...o)),
        (this.$tm = (o) => this.$i18n.tm(o)),
        n.__setInstance(r, this.$i18n);
    },
    mounted() {},
    unmounted() {
      const r = Ze();
      if (!r) throw ht(ut.UNEXPECTED_ERROR);
      const s = this.$i18n;
      delete this.$t,
        delete this.$rt,
        delete this.$te,
        delete this.$d,
        delete this.$n,
        delete this.$tm,
        s.__disposer && (s.__disposer(), delete s.__disposer, delete s.__extender),
        n.__deleteInstance(r),
        delete this.$i18n;
    },
  };
}
function jc(e, t) {
  (e.locale = t.locale || e.locale),
    (e.fallbackLocale = t.fallbackLocale || e.fallbackLocale),
    (e.missing = t.missing || e.missing),
    (e.silentTranslationWarn = t.silentTranslationWarn || e.silentFallbackWarn),
    (e.silentFallbackWarn = t.silentFallbackWarn || e.silentFallbackWarn),
    (e.formatFallbackMessages = t.formatFallbackMessages || e.formatFallbackMessages),
    (e.postTranslation = t.postTranslation || e.postTranslation),
    (e.warnHtmlInMessage = t.warnHtmlInMessage || e.warnHtmlInMessage),
    (e.escapeParameterHtml = t.escapeParameterHtml || e.escapeParameterHtml),
    (e.sync = t.sync || e.sync),
    e.__composer[Pf](t.pluralizationRules || e.pluralizationRules);
  const n = _a(e.locale, { messages: t.messages, __i18n: t.__i18n });
  return (
    Object.keys(n).forEach((r) => e.mergeLocaleMessage(r, n[r])),
    t.datetimeFormats &&
      Object.keys(t.datetimeFormats).forEach((r) => e.mergeDateTimeFormat(r, t.datetimeFormats[r])),
    t.numberFormats &&
      Object.keys(t.numberFormats).forEach((r) => e.mergeNumberFormat(r, t.numberFormats[r])),
    e
  );
}
const ya = {
  tag: { type: [String, Object] },
  locale: { type: String },
  scope: { type: String, validator: (e) => e === 'parent' || e === 'global', default: 'parent' },
  i18n: { type: Object },
};
function Q1({ slots: e }, t) {
  return t.length === 1 && t[0] === 'default'
    ? (e.default ? e.default() : []).reduce(
        (r, s) => [...r, ...(s.type === Ne ? s.children : [s])],
        [],
      )
    : t.reduce((n, r) => {
        const s = e[r];
        return s && (n[r] = s()), n;
      }, De());
}
function wf() {
  return Ne;
}
const J1 = Gt({
    name: 'i18n-t',
    props: qe(
      {
        keypath: { type: String, required: !0 },
        plural: { type: [Number, String], validator: (e) => He(e) || !isNaN(e) },
      },
      ya,
    ),
    setup(e, t) {
      const { slots: n, attrs: r } = t,
        s = e.i18n || Ea({ useScope: e.scope, __useComponent: !0 });
      return () => {
        const o = Object.keys(n).filter((f) => f[0] !== '_'),
          i = De();
        e.locale && (i.locale = e.locale),
          e.plural !== void 0 && (i.plural = re(e.plural) ? +e.plural : e.plural);
        const a = Q1(t, o),
          c = s[wi](e.keypath, a, i),
          l = qe(De(), r),
          u = re(e.tag) || Ce(e.tag) ? e.tag : wf();
        return Ur(u, l, c);
      };
    },
  }),
  Kc = J1;
function Z1(e) {
  return Ie(e) && !re(e[0]);
}
function kf(e, t, n, r) {
  const { slots: s, attrs: o } = t;
  return () => {
    const i = { part: !0 };
    let a = De();
    e.locale && (i.locale = e.locale),
      re(e.format)
        ? (i.key = e.format)
        : Ce(e.format) &&
          (re(e.format.key) && (i.key = e.format.key),
          (a = Object.keys(e.format).reduce(
            (d, p) => (n.includes(p) ? qe(De(), d, { [p]: e.format[p] }) : d),
            De(),
          )));
    const c = r(e.value, i, a);
    let l = [i.key];
    Ie(c)
      ? (l = c.map((d, p) => {
          const m = s[d.type],
            v = m ? m({ [d.type]: d.value, index: p, parts: c }) : [d.value];
          return Z1(v) && (v[0].key = `${d.type}-${p}`), v;
        }))
      : re(c) && (l = [c]);
    const u = qe(De(), o),
      f = re(e.tag) || Ce(e.tag) ? e.tag : wf();
    return Ur(f, u, l);
  };
}
const e_ = Gt({
    name: 'i18n-n',
    props: qe({ value: { type: Number, required: !0 }, format: { type: [String, Object] } }, ya),
    setup(e, t) {
      const n = e.i18n || Ea({ useScope: e.scope, __useComponent: !0 });
      return kf(e, t, Bf, (...r) => n[Oi](...r));
    },
  }),
  Gc = e_;
function t_(e, t) {
  const n = e;
  if (e.mode === 'composition') return n.__getInstance(t) || e.global;
  {
    const r = n.__getInstance(t);
    return r != null ? r.__composer : e.global.__composer;
  }
}
function n_(e) {
  const t = (i) => {
    const { instance: a, value: c } = i;
    if (!a || !a.$) throw ht(ut.UNEXPECTED_ERROR);
    const l = t_(e, a.$),
      u = zc(c);
    return [Reflect.apply(l.t, l, [...Yc(u)]), l];
  };
  return {
    created: (i, a) => {
      const [c, l] = t(a);
      Ds &&
        e.global === l &&
        (i.__i18nWatcher = wt(l.locale, () => {
          a.instance && a.instance.$forceUpdate();
        })),
        (i.__composer = l),
        (i.textContent = c);
    },
    unmounted: (i) => {
      Ds &&
        i.__i18nWatcher &&
        (i.__i18nWatcher(), (i.__i18nWatcher = void 0), delete i.__i18nWatcher),
        i.__composer && ((i.__composer = void 0), delete i.__composer);
    },
    beforeUpdate: (i, { value: a }) => {
      if (i.__composer) {
        const c = i.__composer,
          l = zc(a);
        i.textContent = Reflect.apply(c.t, c, [...Yc(l)]);
      }
    },
    getSSRProps: (i) => {
      const [a] = t(i);
      return { textContent: a };
    },
  };
}
function zc(e) {
  if (re(e)) return { path: e };
  if (xe(e)) {
    if (!('path' in e)) throw ht(ut.REQUIRED_VALUE, 'path');
    return e;
  } else throw ht(ut.INVALID_VALUE);
}
function Yc(e) {
  const { path: t, locale: n, args: r, choice: s, plural: o } = e,
    i = {},
    a = r || {};
  return re(n) && (i.locale = n), He(s) && (i.plural = s), He(o) && (i.plural = o), [t, a, i];
}
function r_(e, t, ...n) {
  const r = xe(n[0]) ? n[0] : {};
  (Ee(r.globalInstall) ? r.globalInstall : !0) &&
    ([Kc.name, 'I18nT'].forEach((o) => e.component(o, Kc)),
    [Gc.name, 'I18nN'].forEach((o) => e.component(o, Gc)),
    [Qc.name, 'I18nD'].forEach((o) => e.component(o, Qc))),
    e.directive('t', n_(t));
}
const s_ = pn('global-vue-i18n');
function o_(e = {}) {
  const t = __VUE_I18N_LEGACY_API__ && Ee(e.legacy) ? e.legacy : __VUE_I18N_LEGACY_API__,
    n = Ee(e.globalInjection) ? e.globalInjection : !0,
    r = new Map(),
    [s, o] = i_(e, t),
    i = pn('');
  function a(f) {
    return r.get(f) || null;
  }
  function c(f, d) {
    r.set(f, d);
  }
  function l(f) {
    r.delete(f);
  }
  const u = {
    get mode() {
      return __VUE_I18N_LEGACY_API__ && t ? 'legacy' : 'composition';
    },
    async install(f, ...d) {
      if (((f.__VUE_I18N_SYMBOL__ = i), f.provide(f.__VUE_I18N_SYMBOL__, u), xe(d[0]))) {
        const v = d[0];
        (u.__composerExtend = v.__composerExtend), (u.__vueI18nExtend = v.__vueI18nExtend);
      }
      let p = null;
      !t && n && (p = x_(f, u.global)),
        __VUE_I18N_FULL_INSTALL__ && r_(f, u, ...d),
        __VUE_I18N_LEGACY_API__ && t && f.mixin(X1(o, o.__composer, u));
      const m = f.unmount;
      f.unmount = () => {
        p && p(), u.dispose(), m();
      };
    },
    get global() {
      return o;
    },
    dispose() {
      s.stop();
    },
    __instances: r,
    __getInstance: a,
    __setInstance: c,
    __deleteInstance: l,
  };
  return u;
}
function Ea(e = {}) {
  const t = Ze();
  if (t == null) throw ht(ut.MUST_BE_CALL_SETUP_TOP);
  if (!t.isCE && t.appContext.app != null && !t.appContext.app.__VUE_I18N_SYMBOL__)
    throw ht(ut.NOT_INSTALLED);
  const n = a_(t),
    r = l_(n),
    s = Tf(t),
    o = c_(e, s);
  if (o === 'global') return Rf(r, e, s), r;
  if (o === 'parent') {
    let c = u_(n, t, e.__useComponent);
    return c == null && (c = r), c;
  }
  const i = n;
  let a = i.__getInstance(t);
  if (a == null) {
    const c = qe({}, e);
    '__i18n' in s && (c.__i18n = s.__i18n),
      r && (c.__root = r),
      (a = va(c)),
      i.__composerExtend && (a[Li] = i.__composerExtend(a)),
      d_(i, t, a),
      i.__setInstance(t, a);
  }
  return a;
}
function i_(e, t) {
  const n = $i(),
    r = __VUE_I18N_LEGACY_API__ && t ? n.run(() => Ni(e)) : n.run(() => va(e));
  if (r == null) throw ht(ut.UNEXPECTED_ERROR);
  return [n, r];
}
function a_(e) {
  const t = dt(e.isCE ? s_ : e.appContext.app.__VUE_I18N_SYMBOL__);
  if (!t) throw ht(e.isCE ? ut.NOT_INSTALLED_WITH_PROVIDE : ut.UNEXPECTED_ERROR);
  return t;
}
function c_(e, t) {
  return zs(e) ? ('__i18n' in t ? 'local' : 'global') : e.useScope ? e.useScope : 'local';
}
function l_(e) {
  return e.mode === 'composition' ? e.global : e.global.__composer;
}
function u_(e, t, n = !1) {
  let r = null;
  const s = t.root;
  let o = f_(t, n);
  for (; o != null; ) {
    const i = e;
    if (e.mode === 'composition') r = i.__getInstance(o);
    else if (__VUE_I18N_LEGACY_API__) {
      const a = i.__getInstance(o);
      a != null && ((r = a.__composer), n && r && !r[Sf] && (r = null));
    }
    if (r != null || s === o) break;
    o = o.parent;
  }
  return r;
}
function f_(e, t = !1) {
  return e == null ? null : (t && e.vnode.ctx) || e.parent;
}
function d_(e, t, n) {
  Fn(() => {}, t),
    $s(() => {
      const r = n;
      e.__deleteInstance(t);
      const s = r[Li];
      s && (s(), delete r[Li]);
    }, t);
}
const h_ = ['locale', 'fallbackLocale', 'availableLocales'],
  Xc = ['t', 'rt', 'd', 'n', 'tm', 'te'];
function x_(e, t) {
  const n = Object.create(null);
  return (
    h_.forEach((s) => {
      const o = Object.getOwnPropertyDescriptor(t, s);
      if (!o) throw ht(ut.UNEXPECTED_ERROR);
      const i = Le(o.value)
        ? {
            get() {
              return o.value.value;
            },
            set(a) {
              o.value.value = a;
            },
          }
        : {
            get() {
              return o.get && o.get();
            },
          };
      Object.defineProperty(n, s, i);
    }),
    (e.config.globalProperties.$i18n = n),
    Xc.forEach((s) => {
      const o = Object.getOwnPropertyDescriptor(t, s);
      if (!o || !o.value) throw ht(ut.UNEXPECTED_ERROR);
      Object.defineProperty(e.config.globalProperties, `$${s}`, o);
    }),
    () => {
      delete e.config.globalProperties.$i18n,
        Xc.forEach((s) => {
          delete e.config.globalProperties[`$${s}`];
        });
    }
  );
}
const p_ = Gt({
    name: 'i18n-d',
    props: qe(
      { value: { type: [Number, Date], required: !0 }, format: { type: [String, Object] } },
      ya,
    ),
    setup(e, t) {
      const n = e.i18n || Ea({ useScope: e.scope, __useComponent: !0 });
      return kf(e, t, Af, (...r) => n[ki](...r));
    },
  }),
  Qc = p_;
K1();
A1(o1);
B1(E1);
D1(_f);
if (__INTLIFY_PROD_DEVTOOLS__) {
  const e = yn();
  (e.__INTLIFY__ = !0), i1(e.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
}
const g_ = {
    common: {},
    login: {
      用户登录: '用户登录',
      账号: '账号',
      '账号为6-15位字母或数字': '账号为6-15位字母或数字',
      账号不合法: '账号不合法',
      密码: '密码',
      '密码为6-15位字母或数字': '密码为6-15位字母或数字',
      密码不合法: '密码不合法',
      登录失败: '登录失败',
      登录: '登录',
      登录成功: '登录成功',
      注册新用户: '注册新用户',
    },
    register: {
      用户注册: '用户注册',
      账号: '账号',
      '账号为6-15位字母或数字': '账号为6-15位字母或数字',
      账号不合法: '账号不合法',
      密码: '密码',
      '密码为6-15位字母或数字': '密码为6-15位字母或数字',
      密码不合法: '密码不合法',
      确认密码: '确认密码',
      密码和确认密码不一致: '密码和确认密码不一致',
      两次密码不一致: '两次密码不一致',
      注册: '注册',
      注册失败: '注册失败',
      登录成功: '登录成功',
      '已有账号,去登录': '已有账号,去登录',
      请等待验证初始化完成: '请等待验证初始化完成',
    },
    menu: {
      用户中心: '用户中心',
      平台币: '平台币',
      游戏账单: '游戏账单',
      联系客服: '联系客服',
      存至桌面: '存至桌面',
      切换账号: '切换账号',
    },
    pay: {
      账单: '账单',
      游戏: '游戏',
      平台币: '平台币',
      充值记录: '充值记录',
      消费记录: '消费记录',
      时间: '时间',
      金额: '金额',
      状态: '状态',
      成功: '成功',
      失败: '失败',
      处理中: '处理中',
      暂无数据: '暂无数据',
      区服绑币: '区服绑币',
      区服: '区服',
      数量: '数量',
      已全部加载完毕: '已全部加载完毕',
      '哎呀，发生了异常': '哎呀，发生了异常',
      手机号: '手机号',
      请输入手机号: '请输入手机号',
      验证码: '验证码',
      请输入验证码: '请输入验证码',
      获取验证码: '获取验证码',
      重新获取: '重新获取',
      绑定: '绑定',
      手机号格式不正确: '手机号格式不正确',
      验证码不能为空: '验证码不能为空',
      绑定成功: '绑定成功',
      绑定失败: '绑定失败',
      支付订单: '支付订单',
      订单金额: '订单金额',
      '请选择支付方式完成支付，感谢您的支持': '请选择支付方式完成支付，感谢您的支持',
      生成订单: '生成订单',
      立即支付: '立即支付',
      在线支付提示: '在线支付提示',
      '请完成支付，支付成功后商品将尽快到账，请耐心等待。':
        '请完成支付，支付成功后商品将尽快到账，请耐心等待。',
      完成支付: '完成支付',
      '支付成功,商品将尽快到帐，请耐心等待': '支付成功,商品将尽快到帐，请耐心等待',
      '支付失败,请重试或稍后再试': '支付失败,请重试或稍后再试',
      确定: '确定',
      关闭: '关闭',
      查询订单超时: '查询订单超时',
      获取支付方式失败: '获取支付方式失败',
      订单生成中: '订单生成中',
      下单失败: '下单失败',
      价格格式不正确: '价格格式不正确',
      余额格式不正确: '余额格式不正确',
      绑币余额不足: '绑币余额不足',
      未查询到支付成功订单: '未查询到支付成功订单',
      支付成功: '支付成功',
      充值: '充值',
      选择充值金额: '选择充值金额',
      自定义金额: '自定义金额',
      请输入充值金额: '请输入充值金额',
      选择支付方式: '选择支付方式',
      微信支付: '微信支付',
      支付宝: '支付宝',
      银行卡: '银行卡',
      立即充值: '立即充值',
      充值金额不能为空: '充值金额不能为空',
      充值金额必须大于0: '充值金额必须大于0',
      请选择支付方式: '请选择支付方式',
      充值成功: '充值成功',
      充值失败: '充值失败',
      支付取消: '支付取消',
      正在处理支付请求: '正在处理支付请求',
      支付超时: '支付超时',
      网络错误: '网络错误',
      余额: '余额',
      元: '元',
      PTB充值: 'PTB充值',
      PTB余额: 'PTB余额',
      充值PTB: '充值PTB',
      PTB: 'PTB',
      当前PTB余额: '当前PTB余额',
      PTB充值记录: 'PTB充值记录',
      PTB消费记录: 'PTB消费记录',
      充值PTB成功: '充值PTB成功',
      充值PTB失败: '充值PTB失败',
      PTB不足: 'PTB不足',
      获取PTB余额失败: '获取PTB余额失败',
      平台币充值: '平台币充值',
      平台币充值描述: '平台币充值描述',
      比例说明: '比例说明',
      兑换比例: '兑换比例',
      支付方式: '支付方式',
      赠送: '赠送',
      储值金额: '储值金额',
      实付: '实付',
      订单确认: '订单确认',
      充值用户: '充值用户',
      付款方式: '付款方式',
      付款金额: '付款金额',
      获得金额: '获得金额',
      付款: '付款',
      提取奖励: '提取奖励',
      消费: '消费',
    },
    promote: {
      全民推广: '全民推广',
      推广收益明细: '推广收益明细',
      规则说明: '规则说明',
      '推广返佣，千万现金': '推广返佣，千万现金',
      等你来拿: '等你来拿',
      '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。':
        '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。',
      '分享越多 返佣越高': '分享越多 返佣越高',
      可提取的余额: '可提取的余额',
      提取平台币: '提取平台币',
      累计返佣: '累计返佣',
      我的推广数据: '我的推广数据',
      近30日获返佣: '近30日获返佣',
      当前返佣比例: '当前返佣比例',
      比例: '比例',
      返佣比例: '返佣比例',
      我的邀请码: '我的邀请码',
      复制邀请链接: '复制邀请链接',
      加载中: '加载中',
      用户: '用户',
      暂无消息: '暂无消息',
      '加入推广成功！': '加入推广成功！',
      单次提现金额不得低于: '单次提现金额不得低于',
      最低额度: '最低额度',
      游戏名称: '游戏名称',
      '复制成功，您可以分享给好友了': '复制成功，您可以分享给好友了',
      '复制失败！': '复制失败！',
      '请按照请好友关注前号导号，正确输入邀请人的邀请码。':
        '请按照请好友关注前号导号，正确输入邀请人的邀请码。',
      '一旦绑定邀请码，将无法更换。': '一旦绑定邀请码，将无法更换。',
      '绑定邀请码后，被邀请人成功充值满大于': '绑定邀请码后，被邀请人成功充值满大于',
      '否则为无效邀请，将不会返佣。': '否则为无效邀请，将不会返佣。',
      '根据邀请的好友充值金额，将会获得': '根据邀请的好友充值金额，将会获得',
      的返佣奖励: '的返佣奖励',
      '奖励无上限。': '奖励无上限。',
      '推广返佣的奖励，永久有效。': '推广返佣的奖励，永久有效。',
      '推广返佣单次提取，需不得低于': '推广返佣单次提取，需不得低于',
      '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。':
        '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。',
      '本平台享有活动的最终解释权。': '本平台享有活动的最终解释权',
      全部: '全部',
      收入: '收入',
      提取: '提取',
      时间: '时间',
      数量: '数量',
      状态: '状态',
      暂无记录: '暂无记录',
      已经到底了: '已经到底了',
      '哎呀，发生了异常': '哎呀，发生了异常',
      审核中: '审核中',
      已通过: '已通过',
      已拒绝: '已拒绝',
      未知: '未知',
      代理排行榜: '代理排行榜',
      周榜: '周榜',
      月榜: '月榜',
      排名: '排名',
      账号: '账号',
      好友充值: '好友充值',
      排名奖励: '排名奖励',
      暂无排行榜数据: '暂无排行榜数据',
      加载更多: '加载更多',
      '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。':
        '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。',
      重试: '重试',
      总邀请人数: '总邀请人数',
      有效邀请人数: '有效邀请人数',
      本月返佣: '本月返佣',
      有效邀请: '有效邀请',
      无效邀请: '无效邀请',
      好友账号: '好友账号',
      注册时间: '注册时间',
      充值金额: '充值金额',
      获取邀请记录失败: '获取邀请记录失败',
      网络请求失败: '网络请求失败',
      提现记录: '提现记录',
      可提取余额: '可提取余额',
      请输入大于: '请输入大于',
      的整数: '的整数',
      提交中: '提交中',
      提现: '提现',
      提现须知: '提现须知',
      '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。':
        '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。',
      如有任何疑问请: '如有任何疑问请',
      联系客服: '联系客服',
      请输入有效的金额: '请输入有效的金额',
      单次提取数量不得低于: '单次提取数量不得低于',
      提取金额不能超过可用余额: '提取金额不能超过可用余额',
      请输入整数金额: '请输入整数金额',
      '提现申请已提交，请等待审核': '提现申请已提交，请等待审核',
      '提现申请失败，请稍后重试': '提现申请失败，请稍后重试',
    },
    gift: {
      礼包: '礼包',
      永久礼包: '永久礼包',
      限时礼包: '限时礼包',
      领取: '领取',
      复制: '复制',
      领取礼包成功: '领取礼包成功',
      领取礼包失败: '领取礼包失败',
      礼包码: '礼包码',
      礼包内容: '礼包内容',
      领取条件: '领取条件',
      累计消费: '累计消费',
      累计充值: '累计充值',
      有效期: '有效期',
      已全部加载完毕: '已全部加载完毕',
      '哎呀，发生了异常': '哎呀，发生了异常',
    },
    center: {
      自动登录: '自动登录',
      关闭后每次进入游戏可重新选择账号登录: '关闭后每次进入游戏可重新选择账号登录',
      隐藏浮球: '隐藏浮球',
      修改密码: '修改密码',
      当前版本: '当前版本',
      返回游戏: '返回游戏',
    },
    chpass: {
      修改密码: '修改密码',
      原密码: '原密码',
      新密码: '新密码',
      确认密码: '确认密码',
      确认: '确认',
      旧密码格式不正确: '旧密码格式不正确',
      新密码格式不正确: '新密码格式不正确',
      两次密码不一致: '两次密码不一致',
      修改成功: '修改成功',
    },
    guide: {
      添加到主屏幕: '添加到主屏幕',
      '点击【更多】图标，接着点击添加到主屏幕': '点击【更多】图标，接着点击添加到主屏幕',
      '点击添加，选择【添加】': '点击添加，选择【添加】',
    },
    news: {
      新闻: '新闻',
      活动: '活动',
      公告: '公告',
      资讯: '资讯',
      攻略: '攻略',
      新闻详情: '新闻详情',
      加载中: '加载中',
      更新时间: '更新时间',
    },
  },
  m_ = {
    common: {},
    login: {
      用户登录: '用戶登錄',
      账号: '賬號',
      '账号为6-15位字母或数字': '賬號為6-15位字母或數字',
      账号不合法: '賬號不合法',
      密码: '密碼',
      '密码为6-15位字母或数字': '密碼為6-15位字母或數字',
      密码不合法: '密碼不合法',
      登录失败: '登錄失敗',
      登录: '登錄',
      登录成功: '登錄成功',
      注册新用户: '註冊新用戶',
    },
    register: {
      用户注册: '用戶註冊',
      账号: '賬號',
      '账号为6-15位字母或数字': '賬號為6-15位字母或數字',
      账号不合法: '賬號不合法',
      密码: '密碼',
      '密码为6-15位字母或数字': '密碼為6-15位字母或數字',
      密码不合法: '密碼不合法',
      确认密码: '確認密碼',
      密码和确认密码不一致: '密碼和確認密碼不一致',
      两次密码不一致: '兩次密碼不一致',
      注册: '註冊',
      注册失败: '註冊失敗',
      登录成功: '登錄成功',
      '已有账号,去登录': '已有賬號,去登錄',
      请等待验证初始化完成: '請等待驗證初始化完成',
    },
    menu: {
      用户中心: '用戶中心',
      平台币: '平台幣',
      游戏账单: '遊戲賬單',
      联系客服: '聯繫客服',
      存至桌面: '存至桌面',
      切换账号: '切換賬號',
    },
    pay: {
      账单: '賬單',
      游戏: '遊戲',
      平台币: '平台幣',
      充值记录: '充值記錄',
      消费记录: '消費記錄',
      时间: '時間',
      金额: '金額',
      状态: '狀態',
      成功: '成功',
      失败: '失敗',
      处理中: '處理中',
      暂无数据: '暫無數據',
      区服绑币: '區服綁幣',
      区服: '區服',
      数量: '數量',
      已全部加载完毕: '已全部加載完畢',
      '哎呀，发生了异常': '哎呀，發生了異常',
      手机号: '手機號',
      请输入手机号: '請輸入手機號',
      验证码: '驗證碼',
      请输入验证码: '請輸入驗證碼',
      获取验证码: '獲取驗證碼',
      重新获取: '重新獲取',
      绑定: '綁定',
      手机号格式不正确: '手機號格式不正確',
      验证码不能为空: '驗證碼不能為空',
      绑定成功: '綁定成功',
      绑定失败: '綁定失敗',
      支付订单: '支付訂單',
      订单金额: '訂單金額',
      '请选择支付方式完成支付，感谢您的支持': '請選擇支付方式完成支付，感謝您的支持',
      生成订单: '生成訂單',
      立即支付: '立即支付',
      在线支付提示: '在線支付提示',
      '请完成支付，支付成功后商品将尽快到账，请耐心等待。':
        '請完成支付，支付成功後商品將盡快到賬，請耐心等待。',
      完成支付: '完成支付',
      '支付成功,商品将尽快到帐，请耐心等待': '支付成功,商品將盡快到帳，請耐心等待',
      '支付失败,请重试或稍后再试': '支付失敗,請重試或稍後再試',
      确定: '確定',
      关闭: '關閉',
      查询订单超时: '查詢訂單超時',
      获取支付方式失败: '獲取支付方式失敗',
      订单生成中: '訂單生成中',
      下单失败: '下單失敗',
      价格格式不正确: '價格格式不正確',
      余额格式不正确: '餘額格式不正確',
      绑币余额不足: '綁幣餘額不足',
      未查询到支付成功订单: '未查詢到支付成功訂單',
      支付成功: '支付成功',
      充值: '儲值',
      选择充值金额: '選擇儲值金額',
      自定义金额: '自定義金額',
      请输入充值金额: '請輸入儲值金額',
      选择支付方式: '選擇支付方式',
      微信支付: '微信支付',
      支付宝: '支付寶',
      银行卡: '銀行卡',
      立即充值: '立即儲值',
      充值金额不能为空: '儲值金額不能為空',
      充值金额必须大于0: '儲值金額必須大於0',
      请选择支付方式: '請選擇支付方式',
      充值成功: '儲值成功',
      充值失败: '儲值失敗',
      支付取消: '支付取消',
      正在处理支付请求: '正在處理支付請求',
      支付超时: '支付超時',
      网络错误: '網絡錯誤',
      余额: '餘額',
      元: '元',
      PTB充值: 'PTB儲值',
      PTB余额: 'PTB餘額',
      充值PTB: '儲值PTB',
      PTB: 'PTB',
      当前PTB余额: '當前PTB餘額',
      PTB充值记录: 'PTB儲值記錄',
      PTB消费记录: 'PTB消費記錄',
      充值PTB成功: '儲值PTB成功',
      充值PTB失败: '儲值PTB失敗',
      PTB不足: 'PTB不足',
      获取PTB余额失败: '獲取PTB餘額失敗',
      平台币充值: '平台幣儲值',
      平台币充值描述: '平台幣儲值描述',
      比例说明: '比例說明',
      兑换比例: '兌換比例',
      支付方式: '支付方式',
      赠送: '贈送',
      储值金额: '儲值金額',
      实付: '實付',
      订单确认: '訂單確認',
      充值用户: '儲值用戶',
      付款方式: '付款方式',
      付款金额: '付款金額',
      获得金额: '獲得金額',
      付款: '付款',
      提取奖励: '提取獎勵',
      消费: '消費',
    },
    promote: {
      全民推广: '全民推廣',
      推广收益明细: '推廣收益明細',
      规则说明: '規則說明',
      '推广返佣，千万现金': '推廣返佣，千萬現金',
      等你来拿: '等你來拿',
      '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。':
        '重磅推出《全民代理計劃》，分享好友玩遊戲拿返佣。',
      '分享越多 返佣越高': '分享越多 返佣越高',
      可提取的余额: '可提取的餘額',
      提取平台币: '提取平台幣',
      累计返佣: '累計返佣',
      我的推广数据: '我的推廣數據',
      近30日获返佣: '近30日獲返佣',
      当前返佣比例: '當前返佣比例',
      比例: '比例',
      返佣比例: '返佣比例',
      我的邀请码: '我的邀請碼',
      复制邀请链接: '複製邀請連結',
      加载中: '載入中',
      用户: '用戶',
      暂无消息: '暫無消息',
      '加入推广成功！': '加入推廣成功！',
      单次提现金额不得低于: '單次提現金額不得低於',
      最低额度: '最低額度',
      游戏名称: '遊戲名稱',
      '复制成功，您可以分享给好友了': '複製成功，您可以分享給好友了',
      '复制失败！': '複製失敗！',
      '请按照请好友关注前号导号，正确输入邀请人的邀请码。':
        '請按照請好友關注前號導號，正確輸入邀請人的邀請碼。',
      '一旦绑定邀请码，将无法更换。': '一旦綁定邀請碼，將無法更換。',
      '绑定邀请码后，被邀请人成功充值满大于': '綁定邀請碼後，被邀請人成功儲值滿大於',
      '否则为无效邀请，将不会返佣。': '否則為無效邀請，將不會返佣。',
      '根据邀请的好友充值金额，将会获得': '根據邀請的好友儲值金額，將會獲得',
      的返佣奖励: '的返佣獎勵',
      '奖励无上限。': '獎勵無上限。',
      '推广返佣的奖励，永久有效。': '推廣返佣的獎勵，永久有效。',
      '推广返佣单次提取，需不得低于': '推廣返佣單次提取，需不得低於',
      '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。':
        '提取收益需要平台人工審核，提交後請耐心等待，平台將會在48小時內盡快處理申請。',
      '本平台享有活动的最终解释权。': '本平台享有活動的最終解釋權',
      全部: '全部',
      收入: '收入',
      提取: '提取',
      时间: '時間',
      数量: '數量',
      状态: '狀態',
      暂无记录: '暫無記錄',
      已经到底了: '已經到底了',
      '哎呀，发生了异常': '哎呀，發生了異常',
      审核中: '審核中',
      已通过: '已通過',
      已拒绝: '已拒絕',
      未知: '未知',
      代理排行榜: '代理排行榜',
      周榜: '周榜',
      月榜: '月榜',
      排名: '排名',
      账号: '賬號',
      好友充值: '好友充值',
      排名奖励: '排名獎勵',
      暂无排行榜数据: '暫無排行榜數據',
      加载更多: '加載更多',
      '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。':
        '注:周/月獎勵將會在指定自然周/月開始的自動結算，獎勵會自動發放至返佣賬戶中，我們將根據的更新，終止或取消活動的權力，活動的活動規則解釋權歸只以官方為準。',
      重试: '重試',
      总邀请人数: '總邀請人數',
      有效邀请人数: '有效邀請人數',
      本月返佣: '本月返佣',
      有效邀请: '有效邀請',
      无效邀请: '無效邀請',
      好友账号: '好友賬號',
      注册时间: '註冊時間',
      充值金额: '儲值金額',
      获取邀请记录失败: '獲取邀請記錄失敗',
      网络请求失败: '網絡請求失敗',
      提现记录: '提現記錄',
      可提取余额: '可提取餘額',
      请输入大于: '請輸入大於',
      的整数: '的整數',
      提交中: '提交中',
      提现: '提現',
      提现须知: '提現須知',
      '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。':
        '提現後將會有專人進行審核，48小時內會核實完畢後會發放到當前賬號，我們會通過短信支付，終止或取消活動的全力，活動辦法和規則請最終解釋權歸公告方準。',
      如有任何疑问请: '如有任何疑問請',
      联系客服: '聯繫客服',
      请输入有效的金额: '請輸入有效的金額',
      单次提取数量不得低于: '單次提取數量不得低於',
      提取金额不能超过可用余额: '提取金額不能超過可用餘額',
      请输入整数金额: '請輸入整數金額',
      '提现申请已提交，请等待审核': '提現申請已提交，請等待審核',
      '提现申请失败，请稍后重试': '提現申請失敗，請稍後重試',
    },
    gift: {
      礼包: '禮包',
      永久礼包: '永久禮包',
      限时礼包: '限時禮包',
      领取: '領取',
      复制: '複製',
      领取礼包成功: '領取禮包成功',
      领取礼包失败: '領取禮包失敗',
      礼包码: '禮包碼',
      礼包内容: '禮包內容',
      领取条件: '領取條件',
      累计消费: '累計消費',
      累计充值: '累計充值',
      有效期: '有效期',
      已全部加载完毕: '已全部加載完畢',
      '哎呀，发生了异常': '哎呀，發生了異常',
    },
    center: {
      自动登录: '自動登錄',
      关闭后每次进入游戏可重新选择账号登录: '關閉後每次進入遊戲可重新選擇賬號登錄',
      隐藏浮球: '隱藏浮球',
      修改密码: '修改密碼',
      当前版本: '當前版本',
      返回游戏: '返回遊戲',
    },
    chpass: {
      修改密码: '修改密碼',
      原密码: '原密碼',
      新密码: '新密碼',
      确认密码: '確認密碼',
      确认: '確認',
      旧密码格式不正确: '舊密碼格式不正確',
      新密码格式不正确: '新密碼格式不正確',
      两次密码不一致: '兩次密碼不一致',
      修改成功: '修改成功',
    },
    guide: {
      添加到主屏幕: '新增至主畫面',
      '点击【更多】图标，接着点击添加到主屏幕': '點擊【更多】圖標，接著點擊新增至主畫面',
      '点击添加，选择【添加】': '點擊新增，選擇【新增】',
    },
    news: {
      新闻: '新聞',
      活动: '活動',
      公告: '公告',
      资讯: '資訊',
      攻略: '攻略',
      新闻详情: '新聞詳情',
      加载中: '載入中',
      更新时间: '更新時間',
    },
  },
  __ = {
    common: {},
    login: {
      用户登录: 'User Login',
      账号: 'Account',
      '账号为6-15位字母或数字': '6-15 letters or digits',
      账号不合法: 'Invalid account',
      密码: 'Password',
      '密码为6-15位字母或数字': '6-15 letters or digits',
      密码不合法: 'Invalid password',
      登录失败: 'Login failed',
      登录: 'Login',
      登录成功: 'Login successful',
      注册新用户: 'Register',
    },
    register: {
      用户注册: 'User Registration',
      账号: 'Account',
      '账号为6-15位字母或数字': '6-15 letters or digits',
      账号不合法: 'Invalid account',
      密码: 'Password',
      '密码为6-15位字母或数字': '6-15 letters or digits',
      密码不合法: 'Invalid password',
      确认密码: 'Confirm Password',
      密码和确认密码不一致: 'Passwords do not match',
      两次密码不一致: 'Passwords do not match',
      注册: 'Register',
      注册失败: 'Registration failed',
      登录成功: 'Login successful',
      '已有账号,去登录': 'Already have an account? Login',
      请等待验证初始化完成: 'Please wait for verification initialization to complete',
    },
    menu: {
      用户中心: 'User Center',
      平台币: 'Platform Coins',
      游戏账单: 'Game Bill',
      联系客服: 'Contact Support',
      存至桌面: 'Save to Desktop',
      切换账号: 'Switch Account',
    },
    pay: {
      账单: 'Bill',
      游戏: 'Game',
      平台币: 'Platform Coins',
      充值记录: 'Recharge Records',
      消费记录: 'Consumption Records',
      时间: 'Time',
      金额: 'Amount',
      状态: 'Status',
      成功: 'Success',
      失败: 'Failed',
      处理中: 'Processing',
      暂无数据: 'No Data',
      区服绑币: 'Server Bound Coins',
      区服: 'Server',
      数量: 'Quantity',
      已全部加载完毕: 'All data loaded',
      '哎呀，发生了异常': 'Oops, an error occurred',
      手机号: 'Phone Number',
      请输入手机号: 'Please enter phone number',
      验证码: 'Verification Code',
      请输入验证码: 'Please enter verification code',
      获取验证码: 'Get Code',
      重新获取: 'Resend',
      绑定: 'Bind',
      手机号格式不正确: 'Invalid phone number format',
      验证码不能为空: 'Verification code cannot be empty',
      绑定成功: 'Bind successful',
      绑定失败: 'Bind failed',
      支付订单: 'Payment Order',
      订单金额: 'Order Amount',
      '请选择支付方式完成支付，感谢您的支持':
        'Choose a payment method to complete payment. Thank you!',
      生成订单: 'Generate Order',
      立即支付: 'Pay Now',
      在线支付提示: 'Online Payment Prompt',
      '请完成支付，支付成功后商品将尽快到账，请耐心等待。':
        'Complete payment; items arrive shortly.',
      完成支付: 'Complete Payment',
      '支付成功,商品将尽快到帐，请耐心等待':
        'Payment successful. The item will be credited as soon as possible. Please be patient.',
      '支付失败,请重试或稍后再试': 'Payment failed. Please try again or try later.',
      确定: 'OK',
      关闭: 'Close',
      查询订单超时: 'Order query timeout',
      获取支付方式失败: 'Failed to get payment method',
      订单生成中: 'Order generating',
      下单失败: 'Order failed',
      价格格式不正确: 'Incorrect price format',
      余额格式不正确: 'Incorrect balance format',
      绑币余额不足: 'Insufficient bound coins',
      未查询到支付成功订单: 'No successful payment order found',
      支付成功: 'Payment successful',
      充值: 'Recharge',
      选择充值金额: 'Select recharge amount',
      自定义金额: 'Custom amount',
      请输入充值金额: 'Please enter recharge amount',
      选择支付方式: 'Select payment method',
      微信支付: 'WeChat Pay',
      支付宝: 'Alipay',
      银行卡: 'Bank Card',
      立即充值: 'Recharge Now',
      充值金额不能为空: 'Recharge amount cannot be empty',
      充值金额必须大于0: 'Recharge amount must be greater than 0',
      请选择支付方式: 'Please select payment method',
      充值成功: 'Recharge successful',
      充值失败: 'Recharge failed',
      支付取消: 'Payment cancelled',
      正在处理支付请求: 'Processing payment request',
      支付超时: 'Payment timeout',
      网络错误: 'Network error',
      余额: 'Balance',
      元: 'Yuan',
      PTB充值: 'PTB Recharge',
      PTB余额: 'PTB Balance',
      充值PTB: 'Recharge PTB',
      PTB: 'PTB',
      当前PTB余额: 'Current PTB Balance',
      PTB充值记录: 'PTB Recharge Records',
      PTB消费记录: 'PTB Consumption Records',
      充值PTB成功: 'PTB recharge successful',
      充值PTB失败: 'PTB recharge failed',
      PTB不足: 'Insufficient PTB',
      获取PTB余额失败: 'Failed to get PTB balance',
      平台币充值: 'Platform Coin Recharge',
      平台币充值描述: 'Platform Coin Recharge Description',
      比例说明: 'Exchange Rate',
      兑换比例: 'Exchange Ratio',
      支付方式: 'Payment Method',
      赠送: 'Bonus',
      储值金额: 'Recharge Amount',
      实付: '',
      订单确认: 'Order Confirmation',
      充值用户: 'Recharge User',
      付款方式: 'Payment Method',
      付款金额: 'Payment Amount',
      获得金额: 'Amount Received',
      付款: 'Payment',
      提取奖励: 'Withdraw Reward',
      消费: 'Consumption',
    },
    promote: {
      全民推广: 'Referral Bonus',
      推广收益明细: 'Earnings',
      规则说明: 'Rules',
      '推广返佣，千万现金': 'Invite Friends, Earn Rewards',
      等你来拿: 'Waiting for You',
      '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。': 'More friends, more rewards.',
      '分享越多 返佣越高': 'More Sharing, Higher Rebates',
      可提取的余额: 'Available',
      提取平台币: 'Withdraw',
      累计返佣: 'Total Rewards',
      我的推广数据: 'My Friends',
      近30日获返佣: 'Rebates Earned in Last 30 Days',
      当前返佣比例: 'Current Rebate Rate',
      比例: 'Ratio',
      返佣比例: 'Rebate Rate',
      我的邀请码: '  My Code',
      复制邀请链接: 'Copy Link',
      加载中: 'Loading',
      用户: 'User',
      暂无消息: 'No Messages',
      '加入推广成功！': 'Successfully Joined Promotion!',
      单次提现金额不得低于: 'Minimum withdrawal amount per transaction must not be less than',
      最低额度: 'Minimum Amount',
      游戏名称: 'Game Name',
      '复制成功，您可以分享给好友了': 'Copy successful, you can now share with friends',
      '复制失败！': 'Copy failed!',
      '请按照请好友关注前号导号，正确输入邀请人的邀请码。':
        'Please ask your friend to follow the previous account guide and enter the inviter’s invitation code correctly.',
      '一旦绑定邀请码，将无法更换。': 'Once the invitation code is bound, it cannot be changed.',
      '绑定邀请码后，被邀请人成功充值满大于':
        'After binding the invitation code, the invitee must successfully recharge more than',
      '否则为无效邀请，将不会返佣。':
        'Otherwise, it will be considered an invalid invitation and no rebate will be granted.',
      '根据邀请的好友充值金额，将会获得':
        'Based on the recharge amount of the invited friend, you will receive',
      的返佣奖励: 'rebate reward',
      '奖励无上限。': 'There is no upper limit to the reward.',
      '推广返佣的奖励，永久有效。': 'The promotion rebate reward is permanently valid.',
      '推广返佣单次提取，需不得低于':
        'The minimum withdrawal amount per promotion rebate transaction must not be less than',
      '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。':
        'Withdrawal requires manual platform review. Please be patient after submission; the platform will process the application within 48 hours.',
      '本平台享有活动的最终解释权。':
        'This platform reserves the final right of interpretation of the event',
      全部: 'All',
      收入: 'Income',
      提取: 'Withdraw',
      时间: 'Time',
      数量: 'Quantity',
      状态: 'Status',
      暂无记录: 'No Records',
      已经到底了: 'End of List',
      '哎呀，发生了异常': 'Oops, an error occurred',
      审核中: 'Under Review',
      已通过: 'Approved',
      已拒绝: 'Rejected',
      未知: 'Unknown',
      代理排行榜: 'Agent Rankings',
      周榜: 'Weekly Rankings',
      月榜: 'Monthly Rankings',
      排名: 'Rank',
      账号: 'Account',
      好友充值: 'Friend Recharge',
      排名奖励: 'Ranking Reward',
      暂无排行榜数据: 'No ranking data available',
      加载更多: 'Load More',
      '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。':
        'Note: Weekly/Monthly rewards will be automatically settled at the start of the specified natural week/month and will be automatically credited to the rebate account. We reserve the right to update, terminate, or cancel the event, and the final interpretation of the event rules belongs to the official authority.',
      重试: 'Retry',
      总邀请人数: 'Total Invitations',
      有效邀请人数: 'Valid Invitations',
      本月返佣: 'This Month',
      有效邀请: 'Valid Invitation',
      无效邀请: 'Invalid Invitation',
      好友账号: 'Friend Account',
      注册时间: 'Registration Time',
      充值金额: 'Recharge Amount',
      获取邀请记录失败: 'Failed to get invitation records',
      网络请求失败: 'Network request failed',
      提现记录: 'Earnings',
      可提取余额: 'Withdrawable Balance',
      请输入大于: 'Please enter an integer greater than',
      的整数: 'integer',
      提交中: 'Submitting',
      提现: 'Withdraw',
      提现须知: 'Withdrawal Notice',
      '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。':
        'After withdrawal, a dedicated person will review the request. It will be verified within 48 hours and credited to your account. We reserve the right to terminate or cancel the event via SMS. The final interpretation of the event rules belongs to the announcing party.',
      如有任何疑问请: 'If you have any questions, please',
      联系客服: 'Contact Support',
      请输入有效的金额: 'Please enter a valid amount',
      单次提取数量不得低于: 'Minimum withdrawal amount per transaction must not be less than',
      提取金额不能超过可用余额: 'Withdrawal amount cannot exceed available balance',
      请输入整数金额: 'Please enter an integer amount',
      '提现申请已提交，请等待审核': 'Withdrawal request submitted, please wait for review',
      '提现申请失败，请稍后重试': 'Withdrawal request failed, please try again later',
    },
    gift: {
      礼包: 'Gift Packs',
      永久礼包: 'Permanent Gift',
      限时礼包: 'Limited Time Gift',
      领取: 'Claim',
      复制: 'Copy',
      领取礼包成功: 'Gift pack claimed successfully',
      领取礼包失败: 'Gift pack claim failed',
      礼包码: 'Gift Code',
      礼包内容: 'Gift Content',
      领取条件: 'Claim Requirements',
      累计消费: 'Total Consumption',
      累计充值: 'Total Recharge',
      有效期: 'Validity Period',
      已全部加载完毕: 'All data loaded',
      '哎呀，发生了异常': 'Oops, an error occurred',
    },
    center: {
      自动登录: 'Auto Login',
      关闭后每次进入游戏可重新选择账号登录:
        'After closing, you can re-select account login each time you enter the game',
      隐藏浮球: 'Hide Float Ball',
      修改密码: 'Change Password',
      当前版本: 'Current Version',
      返回游戏: 'Back to Game',
    },
    chpass: {
      修改密码: 'Change Password',
      原密码: 'Current Password',
      新密码: 'New Password',
      确认密码: 'Confirm Password',
      确认: 'Confirm',
      旧密码格式不正确: 'Current password format is incorrect',
      新密码格式不正确: 'New password format is incorrect',
      两次密码不一致: 'Passwords do not match',
      修改成功: 'Password changed successfully',
    },
    guide: {
      添加到主屏幕: 'Add to Home Screen',
      '点击【更多】图标，接着点击添加到主屏幕': 'Tap the [More] icon, then tap Add to Home Screen',
      '点击添加，选择【添加】': 'Tap Add and select [Add]',
    },
    news: {
      新闻: 'News',
      活动: 'Events',
      公告: 'Notice',
      资讯: 'Info',
      攻略: 'Guides',
      新闻详情: 'News Detail',
      加载中: 'Loading',
      更新时间: 'Update Time',
    },
  },
  v_ = {
    common: {},
    login: {
      用户登录: 'Đăng nhập',
      账号: 'Tài khoản',
      '账号为6-15位字母或数字': 'Tài khoản gồm 6-15 ký tự chữ hoặc số',
      账号不合法: 'Tài khoản không hợp lệ',
      密码: 'Mật khẩu',
      '密码为6-15位字母或数字': 'Mật khẩu gồm 6-15 ký tự chữ hoặc số',
      密码不合法: 'Mật khẩu không hợp lệ',
      登录失败: 'Đăng nhập thất bại',
      登录: 'Đăng nhập',
      登录成功: 'Đăng nhập thành công',
      注册新用户: 'Đăng ký tài khoản mới',
    },
    register: {
      用户注册: 'Đăng ký người dùng',
      账号: 'Tài khoản',
      '账号为6-15位字母或数字': 'Tài khoản gồm 6-15 ký tự chữ hoặc số',
      账号不合法: 'Tài khoản không hợp lệ',
      密码: 'Mật khẩu',
      '密码为6-15位字母或数字': 'Mật khẩu gồm 6-15 ký tự chữ hoặc số',
      密码不合法: 'Mật khẩu không hợp lệ',
      确认密码: 'Xác nhận mật khẩu',
      密码和确认密码不一致: 'Mật khẩu và xác nhận mật khẩu không khớp',
      两次密码不一致: 'Hai lần nhập mật khẩu không khớp',
      注册: 'Đăng ký',
      注册失败: 'Đăng ký thất bại',
      登录成功: 'Đăng nhập thành công',
      '已有账号,去登录': 'Đã có tài khoản, đi đăng nhập',
      请等待验证初始化完成: 'Vui lòng chờ hoàn tất khởi tạo xác thực',
    },
    menu: {
      用户中心: 'Trung tâm người dùng',
      平台币: 'Tiền nền tảng',
      游戏账单: 'Hóa đơn trò chơi',
      联系客服: 'Liên hệ CSKH',
      存至桌面: 'Lưu ra màn hình chính',
      切换账号: 'Chuyển tài khoản',
    },
    pay: {
      账单: 'Hóa đơn',
      游戏: 'Trò chơi',
      平台币: 'Tiền nền tảng',
      充值记录: 'Lịch sử充值',
      消费记录: 'Lịch sử tiêu hao',
      时间: 'Thời gian',
      金额: 'Số tiền',
      状态: 'Trạng thái',
      成功: 'Thành công',
      失败: 'Thất bại',
      处理中: 'Đang xử lý',
      暂无数据: 'Không có dữ liệu',
      区服绑币: 'Ghi nạp tiền nền tảng',
      区服: 'Dịch vụ',
      数量: 'Số lượng',
      已全部加载完毕: 'Đã tải hoàn toàn',
      '哎呀，发生了异常': 'Yikes, something went wrong',
      手机号: 'Số điện thoại',
      请输入手机号: 'Vui lòng nhập số điện thoại',
      验证码: 'Mã xác nhận',
      请输入验证码: 'Vui lòng nhập mã xác nhận',
      获取验证码: 'Lấy mã xác nhận',
      重新获取: 'Lấy lại mã xác nhận',
      绑定: 'Ghi nạp',
      手机号格式不正确: 'Số điện thoại không hợp lệ',
      验证码不能为空: 'Mã xác nhận không thể để trống',
      绑定成功: 'Ghi nạp thành công',
      绑定失败: 'Ghi nạp thất bại',
      支付订单: 'Đơn hàng thanh toán',
      订单金额: 'Số tiền đơn hàng',
      '请选择支付方式完成支付，感谢您的支持':
        'Vui lòng chọn phương thức thanh toán để hoàn tất, cảm ơn sự hỗ trợ của bạn',
      生成订单: 'Tạo đơn hàng',
      立即支付: 'Thanh toán ngay',
      在线支付提示: 'Thông báo thanh toán trực tuyến',
      '请完成支付，支付成功后商品将尽快到账，请耐心等待。':
        'Vui lòng hoàn tất thanh toán, sau khi thanh toán thành công hàng hóa sẽ sớm được cập nhật, vui lòng kiên nhẫn chờ đợi.',
      完成支付: 'Hoàn tất thanh toán',
      '支付成功,商品将尽快到帐，请耐心等待':
        'Thanh toán thành công, hàng hóa sẽ sớm được cập nhật, vui lòng kiên nhẫn chờ đợi',
      '支付失败,请重试或稍后再试': 'Thanh toán thất bại, vui lòng thử lại hoặc thử lại sau',
      确定: 'Xác nhận',
      关闭: 'Đóng',
      查询订单超时: 'Quá thời gian truy vấn đơn hàng',
      获取支付方式失败: 'Lấy phương thức thanh toán thất bại',
      订单生成中: 'Đang tạo đơn hàng',
      下单失败: 'Đặt hàng thất bại',
      价格格式不正确: 'Định dạng giá không đúng',
      余额格式不正确: 'Định dạng số dư không đúng',
      绑币余额不足: 'Số dư tiền ghi nạp không đủ',
      未查询到支付成功订单: 'Không tìm thấy đơn hàng thanh toán thành công',
      支付成功: 'Thanh toán thành công',
      充值: 'Nạp tiền',
      选择充值金额: 'Chọn số tiền nạp',
      自定义金额: 'Tùy chỉnh số tiền',
      请输入充值金额: 'Vui lòng nhập số tiền nạp',
      选择支付方式: 'Chọn phương thức thanh toán',
      微信支付: 'WeChat Pay',
      支付宝: 'Alipay',
      银行卡: 'Thẻ ngân hàng',
      立即充值: 'Nạp tiền ngay',
      充值金额不能为空: 'Số tiền nạp không được để trống',
      充值金额必须大于0: 'Số tiền nạp phải lớn hơn 0',
      请选择支付方式: 'Vui lòng chọn phương thức thanh toán',
      充值成功: 'Nạp tiền thành công',
      充值失败: 'Nạp tiền thất bại',
      支付取消: 'Thanh toán bị hủy',
      正在处理支付请求: 'Đang xử lý yêu cầu thanh toán',
      支付超时: 'Thanh toán quá thời gian',
      网络错误: 'Lỗi mạng',
      余额: 'Số dư',
      元: 'VND',
      PTB充值: 'Nạp PTB',
      PTB余额: 'Số dư PTB',
      充值PTB: 'Nạp PTB',
      PTB: 'PTB',
      当前PTB余额: 'Số dư PTB hiện tại',
      PTB充值记录: 'Lịch sử nạp PTB',
      PTB消费记录: 'Lịch sử tiêu PTB',
      充值PTB成功: 'Nạp PTB thành công',
      充值PTB失败: 'Nạp PTB thất bại',
      PTB不足: 'Không đủ PTB',
      获取PTB余额失败: 'Lấy số dư PTB thất bại',
      平台币充值: 'Nạp tiền nền tảng',
      平台币充值描述: 'Mô tả nạp tiền nền tảng',
      比例说明: 'Giải thích tỷ lệ',
      兑换比例: 'Tỷ lệ quy đổi',
      支付方式: 'Phương thức thanh toán',
      赠送: 'Tặng',
      储值金额: 'Số tiền nạp',
      实付: 'Thực trả',
      订单确认: 'Xác nhận đơn hàng',
      充值用户: 'Người dùng nạp',
      付款方式: 'Cách thanh toán',
      付款金额: 'Số tiền thanh toán',
      获得金额: 'Số tiền nhận được',
      付款: 'Thanh toán',
      提取奖励: 'Rút thưởng',
      消费: 'Tiêu dùng',
    },
    promote: {
      全民推广: 'Thưởng mời',
      推广收益明细: 'Thu nhập',
      规则说明: 'Hướng dẫn',
      '推广返佣，千万现金': 'Thêm Bạn, Nhận Quà',
      等你来拿: 'Chờ bạn nhận',
      '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。': 'Thêm bạn, thêm quà.',
      '分享越多 返佣越高': 'Chia sẻ càng nhiều, hoa hồng càng cao',
      可提取的余额: 'Số dư khả dụng',
      提取平台币: 'Nhận Thưởng',
      累计返佣: 'Tổng thưởng',
      我的推广数据: 'Bạn bè',
      近30日获返佣: 'Hoa hồng 30 ngày gần đây',
      当前返佣比例: 'Tỷ lệ hoa hồng hiện tại',
      比例: 'Tỷ lệ',
      返佣比例: 'Tỷ lệ hoa hồng',
      我的邀请码: 'Mã mời',
      复制邀请链接: 'Sao link mời',
      加载中: 'Đang tải',
      用户: 'Người dùng',
      暂无消息: 'Chưa có tin nhắn',
      '加入推广成功！': 'Tham gia quảng bá thành công!',
      单次提现金额不得低于: 'Số tiền rút một lần không được thấp hơn',
      最低额度: 'Mức tối thiểu',
      游戏名称: 'Tên trò chơi',
      '复制成功，您可以分享给好友了': 'Sao chép thành công, bạn có thể chia sẻ cho bạn bè rồi',
      '复制失败！': 'Sao chép thất bại!',
      '请按照请好友关注前号导号，正确输入邀请人的邀请码。':
        'Vui lòng nhập đúng mã mời của người mời theo hướng dẫn.',
      '一旦绑定邀请码，将无法更换。': 'Sau khi liên kết mã mời, sẽ không thể thay đổi.',
      '绑定邀请码后，被邀请人成功充值满大于':
        'Sau khi liên kết mã mời, người được mời nạp thành công tổng cộng lớn hơn',
      '否则为无效邀请，将不会返佣。':
        'Nếu không sẽ được coi là lời mời không hợp lệ và sẽ không nhận được hoa hồng.',
      '根据邀请的好友充值金额，将会获得':
        'Dựa trên số tiền nạp của bạn bè được mời, bạn sẽ nhận được',
      的返佣奖励: 'tiền thưởng hoa hồng',
      '奖励无上限。': 'Tiền thưởng không giới hạn.',
      '推广返佣的奖励，永久有效。': 'Tiền thưởng hoa hồng quảng bá có hiệu lực vĩnh viễn.',
      '推广返佣单次提取，需不得低于': 'Mỗi lần rút hoa hồng quảng bá phải không thấp hơn',
      '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。':
        'Việc rút lợi nhuận cần được kiểm duyệt thủ công bởi nền tảng, sau khi gửi vui lòng kiên nhẫn chờ đợi, nền tảng sẽ xử lý đơn trong vòng 48 giờ.',
      '本平台享有活动的最终解释权。':
        'Nền tảng này có quyền giải thích cuối cùng đối với hoạt động.',
      全部: 'Tất cả',
      收入: 'Thu nhập',
      提取: 'Rút',
      时间: 'Thời gian',
      数量: 'Số lượng',
      状态: 'Trạng thái',
      暂无记录: 'Chưa có dữ liệu',
      已经到底了: 'Đã đến cuối',
      '哎呀，发生了异常': 'Yikes, something went wrong',
      审核中: 'Đang duyệt',
      已通过: 'Đã duyệt',
      已拒绝: 'Đã từ chối',
      未知: 'Không rõ',
      代理排行榜: 'Bảng xếp hạng đại lý',
      周榜: 'Bảng tuần',
      月榜: 'Bảng tháng',
      排名: 'Xếp hạng',
      账号: 'Tài khoản',
      好友充值: 'Nạp của bạn bè',
      排名奖励: 'Thưởng xếp hạng',
      暂无排行榜数据: 'Chưa có dữ liệu bảng xếp hạng',
      加载更多: 'Tải thêm',
      '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。':
        'Lưu ý: Thưởng tuần/tháng sẽ tự động quyết toán khi tuần/tháng tự nhiên bắt đầu, phần thưởng sẽ tự động chuyển vào tài khoản hoa hồng. Chúng tôi có quyền cập nhật, chấm dứt hoặc hủy bỏ sự kiện; quyền giải thích quy tắc sự kiện thuộc về chính thức.',
      重试: 'Thử lại',
      总邀请人数: 'Tổng số người mời',
      有效邀请人数: 'Số lượt mời hợp lệ',
      本月返佣: 'Thưởng tháng',
      有效邀请: 'Mời hợp lệ',
      无效邀请: 'Mời không hợp lệ',
      好友账号: 'Tài khoản bạn bè',
      注册时间: 'Thời gian đăng ký',
      充值金额: 'Số tiền nạp',
      获取邀请记录失败: 'Lấy lịch sử mời thất bại',
      网络请求失败: 'Yêu cầu mạng thất bại',
      提现记录: 'Thu nhập',
      可提取余额: 'Số dư có thể rút',
      请输入大于: 'Vui lòng nhập lớn hơn',
      的整数: 'số nguyên',
      提交中: 'Đang gửi',
      提现: 'Rút tiền',
      提现须知: 'Lưu ý khi rút tiền',
      '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。':
        'Sau khi rút tiền sẽ có người kiểm duyệt, trong vòng 48 giờ sẽ xác minh và chuyển vào tài khoản hiện tại, chúng tôi sẽ thông báo qua SMS, có quyền dừng hoặc hủy sự kiện, cách thức và quy tắc sự kiện do bên phát hành giải thích.',
      如有任何疑问请: 'Nếu có thắc mắc vui lòng',
      联系客服: 'liên hệ CSKH',
      请输入有效的金额: 'Vui lòng nhập số tiền hợp lệ',
      单次提取数量不得低于: 'Số tiền rút một lần không được thấp hơn',
      提取金额不能超过可用余额: 'Số tiền rút không được vượt số dư khả dụng',
      请输入整数金额: 'Vui lòng nhập số tiền nguyên',
      '提现申请已提交，请等待审核': 'Đã gửi yêu cầu rút tiền, vui lòng chờ duyệt',
      '提现申请失败，请稍后重试': 'Gửi yêu cầu rút tiền thất bại, vui lòng thử lại sau',
    },
    gift: {
      礼包: 'Gói quà',
      永久礼包: 'Gói quà vĩnh viễn',
      限时礼包: 'Gói quà giới hạn thời gian',
      领取: 'Nhận',
      复制: 'Sao chép',
      领取礼包成功: 'Nhận gói quà thành công',
      领取礼包失败: 'Nhận gói quà thất bại',
      礼包码: 'Mã gói quà',
      礼包内容: 'Nội dung gói quà',
      领取条件: 'Điều kiện nhận',
      累计消费: 'Tổng tiêu dùng',
      累计充值: 'Tổng nạp',
      有效期: 'Thời hạn hiệu lực',
      已全部加载完毕: 'Đã tải hoàn toàn',
      '哎呀，发生了异常': 'Yikes, something went wrong',
    },
    center: {
      自动登录: 'Đăng nhập tự động',
      关闭后每次进入游戏可重新选择账号登录:
        'Sau khi tắt, mỗi lần vào game có thể chọn lại tài khoản để đăng nhập',
      隐藏浮球: 'Ẩn bóng nổi',
      修改密码: 'Đổi mật khẩu',
      当前版本: 'Phiên bản hiện tại',
      返回游戏: 'Quay lại game',
    },
    chpass: {
      修改密码: 'Đổi mật khẩu',
      原密码: 'Mật khẩu cũ',
      新密码: 'Mật khẩu mới',
      确认密码: 'Xác nhận mật khẩu',
      确认: 'Xác nhận',
      旧密码格式不正确: 'Mật khẩu cũ không đúng định dạng',
      新密码格式不正确: 'Mật khẩu mới không đúng định dạng',
      两次密码不一致: 'Hai lần nhập mật khẩu không khớp',
      修改成功: 'Đổi mật khẩu thành công',
    },
    guide: {
      添加到主屏幕: 'Thêm vào màn hình chính',
      '点击【更多】图标，接着点击添加到主屏幕':
        'Nhấn vào biểu tượng [Thêm], sau đó nhấn Thêm vào màn hình chính',
      '点击添加，选择【添加】': 'Nhấn Thêm và chọn [Thêm]',
    },
    news: {
      新闻: 'Tin tức',
      活动: 'Hoạt động',
      公告: 'Thông báo',
      资讯: 'Thông tin',
      攻略: 'Hướng dẫn',
      新闻详情: 'Chi tiết tin tức',
      加载中: 'Đang tải',
      更新时间: 'Thời gian cập nhật',
    },
  },
  y_ = {
    common: {},
    login: {
      用户登录: 'Login de Usuário',
      账号: 'Conta',
      '账号为6-15位字母或数字': '6-15 letras ou dígitos',
      账号不合法: 'Conta inválida',
      密码: 'Senha',
      '密码为6-15位字母或数字': '6-15 letras ou dígitos',
      密码不合法: 'Senha inválida',
      登录失败: 'Falha no login',
      登录: 'Entrar',
      登录成功: 'Login bem-sucedido',
      注册新用户: 'Registrar',
    },
    register: {
      用户注册: 'Registro de Usuário',
      账号: 'Conta',
      '账号为6-15位字母或数字': '6-15 letras ou dígitos',
      账号不合法: 'Conta inválida',
      密码: 'Senha',
      '密码为6-15位字母或数字': '6-15 letras ou dígitos',
      密码不合法: 'Senha inválida',
      确认密码: 'Confirmar Senha',
      密码和确认密码不一致: 'As senhas não coincidem',
      两次密码不一致: 'As senhas não coincidem',
      注册: 'Registrar',
      注册失败: 'Falha no registro',
      登录成功: 'Login bem-sucedido',
      '已有账号,去登录': 'Já tem uma conta? Entrar',
      请等待验证初始化完成: 'Aguarde a inicialização da verificação',
    },
    menu: {
      用户中心: 'Central do Usuário',
      平台币: 'Moedas da Plataforma',
      游戏账单: 'Fatura do Jogo',
      联系客服: 'Contatar Suporte',
      存至桌面: 'Salvar na Área de Trabalho',
      切换账号: 'Trocar Conta',
    },
    pay: {
      账单: 'Fatura',
      游戏: 'Jogo',
      平台币: 'Moedas da Plataforma',
      充值记录: 'Registros de Recarga',
      消费记录: 'Registros de Consumo',
      时间: 'Tempo',
      金额: 'Valor',
      状态: 'Status',
      成功: 'Sucesso',
      失败: 'Falhou',
      处理中: 'Processando',
      暂无数据: 'Sem Dados',
      区服绑币: 'Moedas Vinculadas do Servidor',
      区服: 'Servidor',
      数量: 'Quantidade',
      已全部加载完毕: 'Todos os dados carregados',
      '哎呀，发生了异常': 'Ops, ocorreu um erro',
      手机号: 'Número de Telefone',
      请输入手机号: 'Por favor, insira o número de telefone',
      验证码: 'Código de Verificação',
      请输入验证码: 'Por favor, insira o código de verificação',
      获取验证码: 'Obter Código',
      重新获取: 'Reenviar',
      绑定: 'Vincular',
      手机号格式不正确: 'Formato de número de telefone inválido',
      验证码不能为空: 'Código de verificação não pode estar vazio',
      绑定成功: 'Vinculação bem-sucedida',
      绑定失败: 'Falha na vinculação',
      支付订单: 'Ordem de Pagamento',
      订单金额: 'Valor do Pedido',
      '请选择支付方式完成支付，感谢您的支持':
        'Escolha um método de pagamento para concluir o pagamento. Obrigado!',
      生成订单: 'Gerar Pedido',
      立即支付: 'Pagar Agora',
      在线支付提示: 'Prompt de Pagamento Online',
      '请完成支付，支付成功后商品将尽快到账，请耐心等待。':
        'Complete o pagamento; os itens chegarão em breve.',
      完成支付: 'Concluir Pagamento',
      '支付成功,商品将尽快到帐，请耐心等待':
        'Pagamento bem-sucedido. O item será creditado o mais rápido possível. Por favor, seja paciente.',
      '支付失败,请重试或稍后再试': 'Pagamento falhou. Por favor, tente novamente ou mais tarde.',
      确定: 'OK',
      关闭: 'Fechar',
      查询订单超时: 'Tempo esgotado na consulta do pedido',
      获取支付方式失败: 'Falha ao obter método de pagamento',
      订单生成中: 'Gerando pedido',
      下单失败: 'Falha no pedido',
      价格格式不正确: 'Formato de preço incorreto',
      余额格式不正确: 'Formato de saldo incorreto',
      绑币余额不足: 'Moedas vinculadas insuficientes',
      未查询到支付成功订单: 'Nenhum pedido de pagamento bem-sucedido encontrado',
      支付成功: 'Pagamento bem-sucedido',
      充值: 'Recarregar',
      选择充值金额: 'Selecionar valor de recarga',
      自定义金额: 'Valor personalizado',
      请输入充值金额: 'Por favor, insira o valor de recarga',
      选择支付方式: 'Selecionar método de pagamento',
      微信支付: 'WeChat Pay',
      支付宝: 'Alipay',
      银行卡: 'Cartão Bancário',
      立即充值: 'Recarregar Agora',
      充值金额不能为空: 'Valor de recarga não pode estar vazio',
      充值金额必须大于0: 'Valor de recarga deve ser maior que 0',
      请选择支付方式: 'Por favor, selecione o método de pagamento',
      充值成功: 'Recarga bem-sucedida',
      充值失败: 'Falha na recarga',
      支付取消: 'Pagamento cancelado',
      正在处理支付请求: 'Processando solicitação de pagamento',
      支付超时: 'Tempo esgotado no pagamento',
      网络错误: 'Erro de rede',
      余额: 'Saldo',
      元: 'Yuan',
      PTB充值: 'Recarga PTB',
      PTB余额: 'Saldo PTB',
      充值PTB: 'Recarregar PTB',
      PTB: 'PTB',
      当前PTB余额: 'Saldo PTB Atual',
      PTB充值记录: 'Registros de Recarga PTB',
      PTB消费记录: 'Registros de Consumo PTB',
      充值PTB成功: 'Recarga PTB bem-sucedida',
      充值PTB失败: 'Falha na recarga PTB',
      PTB不足: 'PTB insuficiente',
      获取PTB余额失败: 'Falha ao obter saldo PTB',
      平台币充值: 'Recarga de Moedas da Plataforma',
      平台币充值描述: 'Descrição da Recarga de Moedas da Plataforma',
      比例说明: 'Taxa de Câmbio',
      兑换比例: 'Taxa de Câmbio',
      支付方式: 'Método de Pagamento',
      赠送: 'Bônus',
      储值金额: 'Valor de Recarga',
      实付: '',
      订单确认: 'Confirmação do Pedido',
      充值用户: 'Usuário de Recarga',
      付款方式: 'Método de Pagamento',
      付款金额: 'Valor do Pagamento',
      获得金额: 'Valor Recebido',
      付款: 'Pagamento',
      提取奖励: 'Retirar Recompensa',
      消费: 'Consumo',
    },
    promote: {
      全民推广: 'Bônus de Indicação',
      推广收益明细: 'Ganhos',
      规则说明: 'Regras',
      '推广返佣，千万现金': 'Convide Amigos, Ganhe Recompensas',
      等你来拿: 'Esperando por Você',
      '重磅推出《全民代理计划》，分享好友玩游戏拿返佣。': 'Mais amigos, mais recompensas.',
      '分享越多 返佣越高': 'Mais Compartilhamento, Maiores Reembolsos',
      可提取的余额: 'Disponível',
      提取平台币: 'Retirar',
      累计返佣: 'Recompensas Totais',
      我的推广数据: 'Meus Amigos',
      近30日获返佣: 'Reembolsos Ganhos nos Últimos 30 Dias',
      当前返佣比例: 'Taxa de Reembolso Atual',
      比例: 'Taxa',
      返佣比例: 'Taxa de Reembolso',
      我的邀请码: 'Meu Código',
      复制邀请链接: 'Copiar Link',
      加载中: 'Carregando',
      用户: 'Usuário',
      暂无消息: 'Sem Mensagens',
      '加入推广成功！': 'Ingressou com Sucesso na Promoção!',
      单次提现金额不得低于: 'Valor mínimo de saque por transação não deve ser menor que',
      最低额度: 'Valor Mínimo',
      游戏名称: 'Nome do Jogo',
      '复制成功，您可以分享给好友了': 'Cópia bem-sucedida, você pode compartilhar com amigos',
      '复制失败！': 'Falha na cópia!',
      '请按照请好友关注前号导号，正确输入邀请人的邀请码。':
        'Por favor, peça ao seu amigo para seguir o guia da conta anterior e inserir corretamente o código de convite do convidador.',
      '一旦绑定邀请码，将无法更换。':
        'Uma vez vinculado o código de convite, não poderá ser alterado.',
      '绑定邀请码后，被邀请人成功充值满大于':
        'Após vincular o código de convite, o convidado deve recarregar com sucesso mais de',
      '否则为无效邀请，将不会返佣。':
        'Caso contrário, será considerado um convite inválido e nenhum reembolso será concedido.',
      '根据邀请的好友充值金额，将会获得':
        'Com base no valor de recarga do amigo convidado, você receberá',
      的返佣奖励: 'recompensa de reembolso',
      '奖励无上限。': 'Não há limite superior para a recompensa.',
      '推广返佣的奖励，永久有效。':
        'A recompensa de reembolso da promoção é permanentemente válida.',
      '推广返佣单次提取，需不得低于':
        'O valor mínimo de saque por transação de reembolso da promoção não deve ser menor que',
      '提取收益需要平台人工审核，提交后请耐心等待，平台将会在48小时内尽快处理申请。':
        'A retirada requer revisão manual da plataforma. Por favor, seja paciente após o envio; a plataforma processará a solicitação dentro de 48 horas.',
      '本平台享有活动的最终解释权。':
        'Esta plataforma reserva o direito final de interpretação do evento',
      全部: 'Todos',
      收入: 'Renda',
      提取: 'Retirar',
      时间: 'Tempo',
      数量: 'Quantidade',
      状态: 'Status',
      暂无记录: 'Sem Registros',
      已经到底了: 'Fim da Lista',
      '哎呀，发生了异常': 'Ops, ocorreu um erro',
      审核中: 'Em Revisão',
      已通过: 'Aprovado',
      已拒绝: 'Rejeitado',
      未知: 'Desconhecido',
      代理排行榜: 'Rankings de Agentes',
      周榜: 'Rankings Semanais',
      月榜: 'Rankings Mensais',
      排名: 'Posição',
      账号: 'Conta',
      好友充值: 'Recarga de Amigos',
      排名奖励: 'Recompensa de Posição',
      暂无排行榜数据: 'Sem dados de ranking disponíveis',
      加载更多: 'Carregar Mais',
      '注:周/月奖励将会在指定自然周/月开始的自动结算，奖励会自动发放至返佣账户中，我们将根据的更新，终止或取消活动的权力，活动的活动规则解释权归只以官方为准。':
        'Nota: As recompensas Semanais/Mensais serão liquidadas automaticamente no início da semana/mês natural especificado e serão creditadas automaticamente na conta de reembolso. Reservamo-nos o direito de atualizar, encerrar ou cancelar o evento, e a interpretação final das regras do evento pertence à autoridade oficial.',
      重试: 'Tentar Novamente',
      总邀请人数: 'Total de Convites',
      有效邀请人数: 'Convites Válidos',
      本月返佣: 'Este Mês',
      有效邀请: 'Convite Válido',
      无效邀请: 'Convite Inválido',
      好友账号: 'Conta de Amigo',
      注册时间: 'Tempo de Registro',
      充值金额: 'Valor de Recarga',
      获取邀请记录失败: 'Falha ao obter registros de convite',
      网络请求失败: 'Falha na solicitação de rede',
      提现记录: 'Ganhos',
      可提取余额: 'Saldo Disponível para Saque',
      请输入大于: 'Por favor, insira um número inteiro maior que',
      的整数: 'número inteiro',
      提交中: 'Enviando',
      提现: 'Sacar',
      提现须知: 'Aviso de Saque',
      '提现后将会有专人进行审核，48小时内会核实完毕后会发放到当前账号，我们会通过短信支付，终止或取消活动的全力，活动办法和规则请最终解释权归公告方准。':
        'Após o saque, uma pessoa dedicada revisará a solicitação. Será verificado dentro de 48 horas e creditado na conta atual. Reservamo-nos o direito de encerrar ou cancelar o evento via SMS. A interpretação final das regras do evento pertence à parte anunciante.',
      如有任何疑问请: 'Se tiver alguma dúvida, por favor',
      联系客服: 'Contatar Suporte',
      请输入有效的金额: 'Por favor, insira um valor válido',
      单次提取数量不得低于: 'A quantidade mínima de saque por transação não deve ser menor que',
      提取金额不能超过可用余额: 'O valor do saque não pode exceder o saldo disponível',
      请输入整数金额: 'Por favor, insira um valor inteiro',
      '提现申请已提交，请等待审核': 'Solicitação de saque enviada, por favor aguarde revisão',
      '提现申请失败，请稍后重试':
        'Falha na solicitação de saque, por favor tente novamente mais tarde',
    },
    gift: {
      礼包: 'Pacotes de Presente',
      永久礼包: 'Presente Permanente',
      限时礼包: 'Presente por Tempo Limitado',
      领取: 'Resgatar',
      复制: 'Copiar',
      领取礼包成功: 'Pacote de presente resgatado com sucesso',
      领取礼包失败: 'Falha ao resgatar pacote de presente',
      礼包码: 'Código do Presente',
      礼包内容: 'Conteúdo do Presente',
      领取条件: 'Requisitos para Resgatar',
      累计消费: 'Consumo Total',
      累计充值: 'Recarga Total',
      有效期: 'Período de Validade',
      已全部加载完毕: 'Todos os dados carregados',
      '哎呀，发生了异常': 'Ops, ocorreu um erro',
    },
    center: {
      自动登录: 'Login Automático',
      关闭后每次进入游戏可重新选择账号登录:
        'Após desativar, você pode reselecionar o login da conta cada vez que entrar no jogo',
      隐藏浮球: 'Ocultar Bolha Flutuante',
      修改密码: 'Alterar Senha',
      当前版本: 'Versão Atual',
      返回游戏: 'Voltar ao Jogo',
    },
    chpass: {
      修改密码: 'Alterar Senha',
      原密码: 'Senha Atual',
      新密码: 'Nova Senha',
      确认密码: 'Confirmar Senha',
      确认: 'Confirmar',
      旧密码格式不正确: 'Formato da senha atual incorreto',
      新密码格式不正确: 'Formato da nova senha incorreto',
      两次密码不一致: 'As senhas não coincidem',
      修改成功: 'Senha alterada com sucesso',
    },
    guide: {
      添加到主屏幕: 'Adicionar à Tela Inicial',
      '点击【更多】图标，接着点击添加到主屏幕':
        'Toque no ícone [Mais], depois toque em Adicionar à Tela Inicial',
      '点击添加，选择【添加】': 'Toque em Adicionar e selecione [Adicionar]',
    },
    news: {
      新闻: 'Notícias',
      活动: 'Eventos',
      公告: 'Aviso',
      资讯: 'Informações',
      攻略: 'Guias',
      新闻详情: 'Detalhes da Notícia',
      加载中: 'Carregando',
      更新时间: 'Tempo de Atualização',
    },
  },
  Jc = o_({
    legacy: !1,
    locale: 'zh-CN',
    messages: { 'zh-CN': g_, 'zh-TW': m_, en: __, vi: v_, pt: y_ },
  }),
  E_ = hm(),
  b_ = sg(),
  Of = pm(),
  C_ = Ei(lm);
window.$emitter = E_;
window.$messager = Of;
Of.setup();
C_.use(b_).use(dm).use(Jc).use(ng).use(Jc).mount('#app');
export {
  mv as $,
  Me as A,
  fi as B,
  $s as C,
  Wp as D,
  Nr as E,
  Ne as F,
  xu as G,
  vv as H,
  Tu as I,
  Rl as J,
  Td as K,
  ax as L,
  Z_ as M,
  N_ as N,
  I_ as O,
  Ea as P,
  qd as Q,
  Il as R,
  $e as S,
  wv as T,
  sl as U,
  L_ as V,
  Dv as W,
  z_ as X,
  us as Y,
  qn as Z,
  cm as _,
  it as a,
  rh as a$,
  U_ as a0,
  cn as a1,
  R_ as a2,
  kv as a3,
  Dx as a4,
  w_ as a5,
  ia as a6,
  O_ as a7,
  At as a8,
  Lr as a9,
  Yi as aA,
  jh as aB,
  Ur as aC,
  Zn as aD,
  _h as aE,
  Uv as aF,
  W_ as aG,
  K_ as aH,
  j_ as aI,
  q_ as aJ,
  Cv as aK,
  $v as aL,
  dt as aM,
  Qh as aN,
  ji as aO,
  Vt as aP,
  Cn as aQ,
  Le as aR,
  bv as aS,
  _t as aT,
  jt as aU,
  Ki as aV,
  uv as aW,
  fv as aX,
  pu as aY,
  A_ as aZ,
  eh as a_,
  Je as aa,
  Ts as ab,
  Kt as ac,
  Rv as ad,
  Ei as ae,
  Dh as af,
  dv as ag,
  Bh as ah,
  Hx as ai,
  J_ as aj,
  Sd as ak,
  G_ as al,
  Ex as am,
  nv as an,
  rv as ao,
  iv as ap,
  sv as aq,
  tv as ar,
  Lv as as,
  ov as at,
  Fv as au,
  B_ as av,
  $i as aw,
  Ze as ax,
  ol as ay,
  k_ as az,
  Fn as b,
  Ji as b0,
  Vl as b1,
  th as b2,
  ah as b3,
  ih as b4,
  oh as b5,
  id as b6,
  sh as b7,
  Qi as b8,
  Ld as b9,
  P_ as bA,
  lv as bB,
  Iv as bC,
  Ov as bD,
  Cx as bE,
  $_ as bF,
  gv as bG,
  Sh as bH,
  Nv as bI,
  cv as bJ,
  V_ as bK,
  Nl as bL,
  kx as bM,
  Ru as bN,
  wx as bO,
  Jh as bP,
  Bv as bQ,
  pv as bR,
  Th as bS,
  hv as bT,
  av as bU,
  Hv as bV,
  Av as bW,
  M_ as bX,
  Pg as bY,
  rs as ba,
  Al as bb,
  xs as bc,
  bl as bd,
  Ev as be,
  Mx as bf,
  lh as bg,
  X_ as bh,
  Y_ as bi,
  Tv as bj,
  br as bk,
  Ka as bl,
  Pv as bm,
  un as bn,
  El as bo,
  F_ as bp,
  Gi as bq,
  Ph as br,
  Sv as bs,
  D_ as bt,
  ts as bu,
  ev as bv,
  ve as bw,
  T_ as bx,
  S_ as by,
  _v as bz,
  Wh as c,
  Gt as d,
  hu as e,
  H_ as f,
  yv as g,
  Vp as h,
  we as i,
  im as j,
  Mv as k,
  Q_ as l,
  Zp as m,
  he as n,
  Dr as o,
  Bs as p,
  ks as q,
  Or as r,
  wt as s,
  od as t,
  mc as u,
  yi as v,
  xv as w,
  qt as x,
  ws as y,
  Wt as z,
};
