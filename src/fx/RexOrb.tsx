import { useEffect, useRef } from 'react'

// ── REX — the guide. ───────────────────────────────────────────────────────
// Faithful to the PRAX RexOrb: a smooth MARBLE center mass (grey-blue stone
// with accent-tinted veins, lit from the upper left, accent fresnel rim) with
// fine WHITE particles in live formation orbits — evenly-tilted rings flying
// in formation, gyroscope/atom look, never a swarm.
//
// Movement is deliberate: each section declares data-rex="left|right" and REX
// flies to a parking spot beside that section's heading (measured from the
// real DOM), rides with it while it's on screen, and on arrival emits a pulse
// while the section lights up (accent underline sweep + card edge glow via a
// .rex-lit class).

const ACCENT: [number, number, number] = [59, 115, 247]
const HI: [number, number, number] = [143, 176, 255]

type Ring = { inc: number; om: number; r: number; n: number; s: number; phase: number }
const RINGS: Ring[] = [
  { inc: 0.42, om: 0.0, r: 1.45, n: 78, s: 0.45, phase: 0.0 },
  { inc: 1.05, om: 1.9, r: 1.72, n: 88, s: -0.32, phase: 1.3 },
  { inc: 0.75, om: 4.1, r: 1.28, n: 62, s: 0.6, phase: 2.6 },
  { inc: 1.35, om: 2.7, r: 1.95, n: 94, s: 0.26, phase: 4.0 },
  { inc: 0.2, om: 5.3, r: 1.58, n: 68, s: -0.5, phase: 5.1 },
]

