import { useEffect, useRef } from 'react'

// ── Water grid — the hero background ──────────────────────────────────────
// A dense lattice of white points sitting still until the cursor stirs them.
// Underneath is a real fluid solver (Jos Stam "stable fluids": semi-Lagrangian
// advection + pressure projection + vorticity confinement), so cursor strokes
// inject momentum, slow drags make laminar ripples, and fast swipes shed real
// vortexes. The points are passive tracers springing back to their lattice
// homes. Brightness follows SPEED — still water is barely-there, fast water
// burns white.

const ITER = 12          // Gauss-Seidel pressure iterations
const CELL = 16          // px per fluid cell
const SPACING = 13       // px between tracer points
const VORT = 4.2         // vorticity confinement strength
const FORCE = 26         // cursor force multiplier (gentle — water, not explosion)
const SAMPLE_SCALE = 9   // field velocity → px/frame for tracers
const DECAY = 0.9985     // per-frame dissipation — ripples linger and travel

export default function WaterField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0

    // fluid grid
    let NX = 0, NY = 0
    let u: Float32Array, v: Float32Array, u0: Float32Array, v0: Float32Array
    let p: Float32Array, div: Float32Array, curl: Float32Array
    const idx = (i: number, j: number) => i + j * NX

    // tracer points
    type Pt = { x: number; y: number; hx: number; hy: number; vx: number; vy: number }
    let pts: Pt[] = []

    function alloc() {
      w = canvas!.clientWidth; h = canvas!.clientHeight
      canvas!.width = Math.floor(w * dpr); canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      NX = Math.max(24, Math.round(w / CELL))
      NY = Math.max(16, Math.round(h / CELL))
      const n = NX * NY
      u = new Float32Array(n); v = new Float32Array(n)
      u0 = new Float32Array(n); v0 = new Float32Array(n)
      p = new Float32Array(n); div = new Float32Array(n); curl = new Float32Array(n)

      pts = []
      for (let y = SPACING / 2; y < h; y += SPACING)
        for (let x = SPACING / 2; x < w; x += SPACING)
          pts.push({ x, y, hx: x, hy: y, vx: 0, vy: 0 })
    }
    alloc()
    window.addEventListener('resize', alloc)

    // bilinear sample of the velocity field at a px position
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

    function advect() {
      u0.set(u); v0.set(v)
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        // backtrace in cell units
        let x = i - u0[idx(i, j)], y = j - v0[idx(i, j)]
        x = Math.min(Math.max(x, 0.5), NX - 1.5); y = Math.min(Math.max(y, 0.5), NY - 1.5)
        const i0 = Math.floor(x), j0 = Math.floor(y)
        const fx = x - i0, fy = y - j0
        u[idx(i, j)] = u0[idx(i0, j0)] * (1 - fx) * (1 - fy) + u0[idx(i0 + 1, j0)] * fx * (1 - fy) +
                       u0[idx(i0, j0 + 1)] * (1 - fx) * fy + u0[idx(i0 + 1, j0 + 1)] * fx * fy
        v[idx(i, j)] = v0[idx(i0, j0)] * (1 - fx) * (1 - fy) + v0[idx(i0 + 1, j0)] * fx * (1 - fy) +
                       v0[idx(i0, j0 + 1)] * (1 - fx) * fy + v0[idx(i0 + 1, j0 + 1)] * fx * fy
      }
    }

    // vorticity confinement — re-inject the swirl that numerics dissipate,
    // this is what makes fast strokes shed visible vortexes
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

    // cursor forcing
    let mx = -1e4, my = -1e4, pmx = -1e4, pmy = -1e4
    let stirred = false
    function onMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top
      if (pmx < -1e3) { pmx = mx; pmy = my; return }
      stirred = true
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    function addForces() {
      if (mx < -1e3) return
      const dx = mx - pmx, dy = my - pmy
      pmx = mx; pmy = my
      const mag = Math.hypot(dx, dy)
      if (mag < 0.5) return
      const R = 4.5 // splat radius in cells
      const ci = mx / CELL, cj = my / CELL
      const i0 = Math.max(1, Math.floor(ci - R)), i1 = Math.min(NX - 2, Math.ceil(ci + R))
      const j0 = Math.max(1, Math.floor(cj - R)), j1 = Math.min(NY - 2, Math.ceil(cj + R))
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d2 = (i - ci) * (i - ci) + (j - cj) * (j - cj)
        const g = Math.exp(-d2 / (R * 1.6))
        u[idx(i, j)] += (dx / CELL) * g * FORCE * 0.016
        v[idx(i, j)] += (dy / CELL) * g * FORCE * 0.016
      }
    }

    function frame() {
      if (stirred && !reduced) {
        addForces()
        vorticity()
        project()
        advect()
        project()
        // gentle global dissipation — water calms back down, slowly
        for (let n = 0; n < u.length; n++) { u[n] *= DECAY; v[n] *= DECAY }
      }

      ctx!.clearRect(0, 0, w, h)
      ctx!.globalCompositeOperation = 'lighter'
      ctx!.fillStyle = '#ffffff'
      for (const pt of pts) {
        const fu = sample(pt.x, pt.y, u) * SAMPLE_SCALE
        const fv = sample(pt.x, pt.y, v) * SAMPLE_SCALE
        pt.vx = pt.vx * 0.86 + fu * 0.42 + (pt.hx - pt.x) * 0.012
        pt.vy = pt.vy * 0.86 + fv * 0.42 + (pt.hy - pt.y) * 0.012
        pt.x += pt.vx; pt.y += pt.vy

        // brightness = SPEED, with real dynamic range: still water is a
        // whisper, slow drift stays dim, only genuinely fast water burns
        const spd = Math.hypot(pt.vx, pt.vy)
        const a = Math.min(0.95, 0.04 + Math.pow(spd * 0.5, 2.6) * 0.32)
        ctx!.globalAlpha = a
        const s = 1.2 + Math.min(1.1, spd * spd * 0.05)
        ctx!.fillRect(pt.x - s / 2, pt.y - s / 2, s, s)
      }
      ctx!.globalAlpha = 1
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
