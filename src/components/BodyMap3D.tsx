import { Rotate3D } from "lucide-react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { recoveryBandColor } from "../engine/recovery";
import type { MuscleId, MuscleRecovery, Profile } from "../types";

interface BodyMap3DProps {
  profile: Profile;
  recoveryMap: Record<MuscleId, MuscleRecovery>;
  selectedMuscle: MuscleId;
  onSelectMuscle: (muscleId: MuscleId) => void;
}

const MODEL_URL = "/models/z-anatomy-fitness-muscles.glb";

const muscleRules: Array<[MuscleId, string[]]> = [
  ["upperChest", ["clavicular head of pectoralis major"]],
  ["lowerChest", ["abdominal head of pectoralis major"]],
  ["midChest", ["sternocostal head of pectoralis major", "pectoralis minor", "pectoralis"]],
  ["frontDelts", ["clavicular part of deltoid", "subscapularis", "coracobrachialis"]],
  ["sideDelts", ["acromial part of deltoid", "supraspinatus"]],
  ["rearDelts", ["scapular spinal part of deltoid"]],
  ["bicepsLong", ["long head of biceps brachii", "brachialis"]],
  ["bicepsShort", ["short head of biceps brachii"]],
  ["tricepsLong", ["long head of triceps brachii"]],
  ["tricepsLateral", ["lateral head of triceps brachii", "anconeus"]],
  ["tricepsMedial", ["medial head of triceps brachii"]],
  [
    "forearms",
    [
      "brachioradialis",
      "pronator",
      "supinator",
      "flexor carpi",
      "extensor carpi",
      "flexor digitorum",
      "extensor digitorum",
    ],
  ],
  ["abs", ["rectus abdominis", "oblique", "transversus abdominis", "serratus anterior"]],
  ["traps", ["descending part of trapezius", "transverse part of trapezius", "ascending part of trapezius"]],
  ["upperBack", ["rhomboid minor", "levator scapulae"]],
  ["midBack", ["rhomboid major", "teres major", "teres minor", "infraspinatus"]],
  ["lats", ["latissimus dorsi"]],
  ["lowerBack", ["iliocostalis", "longissimus", "multifidus", "quadratus lumborum"]],
  ["glutes", ["gluteus", "tensor fasciae latae"]],
  ["quads", ["rectus femoris", "vastus", "sartorius"]],
  ["hamstrings", ["biceps femoris", "semitendinosus", "semimembranosus", "adductor", "gracilis"]],
  ["calves", ["gastrocnemius", "soleus", "tibialis anterior", "fibularis", "peroneus"]],
];

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[_().-]/g, " ");
}

function muscleIdFromName(name: string): MuscleId | undefined {
  const normalized = normalizeName(name);
  return muscleRules.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0];
}

function materialForMesh(name: string, recoveryMap: Record<MuscleId, MuscleRecovery>) {
  const muscleId = muscleIdFromName(name);
  const isTendon = normalizeName(name).includes("tendon");
  const color = muscleId ? recoveryBandColor(recoveryMap[muscleId]?.recovery ?? 100) : isTendon ? "#ded3c4" : "#b7473e";

  return new THREE.MeshStandardMaterial({
    color,
    roughness: isTendon ? 0.72 : 0.42,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export function BodyMap3D({ profile, recoveryMap, selectedMuscle, onSelectMuscle }: BodyMap3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const muscleMeshesRef = useRef<THREE.Mesh[]>([]);
  const selectedRef = useRef(selectedMuscle);
  const recoveryMapRef = useRef(recoveryMap);
  const onSelectRef = useRef(onSelectMuscle);

  useEffect(() => {
    selectedRef.current = selectedMuscle;
    recoveryMapRef.current = recoveryMap;
    onSelectRef.current = onSelectMuscle;
  }, [selectedMuscle, recoveryMap, onSelectMuscle]);

  useEffect(() => {
    if (!canvasRef.current || !wrapRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.22, 5.25);

    const ambient = new THREE.HemisphereLight("#ffffff", "#64766d", 1.75);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight("#fff4e4", 2.6);
    keyLight.position.set(2.4, 4.2, 3.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#b9e7dd", 1.4);
    rimLight.position.set(-2.8, 2.2, -3);
    scene.add(rimLight);

    const bodyGroup = new THREE.Group();
    bodyGroup.rotation.y = -0.28;
    groupRef.current = bodyGroup;
    scene.add(bodyGroup);

    const grid = new THREE.GridHelper(2.8, 10, "#c9d2c8", "#e0e6df");
    grid.position.y = -1.34;
    grid.material.opacity = 0.18;
    grid.material.transparent = true;
    scene.add(grid);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = maxDimension > 0 ? 2.5 / maxDimension : 1;

        model.position.sub(center);
        model.scale.setScalar(scale);
        model.rotation.y = Math.PI;
        model.updateMatrixWorld(true);

        const mappedMeshes: THREE.Mesh[] = [];

        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = false;
          child.receiveShadow = false;
          child.userData.muscleId = muscleIdFromName(child.name);
          child.userData.baseName = child.name;
          child.material = materialForMesh(child.name, recoveryMapRef.current);
          if (child.userData.muscleId) mappedMeshes.push(child);
        });

        muscleMeshesRef.current = mappedMeshes;
        bodyGroup.add(model);
      },
      undefined,
      (error) => {
        console.error("Could not load anatomy GLB", error);
      },
    );

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startRotation = 0;
    let animationFrame = 0;

    const resize = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(420, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapRef.current);
    resize();

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      startRotation = bodyGroup.rotation.y;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerDown) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) moved = true;
      bodyGroup.rotation.y = startRotation + deltaX * 0.01;
      bodyGroup.rotation.x = Math.max(-0.14, Math.min(0.14, deltaY * 0.0025));
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointerDown = false;
      if (moved || !muscleMeshesRef.current.length) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(muscleMeshesRef.current, false);
      const muscleId = hits[0]?.object.userData.muscleId as MuscleId | undefined;
      if (muscleId) onSelectRef.current(muscleId);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    const render = () => {
      muscleMeshesRef.current.forEach((mesh) => {
        const muscleId = mesh.userData.muscleId as MuscleId | undefined;
        if (!muscleId || !(mesh.material instanceof THREE.MeshStandardMaterial)) return;
        const targetColor = new THREE.Color(recoveryBandColor(recoveryMapRef.current[muscleId]?.recovery ?? 100));
        mesh.material.color.lerp(targetColor, 0.16);
        mesh.material.emissive = new THREE.Color(muscleId === selectedRef.current ? "#142516" : "#000000");
        mesh.material.emissiveIntensity = muscleId === selectedRef.current ? 0.34 : 0;
      });

      bodyGroup.rotation.y += pointerDown ? 0 : 0.00045;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      renderer.dispose();
      disposeObject(bodyGroup);
      scene.clear();
    };
  }, []);

  useEffect(() => {
    const heightScale = Math.max(0.92, Math.min(1.12, profile.heightCm / 176));
    const widthScale = Math.max(0.92, Math.min(1.15, profile.weightKg / 82));
    groupRef.current?.scale.set(widthScale, heightScale, widthScale);
  }, [profile.heightCm, profile.weightKg]);

  return (
    <div className="body-scene" ref={wrapRef}>
      <canvas ref={canvasRef} aria-label="Cuerpo 3D interactivo" />
      <div className="scene-hint">
        <Rotate3D size={16} />
        <span>Atlas muscular 3D</span>
      </div>
    </div>
  );
}
