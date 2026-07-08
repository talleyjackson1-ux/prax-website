import { useEffect, useRef } from 'react'

// ── Water lattice — the site-wide background ──────────────────────────────
// Ported from the PRAX app's welcome gate. A dense grid of points riding a
// REAL fluid solver (Jos Stam "stable fluids": semi-Lagrangian advection +
// pressure projection) with MacCormack second-order advection (vortices stay
// sharp instead of smearing away), stronger incompressibility, and vorticity
// confinement. Ambient "stirrers" wander the field so the water is alive
// before you touch it; the cursor injects momentum like a hand dragged
// through a pool.
// COLOR IS SPEED, blue only: deep navy at rest → electric blue in the
// currents → bright ice-blue where the water is genuinely fast. Brightness
// and dot size ride speed too.

const CELL = 14          // px per fluid cell
const SPACING = 8.5      // px between lattice points
const ITER = 20          // Gauss-Seidel pressure iterations
const VORT = 1.6         // vorticity confinement — low: calm water, not churn
const VISC = 0.14        // viscosity blend per frame — smooths flow laminar
const FORCE = 10         // cursor force multiplier (a hand in a pool, not a jet)
const SAMPLE_SCALE = 4   // field velocity → px/frame for lattice points
const DECAY = 0.998      // per-frame dissipation — gentle currents persist
const DRAG = 0.15        // quadratic drag — FAST water sheds energy quickly,
                         // so cursor wakes fall back through ice→electric→navy
const UMAX = 0.8         // field speed cap (cells/frame) — physics can't blow out
const STIRRERS = 4       // ambient current generators
const LUT_N = 96         // speed→color lookup resolution
const SPD_MAX = 2.2      // px/frame for the brightest blue — only genuinely fast water

// speed→color ramp, four stops so all bands coexist on screen — ALL BLUE:
// still = deep dim navy · slow = the blue BRIGHTENS · mid = electric blue ·
// high = bright ice-blue
const STOPS: [number, number, number][] = [
  [12, 26, 92],    // deep dim navy — the resting lattice
  [36, 84, 210],   // royal blue — slow drift
  [64, 140, 255],  // electric blue — mid currents
  [150, 205, 255], // bright ice-blue — fast water
]

function buildLut(): string[] {
  const lut: string[] = []
  const NSEG = STOPS.length - 1
  for (let k = 0; k < LUT_N; k++) {
    const t = k / (LUT_N - 1)
    const seg = Math.min(NSEG - 1, Math.floor(t * NSEG))
    const f = t * NSEG - seg
    const [r0, g0, b0] = STOPS[seg], [r1, g1, b1] = STOPS[seg + 1]
    const r = Math.round(r0 + (r1 - r0) * f)
    const g = Math.round(g0 + (g1 - g0) * f)
    const b = Math.round(b0 + (b1 - b0) * f)
    // alpha near-flat: the lattice is always present; hue does the talking
    const a = 0.7 + 0.25 * t
    lut.push(`rgba(${r},${g},${b},${a.toFixed(3)})`)
  }
  return lut
}

