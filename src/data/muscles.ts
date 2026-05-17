import type { MuscleId } from "../types";

export interface MuscleDefinition {
  id: MuscleId;
  label: string;
  shortLabel: string;
  region: "Torso" | "Brazos" | "Espalda" | "Piernas";
  baseRecoveryHours: number;
  suggestedExercises: string[];
}

export const MUSCLES: MuscleDefinition[] = [
  {
    id: "upperChest",
    label: "Pecho superior",
    shortLabel: "Pecho sup.",
    region: "Torso",
    baseRecoveryHours: 46,
    suggestedExercises: ["Press inclinado", "Aperturas inclinadas", "Press inclinado mancuernas"],
  },
  {
    id: "midChest",
    label: "Pecho medio",
    shortLabel: "Pecho med.",
    region: "Torso",
    baseRecoveryHours: 48,
    suggestedExercises: ["Press banca", "Aperturas planas", "Press maquina"],
  },
  {
    id: "lowerChest",
    label: "Pecho inferior",
    shortLabel: "Pecho inf.",
    region: "Torso",
    baseRecoveryHours: 46,
    suggestedExercises: ["Fondos", "Press declinado", "Cruce polea alta"],
  },
  {
    id: "frontDelts",
    label: "Deltoide anterior",
    shortLabel: "Delt. ant.",
    region: "Brazos",
    baseRecoveryHours: 38,
    suggestedExercises: ["Press militar", "Press Arnold", "Elevaciones frontales"],
  },
  {
    id: "sideDelts",
    label: "Deltoide lateral",
    shortLabel: "Delt. lat.",
    region: "Brazos",
    baseRecoveryHours: 34,
    suggestedExercises: ["Elevaciones laterales", "Remo al menton", "Press mancuernas"],
  },
  {
    id: "rearDelts",
    label: "Deltoide posterior",
    shortLabel: "Delt. post.",
    region: "Espalda",
    baseRecoveryHours: 36,
    suggestedExercises: ["Face pull", "Pajaros", "Reverse pec deck"],
  },
  {
    id: "tricepsLong",
    label: "Triceps cabeza larga",
    shortLabel: "Tri. larga",
    region: "Brazos",
    baseRecoveryHours: 38,
    suggestedExercises: ["Extension sobre cabeza", "Fondos", "Press cerrado"],
  },
  {
    id: "tricepsLateral",
    label: "Triceps cabeza lateral",
    shortLabel: "Tri. lat.",
    region: "Brazos",
    baseRecoveryHours: 34,
    suggestedExercises: ["Pushdown cuerda", "Press cerrado", "Fondos"],
  },
  {
    id: "tricepsMedial",
    label: "Triceps cabeza medial",
    shortLabel: "Tri. med.",
    region: "Brazos",
    baseRecoveryHours: 32,
    suggestedExercises: ["Pushdown agarre inverso", "Extension polea", "Press cerrado liviano"],
  },
  {
    id: "bicepsLong",
    label: "Biceps cabeza larga",
    shortLabel: "Bic. larga",
    region: "Brazos",
    baseRecoveryHours: 34,
    suggestedExercises: ["Curl inclinado", "Curl barra", "Curl bayesian"],
  },
  {
    id: "bicepsShort",
    label: "Biceps cabeza corta",
    shortLabel: "Bic. corta",
    region: "Brazos",
    baseRecoveryHours: 32,
    suggestedExercises: ["Curl predicador", "Curl concentrado", "Curl spider"],
  },
  {
    id: "forearms",
    label: "Antebrazos",
    shortLabel: "Anteb.",
    region: "Brazos",
    baseRecoveryHours: 28,
    suggestedExercises: ["Farmer walk", "Curl muneca", "Agarre estatico"],
  },
  {
    id: "abs",
    label: "Abdominales",
    shortLabel: "Core",
    region: "Torso",
    baseRecoveryHours: 30,
    suggestedExercises: ["Plancha", "Crunch cable", "Elevacion de piernas"],
  },
  {
    id: "traps",
    label: "Trapecio",
    shortLabel: "Trap.",
    region: "Espalda",
    baseRecoveryHours: 40,
    suggestedExercises: ["Encogimientos", "Remo alto", "Peso muerto"],
  },
  {
    id: "upperBack",
    label: "Espalda alta",
    shortLabel: "Esp. alta",
    region: "Espalda",
    baseRecoveryHours: 44,
    suggestedExercises: ["Face pull", "Remo alto", "Pajaros inclinados"],
  },
  {
    id: "midBack",
    label: "Espalda media",
    shortLabel: "Esp. media",
    region: "Espalda",
    baseRecoveryHours: 46,
    suggestedExercises: ["Remo barra", "Remo maquina", "Remo pecho apoyado"],
  },
  {
    id: "lats",
    label: "Dorsales",
    shortLabel: "Dorsal",
    region: "Espalda",
    baseRecoveryHours: 46,
    suggestedExercises: ["Dominadas", "Jalon al pecho", "Pullover"],
  },
  {
    id: "lowerBack",
    label: "Espalda baja",
    shortLabel: "Lumbar",
    region: "Espalda",
    baseRecoveryHours: 54,
    suggestedExercises: ["Hiperextensiones", "Buenos dias", "Peso muerto rumano"],
  },
  {
    id: "glutes",
    label: "Gluteos",
    shortLabel: "Gluteos",
    region: "Piernas",
    baseRecoveryHours: 52,
    suggestedExercises: ["Hip thrust", "Sentadilla", "Zancadas"],
  },
  {
    id: "quads",
    label: "Cuadriceps",
    shortLabel: "Quads",
    region: "Piernas",
    baseRecoveryHours: 54,
    suggestedExercises: ["Sentadilla", "Prensa", "Extension de piernas"],
  },
  {
    id: "hamstrings",
    label: "Isquiotibiales",
    shortLabel: "Isquios",
    region: "Piernas",
    baseRecoveryHours: 54,
    suggestedExercises: ["Peso muerto rumano", "Curl femoral", "Buenos dias"],
  },
  {
    id: "calves",
    label: "Pantorrillas",
    shortLabel: "Gemelos",
    region: "Piernas",
    baseRecoveryHours: 32,
    suggestedExercises: ["Elevacion de talon", "Gemelo sentado", "Saltos suaves"],
  },
];

