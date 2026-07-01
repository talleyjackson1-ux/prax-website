import { useEffect, useRef } from 'react'

// Luminous particle flow field — the same generative register as PRAX's
// welcome-gate art (thousands of particles advected along layered sin/cos
// pseudo-noise, additive blend + fading trails). Canvas 2D so it renders
// identically everywhere with zero GPU risk.

const ACCENT: [number, number, number] = [59, 115, 247] // PRAX electric blue

export default function FlowField({ particles = 1600 }: { particles?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const [ar, ag, ab] = ACCENT
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, t = 0

    function resize() {
      w = canvas!.clientWidth; h = canvas!.clientHeight
      canvas!.width = Math.max(1, Math.floor(w * dpr))
      canvas!.height = Math.max(1, Math.floor(h * dpr))
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.fillStyle = '#05070d'; ctx!.fillRect(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    type P = { x: number; y: number; life: number; hue: number; spd: number }
    const seed = (): P => ({ x: Math.random() * w, y: Math.random() * h, life: 60 + Math.random() * 260, hue: Math.random(), spd: 0.35 + Math.random() * 0.7 })
    const ps: P[] = Array.from({ length: particles }, seed)

    const flow = (x: number, y: number) => {
      const s = 0.0016
      return (
        Math.sin(x * s + t * 0.15) +
        Math.cos(y * s * 1.3 - t * 0.1) +
        Math.sin((x + y) * s * 0.6 + t * 0.07)
      ) * 1.4
    }

    function frame() {
      t += 0.016
      ctx!.globalCompositeOperation = 'source-over'
      ctx!.fillStyle = 'rgba(5,7,13,0.06)'
      ctx!.fillRect(0, 0, w, h)

      ctx!.globalCompositeOperation = 'lighter'
      for (const p of ps) {
        const a = flow(p.x, p.y)
        const px = p.x, py = p.y
        p.x += Math.cos(a) * p.spd
        p.y += Math.sin(a) * p.spd
        p.life -= 1

        const spark = p.hue > 0.92
        const r = spark ? 235 : ar, g = spark ? 240 : ag, b = spark ? 255 : Math.min(255, ab + 30)
        ctx!.strokeStyle = `rgba(${r},${g},${b},${spark ? 0.5 : 0.16})`
        ctx!.lineWidth = spark ? 1.1 : 0.8
        ctx!.beginPath(); ctx!.moveTo(px, py); ctx!.lineTo(p.x, p.y); ctx!.stroke()

        if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) Object.assign(p, seed())
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [particles])

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
