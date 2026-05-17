import bpy
from collections import Counter

mesh_objects = [obj for obj in bpy.data.objects if obj.type == "MESH"]
print(f"MESH_COUNT={len(mesh_objects)}")
print(f"OBJECT_COUNT={len(bpy.data.objects)}")

collections = Counter()
materials = Counter()

for obj in mesh_objects:
    for collection in obj.users_collection:
        collections[collection.name] += 1
    for material_slot in obj.material_slots:
        if material_slot.material:
            materials[material_slot.material.name] += 1

print("COLLECTIONS_TOP")
for name, count in collections.most_common(80):
    print(f"{count}\t{name}")

print("MATERIALS_TOP")
for name, count in materials.most_common(80):
    print(f"{count}\t{name}")

print("OBJECTS_SAMPLE")
for obj in mesh_objects[:300]:
    collection_names = ",".join(collection.name for collection in obj.users_collection)
    material_names = ",".join(slot.material.name for slot in obj.material_slots if slot.material)
    print(f"{obj.name}\t{collection_names}\t{material_names}")
