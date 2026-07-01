import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── REX — the guide. ───────────────────────────────────────────────────────
// This IS the PRAX RexOrb: the marble shader (domain-warped simplex fbm
// veining + accent fresnel) and the OrbitField (620 fine white particles in
// formation rings hugging the orb) are copied VERBATIM from
// portal/src/jarvis/RexOrb.tsx and rendered with raw three.js in a small
// transparent WebGL canvas. The website only adds the travel brain: REX flies
// to a parking spot beside each section's heading (data-rex="left|right"),
// lights the section on arrival, and never crosses the copy — opposite-side
// moves exit one screen edge and re-enter from the other.
// Trail / halo / arrival pulse are drawn on a 2D canvas underneath.

const ACCENT: [number, number, number] = [59, 115, 247]
const HI: [number, number, number] = [143, 176, 255]
const ACCENT_HEX = '#3b73f7'
const N = 620

// ── Marble shader (domain-warped simplex fbm veining + accent fresnel) ──
// [verbatim from the portal]
const MARBLE_VERT = /* glsl */`
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const MARBLE_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime; uniform vec3 uAccent; uniform float uGlow;
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

  // Ashima simplex noise 3D
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0,0.5,1.0,2.0);
    vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m*m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  float fbm(vec3 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v += a*snoise(p); p*=2.0; a*=0.5; } return v; }

  void main(){
    vec3 p = vPos*1.7 + vec3(0.0, uTime*0.025, 0.0);
    float warp = fbm(p + fbm(p*0.6));
    float veins = abs(sin((vPos.x + vPos.y)*2.0 + warp*3.6));
    veins = pow(1.0 - veins, 2.4);
    vec3 base = mix(vec3(0.52,0.55,0.62), vec3(0.20,0.23,0.30), smoothstep(-0.6,0.85,warp));
    vec3 veinCol = mix(vec3(0.72), uAccent*1.05, 0.6);
    vec3 col = mix(base, veinCol, veins*0.55);
    float lambert = clamp(dot(normalize(vNormal), normalize(vec3(0.4,0.7,0.6))), 0.0, 1.0);
    col *= 0.45 + 0.5*lambert;
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 3.2);
    col += uAccent * fres * 0.7 * uGlow;
    gl_FragColor = vec4(col, 1.0);
  }
`
const PARTICLE_VERT = /* glsl */`
  uniform float uSize; uniform float uGlow; uniform float uDpr;
  attribute float aAlert;
  varying float vAlert;
  void main(){
    vAlert = aAlert;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float s = uSize * (1.0 + aAlert * 0.4) * (16.0 / -mv.z) * uDpr;
    gl_PointSize = clamp(s, 0.8 * uDpr, 5.0 * uDpr);
    gl_Position = projectionMatrix * mv;
  }
`
const PARTICLE_FRAG = /* glsl */`
  uniform vec3 uColor; uniform vec3 uAlertColor; uniform float uGlow;
  varying float vAlert;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColor, uAlertColor, vAlert);
    gl_FragColor = vec4(col, a * 0.6 * uGlow);
  }
`

// ── OrbitField data (verbatim port of the portal's ring construction) ──
function buildOrbitField(num: number) {
  const positions = new Float32Array(num * 3)
  const alert = new Float32Array(num)
  const u = new Float32Array(num * 3), v = new Float32Array(num * 3)
  const rad = new Float32Array(num), spd = new Float32Array(num), phase = new Float32Array(num)
  const n = new THREE.Vector3(), uu = new THREE.Vector3(), vv = new THREE.Vector3(), ref = new THREE.Vector3()
  const RINGS = Math.min(10, Math.max(4, Math.round(num / 62)))
  const perRing = Math.floor(num / RINGS)
  let i = 0
  for (let k = 0; k < RINGS; k++) {
    // evenly-spread ring orientations (Fibonacci sphere of plane normals)
    const yk = 1 - ((k + 0.5) / RINGS) * 2
    const rk = Math.sqrt(Math.max(1 - yk * yk, 0))
    const az = k * 2.399963229
    n.set(Math.cos(az) * rk, yk, Math.sin(az) * rk).normalize()
    ref.set(0, 1, 0); if (Math.abs(n.y) > 0.92) ref.set(1, 0, 0)
    uu.crossVectors(n, ref).normalize()
    vv.crossVectors(n, uu).normalize()
    const r = 1.2 + (k % 3) * 0.04                  // hug the orb (surface ≈ 1.0)
    const omega = 0.3 * (1.2 / r)                   // shared per ring → formation
    const count = (k === RINGS - 1) ? (num - i) : perRing
    for (let j = 0; j < count; j++, i++) {
      const off = (j / count) * Math.PI * 2
      rad[i] = r; spd[i] = omega; phase[i] = off
      u[i * 3] = uu.x; u[i * 3 + 1] = uu.y; u[i * 3 + 2] = uu.z
      v[i * 3] = vv.x; v[i * 3 + 1] = vv.y; v[i * 3 + 2] = vv.z
      const c = Math.cos(off), s = Math.sin(off)
      positions[i * 3]     = (uu.x * c + vv.x * s) * r
      positions[i * 3 + 1] = (uu.y * c + vv.y * s) * r
      positions[i * 3 + 2] = (uu.z * c + vv.z * s) * r
    }
  }
  return { positions, alert, u, v, rad, spd, phase }
}

type Anchor = { section: HTMLElement; el: HTMLElement; side: string }

