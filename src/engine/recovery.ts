import { MUSCLE_BY_ID, MUSCLES, SYNERGY_MAP } from "../data/muscles";
import type {
  AppState,
  DailyWellness,
  MuscleId,
  MuscleRecovery,
  NutritionTotals,
  Profile,
  SupplementEntry,
  WorkoutEntry,
} from "../types";

const HOUR_MS = 1000 * 60 * 60;

export const emptyNutrition: NutritionTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export function createId(prefix: string) {
  if ("crypto" in window && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateWindow(centerDate: string, size = 7) {
  const center = new Date(`${centerDate}T12:00:00`);
  const start = new Date(center);
  start.setDate(start.getDate() - Math.floor(size / 2));

  return Array.from({ length: size }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return toISODate(item);
  });
}

export function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function calculateNutritionForDate(state: AppState, date: string): NutritionTotals {
  return state.foods
    .filter((food) => food.date === date)
    .reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fat: totals.fat + food.fat,
      }),
      emptyNutrition,
    );
}

export function getWellnessForDate(state: AppState, date: string): DailyWellness {
  return (
    state.wellness.find((item) => item.date === date) ?? {
      date,
      steps: 0,
      activeCalories: 0,
      sleepHours: state.profile.defaultSleepHours,
      sleepScore: Math.round(state.profile.defaultSleepHours * 10),
      source: "manual",
    }
  );
}

function getSupplementsImpact(supplements: SupplementEntry[]) {
  return Math.min(
    10,
    supplements.reduce((total, supplement) => total + supplement.recoveryImpact, 0),
  );
}

function getNutritionPenalty(profile: Profile, totals: NutritionTotals, wellness: DailyWellness) {
  const proteinRatio = profile.proteinTarget ? totals.protein / profile.proteinTarget : 1;
  const calorieRatio = profile.calorieTarget ? totals.calories / profile.calorieTarget : 1;
  let penalty = 0;

  if (proteinRatio < 0.65) penalty += 0.28;
  else if (proteinRatio < 0.85) penalty += 0.16;
  else if (proteinRatio >= 1) penalty -= 0.06;

  if (calorieRatio < 0.72) penalty += 0.24;
  else if (calorieRatio < 0.9) penalty += 0.12;
  else if (calorieRatio > 1.05) penalty -= 0.04;

  if (wellness.sleepHours < 6) penalty += 0.26;
  else if (wellness.sleepHours < 7) penalty += 0.12;
  else if (wellness.sleepHours >= 8) penalty -= 0.08;

  if (wellness.steps > 13000) penalty += 0.08;

  return Math.max(-0.16, Math.min(0.5, penalty));
}

function workoutLoad(workout: WorkoutEntry, profile: Profile) {
  const intensity = Math.max(0.6, workout.rpe / 8);
  const sourceFactor = workout.source === "manual" ? 1 : 0.82;
  const sets =
    workout.setDetails?.length
      ? workout.setDetails
      : Array.from({ length: workout.sets }, (_, index) => ({
          setNumber: index + 1,
          reps: workout.reps,
          weightKg: workout.weightKg,
        }));

  const setLoad = sets.reduce((total, set) => {
    const repFactor = Math.max(0.7, Math.min(1.45, set.reps / 8));
    const relativeLoad = set.weightKg > 0 ? set.weightKg / Math.max(45, profile.weightKg) : 0.25;
    const loadFactor = 1 + Math.min(0.85, relativeLoad * 0.45);
    return total + repFactor * intensity * loadFactor;
  }, 0);

  return setLoad * sourceFactor;
}

function addLoad(targets: Map<MuscleId, number>, muscleId: MuscleId, load: number) {
  targets.set(muscleId, (targets.get(muscleId) ?? 0) + load);
}

function getTrainingTargets(workout: WorkoutEntry, profile: Profile) {
  const targets = new Map<MuscleId, number>();
  const primaryLoad = workoutLoad(workout, profile);
  addLoad(targets, workout.muscleId, primaryLoad);

  const synergies = SYNERGY_MAP[workout.muscleId] ?? {};
  Object.entries(synergies).forEach(([muscleId, ratio]) => {
    addLoad(targets, muscleId as MuscleId, primaryLoad * (ratio ?? 0));
  });

  return targets;
}

function factorSummary(
  profile: Profile,
  totals: NutritionTotals,
  wellness: DailyWellness,
  supplementsImpact: number,
) {
  const factors: string[] = [];
  const proteinDelta = totals.protein - profile.proteinTarget;
  const calorieDelta = totals.calories - profile.calorieTarget;

  if (proteinDelta < -25) factors.push(`Proteína baja (${Math.round(Math.abs(proteinDelta))} g bajo objetivo)`);
  if (calorieDelta < -400) factors.push(`Déficit calórico alto (${Math.round(Math.abs(calorieDelta))} kcal)`);
  if (wellness.sleepHours < 7) factors.push(`Sueño corto (${wellness.sleepHours.toFixed(1)} h)`);
  if (wellness.steps > 12000) factors.push(`Alta carga diaria (${wellness.steps.toLocaleString("es-CL")} pasos)`);
  if (supplementsImpact >= 4) factors.push("Suplementación registrada ayuda levemente a la recuperación");
  if (factors.length === 0) factors.push("Nutrición y descanso dentro de rango");

  return factors;
}

