import { Activity, BrainCircuit, CalendarDays, Dumbbell, Rotate3D, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { BodyPanel } from "./components/BodyPanel";
import { DateRail } from "./components/DateRail";
import { NutritionPanel } from "./components/NutritionPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { SummaryBar } from "./components/SummaryBar";
import { TrainingPanel } from "./components/TrainingPanel";
import { defaultState } from "./data/seed";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { calculateRecovery, toISODate } from "./engine/recovery";
import type { AppState, AppTab, MuscleId } from "./types";

const tabs: Array<{ id: AppTab; label: string; icon: typeof Utensils }> = [
  { id: "nutrition", label: "Comidas", icon: Utensils },
  { id: "training", label: "Entrenamiento", icon: Dumbbell },
  { id: "body", label: "Cuerpo 3D", icon: Rotate3D },
];

export default function App() {
  const today = toISODate(new Date());
  const [state, setState] = useLocalStorage<AppState>("recovery-atlas-state", defaultState);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<AppTab>("body");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId>("chest");

  const recoveryMap = useMemo(() => calculateRecovery(state, selectedDate), [state, selectedDate]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Activity size={24} />
          </div>
          <div>
            <span>Recovery Atlas AI</span>
            <strong>Entrenamiento, comida y recuperación muscular</strong>
          </div>
        </div>

        <div className="header-status">
          <BrainCircuit size={17} />
          <span>IA local hoy · backend LLM después</span>
        </div>
      </header>

      <DateRail selectedDate={selectedDate} onChange={setSelectedDate} />
      <SummaryBar state={state} selectedDate={selectedDate} recoveryMap={recoveryMap} />

      <nav className="tab-bar" aria-label="Secciones principales">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="main-layout">
        <ProfilePanel profile={state.profile} onChange={(profile) => setState({ ...state, profile })} />

        <div className="main-surface">
          {activeTab === "nutrition" && (
            <NutritionPanel state={state} selectedDate={selectedDate} onChange={setState} />
          )}
          {activeTab === "training" && (
            <TrainingPanel state={state} selectedDate={selectedDate} onChange={setState} />
          )}
          {activeTab === "body" && (
            <BodyPanel
              state={state}
              selectedDate={selectedDate}
              recoveryMap={recoveryMap}
              selectedMuscle={selectedMuscle}
              onSelectMuscle={setSelectedMuscle}
            />
          )}
        </div>
      </div>

      <footer className="app-footer">
        <CalendarDays size={16} />
        <span>
          Las métricas de recuperación son estimaciones de entrenamiento, no diagnóstico médico. Ajusta con tu percepción
          real de dolor, energía y rendimiento.
        </span>
      </footer>
    </main>
  );
}
