/* Scroll-driven dumbbell hero — the 3D half of the gym concept.
   Procedural PBR rubber-hex dumbbell resting on a shadowed floor:
   - words are DIVOTS pressed into the rubber (bump-driven, not painted text)
   - knurled grip with smooth chrome sleeves
   - real shadow floor that exits WITH the dumbbell
   Drop-in upgrade slot: put a scan at /public/models/dumbbell.glb and it
   replaces the procedural build automatically (normalized + re-oriented). */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface DumbbellRig {
  /** 0 = plate face-on to camera, Math.PI/2 = full side profile */
  setRotation(rad: number): void
  /** world-x offset added to the resting position (negative = slides off left) */
  setShift(x: number): void
  /** floor opacity 0-1 — fades the stage out at the tail of the exit */
  setFloorFade(opacity: number): void
  resize(): void
  dispose(): void
}

const BASE_X = -0.58 // dumbbell owns the LEFT side; copy sits right
const FLOOR_Y = -0.63

// ── procedural textures (canvas) ────────────────────────────────────────────

function speckle(g: CanvasRenderingContext2D, size: number, count: number, lo: number, hi: number) {
  for (let i = 0; i < count; i++) {
    const v = lo + Math.random() * (hi - lo)
    g.fillStyle = `rgb(${v},${v},${v})`
    g.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4)
  }
}

function knurlTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#7d7d7d'
  g.fillRect(0, 0, 512, 512)
  // diamond crosshatch: bright ridge + dark valley offset for depth
  for (const [color, width, off] of [['#2e2e2e', 3.5, 2], ['#dedede', 2, 0]] as const) {
    g.strokeStyle = color
    g.lineWidth = width
    for (let i = -512; i < 1024; i += 8) {
      g.beginPath(); g.moveTo(i + off, 0); g.lineTo(i + off + 512, 512); g.stroke()
      g.beginPath(); g.moveTo(i + off + 512, 0); g.lineTo(i + off, 512); g.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(26, 4)
  return t
}

function rubberNoise(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#8a8a8a'
  g.fillRect(0, 0, 256, 256)
  speckle(g, 256, 15000, 105, 160)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 4)
  return t
}

/* Rubber horse-mat gym flooring: near-black with EPDM flecks + seam grid.
   Color and bump share the same drawing so the flecks and seams read as relief. */
function horseMatTextures(): { color: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const draw = (base: string, fleckLo: number, fleckHi: number, seam: string) => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const g = c.getContext('2d')!
    g.fillStyle = base
    g.fillRect(0, 0, 512, 512)
    // EPDM flecks
    for (let i = 0; i < 5200; i++) {
      const v = fleckLo + Math.random() * (fleckHi - fleckLo)
      g.fillStyle = `rgba(${v},${v},${v},${0.5 + Math.random() * 0.5})`
      const s = 0.8 + Math.random() * 1.8
      g.fillRect(Math.random() * 512, Math.random() * 512, s, s)
    }
    // mat seams (4x6 mats butted together)
    g.strokeStyle = seam
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(0, 256); g.lineTo(512, 256)
    g.moveTo(256, 0); g.lineTo(256, 512)
    g.stroke()
    return c
  }
  const color = new THREE.CanvasTexture(draw('#0d0d0e', 24, 58, 'rgba(0,0,0,0.75)'))
  color.colorSpace = THREE.SRGBColorSpace
  color.wrapS = color.wrapT = THREE.RepeatWrapping
  color.repeat.set(5, 6)
  const bump = new THREE.CanvasTexture(draw('#808080', 96, 150, '#3a3a3a'))
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping
  bump.repeat.set(5, 6)
  return { color, bump }
}

/* Plate face: the words are ENGRAVED — recessed divots in the rubber.
   The bump map does the real work (blurred dark glyphs = smooth recess that
   the lights shade); the color map only adds soft ambient-occlusion darkness. */
