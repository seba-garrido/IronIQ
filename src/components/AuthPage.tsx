import { Dumbbell, LockKeyhole, UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import type { AuthMode } from "../types";

interface AuthPageProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthPage({ mode, onModeChange }: AuthPageProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const isRegister = mode === "register";

  return (
    <section className="auth-page" aria-label={isRegister ? "Registro" : "Login"}>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="ironiq-logo" aria-hidden="true">
            <span>IQ</span>
          </div>
          <div>
            <span>IronIQ</span>
            <strong>{isRegister ? "Crea tu cuenta" : "Inicia sesión"}</strong>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Nombre
              <input autoComplete="name" placeholder="Tu nombre" />
            </label>
          )}
          <label>
            Email
            <input autoComplete="email" placeholder="correo@ejemplo.com" type="email" />
          </label>
          <label>
            Contraseña
            <input autoComplete={isRegister ? "new-password" : "current-password"} type="password" />
          </label>
          {isRegister && (
            <label>
              Confirmar contraseña
              <input autoComplete="new-password" type="password" />
            </label>
          )}
          <button className="primary-button auth-submit" type="submit">
            {isRegister ? <UserPlus size={18} /> : <LockKeyhole size={18} />}
            {isRegister ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <div className="auth-switch">
          <Dumbbell size={17} />
          {isRegister ? (
            <button type="button" onClick={() => onModeChange("login")}>
              Ya tengo cuenta
            </button>
          ) : (
            <button type="button" onClick={() => onModeChange("register")}>
              Registrarme
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