export default function RexOrb() {
  const ref2d = useRef<HTMLCanvasElement>(null)
  const refGl = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref2d.current, glCanvas = refGl.current
    if (!canvas || !glCanvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0
    let side = 0

    // ── three.js scene: the actual portal RexOrb ──
    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(dpr)
    } catch { renderer = null }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 6)
    const accent = new THREE.Color(ACCENT_HEX)

    const marbleUniforms = {
      uTime: { value: 0 }, uAccent: { value: accent.clone() }, uGlow: { value: 1 },
    }
    const marble = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 96),
      new THREE.ShaderMaterial({ vertexShader: MARBLE_VERT, fragmentShader: MARBLE_FRAG, uniforms: marbleUniforms }),
    )
    scene.add(marble)

    const field = buildOrbitField(N)
    const orbitGeom = new THREE.BufferGeometry()
    orbitGeom.setAttribute('position', new THREE.BufferAttribute(field.positions, 3))
    orbitGeom.setAttribute('aAlert', new THREE.BufferAttribute(field.alert, 1))
    const orbitMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color('#ffffff') }, uAlertColor: { value: new THREE.Color('#f87171') },
        uSize: { value: 1.8 }, uGlow: { value: 1 }, uDpr: { value: dpr },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    scene.add(new THREE.Points(orbitGeom, orbitMat))

    const orbR = () => Math.max(30, Math.min(48, Math.min(w, h) * 0.044))

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = Math.floor(w * dpr); canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      // fov 42, camera z 6 → sphere r=1 spans ~43.4% of the canvas height;
      // size the GL canvas so the marble diameter lands at 2·orbR px
      side = Math.ceil((2 * orbR()) / 0.434)
      glCanvas!.style.width = `${side}px`
      glCanvas!.style.height = `${side}px`
      renderer?.setSize(side, side, false)
      // the portal renders at size=320; gl_PointSize is in device px, so scale
      // the particle size (and its clamps, both ∝ uDpr) to our canvas size
      orbitMat.uniforms.uDpr.value = dpr * (side / 320)
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

    const first = anchorPoint()
    let px = first.x, py = first.y, vx = 0, vy = 0
    let traveling = false
    let wrapping: null | { dir: 1 | -1 } = null
    let pulse = 0
    let lit = -1
    let t = 0
    const trail: { x: number; y: number }[] = []

    function setLit(i: number) {
      if (i === lit) return
      anchors.forEach((a, k) => a.section.classList.toggle('rex-lit', k === i))
      lit = i
    }
    setLit(first.i)

    let last = performance.now()
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
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
        wrapping = { dir: curSide === 'left' ? -1 : 1 }
      }

      let seekX = tgt.x + bobX, seekY = tgt.y + bobY
      if (wrapping) {
        seekX = wrapping.dir === -1 ? -offEdge : w + offEdge
        seekY = py + (tgt.y - py) * 0.4
        if ((wrapping.dir === -1 && px < -offEdge + 4) || (wrapping.dir === 1 && px > w + offEdge - 4)) {
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

      // ── 2D layer: trail, halo, arrival pulse ──
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

      const breathe = 1 + Math.sin(t * 2.0) * 0.045 * (1 - moving)
      const halo = ctx!.createRadialGradient(px, py, 0, px, py, R * 2.3 * breathe)
      halo.addColorStop(0, 'rgba(59,115,247,0.17)')
      halo.addColorStop(0.55, 'rgba(59,115,247,0.05)')
      halo.addColorStop(1, 'rgba(59,115,247,0)')
      ctx!.fillStyle = halo
      ctx!.beginPath(); ctx!.arc(px, py, R * 2.3 * breathe, 0, Math.PI * 2); ctx!.fill()

      if (pulse > 0) {
        const pr = R * (1.35 + (1 - pulse) * 2.2)
        ctx!.strokeStyle = `rgba(${HI[0]},${HI[1]},${HI[2]},${pulse * 0.55})`
        ctx!.lineWidth = 1.5
        ctx!.beginPath(); ctx!.arc(px, py, pr, 0, Math.PI * 2); ctx!.stroke()
        pulse -= 0.022
      }

      // ── WebGL layer: the actual RexOrb, carried to (px, py) ──
      if (renderer) {
        // marble veining drift (portal: uTime += dt while in motion)
        marbleUniforms.uTime.value += dt
        // OrbitField formation update (verbatim), with a touch more spin in flight
        const odt = Math.min(dt, 0.033) * (1 + moving * 0.8)
        const pos = orbitGeom.attributes.position.array as Float32Array
        for (let i = 0; i < N; i++) {
          field.phase[i] += field.spd[i] * odt
          const c = Math.cos(field.phase[i]), s = Math.sin(field.phase[i]), r = field.rad[i], ix = i * 3
          pos[ix]     = (field.u[ix] * c + field.v[ix] * s) * r
          pos[ix + 1] = (field.u[ix + 1] * c + field.v[ix + 1] * s) * r
          pos[ix + 2] = (field.u[ix + 2] * c + field.v[ix + 2] * s) * r
        }
        orbitGeom.attributes.position.needsUpdate = true
        glCanvas!.style.transform = `translate3d(${px - side / 2}px, ${py - side / 2}px, 0)`
        renderer.render(scene, camera)
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', resize)
      window.removeEventListener('load', collect)
      marble.geometry.dispose(); (marble.material as THREE.Material).dispose()
      orbitGeom.dispose(); orbitMat.dispose()
      renderer?.dispose()
    }
  }, [])

  return (
    <>
      <canvas ref={ref2d} className="rex-canvas" aria-hidden="true" />
      <canvas ref={refGl} className="rex-webgl" aria-hidden="true" />
    </>
  )
}