export function calculateRecovery(state: AppState, selectedDate: string) {
  const selectedTime = new Date(`${selectedDate}T23:59:59`).getTime();
  const totals = calculateNutritionForDate(state, selectedDate);
  const wellness = getWellnessForDate(state, selectedDate);
  const supplements = state.supplements.filter((item) => item.date === selectedDate);
  const supplementImpact = getSupplementsImpact(supplements);
  const nutritionPenalty = getNutritionPenalty(state.profile, totals, wellness);
  const baseFactors = factorSummary(state.profile, totals, wellness, supplementImpact);

  const result = MUSCLES.map((muscle): MuscleRecovery => {
    let fatigue = 0;
    let weeklySets = 0;
    let lastTrained: string | undefined;
    let loadScore = 0;

    state.workouts.forEach((workout) => {
      const workoutTime = new Date(`${workout.date}T20:00:00`).getTime();
      if (workoutTime > selectedTime) return;

      const hoursAgo = Math.max(0, (selectedTime - workoutTime) / HOUR_MS);
      const targets = getTrainingTargets(workout, state.profile);
      const load = targets.get(muscle.id) ?? 0;
      if (load <= 0) return;

      const ageModifier = state.profile.age > 42 ? 0.12 : state.profile.age < 24 ? -0.05 : 0;
      const supplementModifier = -supplementImpact / 100;
      const recoveryHours =
        muscle.baseRecoveryHours * (1 + nutritionPenalty + ageModifier + supplementModifier);
      const decay = Math.exp(-hoursAgo / Math.max(18, recoveryHours * 0.62));

      fatigue += load * decay;
      loadScore += load;

      if (hoursAgo <= 24 * 7) {
        weeklySets += workout.muscleId === muscle.id ? workout.sets : Math.round(workout.sets * 0.35);
      }

      if (!lastTrained || workout.date > lastTrained) {
        lastTrained = workout.date;
      }
    });

    const fatigueScore = Math.min(96, fatigue * 8.2);
    const recovery = Math.round(Math.max(4, 100 - fatigueScore));
    const thresholdFatigue = 2.2;
    const halfWindow = Math.max(18, MUSCLE_BY_ID[muscle.id].baseRecoveryHours * (0.62 + nutritionPenalty));
    const hoursLeft =
      fatigue <= thresholdFatigue
        ? 0
        : Math.ceil(Math.min(96, Math.max(2, halfWindow * Math.log(fatigue / thresholdFatigue))));
    const confidenceBase = state.workouts.length > 2 ? 74 : 58;
    const confidence = Math.min(
      94,
      confidenceBase + (wellness.source !== "manual" ? 8 : 0) + (totals.calories > 0 ? 6 : 0),
    );
    const factors = [...baseFactors];

    if (lastTrained) factors.unshift(`Último estímulo: ${formatShortDate(lastTrained)}`);
    if (weeklySets > 16) factors.unshift(`Volumen semanal alto (${weeklySets} series estimadas)`);
    if (recovery > 82) factors.unshift("Listo para entrenar con buena probabilidad");

    return {
      muscleId: muscle.id,
      recovery,
      fatigue: Math.round(fatigueScore),
      hoursLeft,
      lastTrained,
      weeklySets,
      loadScore: Math.round(loadScore * 10) / 10,
      confidence,
      factors,
    };
  });

  return result.reduce(
    (acc, item) => {
      acc[item.muscleId] = item;
      return acc;
    },
    {} as Record<MuscleId, MuscleRecovery>,
  );
}

export function recoveryBandName(recovery: number) {
  if (recovery < 25) return "Crítico";
  if (recovery < 45) return "Muy cargado";
  if (recovery < 65) return "Recuperando";
  if (recovery < 82) return "Casi listo";
  return "Listo";
}

export function recoveryBandColor(recovery: number) {
  if (recovery < 25) return "#d83b2d";
  if (recovery < 45) return "#e46f2d";
  if (recovery < 65) return "#e0b72f";
  if (recovery < 82) return "#9ccf56";
  return "#2e9d62";
}

export function getReadinessAdvice(recovery: MuscleRecovery) {
  if (recovery.recovery < 25) {
    return "Evita trabajo intenso. Prioriza descanso, movilidad suave y sueño.";
  }
  if (recovery.recovery < 45) {
    return "Entrena alrededor de este músculo o usa solo técnica liviana.";
  }
  if (recovery.recovery < 65) {
    return "Puedes hacer volumen moderado si la molestia subjetiva es baja.";
  }
  if (recovery.recovery < 82) {
    return "Buen candidato para accesorios o intensidad controlada.";
  }
  return "Listo para una sesión exigente si el calentamiento se siente bien.";
}
