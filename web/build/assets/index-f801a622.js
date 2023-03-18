(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver((s) => {
    for (const o of s)
      if (o.type === 'childList')
        for (const l of o.addedNodes) l.tagName === 'LINK' && l.rel === 'modulepreload' && r(l);
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
function N() {}
function w(t, e) {
  for (const n in e) t[n] = e[n];
  return t;
}
function je(t) {
  return t();
}
function _e() {
  return Object.create(null);
}
function U(t) {
  t.forEach(je);
}
function ce(t) {
  return typeof t == 'function';
}
function O(t, e) {
  return t != t ? e == e : t !== e || (t && typeof t == 'object') || typeof t == 'function';
}
function Xe(t) {
  return Object.keys(t).length === 0;
}
function Ye(t, ...e) {
  if (t == null) return N;
  const n = t.subscribe(...e);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
function x(t, e, n, r) {
  if (t) {
    const s = Oe(t, e, n, r);
    return t[0](s);
  }
}
function Oe(t, e, n, r) {
  return t[1] && r ? w(n.ctx.slice(), t[1](r(e))) : n.ctx;
}
function G(t, e, n, r) {
  if (t[2] && r) {
    const s = t[2](r(n));
    if (e.dirty === void 0) return s;
    if (typeof s == 'object') {
      const o = [],
        l = Math.max(e.dirty.length, s.length);
      for (let i = 0; i < l; i += 1) o[i] = e.dirty[i] | s[i];
      return o;
    }
    return e.dirty | s;
  }
  return e.dirty;
}
function H(t, e, n, r, s, o) {
  if (s) {
    const l = Oe(e, n, r, o);
    t.p(l, s);
  }
}
function J(t) {
  if (t.ctx.length > 32) {
    const e = [],
      n = t.ctx.length / 32;
    for (let r = 0; r < n; r++) e[r] = -1;
    return e;
  }
  return -1;
}
function M(t) {
  const e = {};
  for (const n in t) n[0] !== '$' && (e[n] = t[n]);
  return e;
}
function me(t, e) {
  const n = {};
  e = new Set(e);
  for (const r in t) !e.has(r) && r[0] !== '$' && (n[r] = t[r]);
  return n;
}
function z(t, e) {
  t.appendChild(e);
}
function L(t, e, n) {
  t.insertBefore(e, n || null);
}
function S(t) {
  t.parentNode && t.parentNode.removeChild(t);
}
function Be(t, e) {
  for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e);
}
function D(t) {
  return document.createElement(t);
}
function Se(t) {
  return document.createElementNS('http://www.w3.org/2000/svg', t);
}
function Le(t) {
  return document.createTextNode(t);
}
function oe() {
  return Le(' ');
}
function Q() {
  return Le('');
}
function Fe(t, e, n, r) {
  return t.addEventListener(e, n, r), () => t.removeEventListener(e, n, r);
}
function q(t, e, n) {
  n == null ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n);
}
function te(t, e) {
  for (const n in e) q(t, n, e[n]);
}
function Ue(t) {
  return Array.from(t.childNodes);
}
function Ke(t, e, { bubbles: n = !1, cancelable: r = !1 } = {}) {
  const s = document.createEvent('CustomEvent');
  return s.initCustomEvent(t, n, r, e), s;
}
function ne(t, e) {
  return new t(e);
}
let W;
function K(t) {
  W = t;
}
function ue() {
  if (!W) throw new Error('Function called outside component initialization');
  return W;
}
function We(t) {
  ue().$$.after_update.push(t);
}
function xe(t) {
  ue().$$.on_destroy.push(t);
}
function Ge() {
  const t = ue();
  return (e, n, { cancelable: r = !1 } = {}) => {
    const s = t.$$.callbacks[e];
    if (s) {
      const o = Ke(e, n, { cancelable: r });
      return (
        s.slice().forEach((l) => {
          l.call(t, o);
        }),
        !o.defaultPrevented
      );
    }
    return !0;
  };
}
function ge(t, e) {
  const n = t.$$.callbacks[e.type];
  n && n.slice().forEach((r) => r.call(this, e));
}
const B = [],
  pe = [];
let F = [];
const be = [],
  Ie = Promise.resolve();
let le = !1;
function Ce() {
  le || ((le = !0), Ie.then(Me));
}
function Ae() {
  return Ce(), Ie;
}
function ie(t) {
  F.push(t);
}
const re = new Set();
let X = 0;
function Me() {
  if (X !== 0) return;
  const t = W;
  do {
    try {
      for (; X < B.length; ) {
        const e = B[X];
        X++, K(e), He(e.$$);
      }
    } catch (e) {
      throw ((B.length = 0), (X = 0), e);
    }
    for (K(null), B.length = 0, X = 0; pe.length; ) pe.pop()();
    for (let e = 0; e < F.length; e += 1) {
      const n = F[e];
      re.has(n) || (re.add(n), n());
    }
    F.length = 0;
  } while (B.length);
  for (; be.length; ) be.pop()();
  (le = !1), re.clear(), K(t);
}
function He(t) {
  if (t.fragment !== null) {
    t.update(), U(t.before_update);
    const e = t.dirty;
    (t.dirty = [-1]), t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(ie);
  }
}
function Je(t) {
  const e = [],
    n = [];
  F.forEach((r) => (t.indexOf(r) === -1 ? e.push(r) : n.push(r))), n.forEach((r) => r()), (F = e);
}
const ee = new Set();
let P;
function fe() {
  P = { r: 0, c: [], p: P };
}
function ae() {
  P.r || U(P.c), (P = P.p);
}
function p(t, e) {
  t && t.i && (ee.delete(t), t.i(e));
}
function b(t, e, n, r) {
  if (t && t.o) {
    if (ee.has(t)) return;
    ee.add(t),
      P.c.push(() => {
        ee.delete(t), r && (n && t.d(1), r());
      }),
      t.o(e);
  } else r && r();
}
function R(t, e) {
  const n = {},
    r = {},
    s = { $$scope: 1 };
  let o = t.length;
  for (; o--; ) {
    const l = t[o],
      i = e[o];
    if (i) {
      for (const c in l) c in i || (r[c] = 1);
      for (const c in i) s[c] || ((n[c] = i[c]), (s[c] = 1));
      t[o] = i;
    } else for (const c in l) s[c] = 1;
  }
  for (const l in r) l in n || (n[l] = void 0);
  return n;
}
function V(t) {
  return typeof t == 'object' && t !== null ? t : {};
}
function E(t) {
  t && t.c();
}
function v(t, e, n, r) {
  const { fragment: s, after_update: o } = t.$$;
  s && s.m(e, n),
    r ||
      ie(() => {
        const l = t.$$.on_mount.map(je).filter(ce);
        t.$$.on_destroy ? t.$$.on_destroy.push(...l) : U(l), (t.$$.on_mount = []);
      }),
    o.forEach(ie);
}
function y(t, e) {
  const n = t.$$;
  n.fragment !== null &&
    (Je(n.after_update),
    U(n.on_destroy),
    n.fragment && n.fragment.d(e),
    (n.on_destroy = n.fragment = null),
    (n.ctx = []));
}
function Qe(t, e) {
  t.$$.dirty[0] === -1 && (B.push(t), Ce(), t.$$.dirty.fill(0)), (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31);
}
function I(t, e, n, r, s, o, l, i = [-1]) {
  const c = W;
  K(t);
  const u = (t.$$ = {
    fragment: null,
    ctx: [],
    props: o,
    update: N,
    not_equal: s,
    bound: _e(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (c ? c.$$.context : [])),
    callbacks: _e(),
    dirty: i,
    skip_bound: !1,
    root: e.target || c.$$.root,
  });
  l && l(u.root);
  let a = !1;
  if (
    ((u.ctx = n
      ? n(t, e.props || {}, (f, d, ...h) => {
          const k = h.length ? h[0] : d;
          return (
            u.ctx && s(u.ctx[f], (u.ctx[f] = k)) && (!u.skip_bound && u.bound[f] && u.bound[f](k), a && Qe(t, f)), d
          );
        })
      : []),
    u.update(),
    (a = !0),
    U(u.before_update),
    (u.fragment = r ? r(u.ctx) : !1),
    e.target)
  ) {
    if (e.hydrate) {
      const f = Ue(e.target);
      u.fragment && u.fragment.l(f), f.forEach(S);
    } else u.fragment && u.fragment.c();
    e.intro && p(t.$$.fragment), v(t, e.target, e.anchor, e.customElement), Me();
  }
  K(c);
}
class C {
  $destroy() {
    y(this, 1), (this.$destroy = N);
  }
  $on(e, n) {
    if (!ce(n)) return N;
    const r = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return (
      r.push(n),
      () => {
        const s = r.indexOf(n);
        s !== -1 && r.splice(s, 1);
      }
    );
  }
  $set(e) {
    this.$$set && !Xe(e) && ((this.$$.skip_bound = !0), this.$$set(e), (this.$$.skip_bound = !1));
  }
}
const Y = [];
function ze(t, e) {
  return { subscribe: Pe(t, e).subscribe };
}
function Pe(t, e = N) {
  let n;
  const r = new Set();
  function s(i) {
    if (O(t, i) && ((t = i), n)) {
      const c = !Y.length;
      for (const u of r) u[1](), Y.push(u, t);
      if (c) {
        for (let u = 0; u < Y.length; u += 2) Y[u][0](Y[u + 1]);
        Y.length = 0;
      }
    }
  }
  function o(i) {
    s(i(t));
  }
  function l(i, c = N) {
    const u = [i, c];
    return (
      r.add(u),
      r.size === 1 && (n = e(s) || N),
      i(t),
      () => {
        r.delete(u), r.size === 0 && n && (n(), (n = null));
      }
    );
  }
  return { set: s, update: o, subscribe: l };
}
function De(t, e, n) {
  const r = !Array.isArray(t),
    s = r ? [t] : t,
    o = e.length < 2;
  return ze(n, (l) => {
    let i = !1;
    const c = [];
    let u = 0,
      a = N;
    const f = () => {
        if (u) return;
        a();
        const h = e(r ? c[0] : c, l);
        o ? l(h) : (a = ce(h) ? h : N);
      },
      d = s.map((h, k) =>
        Ye(
          h,
          (Z) => {
            (c[k] = Z), (u &= ~(1 << k)), i && f();
          },
          () => {
            u |= 1 << k;
          }
        )
      );
    return (
      (i = !0),
      f(),
      function () {
        U(d), a(), (i = !1);
      }
    );
  });
}
function Ve(t, e) {
  if (t instanceof RegExp) return { keys: !1, pattern: t };
  var n,
    r,
    s,
    o,
    l = [],
    i = '',
    c = t.split('/');
  for (c[0] || c.shift(); (s = c.shift()); )
    (n = s[0]),
      n === '*'
        ? (l.push('wild'), (i += '/(.*)'))
        : n === ':'
        ? ((r = s.indexOf('?', 1)),
          (o = s.indexOf('.', 1)),
          l.push(s.substring(1, ~r ? r : ~o ? o : s.length)),
          (i += ~r && !~o ? '(?:/([^/]+?))?' : '/([^/]+?)'),
          ~o && (i += (~r ? '?' : '') + '\\' + s.substring(o)))
        : (i += '/' + s);
  return { keys: l, pattern: new RegExp('^' + i + (e ? '(?=$|/)' : '/?$'), 'i') };
}
function Ze(t) {
  let e, n, r;
  const s = [t[2]];
  var o = t[0];
  function l(i) {
    let c = {};
    for (let u = 0; u < s.length; u += 1) c = w(c, s[u]);
    return { props: c };
  }
  return (
    o && ((e = ne(o, l())), e.$on('routeEvent', t[7])),
    {
      c() {
        e && E(e.$$.fragment), (n = Q());
      },
      m(i, c) {
        e && v(e, i, c), L(i, n, c), (r = !0);
      },
      p(i, c) {
        const u = c & 4 ? R(s, [V(i[2])]) : {};
        if (c & 1 && o !== (o = i[0])) {
          if (e) {
            fe();
            const a = e;
            b(a.$$.fragment, 1, 0, () => {
              y(a, 1);
            }),
              ae();
          }
          o
            ? ((e = ne(o, l())),
              e.$on('routeEvent', i[7]),
              E(e.$$.fragment),
              p(e.$$.fragment, 1),
              v(e, n.parentNode, n))
            : (e = null);
        } else o && e.$set(u);
      },
      i(i) {
        r || (e && p(e.$$.fragment, i), (r = !0));
      },
      o(i) {
        e && b(e.$$.fragment, i), (r = !1);
      },
      d(i) {
        i && S(n), e && y(e, i);
      },
    }
  );
}
function et(t) {
  let e, n, r;
  const s = [{ params: t[1] }, t[2]];
  var o = t[0];
  function l(i) {
    let c = {};
    for (let u = 0; u < s.length; u += 1) c = w(c, s[u]);
    return { props: c };
  }
  return (
    o && ((e = ne(o, l())), e.$on('routeEvent', t[6])),
    {
      c() {
        e && E(e.$$.fragment), (n = Q());
      },
      m(i, c) {
        e && v(e, i, c), L(i, n, c), (r = !0);
      },
      p(i, c) {
        const u = c & 6 ? R(s, [c & 2 && { params: i[1] }, c & 4 && V(i[2])]) : {};
        if (c & 1 && o !== (o = i[0])) {
          if (e) {
            fe();
            const a = e;
            b(a.$$.fragment, 1, 0, () => {
              y(a, 1);
            }),
              ae();
          }
          o
            ? ((e = ne(o, l())),
              e.$on('routeEvent', i[6]),
              E(e.$$.fragment),
              p(e.$$.fragment, 1),
              v(e, n.parentNode, n))
            : (e = null);
        } else o && e.$set(u);
      },
      i(i) {
        r || (e && p(e.$$.fragment, i), (r = !0));
      },
      o(i) {
        e && b(e.$$.fragment, i), (r = !1);
      },
      d(i) {
        i && S(n), e && y(e, i);
      },
    }
  );
}
function tt(t) {
  let e, n, r, s;
  const o = [et, Ze],
    l = [];
  function i(c, u) {
    return c[1] ? 0 : 1;
  }
  return (
    (e = i(t)),
    (n = l[e] = o[e](t)),
    {
      c() {
        n.c(), (r = Q());
      },
      m(c, u) {
        l[e].m(c, u), L(c, r, u), (s = !0);
      },
      p(c, [u]) {
        let a = e;
        (e = i(c)),
          e === a
            ? l[e].p(c, u)
            : (fe(),
              b(l[a], 1, 1, () => {
                l[a] = null;
              }),
              ae(),
              (n = l[e]),
              n ? n.p(c, u) : ((n = l[e] = o[e](c)), n.c()),
              p(n, 1),
              n.m(r.parentNode, r));
      },
      i(c) {
        s || (p(n), (s = !0));
      },
      o(c) {
        b(n), (s = !1);
      },
      d(c) {
        l[e].d(c), c && S(r);
      },
    }
  );
}
function we() {
  const t = window.location.href.indexOf('#/');
  let e = t > -1 ? window.location.href.substr(t + 1) : '/';
  const n = e.indexOf('?');
  let r = '';
  return n > -1 && ((r = e.substr(n + 1)), (e = e.substr(0, n))), { location: e, querystring: r };
}
const de = ze(null, function (e) {
  e(we());
  const n = () => {
    e(we());
  };
  return (
    window.addEventListener('hashchange', n, !1),
    function () {
      window.removeEventListener('hashchange', n, !1);
    }
  );
});
De(de, (t) => t.location);
De(de, (t) => t.querystring);
const $e = Pe(void 0);
async function nt(t) {
  if (!t || t.length < 1 || (t.charAt(0) != '/' && t.indexOf('#/') !== 0)) throw Error('Invalid parameter location');
  await Ae(),
    history.replaceState(
      { ...history.state, __svelte_spa_router_scrollX: window.scrollX, __svelte_spa_router_scrollY: window.scrollY },
      void 0
    ),
    (window.location.hash = (t.charAt(0) == '#' ? '' : '#') + t);
}
function rt(t) {
  t ? window.scrollTo(t.__svelte_spa_router_scrollX, t.__svelte_spa_router_scrollY) : window.scrollTo(0, 0);
}
function st(t, e, n) {
  let { routes: r = {} } = e,
    { prefix: s = '' } = e,
    { restoreScrollState: o = !1 } = e;
  class l {
    constructor(_, g) {
      if (!g || (typeof g != 'function' && (typeof g != 'object' || g._sveltesparouter !== !0)))
        throw Error('Invalid component object');
      if (
        !_ ||
        (typeof _ == 'string' && (_.length < 1 || (_.charAt(0) != '/' && _.charAt(0) != '*'))) ||
        (typeof _ == 'object' && !(_ instanceof RegExp))
      )
        throw Error('Invalid value for "path" argument - strings must start with / or *');
      const { pattern: j, keys: $ } = Ve(_);
      (this.path = _),
        typeof g == 'object' && g._sveltesparouter === !0
          ? ((this.component = g.component),
            (this.conditions = g.conditions || []),
            (this.userData = g.userData),
            (this.props = g.props || {}))
          : ((this.component = () => Promise.resolve(g)), (this.conditions = []), (this.props = {})),
        (this._pattern = j),
        (this._keys = $);
    }
    match(_) {
      if (s) {
        if (typeof s == 'string')
          if (_.startsWith(s)) _ = _.substr(s.length) || '/';
          else return null;
        else if (s instanceof RegExp) {
          const A = _.match(s);
          if (A && A[0]) _ = _.substr(A[0].length) || '/';
          else return null;
        }
      }
      const g = this._pattern.exec(_);
      if (g === null) return null;
      if (this._keys === !1) return g;
      const j = {};
      let $ = 0;
      for (; $ < this._keys.length; ) {
        try {
          j[this._keys[$]] = decodeURIComponent(g[$ + 1] || '') || null;
        } catch {
          j[this._keys[$]] = null;
        }
        $++;
      }
      return j;
    }
    async checkConditions(_) {
      for (let g = 0; g < this.conditions.length; g++) if (!(await this.conditions[g](_))) return !1;
      return !0;
    }
  }
  const i = [];
  r instanceof Map
    ? r.forEach((m, _) => {
        i.push(new l(_, m));
      })
    : Object.keys(r).forEach((m) => {
        i.push(new l(m, r[m]));
      });
  let c = null,
    u = null,
    a = {};
  const f = Ge();
  async function d(m, _) {
    await Ae(), f(m, _);
  }
  let h = null,
    k = null;
  o &&
    ((k = (m) => {
      m.state && (m.state.__svelte_spa_router_scrollY || m.state.__svelte_spa_router_scrollX)
        ? (h = m.state)
        : (h = null);
    }),
    window.addEventListener('popstate', k),
    We(() => {
      rt(h);
    }));
  let Z = null,
    T = null;
  const qe = de.subscribe(async (m) => {
    Z = m;
    let _ = 0;
    for (; _ < i.length; ) {
      const g = i[_].match(m.location);
      if (!g) {
        _++;
        continue;
      }
      const j = {
        route: i[_].path,
        location: m.location,
        querystring: m.querystring,
        userData: i[_].userData,
        params: g && typeof g == 'object' && Object.keys(g).length ? g : null,
      };
      if (!(await i[_].checkConditions(j))) {
        n(0, (c = null)), (T = null), d('conditionsFailed', j);
        return;
      }
      d('routeLoading', Object.assign({}, j));
      const $ = i[_].component;
      if (T != $) {
        $.loading
          ? (n(0, (c = $.loading)),
            (T = $),
            n(1, (u = $.loadingParams)),
            n(2, (a = {})),
            d('routeLoaded', Object.assign({}, j, { component: c, name: c.name, params: u })))
          : (n(0, (c = null)), (T = null));
        const A = await $();
        if (m != Z) return;
        n(0, (c = (A && A.default) || A)), (T = $);
      }
      g && typeof g == 'object' && Object.keys(g).length ? n(1, (u = g)) : n(1, (u = null)),
        n(2, (a = i[_].props)),
        d('routeLoaded', Object.assign({}, j, { component: c, name: c.name, params: u })).then(() => {
          $e.set(u);
        });
      return;
    }
    n(0, (c = null)), (T = null), $e.set(void 0);
  });
  xe(() => {
    qe(), k && window.removeEventListener('popstate', k);
  });
  function Re(m) {
    ge.call(this, t, m);
  }
  function Te(m) {
    ge.call(this, t, m);
  }
  return (
    (t.$$set = (m) => {
      'routes' in m && n(3, (r = m.routes)),
        'prefix' in m && n(4, (s = m.prefix)),
        'restoreScrollState' in m && n(5, (o = m.restoreScrollState));
    }),
    (t.$$.update = () => {
      t.$$.dirty & 32 && (history.scrollRestoration = o ? 'manual' : 'auto');
    }),
    [c, u, a, r, s, o, Re, Te]
  );
}
class ot extends C {
  constructor(e) {
    super(), I(this, e, st, tt, O, { routes: 3, prefix: 4, restoreScrollState: 5 });
  }
}
function lt(t) {
  let e;
  return {
    c() {
      (e = D('h2')), (e.textContent = 'Dashboard');
    },
    m(n, r) {
      L(n, e, r);
    },
    p: N,
    i: N,
    o: N,
    d(n) {
      n && S(e);
    },
  };
}
class ve extends C {
  constructor(e) {
    super(), I(this, e, null, lt, O, {});
  }
}
var ye = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};
function ke(t, e, n) {
  const r = t.slice();
  return (r[9] = e[n][0]), (r[10] = e[n][1]), r;
}
function se(t) {
  let e,
    n = [t[10]],
    r = {};
  for (let s = 0; s < n.length; s += 1) r = w(r, n[s]);
  return {
    c() {
      (e = Se(t[9])), te(e, r);
    },
    m(s, o) {
      L(s, e, o);
    },
    p(s, o) {
      te(e, (r = R(n, [o & 16 && s[10]])));
    },
    d(s) {
      s && S(e);
    },
  };
}
function Ee(t) {
  let e = t[9],
    n,
    r = t[9] && se(t);
  return {
    c() {
      r && r.c(), (n = Q());
    },
    m(s, o) {
      r && r.m(s, o), L(s, n, o);
    },
    p(s, o) {
      s[9]
        ? e
          ? O(e, s[9])
            ? (r.d(1), (r = se(s)), (e = s[9]), r.c(), r.m(n.parentNode, n))
            : r.p(s, o)
          : ((r = se(s)), (e = s[9]), r.c(), r.m(n.parentNode, n))
        : e && (r.d(1), (r = null), (e = s[9]));
    },
    d(s) {
      s && S(n), r && r.d(s);
    },
  };
}
function it(t) {
  let e,
    n,
    r,
    s,
    o = t[4],
    l = [];
  for (let f = 0; f < o.length; f += 1) l[f] = Ee(ke(t, o, f));
  const i = t[8].default,
    c = x(i, t, t[7], null);
  let u = [
      ye,
      t[5],
      { width: t[2] },
      { height: t[2] },
      { stroke: t[1] },
      { 'stroke-width': t[3] },
      { class: (r = `tabler-icon tabler-icon-${t[0]} ${t[6].class ?? ''}`) },
    ],
    a = {};
  for (let f = 0; f < u.length; f += 1) a = w(a, u[f]);
  return {
    c() {
      e = Se('svg');
      for (let f = 0; f < l.length; f += 1) l[f].c();
      (n = Q()), c && c.c(), te(e, a);
    },
    m(f, d) {
      L(f, e, d);
      for (let h = 0; h < l.length; h += 1) l[h] && l[h].m(e, null);
      z(e, n), c && c.m(e, null), (s = !0);
    },
    p(f, [d]) {
      if (d & 16) {
        o = f[4];
        let h;
        for (h = 0; h < o.length; h += 1) {
          const k = ke(f, o, h);
          l[h] ? l[h].p(k, d) : ((l[h] = Ee(k)), l[h].c(), l[h].m(e, n));
        }
        for (; h < l.length; h += 1) l[h].d(1);
        l.length = o.length;
      }
      c && c.p && (!s || d & 128) && H(c, i, f, f[7], s ? G(i, f[7], d, null) : J(f[7]), null),
        te(
          e,
          (a = R(u, [
            ye,
            d & 32 && f[5],
            (!s || d & 4) && { width: f[2] },
            (!s || d & 4) && { height: f[2] },
            (!s || d & 2) && { stroke: f[1] },
            (!s || d & 8) && { 'stroke-width': f[3] },
            (!s || (d & 65 && r !== (r = `tabler-icon tabler-icon-${f[0]} ${f[6].class ?? ''}`))) && { class: r },
          ]))
        );
    },
    i(f) {
      s || (p(c, f), (s = !0));
    },
    o(f) {
      b(c, f), (s = !1);
    },
    d(f) {
      f && S(e), Be(l, f), c && c.d(f);
    },
  };
}
function ct(t, e, n) {
  const r = ['name', 'color', 'size', 'stroke', 'iconNode'];
  let s = me(e, r),
    { $$slots: o = {}, $$scope: l } = e,
    { name: i } = e,
    { color: c = 'currentColor' } = e,
    { size: u = 24 } = e,
    { stroke: a = 2 } = e,
    { iconNode: f } = e;
  return (
    (t.$$set = (d) => {
      n(6, (e = w(w({}, e), M(d)))),
        n(5, (s = me(e, r))),
        'name' in d && n(0, (i = d.name)),
        'color' in d && n(1, (c = d.color)),
        'size' in d && n(2, (u = d.size)),
        'stroke' in d && n(3, (a = d.stroke)),
        'iconNode' in d && n(4, (f = d.iconNode)),
        '$$scope' in d && n(7, (l = d.$$scope));
    }),
    (e = M(e)),
    [i, c, u, a, f, s, e, l, o]
  );
}
class ut extends C {
  constructor(e) {
    super(), I(this, e, ct, it, O, { name: 0, color: 1, size: 2, stroke: 3, iconNode: 4 });
  }
}
const he = ut;
function ft(t) {
  let e;
  const n = t[2].default,
    r = x(n, t, t[3], null);
  return {
    c() {
      r && r.c();
    },
    m(s, o) {
      r && r.m(s, o), (e = !0);
    },
    p(s, o) {
      r && r.p && (!e || o & 8) && H(r, n, s, s[3], e ? G(n, s[3], o, null) : J(s[3]), null);
    },
    i(s) {
      e || (p(r, s), (e = !0));
    },
    o(s) {
      b(r, s), (e = !1);
    },
    d(s) {
      r && r.d(s);
    },
  };
}
function at(t) {
  let e, n;
  const r = [{ name: 'layout-dashboard' }, t[1], { iconNode: t[0] }];
  let s = { $$slots: { default: [ft] }, $$scope: { ctx: t } };
  for (let o = 0; o < r.length; o += 1) s = w(s, r[o]);
  return (
    (e = new he({ props: s })),
    {
      c() {
        E(e.$$.fragment);
      },
      m(o, l) {
        v(e, o, l), (n = !0);
      },
      p(o, [l]) {
        const i = l & 3 ? R(r, [r[0], l & 2 && V(o[1]), l & 1 && { iconNode: o[0] }]) : {};
        l & 8 && (i.$$scope = { dirty: l, ctx: o }), e.$set(i);
      },
      i(o) {
        n || (p(e.$$.fragment, o), (n = !0));
      },
      o(o) {
        b(e.$$.fragment, o), (n = !1);
      },
      d(o) {
        y(e, o);
      },
    }
  );
}
function dt(t, e, n) {
  let { $$slots: r = {}, $$scope: s } = e;
  const o = [
    ['path', { d: 'M4 4h6v8h-6z' }],
    ['path', { d: 'M4 16h6v4h-6z' }],
    ['path', { d: 'M14 12h6v8h-6z' }],
    ['path', { d: 'M14 4h6v4h-6z' }],
  ];
  return (
    (t.$$set = (l) => {
      n(1, (e = w(w({}, e), M(l)))), '$$scope' in l && n(3, (s = l.$$scope));
    }),
    (e = M(e)),
    [o, e, r, s]
  );
}
class ht extends C {
  constructor(e) {
    super(), I(this, e, dt, at, O, {});
  }
}
const _t = ht;
function mt(t) {
  let e;
  const n = t[2].default,
    r = x(n, t, t[3], null);
  return {
    c() {
      r && r.c();
    },
    m(s, o) {
      r && r.m(s, o), (e = !0);
    },
    p(s, o) {
      r && r.p && (!e || o & 8) && H(r, n, s, s[3], e ? G(n, s[3], o, null) : J(s[3]), null);
    },
    i(s) {
      e || (p(r, s), (e = !0));
    },
    o(s) {
      b(r, s), (e = !1);
    },
    d(s) {
      r && r.d(s);
    },
  };
}
function gt(t) {
  let e, n;
  const r = [{ name: 'logout' }, t[1], { iconNode: t[0] }];
  let s = { $$slots: { default: [mt] }, $$scope: { ctx: t } };
  for (let o = 0; o < r.length; o += 1) s = w(s, r[o]);
  return (
    (e = new he({ props: s })),
    {
      c() {
        E(e.$$.fragment);
      },
      m(o, l) {
        v(e, o, l), (n = !0);
      },
      p(o, [l]) {
        const i = l & 3 ? R(r, [r[0], l & 2 && V(o[1]), l & 1 && { iconNode: o[0] }]) : {};
        l & 8 && (i.$$scope = { dirty: l, ctx: o }), e.$set(i);
      },
      i(o) {
        n || (p(e.$$.fragment, o), (n = !0));
      },
      o(o) {
        b(e.$$.fragment, o), (n = !1);
      },
      d(o) {
        y(e, o);
      },
    }
  );
}
function pt(t, e, n) {
  let { $$slots: r = {}, $$scope: s } = e;
  const o = [
    ['path', { d: 'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2' }],
    ['path', { d: 'M7 12h14l-3 -3m0 6l3 -3' }],
  ];
  return (
    (t.$$set = (l) => {
      n(1, (e = w(w({}, e), M(l)))), '$$scope' in l && n(3, (s = l.$$scope));
    }),
    (e = M(e)),
    [o, e, r, s]
  );
}
class bt extends C {
  constructor(e) {
    super(), I(this, e, pt, gt, O, {});
  }
}
const wt = bt;
function $t(t) {
  let e;
  const n = t[2].default,
    r = x(n, t, t[3], null);
  return {
    c() {
      r && r.c();
    },
    m(s, o) {
      r && r.m(s, o), (e = !0);
    },
    p(s, o) {
      r && r.p && (!e || o & 8) && H(r, n, s, s[3], e ? G(n, s[3], o, null) : J(s[3]), null);
    },
    i(s) {
      e || (p(r, s), (e = !0));
    },
    o(s) {
      b(r, s), (e = !1);
    },
    d(s) {
      r && r.d(s);
    },
  };
}
function vt(t) {
  let e, n;
  const r = [{ name: 'source-code' }, t[1], { iconNode: t[0] }];
  let s = { $$slots: { default: [$t] }, $$scope: { ctx: t } };
  for (let o = 0; o < r.length; o += 1) s = w(s, r[o]);
  return (
    (e = new he({ props: s })),
    {
      c() {
        E(e.$$.fragment);
      },
      m(o, l) {
        v(e, o, l), (n = !0);
      },
      p(o, [l]) {
        const i = l & 3 ? R(r, [r[0], l & 2 && V(o[1]), l & 1 && { iconNode: o[0] }]) : {};
        l & 8 && (i.$$scope = { dirty: l, ctx: o }), e.$set(i);
      },
      i(o) {
        n || (p(e.$$.fragment, o), (n = !0));
      },
      o(o) {
        b(e.$$.fragment, o), (n = !1);
      },
      d(o) {
        y(e, o);
      },
    }
  );
}
function yt(t, e, n) {
  let { $$slots: r = {}, $$scope: s } = e;
  const o = [
    ['path', { d: 'M14.5 4h2.5a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-5' }],
    ['path', { d: 'M6 5l-2 2l2 2' }],
    ['path', { d: 'M10 9l2 -2l-2 -2' }],
  ];
  return (
    (t.$$set = (l) => {
      n(1, (e = w(w({}, e), M(l)))), '$$scope' in l && n(3, (s = l.$$scope));
    }),
    (e = M(e)),
    [o, e, r, s]
  );
}
class kt extends C {
  constructor(e) {
    super(), I(this, e, yt, vt, O, {});
  }
}
const Et = kt;
function Nt(t) {
  let e, n, r, s;
  const o = t[2].default,
    l = x(o, t, t[1], null);
  return {
    c() {
      (e = D('button')),
        l && l.c(),
        q(
          e,
          'class',
          'flex flex-col hover:bg-slate-600 w-[50px] h-[50px] justify-center items-center p-3 bg-slate-700 rounded-md'
        );
    },
    m(i, c) {
      L(i, e, c), l && l.m(e, null), (n = !0), r || ((s = Fe(e, 'click', t[3])), (r = !0));
    },
    p(i, [c]) {
      l && l.p && (!n || c & 2) && H(l, o, i, i[1], n ? G(o, i[1], c, null) : J(i[1]), null);
    },
    i(i) {
      n || (p(l, i), (n = !0));
    },
    o(i) {
      b(l, i), (n = !1);
    },
    d(i) {
      i && S(e), l && l.d(i), (r = !1), s();
    },
  };
}
function jt(t, e, n) {
  let { $$slots: r = {}, $$scope: s } = e,
    { link: o } = e;
  const l = () => nt(o);
  return (
    (t.$$set = (i) => {
      'link' in i && n(0, (o = i.link)), '$$scope' in i && n(1, (s = i.$$scope));
    }),
    [o, s, r, l]
  );
}
class Ne extends C {
  constructor(e) {
    super(), I(this, e, jt, Nt, O, { link: 0 });
  }
}
function Ot(t) {
  let e, n;
  return (
    (e = new _t({})),
    {
      c() {
        E(e.$$.fragment);
      },
      m(r, s) {
        v(e, r, s), (n = !0);
      },
      i(r) {
        n || (p(e.$$.fragment, r), (n = !0));
      },
      o(r) {
        b(e.$$.fragment, r), (n = !1);
      },
      d(r) {
        y(e, r);
      },
    }
  );
}
function St(t) {
  let e, n;
  return (
    (e = new Et({})),
    {
      c() {
        E(e.$$.fragment);
      },
      m(r, s) {
        v(e, r, s), (n = !0);
      },
      i(r) {
        n || (p(e.$$.fragment, r), (n = !0));
      },
      o(r) {
        b(e.$$.fragment, r), (n = !1);
      },
      d(r) {
        y(e, r);
      },
    }
  );
}
function Lt(t) {
  let e, n, r, s, o, l, i, c, u;
  return (
    (r = new Ne({ props: { link: '/', $$slots: { default: [Ot] }, $$scope: { ctx: t } } })),
    (o = new Ne({ props: { link: '/resources', $$slots: { default: [St] }, $$scope: { ctx: t } } })),
    (c = new wt({})),
    {
      c() {
        (e = D('div')),
          (n = D('div')),
          E(r.$$.fragment),
          (s = oe()),
          E(o.$$.fragment),
          (l = oe()),
          (i = D('div')),
          E(c.$$.fragment),
          q(n, 'class', 'flex flex-col gap-2'),
          q(
            i,
            'class',
            'bg-red-500 bg-opacity-30 text-red-500 hover:bg-opacity-40 rounded-md w-[50px] h-[50px] flex justify-center items-center'
          ),
          q(
            e,
            'class',
            'bg-slate-800 w-[80px] h-full rounded-tl-md rounded-bl-md p-4 flex flex-col justify-between items-center'
          );
      },
      m(a, f) {
        L(a, e, f), z(e, n), v(r, n, null), z(n, s), v(o, n, null), z(e, l), z(e, i), v(c, i, null), (u = !0);
      },
      p(a, [f]) {
        const d = {};
        f & 1 && (d.$$scope = { dirty: f, ctx: a }), r.$set(d);
        const h = {};
        f & 1 && (h.$$scope = { dirty: f, ctx: a }), o.$set(h);
      },
      i(a) {
        u || (p(r.$$.fragment, a), p(o.$$.fragment, a), p(c.$$.fragment, a), (u = !0));
      },
      o(a) {
        b(r.$$.fragment, a), b(o.$$.fragment, a), b(c.$$.fragment, a), (u = !1);
      },
      d(a) {
        a && S(e), y(r), y(o), y(c);
      },
    }
  );
}
class It extends C {
  constructor(e) {
    super(), I(this, e, null, Lt, O, {});
  }
}
function Ct(t) {
  let e, n, r, s, o, l;
  return (
    (r = new It({})),
    (o = new ot({ props: { routes: t[0] } })),
    {
      c() {
        (e = D('main')),
          (n = D('div')),
          E(r.$$.fragment),
          (s = oe()),
          E(o.$$.fragment),
          q(n, 'class', 'bg-slate-900 text-white w-[1200px] h-[650px] rounded-md'),
          q(e, 'class', 'w-full h-full flex justify-center items-center font-main');
      },
      m(i, c) {
        L(i, e, c), z(e, n), v(r, n, null), z(n, s), v(o, n, null), (l = !0);
      },
      p: N,
      i(i) {
        l || (p(r.$$.fragment, i), p(o.$$.fragment, i), (l = !0));
      },
      o(i) {
        b(r.$$.fragment, i), b(o.$$.fragment, i), (l = !1);
      },
      d(i) {
        i && S(e), y(r), y(o);
      },
    }
  );
}
function At(t) {
  return [{ '/': ve, '*': ve }];
}
class Mt extends C {
  constructor(e) {
    super(), I(this, e, At, Ct, O, {});
  }
}
new Mt({ target: document.getElementById('app') });
