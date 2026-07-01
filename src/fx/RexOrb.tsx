import { useEffect, useRef } from 'react'

// REX — the scroll-driven creature. A luminous particle orb (the PRAX core)
// that swims left↔right across the page as you scroll, following waypoints
// declared by each section via data-rex / data-rex-y attributes.
//
// Rendered on a fixed transparent canvas above the page: a glowing core,
// an orbiting particle cloud, two slow geodesic rings, and a comet trail
// whose intensity follows swim speed. When REX arrives at a section it
// settles and "breathes" while that section's speech line reveals.

const ACCENT: [number, number, number] = [59, 115, 247]
const HI: [number, number, number] = [143, 176, 255]

type Waypoint = { docY: number; x: number; y: number }

const smooth = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

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
      measure()
    }

    let points: Waypoint[] = []
    function measure() {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-rex]'))
      points = els.map(el => {
        const r = el.getBoundingClientRect()
        return {
          docY: r.top + window.scrollY + r.height / 2,
          x: parseFloat(el.dataset.rex || '0.5'),
          y: parseFloat(el.dataset.rexY || '0.5'),
        }
      }).sort((a, b) => a.docY - b.docY)
    }

    resize()
    window.addEventListener('resize', resize)
    // re-measure once fonts/layout settle
    const settle = window.setTimeout(measure, 600)
    window.addEventListener('load', measure)

    // orbit particle cloud
    const N = 64
    const cloud = Array.from({ length: N }, () => ({
      r: 0.55 + Math.random() * 0.75,          // orbital radius (× orb size)
      a: Math.random() * Math.PI * 2,           // angle
      s: (0.4 + Math.random() * 0.9) * (Math.random() > 0.5 ? 1 : -1), // speed/dir
      tilt: Math.random() * Math.PI,            // orbit plane tilt
      size: 0.8 + Math.random() * 1.6,
      hue: Math.random(),
    }))

    // comet trail history
    const trail: { x: number; y: number }[] = []

    let px = w * 0.75, py = h * 0.55 // current position
    let vx = 0, vy = 0

    function target(): { x: number; y: number } {
      if (points.length === 0) return { x: w * 0.75, y: h * 0.55 }
      const cy = window.scrollY + h * 0.5
      if (cy <= points[0].docY) return { x: points[0].x * w, y: points[0].y * h }
      const last = points[points.length - 1]
      if (cy >= last.docY) return { x: last.x * w, y: last.y * h }
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1]
        if (cy >= a.docY && cy < b.docY) {
          const raw = (cy - a.docY) / (b.docY - a.docY)
          const e = smooth(smooth(raw)) // ease hard: dwell at sections, dash between
          return { x: lerp(a.x, b.x, e) * w, y: lerp(a.y, b.y, e) * h }
        }
      }
      return { x: last.x * w, y: last.y * h }
    }

    function frame() {
      t += 0.016
      ctx!.clearRect(0, 0, w, h)

      const tgt = target()
      // gentle idle bob so REX always feels alive
      const bobX = Math.sin(t * 0.9) * 6
      const bobY = Math.cos(t * 1.3) * 8

      const k = reduced ? 1 : 0.055
      vx = (tgt.x + bobX - px) * k
      vy = (tgt.y + bobY - py) * k
      px += vx; py += vy

      const speed = Math.hypot(vx, vy)
      const moving = Math.min(1, speed / 14)
      const orbR = Math.max(30, Math.min(52, Math.min(w, h) * 0.045))
      const ang = Math.atan2(vy, vx)

      // ── comet trail ──
      if (!reduced) {
        trail.push({ x: px, y: py })
        if (trail.length > 34) trail.shift()
        ctx!.globalCompositeOperation = 'lighter'
        for (let i = 0; i < trail.length; i++) {
          const f = i / trail.length
          const alpha = f * f * 0.14 * (0.25 + moving)
          const rad = orbR * 0.62 * f
          const g = ctx!.createRadialGradient(trail[i].x, trail[i].y, 0, trail[i].x, trail[i].y, rad)
          g.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`)
          g.addColorStop(1, 'rgba(59,115,247,0)')
          ctx!.fillStyle = g
          ctx!.beginPath(); ctx!.arc(trail[i].x, trail[i].y, rad, 0, Math.PI * 2); ctx!.fill()
        }
      }

      ctx!.globalCompositeOperation = 'lighter'

      // ── outer glow / breathing halo ──
      const breathe = 1 + Math.sin(t * 2.1) * 0.05 * (1 - moving)
      const halo = ctx!.createRadialGradient(px, py, 0, px, py, orbR * 2.6 * breathe)
      halo.addColorStop(0, 'rgba(59,115,247,0.22)')
      halo.addColorStop(0.5, 'rgba(59,115,247,0.07)')
      halo.addColorStop(1, 'rgba(59,115,247,0)')
      ctx!.fillStyle = halo
      ctx!.beginPath(); ctx!.arc(px, py, orbR * 2.6 * breathe, 0, Math.PI * 2); ctx!.fill()

      // ── geodesic rings (the PRAX core signature) ──
      ctx!.save()
      ctx!.translate(px, py)
      ctx!.rotate(ang * 0.25)
      const stretch = 1 + moving * 0.35 // swim-stretch along motion
      ctx!.scale(stretch, 1 / Math.sqrt(stretch))
      for (const [rot, squash, alpha] of [[t * 0.5, 0.36, 0.5], [-t * 0.35 + 1.2, 0.62, 0.32]] as const) {
        ctx!.save()
        ctx!.rotate(rot % (Math.PI * 2))
        ctx!.strokeStyle = `rgba(${HI[0]},${HI[1]},${HI[2]},${alpha})`
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.ellipse(0, 0, orbR * 1.28, orbR * 1.28 * squash, 0, 0, Math.PI * 2)
        ctx!.stroke()
        ctx!.restore()
      }
      ctx!.restore()

      // ── orbiting particle cloud ──
      for (const p of cloud) {
        p.a += p.s * 0.02 * (1 + moving * 1.6)
        const ox = Math.cos(p.a) * orbR * p.r
        const oyRaw = Math.sin(p.a) * orbR * p.r
        const oy = oyRaw * Math.cos(p.tilt) * 0.85
        const depth = 0.5 + 0.5 * Math.sin(p.a + p.tilt) // fake z for brightness
        const spark = p.hue > 0.88
        const cr = spark ? 235 : ACCENT[0], cg = spark ? 240 : ACCENT[1], cb = spark ? 255 : 255
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${(0.18 + depth * 0.5) * (spark ? 1 : 0.75)})`
        ctx!.beginPath()
        ctx!.arc(px + ox - vx * 1.6 * p.r, py + oy - vy * 1.6 * p.r, p.size * (0.7 + depth * 0.6), 0, Math.PI * 2)
        ctx!.fill()
      }

      // ── core ──
      const core = ctx!.createRadialGradient(px, py, 0, px, py, orbR * 0.66)
      core.addColorStop(0, 'rgba(240,246,255,0.95)')
      core.addColorStop(0.35, `rgba(${HI[0]},${HI[1]},${HI[2]},0.55)`)
      core.addColorStop(1, 'rgba(59,115,247,0)')
      ctx!.fillStyle = core
      ctx!.beginPath(); ctx!.arc(px, py, orbR * 0.66, 0, Math.PI * 2); ctx!.fill()

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', resize)
      window.removeEventListener('load', measure)
    }
  }, [])

  return <canvas ref={ref} className="rex-canvas" aria-hidden="true" />
}
