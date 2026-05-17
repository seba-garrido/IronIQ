import { BrainCircuit, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { AuthPage } from "./components/AuthPage";
import { BodyPanel } from "./components/BodyPanel";
import { DateRail } from "./components/DateRail";
import { NutritionPanel } from "./components/NutritionPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { SummaryBar } from "./components/SummaryBar";
import { TrainingPanel } from "./components/TrainingPanel";
import { defaultState } from "./data/seed";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { calculateRecovery, toISODate } from "./engine/recovery";
import type { AppState, AppTab, AuthMode, MuscleId } from "./types";

export default function App() {
  const today = toISODate(new Date());
  const [state, setState] = useLocalStorage<AppState>("recovery-atlas-state", defaultState);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>("ironiq-dark-mode", false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>("ironiq-sidebar-collapsed", false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<AppTab>("body");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthView, setIsAuthView] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId>("midChest");

  const recoveryMap = useMemo(() => calculateRecovery(state, selectedDate), [state, selectedDate]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const openTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsAuthView(false);
  };

  const openAuth = () => {
    setIsAuthView(true);
  };

  return (
    <main className={`app-frame ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <AppSidebar
        activeTab={activeTab}
        isCollapsed={isSidebarCollapsed}
        isAuthView={isAuthView}
        isDarkMode={isDarkMode}
        onAuthOpen={openAuth}
        onCollapseChange={setIsSidebarCollapsed}
        onTabChange={openTab}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      <section className={`app-shell ${isAuthView ? "is-auth-shell" : ""}`}>
        {isAuthView ? (
          <AuthPage mode={authMode} onModeChange={setAuthMode} />
        ) : (
          <>
            <header className="app-header">
              <div className="brand-lockup">
                <div className="ironiq-logo is-header" aria-hidden="true">
                  <span>IQ</span>
                </div>
                <div>
                  <span>IronIQ</span>
                  <strong>Tu mapa muscular inteligente para el gym</strong>
                </div>
              </div>

              <div className="header-status">
                <BrainCircuit size={17} />
                <span>IA local hoy · backend LLM después</span>
              </div>
            </header>

            <DateRail selectedDate={selectedDate} onChange={setSelectedDate} />
            <SummaryBar state={state} selectedDate={selectedDate} recoveryMap={recoveryMap} />

            <div className="main-layout">
              <div className="main-surface">
                {activeTab === "nutrition" && (
                  <NutritionPanel state={state} selectedDate={selectedDate} onChange={setState} />
                )}
                {activeTab === "training" && (
                  <TrainingPanel
                    state={state}
                    selectedDate={selectedDate}
                    recoveryMap={recoveryMap}
                    onChange={setState}
                  />
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
                {activeTab === "profile" && (
                  <ProfilePanel profile={state.profile} onChange={(profile) => setState({ ...state, profile })} />
                )}
              </div>
            </div>

            <footer className="app-footer">
              <CalendarDays size={16} />
              <span>
                Las métricas de recuperación son estimaciones de entrenamiento, no diagnóstico médico. Ajusta con tu
                percepción real de dolor, energía y rendimiento.
              </span>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
