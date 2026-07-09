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

# ── 1. BEFORE / AFTER pair ────────────────────────────────────────────────────
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

# ── 2. mist puffs ─────────────────────────────────────────────────────────────
print('[2] mist puffs…')
S = 640
ysm, xsm = np.mgrid[0:S, 0:S].astype(np.float32)
for i, (tone, dens, seed) in enumerate([(0.10, 0.55, 1), (0.13, 0.45, 2), (0.55, 0.30, 3)], start=1):
    np.random.seed(seed)
    rad = np.sqrt((xsm - S / 2) ** 2 + (ysm - S / 2) ** 2) / (S / 2)
    fall = np.clip(1 - rad, 0, 1) ** 1.8
    tex = soft_noise(S, S, 22) * 0.7 + soft_noise(S, S, 7) * 0.3
    a = np.clip(fall * (0.35 + tex) * dens, 0, 0.75)
    puff = np.zeros((S, S, 4), dtype=np.float32)
    puff[..., 0] = puff[..., 1] = puff[..., 2] = tone
    puff[..., 2] += 0.02  # cold hint
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

# the scan's baked texture renders as flat clay — force the real finish: brushed steel
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf is None: continue
    for link in list(mat.node_tree.links):
        if link.to_node == bsdf and link.to_socket.name == 'Base Color':
            mat.node_tree.links.remove(link)
    bsdf.inputs['Base Color'].default_value = (0.56, 0.58, 0.62, 1)
    bsdf.inputs['Metallic'].default_value = 0.85
    bsdf.inputs['Roughness'].default_value = 0.3

# frame the gun: gather bounds
mins = np.array([1e9] * 3); maxs = np.array([-1e9] * 3)
for ob in scn.objects:
    if ob.type == 'MESH':
        for v in ob.bound_box:
            wv = ob.matrix_world @ __import__('mathutils').Vector(v)
            mins = np.minimum(mins, np.array(wv)); maxs = np.maximum(maxs, np.array(wv))
center = (mins + maxs) / 2; size = float(np.max(maxs - mins))

# camera: side profile, slight 3/4, looking at center
cam_data = bpy.data.cameras.new('cam'); cam_data.lens = 62
cam = bpy.data.objects.new('cam', cam_data); scn.collection.objects.link(cam)
scn.camera = cam
cam.location = (center[0] + size * 0.55, center[1] - size * 2.35, center[2] + size * 0.3)
direc = __import__('mathutils').Vector(center) - cam.location
cam.rotation_euler = direc.to_track_quat('-Z', 'Y').to_euler()

# lights: key + rim + fill
def add_light(name, loc, power, sz):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.size = sz
    lo = bpy.data.objects.new(name, ld); scn.collection.objects.link(lo)
    lo.location = loc
    d = __import__('mathutils').Vector(center) - lo.location
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
add_light('key', (center[0] + size, center[1] - size * 1.2, center[2] + size * 1.6), 900 * size, size * 2)
add_light('rim', (center[0] - size * 1.4, center[1] + size, center[2] + size * 0.8), 500 * size, size * 1.5)
add_light('fill', (center[0], center[1] - size * 2, center[2] - size * 0.4), 250 * size, size * 2)
world = bpy.data.worlds.new('w'); scn.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.28, 0.29, 0.31, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.7

scn.render.engine = 'CYCLES'
scn.cycles.samples = 96
scn.render.film_transparent = True
scn.render.resolution_x = 2048; scn.render.resolution_y = 2048
scn.render.image_settings.file_format = 'PNG'
scn.render.image_settings.color_mode = 'RGBA'
scn.render.filepath = os.path.join(OUT, 'gun.png')
bpy.ops.render.render(write_still=True)
print('DONE — all refinish assets written to', OUT)
