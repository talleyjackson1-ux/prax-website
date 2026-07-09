# THE REFINISH — asset factory (headless Blender, numpy only; no PIL on this machine)
# Run:  & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b -P tools/make_refinish_assets.py
# Jobs:
#   1. BEFORE: composite believable scuff/scratch damage onto the glossy hood photo
#      (assets_work/after-hood.jpg) -> public/img/auto/refinish-before.jpg
#      AFTER: the untouched photo -> public/img/auto/refinish-after.jpg
#      (same piece, same angle — guaranteed, because it IS the same photo)
#   2. Spray mist puffs (alpha PNGs) -> public/img/auto/mist-{1,2,3}.png
#   3. Masking-tape strip w/ torn edge -> public/img/auto/tape.png
#   4. Spray gun render (CC-BY Oleksii Rozumnyi) w/ alpha -> public/img/auto/gun.png
import bpy, os, math, random
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets_work', 'after-hood.jpg')
OUT = os.path.join(ROOT, 'public', 'img', 'auto')
os.makedirs(OUT, exist_ok=True)
random.seed(42); np.random.seed(42)

# ── helpers ───────────────────────────────────────────────────────────────────
def load_np(path):
    img = bpy.data.images.load(path)
    w, h = img.size
    arr = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)  # row 0 = BOTTOM
    return img, arr, w, h

def save_np(arr, w, h, path, is_jpg=True):
    img = bpy.data.images.new('out', width=w, height=h, alpha=not is_jpg)
    img.pixels = arr.astype(np.float32).ravel()
    img.filepath_raw = path
    img.file_format = 'JPEG' if is_jpg else 'PNG'
    scn = bpy.context.scene
    scn.render.image_settings.quality = 92
    img.save()
    bpy.data.images.remove(img)

def streaks(h, w, angle_deg, steps=22):
    """directional motion-blurred noise — reads as abrasion streaks"""
    n = np.random.rand(h, w).astype(np.float32)
    acc = np.zeros_like(n)
    dx = math.cos(math.radians(angle_deg)); dy = math.sin(math.radians(angle_deg))
    for i in range(steps):
        acc += np.roll(np.roll(n, int(dy * i), axis=0), int(dx * i), axis=1)
    acc /= steps
    acc = (acc - acc.min()) / (acc.max() - acc.min() + 1e-6)
    return acc

def soft_noise(h, w, scale=8):
    """low-frequency blobby noise via tiled random + repeated box blur"""
    small = np.random.rand(h // scale + 2, w // scale + 2).astype(np.float32)
    big = np.kron(small, np.ones((scale, scale), dtype=np.float32))[:h, :w]
    for r in (7, 5, 5, 3, 3, 2, 2, 1):   # heavy multi-radius box blur — kills the kron grid
        big = (big + np.roll(big, r, 0) + np.roll(big, -r, 0) + np.roll(big, r, 1) + np.roll(big, -r, 1)) / 5
    return (big - big.min()) / (big.max() - big.min() + 1e-6)

def stamp_path(alpha, pts, width, strength):
    """stamp gaussian dots along a polyline into alpha (top-origin coords)"""
    h, w = alpha.shape
    r = max(2, int(width * 2))
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    kern = np.exp(-(xx ** 2 + yy ** 2) / (2 * (width * 0.55) ** 2)) * strength
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        steps = max(2, int(math.hypot(x1 - x0, y1 - y0) / max(1, width * 0.4)))
        for t in np.linspace(0, 1, steps):
            cx, cy = int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t)
            ny = h - 1 - cy  # to bottom-origin
            y_lo, y_hi = max(0, ny - r), min(h, ny + r + 1)
            x_lo, x_hi = max(0, cx - r), min(w, cx + r + 1)
            if y_hi <= y_lo or x_hi <= x_lo: continue
            k = kern[(y_lo - (ny - r)):(y_hi - (ny - r)), (x_lo - (cx - r)):(x_hi - (cx - r))]
            np.maximum(alpha[y_lo:y_hi, x_lo:x_hi], k, out=alpha[y_lo:y_hi, x_lo:x_hi])

