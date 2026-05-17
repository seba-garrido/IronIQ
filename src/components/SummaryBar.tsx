import { Activity, BrainCircuit, Flame, Target, Watch, Zap } from "lucide-react";
import { MUSCLE_BY_ID } from "../data/muscles";
import { calculateIronIQIndex } from "../engine/insights";
import { calculateNutritionForDate, getWellnessForDate } from "../engine/recovery";
import type { AppState, MuscleId, MuscleRecovery } from "../types";

interface SummaryBarProps {
  state: AppState;
  selectedDate: string;
  recoveryMap: Record<MuscleId, MuscleRecovery>;
}

export function SummaryBar({ state, selectedDate, recoveryMap }: SummaryBarProps) {
  const nutrition = calculateNutritionForDate(state, selectedDate);
  const wellness = getWellnessForDate(state, selectedDate);
  const lowest = Object.values(recoveryMap).sort((a, b) => a.recovery - b.recovery)[0];
  const readyCount = Object.values(recoveryMap).filter((item) => item.recovery >= 82).length;
  const ironIQ = calculateIronIQIndex(state, selectedDate, recoveryMap);

  return (
    <section className="summary-grid" aria-label="Resumen del día">
      <div className="summary-tile ironiq-index">
        <BrainCircuit size={20} />
        <span>Índice IronIQ</span>
        <strong>{ironIQ.index}</strong>
        <small>recuperación {ironIQ.averageRecovery}%</small>
      </div>
      <div className="summary-tile">
        <Flame size={20} />
        <span>Calorías</span>
        <strong>{nutrition.calories.toLocaleString("es-CL")}</strong>
        <small>de {state.profile.calorieTarget.toLocaleString("es-CL")}</small>
      </div>
      <div className="summary-tile">
        <Target size={20} />
        <span>Proteína</span>
        <strong>{Math.round(nutrition.protein)} g</strong>
        <small>objetivo {state.profile.proteinTarget} g</small>
      </div>
      <div className="summary-tile">
        <Watch size={20} />
        <span>Huawei</span>
        <strong>{wellness.steps.toLocaleString("es-CL")}</strong>
        <small>{wellness.sleepHours.toFixed(1)} h sueño</small>
      </div>
      <div className="summary-tile">
        <Activity size={20} />
        <span>Músculo crítico</span>
        <strong>{MUSCLE_BY_ID[lowest.muscleId].shortLabel}</strong>
        <small>{lowest.recovery}% recuperado</small>
      </div>
      <div className="summary-tile">
        <Zap size={20} />
        <span>Listos</span>
        <strong>{readyCount}</strong>
        <small>grupos en verde</small>
      </div>
    </section>
  );
}