function facePlateTextures(): { color: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const cc = document.createElement('canvas')
  cc.width = cc.height = 1024
  const bc = document.createElement('canvas')
  bc.width = bc.height = 1024

  const glyphs = (g: CanvasRenderingContext2D) => {
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '600 46px "JetBrains Mono", monospace'
    g.fillText('IRONWORKS · KANSAS CITY', 512, 296)
    g.font = '400 208px "Bebas Neue", sans-serif'
    g.fillText('STRENGTH', 512, 478)
    g.fillText('LIVES HERE', 512, 664)
  }

  const drawColor = () => {
    const g = cc.getContext('2d')!
    g.filter = 'none'
    g.fillStyle = '#141416'
    g.fillRect(0, 0, 1024, 1024)
    speckle(g, 1024, 26000, 14, 34)
    // engraved ring groove
    g.filter = 'blur(3px)'
    g.strokeStyle = 'rgba(0,0,0,0.55)'
    g.lineWidth = 10
    g.beginPath(); g.arc(512, 512, 436, 0, Math.PI * 2); g.stroke()
    // divot AO: soft dark halo, then the recessed face slightly darker than the rubber
    g.filter = 'blur(6px)'
    g.fillStyle = 'rgba(0,0,0,0.6)'
    glyphs(g)
    g.filter = 'none'
    g.fillStyle = '#0d0d0f'
    glyphs(g)
  }

  const drawBump = () => {
    const g = bc.getContext('2d')!
    g.filter = 'none'
    g.fillStyle = '#808080'
    g.fillRect(0, 0, 1024, 1024)
    speckle(g, 1024, 26000, 100, 155)
    g.filter = 'blur(3px)'
    g.strokeStyle = '#4a4a4a'
    g.lineWidth = 10
    g.beginPath(); g.arc(512, 512, 436, 0, Math.PI * 2); g.stroke()
    // blurred dark glyphs = smooth-walled recess the lighting can catch
    g.filter = 'blur(4px)'
    g.fillStyle = '#2e2e2e'
    glyphs(g)
    g.filter = 'none'
  }

  drawColor()
  drawBump()
  const color = new THREE.CanvasTexture(cc)
  color.colorSpace = THREE.SRGBColorSpace // color map — without this the plate washes out grey
  color.anisotropy = 4
  const bump = new THREE.CanvasTexture(bc)

  // Bebas usually isn't decoded yet on first draw — redraw when fonts land
  document.fonts.ready.then(() => {
    drawColor(); drawBump()
    color.needsUpdate = true; bump.needsUpdate = true
  })

  return { color, bump }
}

// ── procedural dumbbell build ────────────────────────────────────────────────

function hexShape(radius: number): THREE.Shape {
  // flat-top hexagon (vertices on the horizontal axis) — rests on a flat face
  const s = new THREE.Shape()
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3
    if (k === 0) s.moveTo(Math.cos(a) * radius, Math.sin(a) * radius)
    else s.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
  }
  s.closePath()
  return s
}

interface Mats {
  chrome: THREE.MeshStandardMaterial
  grip: THREE.MeshStandardMaterial
  rubber: THREE.MeshPhysicalMaterial
  face: THREE.MeshPhysicalMaterial
  textWhite: THREE.MeshStandardMaterial
}

function makeMats(): Mats {
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd6d8dc, metalness: 1, roughness: 0.18 })
  const knurl = knurlTexture()
  // dark gunmetal grip — reads as machined steel, not more chrome
  const grip = new THREE.MeshStandardMaterial({
    color: 0x74777c, metalness: 1, roughness: 0.55,
    bumpMap: knurl, bumpScale: 1.2, roughnessMap: knurl,
  })
  // painted divot floors — the words, flat faces only; slight emissive so the
  // paint stays readable at any light angle
  const textWhite = new THREE.MeshStandardMaterial({
    color: 0xdedbd4, metalness: 0, roughness: 0.65, envMapIntensity: 0.3,
    emissive: 0xdedbd4, emissiveIntensity: 0.22,
  })
  const noise = rubberNoise()
  // TRUE black rubber (darker than the grey floor): env stays dim or it grey-casts
  const rubber = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0c, metalness: 0, roughness: 0.92,
    bumpMap: noise, bumpScale: 0.14, envMapIntensity: 0.05,
    clearcoat: 0.05, clearcoatRoughness: 0.7,
  })
  const faceTex = facePlateTextures()
  const face = new THREE.MeshPhysicalMaterial({
    map: faceTex.color, bumpMap: faceTex.bump, bumpScale: 2.2,
    metalness: 0, roughness: 0.92, envMapIntensity: 0.06,
  })
  return { chrome, grip, rubber, face, textWhite }
}

function buildDumbbell(mats: Mats): THREE.Group {
  const db = new THREE.Group()
  const { chrome, grip, rubber, face } = mats

  // knurled grip — axis along Z (front head faces the camera at rotation 0)
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 1.9, 64), grip)
  handle.rotation.x = Math.PI / 2
  db.add(handle)

  // beveled hex head geometry (the chamfer is what sells it as molded rubber)
  const headGeo = new THREE.ExtrudeGeometry(hexShape(0.66), {
    depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045,
    bevelSegments: 4, curveSegments: 8,
  })
  headGeo.translate(0, 0, -0.25)

  for (const side of [1, -1]) {
    // smooth chrome sleeve between grip and head
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.16, 64), chrome)
    sleeve.rotation.x = Math.PI / 2
    sleeve.position.z = side * 0.55
    db.add(sleeve)

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.148, 0.15, 64), chrome)
    collar.rotation.x = Math.PI / 2
    collar.position.z = side * 0.66
    db.add(collar)

    const head = new THREE.Mesh(headGeo, rubber)
    head.position.z = side * 1.0
    db.add(head)

    // engraved face plate on the outer end
    const plate = new THREE.Mesh(new THREE.CircleGeometry(0.52, 72), face)
    plate.position.z = side * (1.0 + 0.25 + 0.05 + 0.004)
    if (side === -1) plate.rotation.y = Math.PI
    db.add(plate)
  }

  db.traverse((o) => { o.castShadow = true })
  return db
}