def jitter_line(x0, y0, x1, y1, seg=14, j=6):
    pts = []
    for t in np.linspace(0, 1, seg):
        pts.append((x0 + (x1 - x0) * t + random.uniform(-j, j),
                    y0 + (y1 - y0) * t + random.uniform(-j, j)))
    return pts

# ── 1b. REAL before/after PAIR (Jackson 2026-07-09): crop the two halves of the
#     reference comp he chose (Shutterstock 1948581235 — PLACEHOLDER pending the
#     ~$15 license or dad's real pair; the black mist band hides seam mismatch).
PAIR_SRC = r'C:\Users\jacks\.claude\image-cache\7a0bc825-88c3-47fe-a38b-64db2b37da6b\5.jpeg'
def crop_pair():
    img2, arr2, w2, h2 = load_np(PAIR_SRC)
    # box + split measured on the screenshot (ratios of full frame)
    x0, x1, xm = int(w2 * 34 / 1363), int(w2 * 1264 / 1363), int(w2 * 649 / 1363)  # inside the carousel arrows
    y0, y1 = int(h2 * 180 / 792), int(h2 * 615 / 792)      # stop above the watermark line
    r0, r1 = h2 - y1, h2 - y0                               # bottom-origin rows
    left = arr2[r0:r1, x0:xm].copy()
    right = arr2[r0:r1, xm + 2:x1].copy()
    hh, lw = left.shape[0], left.shape[1]
    rw = right.shape[1]
    save_np(left, lw, hh, os.path.join(OUT, 'pair-before.jpg'))
    save_np(right, rw, hh, os.path.join(OUT, 'pair-after.jpg'))
    bpy.data.images.remove(img2)
    print(f'    pair cropped: {lw}x{hh} / {rw}x{hh} (placeholder — license before shipping)')
if os.path.exists(PAIR_SRC):
    crop_pair()
else:
    print('    pair source missing — skipped')
if os.environ.get('PAIR_ONLY'):
    print('DONE — pair only'); raise SystemExit

# ── 1. BEFORE / AFTER pair (composited hood — kept as fallback assets) ───────
print('[1] compositing damage…')
img, base, W, H = load_np(SRC)

# after = untouched
save_np(base, W, H, os.path.join(OUT, 'refinish-after.jpg'))

# scuff patch — DARK zone (lower bumper/panel, right of headlight) so grey abrasion pops;
# the deep scratches keep their own anchor up in the reflective hood zone
s_cx, s_cy = 2050, 520
cx, cy_top, rx, ry, rot = 2300, 1560, 440, 230, math.radians(-8)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
ys_top = (H - 1) - ys                                     # convert grid to top-origin
dx_, dy_ = xs - cx, ys_top - cy_top
xr = dx_ * math.cos(rot) + dy_ * math.sin(rot)
yr = -dx_ * math.sin(rot) + dy_ * math.cos(rot)
ell = np.exp(-((xr / rx) ** 2 + (yr / ry) ** 2) * 2.2)     # soft ellipse falloff
ragged = soft_noise(H, W, 40)
patch_mask = np.clip(ell * (0.55 + 0.7 * ragged), 0, 1).astype(np.float32)

# abrasion streaks inside the patch (direction ~ the swipe of an impact)
st = streaks(H, W, -8)
scuff_a = (st ** 1.4) * patch_mask * 1.5
scuff_a += (streaks(H, W, -12, 34) ** 2.0) * patch_mask * 0.9   # second pass, longer streaks
scuff_a *= 0.55 + 0.45 * streaks(H, W, -8, 6)                    # fine grain breaks any blockiness
scuff_a = np.clip(scuff_a, 0, 0.95)

# fine swirl scratches around the patch
swirl_a = np.zeros((H, W), dtype=np.float32)
for _ in range(72):
    ang0 = random.uniform(0, 2 * math.pi)
    r0 = random.uniform(60, 420)
    ccx = cx + random.uniform(-rx * 0.8, rx * 0.8)
    ccy = cy_top + random.uniform(-ry * 0.8, ry * 0.8)
    arc = random.uniform(0.4, 1.4)
    pts = [(ccx + r0 * math.cos(ang0 + t), ccy + r0 * math.sin(ang0 + t) * 0.55)
           for t in np.linspace(0, arc, 10)]
    stamp_path(swirl_a, pts, width=random.uniform(1.0, 2.0), strength=random.uniform(0.18, 0.36))
