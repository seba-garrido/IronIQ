import { MUSCLE_BY_ID, MUSCLES, normalizeMuscleId } from "../data/muscles";
import { calculateNutritionForDate, getWellnessForDate, toISODate } from "./recovery";
import type { AppState, MuscleId, MuscleRecovery, NutritionTotals } from "../types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function getDateRangeEnding(selectedDate: string, days: number) {
  const end = new Date(`${selectedDate}T12:00:00`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - 1 - index));
    return toISODate(date);
  });
}

export function getSetCount(workout: AppState["workouts"][number]) {
  return workout.setDetails?.length || workout.sets;
}

export function calculateIronIQIndex(
  state: AppState,
  selectedDate: string,
  recoveryMap: Record<MuscleId, MuscleRecovery>,
) {
  const nutrition = calculateNutritionForDate(state, selectedDate);
  const wellness = getWellnessForDate(state, selectedDate);
  const recoveries = Object.values(recoveryMap);
  const averageRecovery = recoveries.reduce((total, item) => total + item.recovery, 0) / recoveries.length;
  const lowestRecovery = Math.min(...recoveries.map((item) => item.recovery));

  const calorieRatio = state.profile.calorieTarget ? nutrition.calories / state.profile.calorieTarget : 1;
  const proteinRatio = state.profile.proteinTarget ? nutrition.protein / state.profile.proteinTarget : 1;
  const calorieScore = clamp(100 - Math.abs(1 - calorieRatio) * 115, 0, 100);
  const proteinScore = clamp(proteinRatio * 100, 0, 115);
  const nutritionScore = clamp(calorieScore * 0.45 + Math.min(100, proteinScore) * 0.55, 0, 100);
  const sleepScore = clamp((wellness.sleepHours / 8) * 100, 0, 100);
  const activityScore =
    wellness.steps === 0 ? 68 : wellness.steps > 15000 ? 72 : wellness.steps > 5000 ? 92 : 76;

  const index = Math.round(
    averageRecovery * 0.42 + lowestRecovery * 0.13 + nutritionScore * 0.23 + sleepScore * 0.16 + activityScore * 0.06,
  );

  return {
    index: clamp(index, 0, 100),
    averageRecovery: Math.round(averageRecovery),
    nutritionScore: Math.round(nutritionScore),
    sleepScore: Math.round(sleepScore),
  };
}

export function getWeeklyTrainingDistribution(state: AppState, selectedDate: string) {
  const dates = getDateRangeEnding(selectedDate, 7);
  const dateSet = new Set(dates);
  const byMuscle = new Map<MuscleId, number>();
  const daily = dates.map((date) => ({
    date,
    sets: state.workouts
      .filter((workout) => workout.date === date)
      .reduce((total, workout) => total + getSetCount(workout), 0),
  }));

  state.workouts.forEach((workout) => {
    if (!dateSet.has(workout.date)) return;
    const muscleId = normalizeMuscleId(workout.muscleId);
    byMuscle.set(muscleId, (byMuscle.get(muscleId) ?? 0) + getSetCount(workout));
  });

  return {
    dates,
    daily,
    muscles: MUSCLES.map((muscle) => ({
      muscleId: muscle.id,
      label: muscle.shortLabel,
      sets: byMuscle.get(muscle.id) ?? 0,
    }))
      .filter((item) => item.sets > 0)
      .sort((a, b) => b.sets - a.sets),
  };
}

export function getNutritionHistory(state: AppState, selectedDate: string) {
  return getDateRangeEnding(selectedDate, 7).map((date) => ({
    date,
    totals: calculateNutritionForDate(state, date),
  }));
}

export function getMacroCalories(totals: NutritionTotals) {
  return {
    protein: totals.protein * 4,
    carbs: totals.carbs * 4,
    fat: totals.fat * 9,
  };
}

