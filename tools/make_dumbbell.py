# make_dumbbell.py — generate the IRONWORKS hex dumbbell as a real GLB.
# Geometry-level realism: words engraved DIRECTLY into the hex faces (no disc),
# divot floors get a separate white material (walls stay rubber), flat-side
# resting orientation, ribbed grip, beveled heads. Materials are placeholders —
# dumbbellScene.ts re-dresses them at load by name.
#
# Run:  & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" `
#         --background --python tools\make_dumbbell.py
#
# Axis: built along Blender +Y so the glTF exporter (Y-up) lands the long axis
# on three.js Z. Blender Z (up) maps to glTF Y (up), so "flat face down" holds.
import bpy
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'models', 'dumbbell.glb')

HEAD_R = 0.66        # hex circumradius
HEAD_DEPTH = 0.5
HEAD_Y = 1.0         # head center along the axis
BEVEL = 0.045
HANDLE_R = 0.125

# ── scene reset ──────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def add_cyl(name, r, depth, y, verts=96, mat=None, spin=0.0):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=r, depth=depth,
        rotation=(math.radians(90), spin, 0), location=(0, y, 0))
    ob = bpy.context.active_object
    ob.name = name
    if mat: ob.data.materials.append(mat)
    return ob

# ── materials (placeholders; runtime re-dress keys off the names) ────────────
def mat(name, base, rough, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*base, 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    return m

RUBBER = mat('RubberHead', (0.006, 0.006, 0.007), 0.92)
WHITE = mat('PlateText', (0.75, 0.73, 0.7), 0.6)
GRIP = mat('GripSteel', (0.2, 0.21, 0.22), 0.55, 1.0)
CHROME = mat('Chrome', (0.65, 0.66, 0.68), 0.15, 1.0)

# ── handle: core + ribbed grip band ──────────────────────────────────────────
add_cyl('GripCore', HANDLE_R, 1.9, 0, verts=96, mat=GRIP)

ribs = []
RIB_N = 26
y0 = -0.425
for i in range(RIB_N):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.1215, minor_radius=0.0135,
        major_segments=64, minor_segments=12,
        rotation=(math.radians(90), 0, 0), location=(0, y0 + i * (0.85 / (RIB_N - 1)), 0))
    rib = bpy.context.active_object
    rib.data.materials.append(GRIP)
    ribs.append(rib)
bpy.ops.object.select_all(action='DESELECT')
for r in ribs: r.select_set(True)
bpy.context.view_layer.objects.active = ribs[0]
bpy.ops.object.join()
bpy.context.active_object.name = 'GripRibs'

for side in (1, -1):
    s = 'R' if side > 0 else 'L'
    add_cyl(f'SleeveChrome_{s}', HANDLE_R + 0.004, 0.16, side * 0.55, mat=CHROME)
    bpy.ops.mesh.primitive_cone_add(
        vertices=96, radius1=0.148 if side > 0 else 0.185,
        radius2=0.185 if side > 0 else 0.148, depth=0.15,
        rotation=(math.radians(90), 0, 0), location=(0, side * 0.66, 0))
    col = bpy.context.active_object
    col.name = f'CollarChrome_{s}'
    col.data.materials.append(CHROME)

# ── engraving cutters ────────────────────────────────────────────────────────
FONT = None
for cand in (os.path.join(HERE, 'BebasNeue-Regular.ttf'), r'C:\Windows\Fonts\impact.ttf'):
    if os.path.exists(cand):
        FONT = bpy.data.fonts.load(cand)
        break

def text_cutter(body, size, z, y_face, side):
    # front toward world +/-Y (outward), upright, correct reading from outside
    rot_z = math.radians(180) if side > 0 else 0
    bpy.ops.object.text_add(location=(0, y_face, z), rotation=(math.radians(90), 0, rot_z))
    t = bpy.context.active_object
    t.data.body = body
    if FONT: t.data.font = FONT
    t.data.size = size
    t.data.align_x = 'CENTER'
    t.data.align_y = 'CENTER'
    t.data.extrude = 0.014 # shallow: deep divots parallax-hide their white floors
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.active_object
    # font meshes ship with doubled verts + inconsistent normals — clean them
    # or the EXACT boolean silently no-ops
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0002)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return ob

# ── heads: hex prism + bevel + direct engraving + white divot floors ─────────
for side in (1, -1):
    s = 'R' if side > 0 else 'L'
    # spin 30° about the axis so a FLAT side faces down (rests, not balances)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6, radius=HEAD_R, depth=HEAD_DEPTH,
        rotation=(math.radians(90), math.radians(30), 0), location=(0, side * HEAD_Y, 0))
    head = bpy.context.active_object
    head.name = f'HeadRubber_{s}'
    head.data.materials.append(RUBBER)
    bev = head.modifiers.new('bevel', 'BEVEL')
    bev.width = BEVEL
    bev.segments = 4
    bev.limit_method = 'ANGLE'
    bpy.ops.object.modifier_apply(modifier='bevel')

    # cut ring groove + words straight into the outer hex face
    face_y = side * (HEAD_Y + HEAD_DEPTH / 2)
    cutters = []
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.455, minor_radius=0.012,
        rotation=(math.radians(90), 0, 0), location=(0, face_y, 0))
    cutters.append(bpy.context.active_object)
    cutters.append(text_cutter('IRONWORKS · KANSAS CITY', 0.05, 0.30, face_y, side))
    cutters.append(text_cutter('STRENGTH', 0.17, 0.085, face_y, side))
    cutters.append(text_cutter('LIVES HERE', 0.17, -0.125, face_y, side))

    for c in cutters:
        before = len(head.data.polygons)
        boo = head.modifiers.new('cut', 'BOOLEAN')
        boo.operation = 'DIFFERENCE'
        boo.solver = 'EXACT'
        boo.object = c
        bpy.ops.object.select_all(action='DESELECT')
        head.select_set(True)
        bpy.context.view_layer.objects.active = head
        bpy.ops.object.modifier_apply(modifier=boo.name)
        print(f'  cut {c.name}: {before} -> {len(head.data.polygons)} polys')
        bpy.data.objects.remove(c, do_unlink=True)

    # white material on the divot FLOORS only: outward-facing, recessed,
    # inside the ring — walls and everything else stay rubber
    head.data.materials.append(WHITE)
    mw = head.matrix_world
    rot = mw.to_3x3()
    painted = 0
    for poly in head.data.polygons:
        n = (rot @ poly.normal).normalized()
        c = mw @ poly.center
        recessed = (c.y * side) < (abs(face_y) - 0.002)
        near_face = (c.y * side) > (abs(face_y) - 0.06)
        inside_ring = (c.x ** 2 + c.z ** 2) ** 0.5 < 0.42
        # abs(): boolean floors come out with mixed winding — paint both signs,
        # walls are still excluded by the axis test. The small top line is too
        # fine for floor-only paint, so its whole divot goes white (c.z band).
        small_line = c.z > 0.26
        if (abs(n.y) > 0.9 or small_line) and recessed and near_face and inside_ring:
            poly.material_index = 1
            painted += 1
    print(f'HEAD {s}: {len(head.data.polygons)} polys, {painted} white divot floors')

# ── export ───────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUT), exist_ok=True)
for ob in scene.objects:
    ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_apply=True)
print('WROTE', os.path.abspath(OUT))
