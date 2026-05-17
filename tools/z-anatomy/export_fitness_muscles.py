import bpy
import math
import os

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "z-anatomy-fitness-muscles.glb"))

FITNESS_KEYWORDS = [
    "pectoralis",
    "serratus anterior",
    "rectus abdominis",
    "external oblique",
    "internal oblique",
    "transversus abdominis",
    "deltoid",
    "biceps brachii",
    "brachialis",
    "triceps brachii",
    "brachioradialis",
    "pronator teres",
    "supinator",
    "flexor carpi",
    "extensor carpi",
    "flexor digitorum",
    "extensor digitorum",
    "trapezius",
    "latissimus dorsi",
    "rhomboid",
    "teres major",
    "teres minor",
    "infraspinatus",
    "supraspinatus",
    "subscapularis",
    "erector spinae",
    "iliocostalis",
    "longissimus",
    "multifidus",
    "quadratus lumborum",
    "gluteus",
    "tensor fasciae latae",
    "rectus femoris",
    "vastus",
    "sartorius",
    "gracilis",
    "adductor longus",
    "adductor brevis",
    "adductor magnus",
    "biceps femoris",
    "semitendinosus",
    "semimembranosus",
    "gastrocnemius",
    "soleus",
    "tibialis anterior",
    "fibularis",
    "peroneus",
    "sternocleidomastoid",
    "splenius",
    "masseter",
    "temporalis",
    "occipitofrontalis",
    "frontal belly",
    "occipital belly",
    "orbicularis",
    "buccinator",
    "zygomaticus",
    "risorius",
    "nasalis",
    "mentalis",
    "depressor",
    "levator labii",
    "platysma",
    "digastric",
    "stylohyoid",
    "mylohyoid",
]

EXCLUDED_SUFFIXES = (".ol", ".or", ".el", ".er", ".j", ".i")
EXCLUDED_WORDS = [
    "insertion",
    "origin",
    "nerve",
    "artery",
    "vein",
    "node",
    "lymph",
    "bursa",
    "fascia",
    "ligament",
    "capsule",
    "skin",
    "bone",
]

MATERIALS = {
    "muscle": bpy.data.materials.new("Recovery muscle material"),
    "tendon": bpy.data.materials.new("Tendon material"),
}
MATERIALS["muscle"].diffuse_color = (0.82, 0.25, 0.2, 1.0)
MATERIALS["tendon"].diffuse_color = (0.9, 0.82, 0.7, 1.0)


def collection_names(obj):
    return {collection.name for collection in obj.users_collection}


def is_muscle_candidate(obj):
    name = obj.name.lower()
    collections = collection_names(obj)
    if obj.type != "MESH":
        return False
    if "4: Muscular system" not in collections:
        return False
    if obj.name.endswith(EXCLUDED_SUFFIXES):
        return False
    if any(word in name for word in EXCLUDED_WORDS):
        return False
    return any(keyword in name for keyword in FITNESS_KEYWORDS)


def material_is_tendon(material):
    return material and "tendon" in material.name.lower()


selected = []
for obj in bpy.data.objects:
    obj.select_set(False)
    if not is_muscle_candidate(obj):
        continue

    selected.append(obj)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    has_tendon = any(material_is_tendon(slot.material) for slot in obj.material_slots)
    obj.data.materials.clear()
    obj.data.materials.append(MATERIALS["tendon" if has_tendon and len(obj.data.polygons) < 300 else "muscle"])

    obj.name = obj.name.replace(" muscle", "").replace(" muscle", "")
    obj.data.name = obj.name

print(f"SELECTED_MUSCLES={len(selected)}")
for obj in selected[:220]:
    print(obj.name)

if not selected:
    raise RuntimeError("No muscle objects selected for export")

root = bpy.data.objects.new("Z-Anatomy fitness muscle model", None)
bpy.context.collection.objects.link(root)
for obj in selected:
    obj.parent = root

root.rotation_euler[2] = math.radians(180)
root.scale = (1.0, 1.0, 1.0)
root.select_set(True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
)

print(f"EXPORTED={OUT}")
