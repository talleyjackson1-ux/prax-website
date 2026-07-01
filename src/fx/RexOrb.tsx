import { useEffect, useRef } from 'react'

// ── REX — the guide. ───────────────────────────────────────────────────────
// A direct port of the PRAX RexOrb (portal/src/jarvis/RexOrb.tsx):
//  · Marble center mass — blue stone, drifting darker blotches, accent
//    fresnel rim, key light upper-left.
//  · OrbitField — 620 fine WHITE particles in 10 formation rings that HUG the
//    orb (r = 1.2 + (k%3)*0.04, surface = 1.0). Ring plane normals are spread
//    on a Fibonacci sphere; every particle on a ring shares one angular speed
//    (ω = 0.3·1.2/r) and is evenly spaced — gyroscope/atom look, never a swarm.
//
// Movement is deliberate and stays OUT of the text: each section declares
// data-rex="left|right" and REX parks beside that section's heading. When the
// next anchor is on the opposite side he never crosses the copy — he exits
// off one edge of the screen and glides back in from the other.

const ACCENT: [number, number, number] = [59, 115, 247]
const HI: [number, number, number] = [143, 176, 255]
const N = 620

// ── exact OrbitField setup (ported from the portal) ──
type Field = { u: Float32Array; v: Float32Array; rad: Float32Array; spd: Float32Array; phase: Float32Array }
function buildOrbitField(num: number): Field {
  const u = new Float32Array(num * 3), v = new Float32Array(num * 3)
  const rad = new Float32Array(num), spd = new Float32Array(num), phase = new Float32Array(num)
  const RINGS = Math.min(10, Math.max(4, Math.round(num / 62)))
  const perRing = Math.floor(num / RINGS)
  let i = 0
  for (let k = 0; k < RINGS; k++) {
    // evenly-spread ring orientations (Fibonacci sphere of plane normals)
    const yk = 1 - ((k + 0.5) / RINGS) * 2
    const rk = Math.sqrt(Math.max(1 - yk * yk, 0))
    const az = k * 2.399963229
    let nx = Math.cos(az) * rk, ny = yk, nz = Math.sin(az) * rk
    const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl
    let rx = 0, ry = 1, rz = 0
    if (Math.abs(ny) > 0.92) { rx = 1; ry = 0; rz = 0 }
    // uu = n × ref, vv = n × uu
    let ux = ny * rz - nz * ry, uy = nz * rx - nx * rz, uz = nx * ry - ny * rx
    const ul = Math.hypot(ux, uy, uz); ux /= ul; uy /= ul; uz /= ul
    let vx = ny * uz - nz * uy, vy = nz * ux - nx * uz, vz = nx * uy - ny * ux
    const vl = Math.hypot(vx, vy, vz); vx /= vl; vy /= vl; vz /= vl
    const r = 1.2 + (k % 3) * 0.04            // hug the orb (surface ≈ 1.0)
    const omega = 0.3 * (1.2 / r)             // shared per ring → formation
    const count = (k === RINGS - 1) ? (num - i) : perRing
    for (let j = 0; j < count; j++, i++) {
      rad[i] = r; spd[i] = omega; phase[i] = (j / count) * Math.PI * 2
      u[i * 3] = ux; u[i * 3 + 1] = uy; u[i * 3 + 2] = uz
      v[i * 3] = vx; v[i * 3 + 1] = vy; v[i * 3 + 2] = vz
    }
  }
  return { u, v, rad, spd, phase }
}

// surface blotches — darker stone patches that rotate with the planet
const BLOTCHES = Array.from({ length: 16 }, (_, k) => {
  const r1 = Math.sin(k * 127.1) * 43758.5453, r2 = Math.sin(k * 311.7) * 12543.21
  const a = (r1 - Math.floor(r1)) * Math.PI * 2
  const y = ((r2 - Math.floor(r2)) - 0.5) * 1.7
  const rr = Math.sqrt(Math.max(1 - y * y * 0.8, 0.05))
  return {
    x: Math.cos(a) * rr, y: y * 0.9, z: Math.sin(a) * rr,
    size: 0.22 + ((k * 73) % 10) * 0.03,
    dark: 0.10 + ((k * 41) % 10) * 0.014,
  }
})

type Anchor = { section: HTMLElement; el: HTMLElement; side: string }