swirl_a *= np.clip(ell * 1.6, 0, 1)

# two deeper gouge scratches crossing the patch
deep_a = np.zeros((H, W), dtype=np.float32)
shadow_a = np.zeros((H, W), dtype=np.float32)
for (sx, sy, ex, ey, wd) in [
    (s_cx - 700, s_cy + 150, s_cx + 560, s_cy - 130, 3.4),
    (s_cx - 380, s_cy + 260, s_cx + 700, s_cy + 60, 2.4),
]:
    pts = jitter_line(sx, sy, ex, ey, seg=18, j=5)
    stamp_path(deep_a, pts, width=wd, strength=0.85)
    stamp_path(shadow_a, [(x, y + 4) for (x, y) in pts], width=wd + 1.6, strength=0.5)

# assemble: dull the clearcoat in the patch, then screen the marks on top
out = base.copy()
dull = np.clip(patch_mask * 0.85, 0, 1)[..., None]
grey = out[..., :3].mean(axis=2, keepdims=True)
out[..., :3] = out[..., :3] * (1 - dull) + (out[..., :3] * 0.35 + grey * 0.35 + 0.10) * dull

scuff_col = np.array([0.78, 0.79, 0.80], dtype=np.float32)
swirl_col = np.array([0.70, 0.71, 0.73], dtype=np.float32)
deep_col = np.array([0.86, 0.86, 0.87], dtype=np.float32)   # bright primer core
shad_col = np.array([0.03, 0.03, 0.035], dtype=np.float32)

for a, col in ((shadow_a, shad_col), (scuff_a, scuff_col), (swirl_a, swirl_col), (deep_a, deep_col)):
    al = np.clip(a, 0, 1)[..., None]
    out[..., :3] = out[..., :3] * (1 - al) + col * al

save_np(out, W, H, os.path.join(OUT, 'refinish-before.jpg'))
print('    before/after saved')

# ── 2. mist — BLACK paint cloud (Jackson: hide the seam entirely; ~1/3 screen
#     wide, full height, black for a black car). One tall dense column + 2 puffs.
print('[2] mist…')
CW, CH = 900, 2160
ysm, xsm = np.mgrid[0:CH, 0:CW].astype(np.float32)
np.random.seed(11)
# horizontal falloff (soft column edges), full-height coverage w/ ragged noise
xfall = np.clip(1 - np.abs(xsm - CW / 2) / (CW / 2), 0, 1) ** 0.9
tex = soft_noise(CH, CW, 34) * 0.55 + soft_noise(CH, CW, 11) * 0.45
col_a = np.clip(xfall * (0.55 + 0.75 * tex), 0, 1) ** 1.1
col_a = np.clip(col_a * 1.25, 0, 0.97)
column = np.zeros((CH, CW, 4), dtype=np.float32)
column[..., 0] = column[..., 1] = 0.03
column[..., 2] = 0.045                      # barely-cool black paint
column[..., 3] = col_a
save_np(column, CW, CH, os.path.join(OUT, 'mist-column.png'), is_jpg=False)

S = 760
ysp, xsp = np.mgrid[0:S, 0:S].astype(np.float32)
for i, (dens, seed) in enumerate([(0.85, 1), (0.7, 2)], start=1):
    np.random.seed(seed)
    rad = np.sqrt((xsp - S / 2) ** 2 + (ysp - S / 2) ** 2) / (S / 2)
    fall = np.clip(1 - rad, 0, 1) ** 1.4
    tex2 = soft_noise(S, S, 26) * 0.6 + soft_noise(S, S, 9) * 0.4
    a = np.clip(fall * (0.45 + tex2) * dens, 0, 0.92)
    puff = np.zeros((S, S, 4), dtype=np.float32)
    puff[..., 0] = puff[..., 1] = 0.03; puff[..., 2] = 0.045
    puff[..., 3] = a
    save_np(puff, S, S, os.path.join(OUT, f'mist-{i}.png'), is_jpg=False)