export function getOvertrainingAlerts(
  state: AppState,
  selectedDate: string,
  recoveryMap: Record<MuscleId, MuscleRecovery>,
) {
  const distribution = getWeeklyTrainingDistribution(state, selectedDate);
  const totalWeeklySets = distribution.muscles.reduce((total, item) => total + item.sets, 0);
  const alerts: Array<{ title: string; detail: string; severity: "high" | "medium" | "low" }> = [];

  distribution.muscles.forEach((item) => {
    const recovery = recoveryMap[item.muscleId];
    if (item.sets >= 18) {
      alerts.push({
        title: `${MUSCLE_BY_ID[item.muscleId].shortLabel}: volumen alto`,
        detail: `${item.sets} series en 7 días. Baja intensidad o reparte el estímulo.`,
        severity: "high",
      });
    } else if (item.sets >= 12 && recovery?.recovery < 55) {
      alerts.push({
        title: `${MUSCLE_BY_ID[item.muscleId].shortLabel}: fatiga acumulada`,
        detail: `${item.sets} series y ${recovery.recovery}% recuperado. Conviene evitar fallo muscular.`,
        severity: "medium",
      });
    }
  });

  const getSets = (muscleId: MuscleId) => distribution.muscles.find((item) => item.muscleId === muscleId)?.sets ?? 0;
  const pushSets =
    getSets("upperChest") +
    getSets("midChest") +
    getSets("lowerChest") +
    getSets("frontDelts") +
    getSets("sideDelts") +
    getSets("tricepsLong") +
    getSets("tricepsLateral") +
    getSets("tricepsMedial");
  const pullSets =
    getSets("upperBack") + getSets("midBack") + getSets("lats") + getSets("bicepsLong") + getSets("bicepsShort");

  if (pushSets >= 14 && pullSets > 0 && pushSets / pullSets > 1.6) {
    alerts.push({
      title: "Desbalance push/pull",
      detail: `${pushSets} series de empuje vs ${pullSets} de tirón. Suma espalda o reduce presses.`,
      severity: "medium",
    });
  }

  if (totalWeeklySets >= 70) {
    alerts.push({
      title: "Carga semanal muy alta",
      detail: `${totalWeeklySets} series en 7 días. Revisa sueño, dolor y rendimiento antes de subir volumen.`,
      severity: "high",
    });
  }

  return alerts.slice(0, 4);
}

export function getTrainingSuggestion(
  state: AppState,
  selectedDate: string,
  recoveryMap: Record<MuscleId, MuscleRecovery>,
) {
  const distribution = getWeeklyTrainingDistribution(state, selectedDate);
  const weeklySets = new Map(distribution.muscles.map((item) => [item.muscleId, item.sets]));
  const wellness = getWellnessForDate(state, selectedDate);
  const averageRecovery =
    Object.values(recoveryMap).reduce((total, item) => total + item.recovery, 0) / Object.values(recoveryMap).length;

  const focus = MUSCLES.map((muscle) => ({
    muscle,
    recovery: recoveryMap[muscle.id].recovery,
    sets: weeklySets.get(muscle.id) ?? 0,
  }))
    .filter((item) => item.recovery >= 70 && item.sets <= 12)
    .sort((a, b) => b.recovery - a.recovery || a.sets - b.sets)
    .slice(0, 3);

  const avoid = MUSCLES.map((muscle) => ({
    muscle,
    recovery: recoveryMap[muscle.id].recovery,
    hoursLeft: recoveryMap[muscle.id].hoursLeft,
  }))
    .filter((item) => item.recovery < 58)
    .sort((a, b) => a.recovery - b.recovery)
    .slice(0, 3);

  const intensity = wellness.sleepHours < 6.5 || averageRecovery < 66 ? "controlada" : "progresiva";
  const volume = intensity === "controlada" ? "2-3 ejercicios, RPE 6-7" : "3-5 ejercicios, RPE 7-8";

  return {
    title: focus.length ? `Enfoca ${focus.map((item) => item.muscle.shortLabel).join(", ")}` : "Recuperación activa",
    detail: focus.length
      ? `Volumen ${intensity}: ${volume}. Evita llegar al fallo si el calentamiento se siente pesado.`
      : "No hay grupos claramente listos. Prioriza movilidad, caminata y técnica liviana.",
    focus,
    avoid,
    exercises: focus.flatMap((item) => item.muscle.suggestedExercises.slice(0, 2)).slice(0, 5),
  };
}