export default function WaterField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const LUT = buildLut()
    let w = 0, h = 0, raf = 0, t = 0

    // fluid grid
    let NX = 0, NY = 0
    let u: Float32Array, v: Float32Array
    let u0: Float32Array, v0: Float32Array        // pre-advection copy
    let ub: Float32Array, vb: Float32Array        // back-traced (MacCormack error term)
    let p: Float32Array, div: Float32Array, curl: Float32Array
    const idx = (i: number, j: number) => i + j * NX

    // lattice points
    type Pt = { x: number; y: number; hx: number; hy: number; vx: number; vy: number }
    let pts: Pt[] = []

    function alloc() {
      w = canvas!.clientWidth; h = canvas!.clientHeight
      canvas!.width = Math.max(1, Math.floor(w * dpr))
      canvas!.height = Math.max(1, Math.floor(h * dpr))
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      NX = Math.max(24, Math.round(w / CELL))
      NY = Math.max(16, Math.round(h / CELL))
      const n = NX * NY
      u = new Float32Array(n); v = new Float32Array(n)
      u0 = new Float32Array(n); v0 = new Float32Array(n)
      ub = new Float32Array(n); vb = new Float32Array(n)
      p = new Float32Array(n); div = new Float32Array(n); curl = new Float32Array(n)

      pts = []
      for (let y = SPACING / 2; y < h; y += SPACING)
        for (let x = SPACING / 2; x < w; x += SPACING)
          pts.push({ x, y, hx: x, hy: y, vx: 0, vy: 0 })
    }
    alloc()
    window.addEventListener('resize', alloc)

    // bilinear sample of a field at a px position
    function sample(x: number, y: number, f: Float32Array): number {
      const gx = Math.min(Math.max(x / CELL - 0.5, 0), NX - 1.001)
      const gy = Math.min(Math.max(y / CELL - 0.5, 0), NY - 1.001)
      const i = Math.floor(gx), j = Math.floor(gy)
      const fx = gx - i, fy = gy - j
      const i1 = Math.min(i + 1, NX - 1), j1 = Math.min(j + 1, NY - 1)
      return f[idx(i, j)] * (1 - fx) * (1 - fy) + f[idx(i1, j)] * fx * (1 - fy) +
             f[idx(i, j1)] * (1 - fx) * fy + f[idx(i1, j1)] * fx * fy
    }

    function project() {
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        div[idx(i, j)] = -0.5 * (u[idx(i + 1, j)] - u[idx(i - 1, j)] + v[idx(i, j + 1)] - v[idx(i, j - 1)])
        p[idx(i, j)] = 0
      }
      for (let k = 0; k < ITER; k++)
        for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++)
          p[idx(i, j)] = (div[idx(i, j)] + p[idx(i - 1, j)] + p[idx(i + 1, j)] + p[idx(i, j - 1)] + p[idx(i, j + 1)]) / 4
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        u[idx(i, j)] -= 0.5 * (p[idx(i + 1, j)] - p[idx(i - 1, j)])
        v[idx(i, j)] -= 0.5 * (p[idx(i, j + 1)] - p[idx(i, j - 1)])
      }
    }

    // semi-Lagrangian advection of (srcU,srcV) by (velU,velV) into (dstU,dstV);
    // dir=-1 backtraces (standard), dir=+1 traces forward (MacCormack pass)
    function advectInto(
      dstU: Float32Array, dstV: Float32Array,
      srcU: Float32Array, srcV: Float32Array,
      velU: Float32Array, velV: Float32Array, dir: number,
    ) {
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        let x = i + dir * velU[idx(i, j)], y = j + dir * velV[idx(i, j)]
        x = Math.min(Math.max(x, 0.5), NX - 1.5); y = Math.min(Math.max(y, 0.5), NY - 1.5)
        const i0 = Math.floor(x), j0 = Math.floor(y)
        const fx = x - i0, fy = y - j0
        const a = idx(i0, j0), b = idx(i0 + 1, j0), c = idx(i0, j0 + 1), d = idx(i0 + 1, j0 + 1)
        dstU[idx(i, j)] = srcU[a] * (1 - fx) * (1 - fy) + srcU[b] * fx * (1 - fy) + srcU[c] * (1 - fx) * fy + srcU[d] * fx * fy
        dstV[idx(i, j)] = srcV[a] * (1 - fx) * (1 - fy) + srcV[b] * fx * (1 - fy) + srcV[c] * (1 - fx) * fy + srcV[d] * fx * fy
      }
    }

    // MacCormack: advect forward, trace back, use the round-trip error to
    // cancel numerical smearing — second-order accuracy, sharp long-lived
    // vortices. Clamped to the neighborhood min/max so the correction can't
    // overshoot.
    function advect() {
      u0.set(u); v0.set(v)
      advectInto(u, v, u0, v0, u0, v0, -1)      // u,v = phi1 (standard advect)
      advectInto(ub, vb, u, v, u0, v0, +1)      // ub,vb = phi1 traced back forward
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        const k = idx(i, j)
        let nu = u[k] + 0.5 * (u0[k] - ub[k])
        let nv = v[k] + 0.5 * (v0[k] - vb[k])
        // limiter: clamp to the values around the backtrace point
        let x = i - u0[k], y = j - v0[k]
        x = Math.min(Math.max(x, 0.5), NX - 1.5); y = Math.min(Math.max(y, 0.5), NY - 1.5)
        const i0 = Math.floor(x), j0 = Math.floor(y)
        const a = idx(i0, j0), b = idx(i0 + 1, j0), c = idx(i0, j0 + 1), d = idx(i0 + 1, j0 + 1)
        const loU = Math.min(u0[a], u0[b], u0[c], u0[d]), hiU = Math.max(u0[a], u0[b], u0[c], u0[d])
        const loV = Math.min(v0[a], v0[b], v0[c], v0[d]), hiV = Math.max(v0[a], v0[b], v0[c], v0[d])
        u[k] = nu < loU ? loU : nu > hiU ? hiU : nu
        v[k] = nv < loV ? loV : nv > hiV ? hiV : nv
      }
    }

    function vorticity() {
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++)
        curl[idx(i, j)] = 0.5 * (v[idx(i + 1, j)] - v[idx(i - 1, j)] - u[idx(i, j + 1)] + u[idx(i, j - 1)])
      for (let j = 2; j < NY - 2; j++) for (let i = 2; i < NX - 2; i++) {
        let dx = Math.abs(curl[idx(i + 1, j)]) - Math.abs(curl[idx(i - 1, j)])
        let dy = Math.abs(curl[idx(i, j + 1)]) - Math.abs(curl[idx(i, j - 1)])
        const len = Math.hypot(dx, dy) + 1e-5
        dx /= len; dy /= len
        const c = curl[idx(i, j)] * VORT * 0.016
        u[idx(i, j)] += dy * c
        v[idx(i, j)] += -dx * c
      }
    }

    // light viscous diffusion — real water damps shear, so neighboring cells
    // drag each other along; this is what makes motion read as LIQUID (smooth
    // laminar drift, broad swells) instead of gassy turbulence
    function diffuse() {
      u0.set(u); v0.set(v)
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        const k = idx(i, j)
        const au = (u0[k - 1] + u0[k + 1] + u0[k - NX] + u0[k + NX]) * 0.25
        const av = (v0[k - 1] + v0[k + 1] + v0[k - NX] + v0[k + NX]) * 0.25
        u[k] += (au - u0[k]) * VISC
        v[k] += (av - v0[k]) * VISC
      }
    }

    // gaussian momentum splat in cell space
    function splat(cx: number, cy: number, fx: number, fy: number, R: number) {
      const i0 = Math.max(1, Math.floor(cx - R)), i1 = Math.min(NX - 2, Math.ceil(cx + R))
      const j0 = Math.max(1, Math.floor(cy - R)), j1 = Math.min(NY - 2, Math.ceil(cy + R))
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d2 = (i - cx) * (i - cx) + (j - cy) * (j - cy)
        const g = Math.exp(-d2 / (R * 1.6))
        u[idx(i, j)] += fx * g
        v[idx(i, j)] += fy * g
      }
    }

    // ambient stirrers — slow underwater currents wandering on layered sines,
    // each dragging momentum along its own heading so the water never sits dead
    const stir = Array.from({ length: STIRRERS }, (_, k) => ({
      ph: k * 2.1 + 0.7,           // phase offset per stirrer
      sp: 0.045 + k * 0.016,       // wander speed — slow, tidal
    }))
    function ambient() {
      for (const s of stir) {
        const a = t * s.sp + s.ph
        const x = (0.5 + 0.38 * Math.sin(a) * Math.cos(a * 0.63 + s.ph)) * NX
        const y = (0.5 + 0.36 * Math.sin(a * 0.81 + s.ph * 2)) * NY
        const dirx = Math.cos(a * 1.7), diry = Math.sin(a * 1.3 + s.ph)
        // broad + steady: deep currents that keep the whole field breathing,
        // so there's always visible navy↔royal↔ice variation across it
        splat(x, y, dirx * 0.017, diry * 0.017, 11)
      }
    }

    // cursor forcing
    let mx = -1e4, my = -1e4, pmx = -1e4, pmy = -1e4
    function onMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top
      if (pmx < -1e3) { pmx = mx; pmy = my }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    function addCursor() {
      if (mx < -1e3) return
      const dx = mx - pmx, dy = my - pmy
      pmx = mx; pmy = my
      if (Math.hypot(dx, dy) < 0.5) return
      splat(mx / CELL, my / CELL, (dx / CELL) * FORCE * 0.016, (dy / CELL) * FORCE * 0.016, 4.5)
    }

    function frame() {
      t += 0.016
      if (!reduced) {
        ambient()
        addCursor()
        vorticity()
        diffuse()
        project()
        advect()
        project()
        for (let n = 0; n < u.length; n++) {
          const sp = Math.hypot(u[n], v[n])
          let d = DECAY / (1 + DRAG * sp)
          if (sp > UMAX) d *= UMAX / sp
          u[n] *= d; v[n] *= d
        }
      }

      ctx!.clearRect(0, 0, w, h)
      ctx!.globalCompositeOperation = 'lighter'
      let bucket = -1
      for (const pt of pts) {
        const fu = sample(pt.x, pt.y, u) * SAMPLE_SCALE
        const fv = sample(pt.x, pt.y, v) * SAMPLE_SCALE
        pt.vx = pt.vx * 0.9 + fu * 0.3 + (pt.hx - pt.x) * 0.012
        pt.vy = pt.vy * 0.9 + fv * 0.3 + (pt.hy - pt.y) * 0.012
        pt.x += pt.vx; pt.y += pt.vy

        // color = speed, bands anchored to MEASURED tracer speeds (headless
        // sim percentiles): ambient bulk ~0.02 → navy, currents ~0.2 → royal,
        // swells ~0.7 → electric, cursor wakes 1.5+ → bright ice-blue.
        const spd = Math.hypot(pt.vx, pt.vy)
        const nt = Math.min(1, Math.pow(spd / SPD_MAX, 0.45))
        const bk = Math.min(LUT_N - 1, (nt * (LUT_N - 1)) | 0)
        if (bk !== bucket) { ctx!.fillStyle = LUT[bucket = bk] }
        const s = 0.75 + Math.min(0.7, spd * spd * 0.05)
        ctx!.fillRect(pt.x - s / 2, pt.y - s / 2, s, s)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', alloc)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
