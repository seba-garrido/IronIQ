import { MUSCLE_BY_ID, MUSCLES } from "../data/muscles";
import {
  calculateNutritionForDate,
  getReadinessAdvice,
  getWellnessForDate,
  recoveryBandName,
} from "./recovery";
import type { AppState, MuscleId, MuscleRecovery } from "../types";

interface CoachContext {
  state: AppState;
  selectedDate: string;
  recoveryMap: Record<MuscleId, MuscleRecovery>;
  selectedMuscle: MuscleId;
}

export function buildLLMPayload({ state, selectedDate, recoveryMap, selectedMuscle }: CoachContext) {
  const totals = calculateNutritionForDate(state, selectedDate);
  const wellness = getWellnessForDate(state, selectedDate);
  const selectedRecovery = recoveryMap[selectedMuscle];
  const muscles = MUSCLES.map((muscle) => {
    const recovery = recoveryMap[muscle.id];
    return {
      id: muscle.id,
      label: muscle.label,
      recovery: recovery.recovery,
      status: recoveryBandName(recovery.recovery),
      hours_left: recovery.hoursLeft,
      weekly_sets: recovery.weeklySets,
      last_trained: recovery.lastTrained ?? null,
    };
  });

  return {
    date: selectedDate,
    user: state.profile,
    nutrition: {
      totals,
      target_calories: state.profile.calorieTarget,
      target_protein: state.profile.proteinTarget,
      supplements: state.supplements.filter((item) => item.date === selectedDate),
    },
    wearable: wellness,
    selected_muscle: {
      id: selectedMuscle,
      label: MUSCLE_BY_ID[selectedMuscle].label,
      recovery: selectedRecovery.recovery,
      hours_left: selectedRecovery.hoursLeft,
      factors: selectedRecovery.factors,
    },
    muscles,
    safety_rule:
      "Responder como coach fitness, no médico. Indicar que la recuperación es una estimación y sugerir consultar a un profesional ante dolor agudo.",
  };
}

export function generateCoachReply(question: string, context: CoachContext) {
  const payload = buildLLMPayload(context);
  const weakest = [...MUSCLES]
    .map((muscle) => context.recoveryMap[muscle.id])
    .sort((a, b) => a.recovery - b.recovery)
    .slice(0, 3);
  const ready = [...MUSCLES]
    .map((muscle) => context.recoveryMap[muscle.id])
    .filter((item) => item.recovery >= 75)
    .sort((a, b) => b.recovery - a.recovery)
    .slice(0, 4);
  const selected = context.recoveryMap[context.selectedMuscle];
  const selectedLabel = MUSCLE_BY_ID[context.selectedMuscle].label;
  const totals = calculateNutritionForDate(context.state, context.selectedDate);
  const proteinDelta = Math.round(totals.protein - context.state.profile.proteinTarget);
  const calorieDelta = Math.round(totals.calories - context.state.profile.calorieTarget);
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("rutina") || lowerQuestion.includes("entreno") || lowerQuestion.includes("hoy")) {
    const readyLabels = ready.map((item) => MUSCLE_BY_ID[item.muscleId].label).join(", ");
    const blockedLabels = weakest.map((item) => MUSCLE_BY_ID[item.muscleId].label).join(", ");

    return `Hoy priorizaría ${readyLabels || "movilidad y técnica"}, evitando cargar fuerte ${blockedLabels}. Si quieres una sesión de 45 minutos: 8 minutos de calentamiento, 3 ejercicios principales para los músculos verdes, 2 accesorios moderados y cierre con movilidad. Mantén RPE 7-8 salvo que el calentamiento muestre fatiga.`;
  }

  if (lowerQuestion.includes("comida") || lowerQuestion.includes("prote") || lowerQuestion.includes("calor")) {
    const calorieText = calorieDelta >= 0 ? `${calorieDelta} kcal sobre objetivo` : `${Math.abs(calorieDelta)} kcal bajo objetivo`;
    const proteinText = proteinDelta >= 0 ? `${proteinDelta} g sobre objetivo` : `${Math.abs(proteinDelta)} g bajo objetivo`;

    return `Nutricionalmente vas ${calorieText} y ${proteinText} de proteína. Para recuperación muscular, lo más sensible ahora es cerrar la proteína diaria y no profundizar demasiado el déficit si planeas entrenar pesado mañana.`;
  }

  if (lowerQuestion.includes("huawei") || lowerQuestion.includes("reloj") || lowerQuestion.includes("pasos")) {
    return `La lectura del reloj se usaría como una señal adicional: pasos, calorías activas, sueño, HRV y entrenamientos importados. En esta versión ya está modelado el flujo con un importador demo; en producción conviene ir por Huawei Health Kit o Health Connect, no por Bluetooth directo al reloj.`;
  }

  return `${selectedLabel} está en ${selected.recovery}% (${recoveryBandName(selected.recovery)}). Mi lectura: ${getReadinessAdvice(selected)} Factores principales: ${selected.factors.slice(0, 3).join("; ")}. Como estimación, faltan cerca de ${selected.hoursLeft} h para volver a verde sólido. Payload estructurado listo para LLM: ${Object.keys(payload).join(", ")}.`;
}
