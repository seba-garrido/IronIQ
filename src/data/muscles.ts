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
    id: "chest",
    label: "Pecho",
    shortLabel: "Pecho",
    region: "Torso",
    baseRecoveryHours: 48,
    suggestedExercises: ["Press banca", "Press inclinado", "Aperturas"],
  },
  {
    id: "shoulders",
    label: "Hombros",
    shortLabel: "Hombros",
    region: "Brazos",
    baseRecoveryHours: 42,
    suggestedExercises: ["Press militar", "Elevaciones laterales", "Face pull"],
  },
  {
    id: "triceps",
    label: "Tríceps",
    shortLabel: "Tríceps",
    region: "Brazos",
    baseRecoveryHours: 36,
    suggestedExercises: ["Fondos", "Extensión de tríceps", "Press cerrado"],
  },
  {
    id: "biceps",
    label: "Bíceps",
    shortLabel: "Bíceps",
    region: "Brazos",
    baseRecoveryHours: 34,
    suggestedExercises: ["Curl barra", "Curl martillo", "Curl inclinado"],
  },
  {
    id: "forearms",
    label: "Antebrazos",
    shortLabel: "Anteb.",
    region: "Brazos",
    baseRecoveryHours: 28,
    suggestedExercises: ["Farmer walk", "Curl muñeca", "Agarre estático"],
  },
  {
    id: "abs",
    label: "Abdominales",
    shortLabel: "Core",
    region: "Torso",
    baseRecoveryHours: 30,
    suggestedExercises: ["Plancha", "Crunch cable", "Elevación de piernas"],
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
    baseRecoveryHours: 46,
    suggestedExercises: ["Remo barra", "Remo máquina", "Pájaros"],
  },
  {
    id: "lats",
    label: "Dorsales",
    shortLabel: "Dorsal",
    region: "Espalda",
    baseRecoveryHours: 46,
    suggestedExercises: ["Dominadas", "Jalón al pecho", "Pullover"],
  },
  {
    id: "lowerBack",
    label: "Zona lumbar",
    shortLabel: "Lumbar",
    region: "Espalda",
    baseRecoveryHours: 54,
    suggestedExercises: ["Hiperextensiones", "Buenos días", "Peso muerto rumano"],
  },
  {
    id: "glutes",
    label: "Glúteos",
    shortLabel: "Glúteos",
    region: "Piernas",
    baseRecoveryHours: 52,
    suggestedExercises: ["Hip thrust", "Sentadilla", "Zancadas"],
  },
  {
    id: "quads",
    label: "Cuádriceps",
    shortLabel: "Quads",
    region: "Piernas",
    baseRecoveryHours: 54,
    suggestedExercises: ["Sentadilla", "Prensa", "Extensión de piernas"],
  },
  {
    id: "hamstrings",
    label: "Isquiotibiales",
    shortLabel: "Isquios",
    region: "Piernas",
    baseRecoveryHours: 54,
    suggestedExercises: ["Peso muerto rumano", "Curl femoral", "Buenos días"],
  },
  {
    id: "calves",
    label: "Pantorrillas",
    shortLabel: "Gemelos",
    region: "Piernas",
    baseRecoveryHours: 32,
    suggestedExercises: ["Elevación de talón", "Gemelo sentado", "Saltos suaves"],
  },
];

export const MUSCLE_BY_ID = MUSCLES.reduce(
  (acc, muscle) => {
    acc[muscle.id] = muscle;
    return acc;
  },
  {} as Record<MuscleId, MuscleDefinition>,
);

export const SYNERGY_MAP: Partial<Record<MuscleId, Partial<Record<MuscleId, number>>>> = {
  chest: { shoulders: 0.35, triceps: 0.45 },
  shoulders: { triceps: 0.25, traps: 0.2 },
  triceps: { chest: 0.18, shoulders: 0.2 },
  biceps: { forearms: 0.25, lats: 0.15 },
  upperBack: { lats: 0.35, biceps: 0.2, traps: 0.25 },
  lats: { biceps: 0.3, upperBack: 0.25, forearms: 0.15 },
  lowerBack: { glutes: 0.25, hamstrings: 0.25 },
  glutes: { quads: 0.3, hamstrings: 0.35, lowerBack: 0.15 },
  quads: { glutes: 0.25, calves: 0.16 },
  hamstrings: { glutes: 0.35, lowerBack: 0.18 },
  calves: { quads: 0.12, hamstrings: 0.1 },
};