# ── 3. masking-tape strip ─────────────────────────────────────────────────────
print('[3] tape strip…')
TW, TH = 2048, 260
tape = np.zeros((TH, TW, 4), dtype=np.float32)
crinkle = soft_noise(TH, TW, 9) * 0.5 + streaks(TH, TW, 0, 30) * 0.5
col = np.array([0.86, 0.80, 0.62], dtype=np.float32)
tape[..., :3] = col * (0.82 + 0.24 * crinkle[..., None])
# vertical shading — top edge lit, bottom in shadow (it's curling toward viewer)
shade = np.linspace(1.06, 0.78, TH, dtype=np.float32)[::-1][:, None, None]
tape[..., :3] *= shade
tape[..., 3] = 1
# torn bottom edge (bottom of strip = row 0 in bottom-origin array)
edge = (soft_noise(4, TW, 2)[0] * 26).astype(int)
for x in range(TW):
    tape[:6 + edge[x % TW], x, 3] = 0
save_np(tape, TW, TH, os.path.join(OUT, 'tape.png'), is_jpg=False)

# ── 4. gun render ─────────────────────────────────────────────────────────────
print('[4] gun render…')
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets_work', 'spray-gun', 'scene.gltf'))

# POLISHED metal (Jackson: shiny, lighting matched to the hood photo — bright
# overcast sky from above, dark ground, cool white balance)
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf is None: continue
    for link in list(mat.node_tree.links):
        if link.to_node == bsdf and link.to_socket.name == 'Base Color':
            mat.node_tree.links.remove(link)
    bsdf.inputs['Base Color'].default_value = (0.75, 0.77, 0.8, 1)
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = 0.14

# frame the gun: gather bounds
mins = np.array([1e9] * 3); maxs = np.array([-1e9] * 3)
for ob in scn.objects:
    if ob.type == 'MESH':
        for v in ob.bound_box:
            wv = ob.matrix_world @ __import__('mathutils').Vector(v)
            mins = np.minimum(mins, np.array(wv)); maxs = np.maximum(maxs, np.array(wv))
center = (mins + maxs) / 2; size = float(np.max(maxs - mins))

mv = __import__('mathutils')

# ── the GRAVITY CUP ("the big top part that holds the paint") ────────────────
# polished aluminum cup + domed lid + vent knob, mounted above the body on the
# nozzle side (nozzle = -X from the profile framing)
cup_mat = bpy.data.materials.new('cup'); cup_mat.use_nodes = True
cb = cup_mat.node_tree.nodes['Principled BSDF']
cb.inputs['Base Color'].default_value = (0.78, 0.8, 0.83, 1)
cb.inputs['Metallic'].default_value = 1.0
cb.inputs['Roughness'].default_value = 0.12

cup_x = mins[0] + size * 0.28
cup_r = size * 0.17
cup_base_z = maxs[2] - size * 0.05          # seated into the body, no float gap
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=cup_r * 0.62, radius2=cup_r, depth=size * 0.34,
    location=(cup_x, center[1], cup_base_z + size * 0.17))
cup = bpy.context.object; cup.data.materials.append(cup_mat)
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=cup_r,
    location=(cup_x, center[1], cup_base_z + size * 0.34), scale=(1, 1, 0.36))
lid = bpy.context.object; lid.data.materials.append(cup_mat)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=cup_r * 0.13, depth=size * 0.05,
    location=(cup_x, center[1], cup_base_z + size * 0.40))
knob = bpy.context.object; knob.data.materials.append(cup_mat)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=cup_r * 0.3, depth=size * 0.06,
    location=(cup_x, center[1], cup_base_z + size * 0.02))
stem = bpy.context.object; stem.data.materials.append(cup_mat)
for ob in (cup, lid, knob, stem):
    m = ob.modifiers.new('bev', 'BEVEL'); m.width = size * 0.004; m.segments = 2