// per-vein wave params for the marble surface (stable across frames)
const VEINS = Array.from({ length: 6 }, (_, k) => ({
  y: -0.72 + k * 0.28 + (k % 2) * 0.07,
  amp: 0.1 + (k * 37 % 10) * 0.02,
  freq: 2.2 + (k * 53 % 10) * 0.22,
  ph: k * 1.7,
  wdt: 0.9 + (k * 29 % 10) * 0.14,
}))

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

    // where REX should park right now (viewport coords)
    function target(): { x: number; y: number; i: number } {
      if (anchors.length === 0) return { x: w * 0.75, y: h * 0.55, i: 0 }
      let best = 0, bestD = Infinity
      for (let i = 0; i < anchors.length; i++) {
        const r = anchors[i].section.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - h * 0.5)
        if (d < bestD) { bestD = d; best = i }
      }
      const a = anchors[best]
      const r = a.el.getBoundingClientRect()
      const margin = orbR() * 2.4
      const x = a.side === 'left'
        ? Math.max(r.left - 120, margin)
        : Math.min(r.right + 120, w - margin)
      const y = Math.min(Math.max(r.top + r.height / 2, margin), h - margin)
      return { x, y, i: best }
    }

    const orbR = () => Math.max(28, Math.min(46, Math.min(w, h) * 0.042))

    const first = target()
    let px = first.x, py = first.y, vx = 0, vy = 0
    let traveling = false
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
      const tgt = target()
      const bobX = Math.sin(t * 0.8) * 5
      const bobY = Math.cos(t * 1.25) * 7

      if (reduced) {
        px = tgt.x; py = tgt.y
        setLit(tgt.i)
      } else {
        vx += (tgt.x + bobX - px) * 0.011
        vy += (tgt.y + bobY - py) * 0.011
        vx *= 0.9; vy *= 0.9
        px += vx; py += vy
      }

      const dist = Math.hypot(tgt.x - px, tgt.y - py)
      if (dist > 160) traveling = true
      if (traveling && dist < 34) {
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
      const halo = ctx!.createRadialGradient(px, py, 0, px, py, R * 2.5 * breathe)
      halo.addColorStop(0, 'rgba(59,115,247,0.16)')
      halo.addColorStop(0.55, 'rgba(59,115,247,0.05)')
      halo.addColorStop(1, 'rgba(59,115,247,0)')
      ctx!.fillStyle = halo
      ctx!.beginPath(); ctx!.arc(px, py, R * 2.5 * breathe, 0, Math.PI * 2); ctx!.fill()

      // ── arrival pulse ring ──
      if (pulse > 0) {
        const pr = R * (1.3 + (1 - pulse) * 2.2)
        ctx!.strokeStyle = `rgba(${HI[0]},${HI[1]},${HI[2]},${pulse * 0.55})`
        ctx!.lineWidth = 1.5
        ctx!.beginPath(); ctx!.arc(px, py, pr, 0, Math.PI * 2); ctx!.stroke()
        pulse -= 0.022
      }

      // ── orbit particles: compute all, draw the BEHIND half first ──
      const spin = 1 + moving * 2.2
      const prec = t * 0.06 // slow precession of the whole formation
      type P3 = { sx: number; sy: number; z: number }
      const behind: P3[] = [], front: P3[] = []
      for (const ring of RINGS) {
        const cosI = Math.cos(ring.inc), sinI = Math.sin(ring.inc)
        const om = ring.om + prec
        const cosO = Math.cos(om), sinO = Math.sin(om)
        const rr = ring.r * R
        for (let m = 0; m < ring.n; m++) {
          const th = ring.phase + ring.s * t * spin + (m / ring.n) * Math.PI * 2
          const ct = Math.cos(th), st = Math.sin(th)
          const x = rr * (cosO * ct - sinO * st * cosI)
          const z = rr * (sinO * ct + cosO * st * cosI)
          const y = rr * st * sinI
          const p: P3 = { sx: px + x, sy: py + y * 0.92, z }
          ;(z < 0 ? behind : front).push(p)
        }
      }
      const drawPts = (list: P3[]) => {
        for (const p of list) {
          const depth = (p.z / (2 * R) + 1) / 2 // 0 back → 1 front
          ctx!.fillStyle = `rgba(255,255,255,${0.14 + depth * 0.5})`
          const s = 0.9 + depth * 0.7
          ctx!.fillRect(p.sx - s / 2, p.sy - s / 2, s, s)
        }
      }
      drawPts(behind)

      // ── the marble ──
      ctx!.globalCompositeOperation = 'source-over'
      // stone shading, key light upper-left (matches the shader's lambert dir)
      const sph = ctx!.createRadialGradient(px - R * 0.38, py - R * 0.42, R * 0.08, px, py, R)
      sph.addColorStop(0, '#a7aec2')
      sph.addColorStop(0.42, '#59617a')
      sph.addColorStop(0.8, '#2b3145')
      sph.addColorStop(1, '#1a1f30')
      ctx!.fillStyle = sph
      ctx!.beginPath(); ctx!.arc(px, py, R, 0, Math.PI * 2); ctx!.fill()

      // accent-tinted veins drifting across the stone
      ctx!.save()
      ctx!.beginPath(); ctx!.arc(px, py, R, 0, Math.PI * 2); ctx!.clip()
      ctx!.globalCompositeOperation = 'lighter'
      for (const vn of VEINS) {
        ctx!.strokeStyle = `rgba(${HI[0]},${HI[1]},${HI[2]},0.14)`
        ctx!.lineWidth = vn.wdt
        ctx!.beginPath()
        const drift = t * 0.12
        for (let sx = -1; sx <= 1.001; sx += 0.08) {
          const yy = vn.y + Math.sin(sx * vn.freq + vn.ph + drift) * vn.amp
                   + Math.sin(sx * vn.freq * 2.3 - drift * 0.7) * vn.amp * 0.35
          const X = px + sx * R
          const Y = py + yy * R
          if (sx === -1) ctx!.moveTo(X, Y); else ctx!.lineTo(X, Y)
        }
        ctx!.stroke()
      }
      ctx!.restore()

      // fresnel rim — accent edge light
      ctx!.globalCompositeOperation = 'lighter'
      const rim = ctx!.createRadialGradient(px, py, R * 0.62, px, py, R * 1.04)
      rim.addColorStop(0, 'rgba(59,115,247,0)')
      rim.addColorStop(0.82, 'rgba(59,115,247,0.10)')
      rim.addColorStop(0.97, `rgba(${HI[0]},${HI[1]},${HI[2]},0.5)`)
      rim.addColorStop(1, 'rgba(143,176,255,0)')
      ctx!.fillStyle = rim
      ctx!.beginPath(); ctx!.arc(px, py, R * 1.04, 0, Math.PI * 2); ctx!.fill()

      // ── front orbit particles over the marble ──
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