// ── GLB upgrade slot ─────────────────────────────────────────────────────────

/* The Blender build (tools/make_dumbbell.py) carries the REAL geometry —
   boolean-engraved divot words, beveled hex, machined collars — and exports
   placeholder materials. We re-dress them here by name with the same tuned
   PBR set as the procedural build (bump, knurl, dimmed env). */
function tryLoadGlb(yaw: THREE.Group, procedural: THREE.Group, mats: Mats) {
  new GLTFLoader().load(
    '/models/dumbbell.glb',
    (gltf) => {
      const model = gltf.scene
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        o.castShadow = true
        const matName = (o.material as THREE.Material)?.name ?? ''
        const name = `${o.name} ${matName}`
        // material name FIRST: the white divot floors live on meshes whose
        // object name still says Rubber
        if (/platetext/i.test(matName)) o.material = mats.textWhite
        else if (/rubber/i.test(name)) o.material = mats.rubber
        else if (/grip/i.test(name)) o.material = mats.grip
        else if (/chrome|sleeve|collar/i.test(name)) o.material = mats.chrome
      })
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      if (size.x >= size.y && size.x >= size.z) model.rotation.y = Math.PI / 2
      else if (size.y >= size.x && size.y >= size.z) model.rotation.x = Math.PI / 2
      const box2 = new THREE.Box3().setFromObject(model)
      const size2 = box2.getSize(new THREE.Vector3())
      const center = box2.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.scale.setScalar(2.55 / Math.max(size2.z, 0.001))
      // rest the flat face ON the floor (yaw is about +Y, so the bottom holds)
      const box3 = new THREE.Box3().setFromObject(model)
      model.position.y += FLOOR_Y - box3.min.y
      yaw.remove(procedural)
      yaw.add(model)
    },
    undefined,
    () => { /* no glb present — procedural build stays */ },
  )
}

// ── scene ────────────────────────────────────────────────────────────────────

export function createDumbbellScene(canvas: HTMLCanvasElement): DumbbellRig {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  // fade the floor plane into the page background color at distance
  scene.fog = new THREE.Fog(0x0b0b0c, 4.5, 10.5)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
  camera.position.set(0.55, 0.52, 3.5)
  camera.lookAt(-0.15, -0.08, 0)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const key = new THREE.DirectionalLight(0xfff1e0, 1.4)
  key.position.set(2.6, 4.5, 3)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -3.5
  key.shadow.camera.right = 3.5
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -2
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 15
  key.shadow.bias = -0.0004
  key.shadow.radius = 6
  scene.add(key)
  const top = new THREE.DirectionalLight(0xffffff, 0.35) // rakes the divots + bevels
  top.position.set(0.5, 6, 1.5)
  scene.add(top)
  const rim = new THREE.DirectionalLight(0xff4a2e, 0.9) // brand-red rim, kept low so the rubber stays BLACK
  rim.position.set(-4, 1.2, -1.5)
  scene.add(rim)
  scene.add(new THREE.AmbientLight(0xffffff, 0.06))

  const shift = new THREE.Group() // exit-left translation — dumbbell AND floor
  const yaw = new THREE.Group()   // scroll-frame rotation (dumbbell only)
  const mats = makeMats()
  const procedural = buildDumbbell(mats)
  yaw.add(procedural)
  shift.add(yaw)

  // rubber horse-mat floor: a real slab with thickness (visible front edge),
  // fleck texture + seam grid; it EXITS with the dumbbell and fades at the tail
  const matTex = horseMatTextures()
  const floorMat = new THREE.MeshStandardMaterial({
    map: matTex.color, bumpMap: matTex.bump, bumpScale: 0.35,
    roughness: 0.96, metalness: 0, envMapIntensity: 0.05,
    transparent: true,
  })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(13, 0.34, 16), floorMat)
  floor.position.y = FLOOR_Y - 0.17
  floor.receiveShadow = true
  shift.add(floor)

  shift.position.x = BASE_X
  scene.add(shift)
  tryLoadGlb(yaw, procedural, mats)

  let shiftX = 0
  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    shift.position.x = BASE_X + shiftX
    renderer.render(scene, camera)
  }

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  loop()
  window.addEventListener('resize', resize)

  return {
    // negative yaw: the engraved face sweeps LEFT — same direction it exits
    setRotation: (rad) => { yaw.rotation.y = -rad },
    setShift: (x) => { shiftX = x },
    setFloorFade: (o) => { floorMat.opacity = o },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