export default function RexOrb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, t = 0

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = Math.floor(w * dpr); canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let anchors: Anchor[] = []
    function collect() {
      anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-rex]')).map(section => ({
        section,
        el: section.querySelector<HTMLElement>('[data-rex-el]') || section.querySelector<HTMLElement>('h2') || section,
        side: section.dataset.rex || 'right',
      }))
    }
    collect()
    const settle = window.setTimeout(collect, 600)
    window.addEventListener('load', collect)

    const orbR = () => Math.max(30, Math.min(48, Math.min(w, h) * 0.044))

    function anchorPoint(): { x: number; y: number; i: number; side: string } {
      if (anchors.length === 0) return { x: w * 0.75, y: h * 0.55, i: 0, side: 'right' }
      let best = 0, bestD = Infinity
      for (let i = 0; i < anchors.length; i++) {
        const r = anchors[i].section.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - h * 0.5)
        if (d < bestD) { bestD = d; best = i }
      }
      const a = anchors[best]
      const r = a.el.getBoundingClientRect()
      const margin = orbR() * 1.7
      const x = a.side === 'left'
        ? Math.max(r.left - 120, margin)
        : Math.min(r.right + 120, w - margin)
      // keep REX below the fixed nav and above the fold edge
      const y = Math.min(Math.max(r.top + r.height / 2, Math.max(margin, 150)), h - margin)
      return { x, y, i: best, side: a.side }
    }

    const field = buildOrbitField(N)

    const first = anchorPoint()
    let px = first.x, py = first.y, vx = 0, vy = 0
    let traveling = false
    let wrapping: null | { dir: 1 | -1 } = null // dir = edge REX exits through (-1 left, +1 right)
    let pulse = 0
    let lit = -1
    const trail: { x: number; y: number }[] = []

    function setLit(i: number) {
      if (i === lit) return
      anchors.forEach((a, k) => a.section.classList.toggle('rex-lit', k === i))
      lit = i
    }
    setLit(first.i)

    function frame() {
      t += 0.016
      ctx!.clearRect(0, 0, w, h)

      const R = orbR()
      const tgt = anchorPoint()
      const bobX = Math.sin(t * 0.8) * 5
      const bobY = Math.cos(t * 1.25) * 7

      // ── wrap-around routing: never cross the copy ──
      const curSide = px < w / 2 ? 'left' : 'right'
      const offEdge = R * 2.6
      if (!wrapping && tgt.side !== curSide && Math.abs(tgt.x - px) > w * 0.3) {
        wrapping = { dir: curSide === 'left' ? -1 : 1 } // exit through the near edge
      }

      let seekX = tgt.x + bobX, seekY = tgt.y + bobY
      if (wrapping) {
        seekX = wrapping.dir === -1 ? -offEdge : w + offEdge
        seekY = py + (tgt.y - py) * 0.4 // drift toward arrival altitude on the way out
        if ((wrapping.dir === -1 && px < -offEdge + 4) || (wrapping.dir === 1 && px > w + offEdge - 4)) {
          // fully offscreen → re-enter from the OTHER edge at arrival altitude
          px = wrapping.dir === -1 ? w + offEdge : -offEdge
          py = tgt.y
          vx = 0; vy = 0
          trail.length = 0
          wrapping = null
        }
      }

      if (reduced) {
        px = tgt.x; py = tgt.y
        setLit(tgt.i)
      } else {
        vx += (seekX - px) * 0.011
        vy += (seekY - py) * 0.011
        vx *= 0.9; vy *= 0.9
        px += vx; py += vy
      }

      const dist = Math.hypot(tgt.x - px, tgt.y - py)
      if (dist > 160) traveling = true
      if (traveling && !wrapping && dist < 34) {
        traveling = false
        pulse = 1
        setLit(tgt.i)
      }

      const speed = Math.hypot(vx, vy)
      const moving = Math.min(1, speed / 13)

      // ── comet trail while traveling ──
      ctx!.globalCompositeOperation = 'lighter'
      if (!reduced) {
        trail.push({ x: px, y: py })
        if (trail.length > 28) trail.shift()
        for (let i = 0; i < trail.length; i++) {
          const f = i / trail.length
          const alpha = f * f * 0.12 * moving
          if (alpha < 0.004) continue
          const rad = R * 0.7 * f
          const g = ctx!.createRadialGradient(trail[i].x, trail[i].y, 0, trail[i].x, trail[i].y, rad)
          g.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`)
          g.addColorStop(1, 'rgba(59,115,247,0)')
          ctx!.fillStyle = g
          ctx!.beginPath(); ctx!.arc(trail[i].x, trail[i].y, rad, 0, Math.PI * 2); ctx!.fill()
        }
      }

      // ── soft accent halo ──
      const breathe = 1 + Math.sin(t * 2.0) * 0.045 * (1 - moving)
      const halo = ctx!.createRadialGradient(px, py, 0, px, py, R * 2.3 * breathe)
      halo.addColorStop(0, 'rgba(59,115,247,0.17)')
      halo.addColorStop(0.55, 'rgba(59,115,247,0.05)')
      halo.addColorStop(1, 'rgba(59,115,247,0)')
      ctx!.fillStyle = halo
      ctx!.beginPath(); ctx!.arc(px, py, R * 2.3 * breathe, 0, Math.PI * 2); ctx!.fill()

      // ── arrival pulse ring ──
      if (pulse > 0) {
        const pr = R * (1.35 + (1 - pulse) * 2.2)
        ctx!.strokeStyle = `rgba(${HI[0]},${HI[1]},${HI[2]},${pulse * 0.55})`
        ctx!.lineWidth = 1.5
        ctx!.beginPath(); ctx!.arc(px, py, pr, 0, Math.PI * 2); ctx!.stroke()
        pulse -= 0.022
      }

      // ── OrbitField: advance formation, split behind/front ──
      const dtSpin = 0.016 * (1 + moving * 1.6)
      type P3 = { sx: number; sy: number; z: number }
      const behind: P3[] = [], front: P3[] = []
      for (let i = 0; i < N; i++) {
        field.phase[i] += field.spd[i] * dtSpin
        const c = Math.cos(field.phase[i]), s = Math.sin(field.phase[i])
        const ix = i * 3, r = field.rad[i] * R
        const x = (field.u[ix] * c + field.v[ix] * s) * r
        const y = (field.u[ix + 1] * c + field.v[ix + 1] * s) * r
        const z = (field.u[ix + 2] * c + field.v[ix + 2] * s) * r
        const p: P3 = { sx: px + x, sy: py + y, z }
        ;(z < 0 ? behind : front).push(p)
      }
      const drawPts = (list: P3[]) => {
        for (const p of list) {
          const depth = (p.z / (1.3 * R) + 1) / 2 // 0 back → 1 front
          ctx!.fillStyle = `rgba(255,255,255,${0.12 + depth * 0.5})`
          const s = 0.8 + depth * 0.9
          ctx!.fillRect(p.sx - s / 2, p.sy - s / 2, s, s)
        }
      }
      ctx!.globalCompositeOperation = 'lighter'
      drawPts(behind)

      // ── the marble: blue stone planet ──
      ctx!.globalCompositeOperation = 'source-over'
      const sph = ctx!.createRadialGradient(px - R * 0.36, py - R * 0.4, R * 0.08, px, py, R)
      sph.addColorStop(0, '#aebcdd')
      sph.addColorStop(0.4, '#5b6d9e')
      sph.addColorStop(0.78, '#2e3a61')
      sph.addColorStop(1, '#1b2340')
      ctx!.fillStyle = sph
      ctx!.beginPath(); ctx!.arc(px, py, R, 0, Math.PI * 2); ctx!.fill()

      // rotating surface blotches (the fbm stone texture, in spirit)
      ctx!.save()
      ctx!.beginPath(); ctx!.arc(px, py, R * 0.985, 0, Math.PI * 2); ctx!.clip()
      const rot = t * 0.09
      const cR = Math.cos(rot), sR = Math.sin(rot)
      for (const b of BLOTCHES) {
        const bx = b.x * cR + b.z * sR
        const bz = -b.x * sR + b.z * cR
        if (bz < 0.05) continue // back side of the planet
        const gx = px + bx * R * 0.82, gy = py + b.y * R * 0.82
        const gr = b.size * R * (0.7 + bz * 0.5)
        const g = ctx!.createRadialGradient(gx, gy, 0, gx, gy, gr)
        g.addColorStop(0, `rgba(13,18,38,${b.dark * bz})`)
        g.addColorStop(1, 'rgba(13,18,38,0)')
        ctx!.fillStyle = g
        ctx!.beginPath(); ctx!.arc(gx, gy, gr, 0, Math.PI * 2); ctx!.fill()
      }
      ctx!.restore()

      // fresnel rim — bright accent edge light
      ctx!.globalCompositeOperation = 'lighter'
      const rim = ctx!.createRadialGradient(px, py, R * 0.6, px, py, R * 1.05)
      rim.addColorStop(0, 'rgba(59,115,247,0)')
      rim.addColorStop(0.8, 'rgba(59,115,247,0.12)')
      rim.addColorStop(0.96, `rgba(${HI[0]},${HI[1]},${HI[2]},0.6)`)
      rim.addColorStop(1, 'rgba(143,176,255,0)')
      ctx!.fillStyle = rim
      ctx!.beginPath(); ctx!.arc(px, py, R * 1.05, 0, Math.PI * 2); ctx!.fill()

      // ── front half of the OrbitField over the marble ──
      drawPts(front)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', resize)
      window.removeEventListener('load', collect)
    }
  }, [])

  return <canvas ref={ref} className="rex-canvas" aria-hidden="true" />
}