export const MUSCLE_BY_ID = MUSCLES.reduce(
  (acc, muscle) => {
    acc[muscle.id] = muscle;
    return acc;
  },
  {} as Record<MuscleId, MuscleDefinition>,
);

const LEGACY_MUSCLE_ALIASES: Partial<Record<string, MuscleId>> = {
  chest: "midChest",
  shoulders: "frontDelts",
  biceps: "bicepsLong",
  triceps: "tricepsLateral",
};

export function normalizeMuscleId(muscleId: MuscleId | string): MuscleId {
  return LEGACY_MUSCLE_ALIASES[muscleId] ?? (muscleId as MuscleId);
}

export const SYNERGY_MAP: Partial<Record<MuscleId, Partial<Record<MuscleId, number>>>> = {
  upperChest: { midChest: 0.32, frontDelts: 0.34, tricepsLong: 0.18, tricepsLateral: 0.22 },
  midChest: { upperChest: 0.24, lowerChest: 0.22, frontDelts: 0.22, tricepsLateral: 0.28, tricepsMedial: 0.14 },
  lowerChest: { midChest: 0.3, tricepsLong: 0.24, tricepsLateral: 0.22, frontDelts: 0.1 },
  frontDelts: { sideDelts: 0.2, tricepsLong: 0.18, tricepsLateral: 0.12, upperChest: 0.12 },
  sideDelts: { frontDelts: 0.16, rearDelts: 0.12, traps: 0.14 },
  rearDelts: { midBack: 0.26, upperBack: 0.2, traps: 0.16 },
  tricepsLong: { tricepsLateral: 0.38, tricepsMedial: 0.3, lowerChest: 0.12 },
  tricepsLateral: { tricepsLong: 0.35, tricepsMedial: 0.24, midChest: 0.1 },
  tricepsMedial: { tricepsLong: 0.3, tricepsLateral: 0.25 },
  bicepsLong: { bicepsShort: 0.42, forearms: 0.25, lats: 0.12 },
  bicepsShort: { bicepsLong: 0.42, forearms: 0.2 },
  upperBack: { midBack: 0.28, traps: 0.26, rearDelts: 0.22 },
  midBack: { upperBack: 0.25, lats: 0.24, rearDelts: 0.18, traps: 0.14 },
  lats: { bicepsLong: 0.22, bicepsShort: 0.16, midBack: 0.25, forearms: 0.15 },
  lowerBack: { glutes: 0.25, hamstrings: 0.25 },
  traps: { upperBack: 0.2, midBack: 0.14, rearDelts: 0.12 },
  glutes: { quads: 0.3, hamstrings: 0.35, lowerBack: 0.15 },
  quads: { glutes: 0.25, calves: 0.16 },
  hamstrings: { glutes: 0.35, lowerBack: 0.18 },
  calves: { quads: 0.12, hamstrings: 0.1 },
};
