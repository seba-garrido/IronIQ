import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  LockKeyhole,
  Moon,
  Rotate3D,
  Sun,
  UserRound,
  Utensils,
} from "lucide-react";
import type { AppTab } from "../types";

interface AppSidebarProps {
  activeTab: AppTab;
  isCollapsed: boolean;
  isAuthView: boolean;
  isDarkMode: boolean;
  onAuthOpen: () => void;
  onCollapseChange: (isCollapsed: boolean) => void;
  onTabChange: (tab: AppTab) => void;
  onThemeToggle: () => void;
}

const navItems: Array<{ id: AppTab; label: string; icon: typeof Utensils }> = [
  { id: "nutrition", label: "Comidas", icon: Utensils },
  { id: "training", label: "Entrenamiento", icon: Dumbbell },
  { id: "body", label: "Cuerpo 3D", icon: Rotate3D },
  { id: "profile", label: "Perfil corporal", icon: UserRound },
];

export function AppSidebar({
  activeTab,
  isCollapsed,
  isAuthView,
  isDarkMode,
  onAuthOpen,
  onCollapseChange,
  onTabChange,
  onThemeToggle,
}: AppSidebarProps) {
  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft;

  return (
    <aside className={`app-sidebar ${isCollapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="ironiq-logo" aria-hidden="true">
          <span>IQ</span>
        </div>
        <div className="sidebar-brand__text">
          <span>IronIQ</span>
          <strong>AI Gym Intelligence</strong>
        </div>
        <button
          className="sidebar-collapse"
          type="button"
          onClick={() => onCollapseChange(!isCollapsed)}
          aria-label={isCollapsed ? "Mostrar menú lateral" : "Ocultar menú lateral"}
        >
          <CollapseIcon size={18} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Secciones principales">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={!isAuthView && activeTab === item.id ? "is-active" : ""}
              onClick={() => onTabChange(item.id)}
              title={item.label}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-tools">
        <button
          className={`theme-switch ${isDarkMode ? "is-dark" : ""}`}
          type="button"
          onClick={onThemeToggle}
          aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="theme-switch__track">
            <span className="theme-switch__thumb" />
            <span className="theme-switch__option">
              <Sun size={15} />
            </span>
            <span className="theme-switch__option">
              <Moon size={15} />
            </span>
          </span>
          <span className="theme-switch__label">{isDarkMode ? "Oscuro" : "Claro"}</span>
        </button>
        <div className="sidebar-tool is-muted">
          <BrainCircuit size={18} />
          <span>IA local · LLM-ready</span>
        </div>
      </div>

      <button
        className={`sidebar-login-button ${isAuthView ? "is-active" : ""}`}
        type="button"
        onClick={onAuthOpen}
        title="Iniciar sesión"
      >
        <LockKeyhole size={18} />
        <span>Login</span>
      </button>
    </aside>
  );
}
