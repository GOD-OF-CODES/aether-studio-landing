"""
Aiko, the Aether Studio guide robot. Built entirely by script so she can be regenerated.

Run:
  /Applications/Blender.app/Contents/MacOS/Blender -b --python blender/aiko.py -- <project-root>

Writes:
  public/models/aiko.glb      (named nodes, animated in code on the page, no rig)
  public/aiko-still.png       (transparent still, used as the no-WebGL / reduced-motion fallback)
"""
import bpy, bmesh, sys, math, os
from mathutils import Vector

ROOT = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)

HEAD_C = Vector((0.0, 0.0, 1.35))
NECK_Z = 0.74


# ---------- materials ----------
def mat(name, color, rough=0.4, metal=0.0, coat=0.0, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.08
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_strength
    return m


PEARL = mat("Pearl", (0.86, 0.84, 0.92), rough=0.32, coat=1.0)
INDIGO = mat("Indigo", (0.05, 0.028, 0.24), rough=0.22, metal=0.35, coat=1.0)
GLASS = mat("Glass", (0.006, 0.006, 0.014), rough=0.06, metal=0.2, coat=1.0)
GOLD = mat("Gold", (1.0, 0.72, 0.3), rough=0.24, metal=1.0)
TEAL = mat("Teal", (0.02, 0.36, 0.34), rough=0.3, metal=0.2, coat=1.0)
DARK = mat("Dark", (0.03, 0.03, 0.045), rough=0.45, metal=0.8)
GLOW = mat("Glow", (0.3, 0.2, 0.9), rough=0.5, emit=(0.5, 0.3, 1.0), emit_strength=2.2)
FACE = mat("Face", (0, 0, 0), rough=1.0)


# ---------- helpers ----------
def activate(o):
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o


def finish(o, name, material, smooth=True):
    o.name = name
    o.data.name = name
    o.data.materials.clear()
    o.data.materials.append(material)
    if smooth:
        activate(o)
        bpy.ops.object.shade_smooth()
    return o


def sphere(name, material, loc, scale=(1, 1, 1), r=1.0, seg=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=rings)
    o = bpy.context.object
    o.scale = scale
    activate(o)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, name, material)


def cyl(name, material, loc, r=1.0, depth=1.0, rot=(0, 0, 0), verts=48, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object
    activate(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    finish(o, name, material)
    m = o.modifiers.new("bevel", "BEVEL")
    m.width = min(r, depth) * 0.18
    m.segments = 3
    m.limit_method = "ANGLE"
    return o


def torus(name, material, loc, major, minor, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=loc, rotation=rot,
                                     major_segments=64, minor_segments=14)
    o = bpy.context.object
    activate(o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(o, name, material)


def empty(name, loc):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    bpy.context.collection.objects.link(e)
    return e


def parent(child, par):
    bpy.context.view_layer.update()
    m = child.matrix_world.copy()
    child.parent = par
    child.matrix_world = m


def apply_mods(o):
    activate(o)
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


# ---------- rig-free hierarchy ----------
root = empty("Aiko", (0, 0, 0))
head = empty("Head", (0, 0, NECK_Z))
body_grp = empty("Torso", (0, 0, 0))
parent(head, root)
parent(body_grp, root)

# ---------- torso ----------
body = sphere("Body", PEARL, (0, 0, 0.06), scale=(0.5, 0.43, 0.62))
# the skirt: a teal flare, nod to the original Aiko's teal top
skirt = cyl("Skirt", TEAL, (0, 0, -0.3), r=0.56, r2=0.37, depth=0.42, verts=64)
hem = torus("Hem", GOLD, (0, 0, -0.5), 0.555, 0.018)
neck = cyl("Neck", DARK, (0, 0, 0.68), r=0.15, depth=0.2)
collar = torus("Collar", GOLD, (0, 0, 0.6), 0.25, 0.028)
thruster = cyl("Thruster", DARK, (0, 0, -0.6), r=0.2, r2=0.33, depth=0.24)
thr_glow = cyl("ThrusterGlow", GLOW, (0, 0, -0.725), r=0.17, depth=0.02)

core_z = 0.2
core_y = -0.43 * math.sqrt(1 - ((core_z - 0.06) / 0.62) ** 2)
tilt = math.radians(90 - 12)
core_ring = torus("CoreRing", GOLD, (0, core_y - 0.005, core_z), 0.105, 0.02, rot=(tilt, 0, 0))
core = cyl("Core", GLOW, (0, core_y + 0.012, core_z), r=0.09, depth=0.03, rot=(tilt, 0, 0))

for o in (body, skirt, hem, neck, collar, thruster, thr_glow, core_ring, core):
    parent(o, body_grp)

# shoulders and floating hands
for side, sx in (("L", 1), ("R", -1)):
    sh = sphere("Shoulder" + side, INDIGO, (sx * 0.47, 0, 0.3), scale=(0.11, 0.11, 0.11), seg=24, rings=12)
    parent(sh, body_grp)
    hand = empty("Hand" + side, (sx * 0.78, -0.12, -0.02))
    parent(hand, root)
    palm = sphere("Palm" + side, PEARL, hand.location, scale=(0.13, 0.11, 0.17), seg=32, rings=16)
    thumb = sphere("Thumb" + side, PEARL, hand.location + Vector((-sx * 0.1, -0.03, 0.03)),
                   scale=(0.055, 0.05, 0.075), seg=20, rings=10)
    cuff = torus("Cuff" + side, INDIGO, hand.location + Vector((0, 0, 0.13)), 0.085, 0.035)
    for o in (palm, thumb, cuff):
        parent(o, hand)

# ---------- head ----------
glass = sphere("Visor", GLASS, HEAD_C, scale=(0.64, 0.6, 0.62), seg=64, rings=32)

# hair helmet: a shell stretched downward into a bob, with the face opening cut out
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=HEAD_C, segments=96, ring_count=48)
hair = bpy.context.object
bm = bmesh.new()
bm.from_mesh(hair.data)
for v in bm.verts:
    v.co.x *= 0.7
    v.co.y *= 0.665
    v.co.z *= 0.69
    if v.co.z < 0:
        v.co.z *= 1.22          # the bob hangs below the jaw line
        v.co.x *= 1.0 + 0.06 * min(1.0, -v.co.z)
    if v.co.y > 0:
        v.co.y *= 1.05          # a little more volume at the back
bm.to_mesh(hair.data)
bm.free()
finish(hair, "Hair", INDIGO)
sol = hair.modifiers.new("solid", "SOLIDIFY")
sol.thickness = 0.045
sol.offset = -1
apply_mods(hair)


def cutter(loc, scale, bevel):
    bpy.ops.mesh.primitive_cube_add(size=2, location=loc)
    c = bpy.context.object
    c.scale = scale
    activate(c)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = c.modifiers.new("b", "BEVEL")
        b.width = bevel
        b.segments = 10
        apply_mods(c)
    return c


def cut(target, c):
    m = target.modifiers.new("cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.solver = "EXACT"
    m.object = c
    apply_mods(target)
    bpy.data.objects.remove(c, do_unlink=True)


# face opening: rounded window, open at the bottom so the side locks frame the face
cut(hair, cutter(HEAD_C + Vector((0, -0.75, -0.42)), (0.47, 0.6, 0.72), 0.2))
# flat hem under the bob
cut(hair, cutter(HEAD_C + Vector((0, 0, -1.72)), (2, 2, 1.0), 0))
activate(hair)
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))

# face screen: a spherical cap just proud of the glass; the page swaps in a shader for the eyes
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=HEAD_C, segments=48, ring_count=24)
face = bpy.context.object
bm = bmesh.new()
bm.from_mesh(face.data)
for v in bm.verts:
    v.co.x *= 0.648
    v.co.y *= 0.608
    v.co.z *= 0.628
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > -0.26], context="VERTS")
bm.to_mesh(face.data)
bm.free()
finish(face, "Face", FACE)