# ── the AIR HOSE — from the handle bottom, sagging, off-frame right ──────────
hose_mat = bpy.data.materials.new('hose'); hose_mat.use_nodes = True
hb = hose_mat.node_tree.nodes['Principled BSDF']
hb.inputs['Base Color'].default_value = (0.045, 0.045, 0.05, 1)
hb.inputs['Roughness'].default_value = 0.5

curve = bpy.data.curves.new('hose', 'CURVE'); curve.dimensions = '3D'
curve.bevel_depth = size * 0.032; curve.bevel_resolution = 6; curve.resolution_u = 24
sp = curve.splines.new('NURBS')
hx, hz = maxs[0] - size * 0.12, mins[2] + size * 0.04
pts = [
    (hx, center[1], hz),
    (hx + size * 0.2, center[1], hz - size * 0.1),
    (hx + size * 1.0, center[1] + size * 0.08, hz + size * 0.02),
    (hx + size * 2.2, center[1] - size * 0.05, hz + size * 0.28),
    (hx + size * 3.6, center[1], hz + size * 0.12),
    (hx + size * 5.0, center[1] + size * 0.1, hz + size * 0.4),
]
sp.points.add(len(pts) - 1)
for p, (px, py, pz) in zip(sp.points, pts):
    p.co = (px, py, pz, 1)
sp.use_endpoint_u = True
hose = bpy.data.objects.new('hose', curve); scn.collection.objects.link(hose)
hose.data.materials.append(hose_mat)

# ── lighting matched to the hood photo: huge bright overcast sky above, dark
#    ground below → high-contrast reflections in the polished metal ───────────
def add_light(name, loc, power, sz, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.size = sz; ld.color = color
    lo = bpy.data.objects.new(name, ld); scn.collection.objects.link(lo)
    lo.location = loc
    d = mv.Vector(center) - lo.location
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
add_light('sky', (center[0] + size * 0.6, center[1] - size * 0.6, center[2] + size * 3.2), 2600 * size, size * 6, (0.93, 0.96, 1.0))
add_light('front', (center[0] + size * 0.3, center[1] - size * 2.6, center[2] + size * 0.7), 700 * size, size * 3, (0.9, 0.94, 1.0))
add_light('rim', (center[0] - size * 1.6, center[1] + size * 1.1, center[2] + size * 1.1), 900 * size, size * 1.2)
# dark "ground" card for the lower reflections (reflection-only, hidden from camera)
bpy.ops.mesh.primitive_plane_add(size=size * 14, location=(center[0], center[1], mins[2] - size * 1.6))
ground = bpy.context.object
gm = bpy.data.materials.new('ground'); gm.use_nodes = True
gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.015, 0.016, 0.02, 1)
ground.data.materials.append(gm)
ground.visible_camera = False
world = bpy.data.worlds.new('w'); scn.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.32, 0.35, 0.4, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.3   # darker env → chrome contrast

# ── camera: straight-on profile at fixed distance; shift_x slides the frame so
#    the gun sits left and the hose runs off the right edge (deterministic)
cam_data = bpy.data.cameras.new('cam'); cam_data.lens = 50
cam_data.shift_x = 0.32
cam = bpy.data.objects.new('cam', cam_data); scn.collection.objects.link(cam)
scn.camera = cam
cam.location = (center[0], center[1] - size * 5.2, center[2] + size * 0.2)
direc = mv.Vector((center[0], center[1], center[2] + size * 0.2)) - mv.Vector(cam.location)
cam.rotation_euler = direc.to_track_quat('-Z', 'Y').to_euler()

scn.render.engine = 'CYCLES'
scn.cycles.samples = 128
scn.render.film_transparent = True
scn.render.resolution_x = 3584; scn.render.resolution_y = 1536
scn.render.image_settings.file_format = 'PNG'
scn.render.image_settings.color_mode = 'RGBA'
scn.render.filepath = os.path.join(OUT, 'gun.png')
bpy.ops.render.render(write_still=True)
print('DONE — all refinish assets written to', OUT)