for o in (glass, hair, face):
    parent(o, head)

for side, sx in (("L", 1), ("R", -1)):
    pod = cyl("Ear" + side, PEARL, HEAD_C + Vector((sx * 0.7, 0.02, -0.06)), r=0.14, depth=0.1,
              rot=(0, math.radians(90), 0))
    ring = torus("EarGlow" + side, GLOW, HEAD_C + Vector((sx * 0.752, 0.02, -0.06)), 0.075, 0.016,
                 rot=(0, math.radians(90), 0))
    parent(pod, head)
    parent(ring, head)

# hair clip: a small gold bar on the fringe, like the original's
clip = cyl("Clip", GOLD, HEAD_C + Vector((0.36, -0.468, 0.36)), r=0.022, depth=0.2, rot=(0, math.radians(72), math.radians(-32)), verts=16)
parent(clip, head)

# ---------- export ----------
os.makedirs(os.path.join(ROOT, "public", "models"), exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=os.path.join(ROOT, "public", "models", "aiko.glb"),
    export_format="GLB",
    export_apply=True,
    export_yup=True,
)

# ---------- still render (not exported) ----------
face.hide_render = True
EYE = mat("EyeGlow", (1, 0.4, 0.3), emit=(1.0, 0.36, 0.26), emit_strength=2.4)
for sx in (1, -1):
    sphere("RenderEye", EYE, HEAD_C + Vector((sx * 0.2, -0.585, 0.0)), scale=(0.075, 0.03, 0.12), seg=24, rings=12)
sphere("RenderMouth", EYE, HEAD_C + Vector((0, -0.575, -0.2)), scale=(0.06, 0.03, 0.018), seg=24, rings=12)

root.rotation_euler = (0, 0, math.radians(-24))
head.rotation_euler = (math.radians(-4), math.radians(6), math.radians(8))
bpy.data.objects["HandR"].location += Vector((-0.1, -0.1, 0.5))
bpy.data.objects["HandR"].rotation_euler = (0, math.radians(-25), 0)


def light(name, loc, energy, color, size):
    bpy.ops.object.light_add(type="AREA", location=loc)
    l = bpy.context.object
    l.name = name
    l.data.energy = energy
    l.data.color = color
    l.data.size = size
    d = Vector((0, 0, 0.7)) - Vector(loc)
    l.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


light("Key", (-3.2, -4.0, 3.6), 620, (1.0, 0.93, 0.86), 4)
light("Rim", (3.4, 3.0, 2.2), 1400, (0.55, 0.4, 1.0), 3)
light("Fill", (3.0, -3.0, -0.5), 220, (1.0, 0.72, 0.45), 5)
light("Top", (0, 0.5, 5), 160, (0.8, 0.85, 1.0), 4)

bpy.ops.object.camera_add(location=(0, -7.4, 0.95))
cam = bpy.context.object
cam.rotation_euler = (math.radians(88.6), 0, 0)
cam.data.lens = 70
sc = bpy.context.scene
sc.camera = cam
world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.018, 0.04, 1)
sc.world = world
sc.render.film_transparent = True
sc.render.resolution_x = 1100
sc.render.resolution_y = 1400
sc.view_settings.view_transform = "Standard"
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.render.filepath = os.path.join(ROOT, "public", "aiko-still.png")
bpy.ops.render.render(write_still=True)
print("AIKO_OK")
