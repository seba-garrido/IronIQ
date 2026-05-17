import { BrainCircuit, ClipboardList, Send, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { MUSCLE_BY_ID, MUSCLES } from "../data/muscles";
import { buildLLMPayload, generateCoachReply } from "../engine/coach";
import { getReadinessAdvice, recoveryBandColor, recoveryBandName } from "../engine/recovery";
import type { AppState, CoachMessage, MuscleId, MuscleRecovery } from "../types";
import { BodyMap3D } from "./BodyMap3D";

interface BodyPanelProps {
  state: AppState;
  selectedDate: string;
  recoveryMap: Record<MuscleId, MuscleRecovery>;
  selectedMuscle: MuscleId;
  onSelectMuscle: (muscleId: MuscleId) => void;
}

export function BodyPanel({ state, selectedDate, recoveryMap, selectedMuscle, onSelectMuscle }: BodyPanelProps) {
  const [question, setQuestion] = useState("¿Qué entreno hoy?");
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "Listo. Estoy cruzando fuerza, comida, suplementos y señales del reloj para estimar recuperación muscular.",
    },
  ]);
  const recovery = recoveryMap[selectedMuscle];
  const muscle = MUSCLE_BY_ID[selectedMuscle];
  const payload = useMemo(
    () => buildLLMPayload({ state, selectedDate, recoveryMap, selectedMuscle }),
    [state, selectedDate, recoveryMap, selectedMuscle],
  );

  const askCoach = (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;

    const userMessage: CoachMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question.trim(),
    };
    const assistantMessage: CoachMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: generateCoachReply(question, { state, selectedDate, recoveryMap, selectedMuscle }),
    };

    setMessages((current) => [...current, userMessage, assistantMessage].slice(-6));
    setQuestion("");
  };

  return (
    <div className="body-layout">
      <section className="body-stage">
        <BodyMap3D
          profile={state.profile}
          recoveryMap={recoveryMap}
          selectedMuscle={selectedMuscle}
          onSelectMuscle={onSelectMuscle}
        />
      </section>

      <section className="recovery-panel">
        <div className="panel-heading">
          <Sparkles size={20} />
          <div>
            <span>Mapa muscular 3D</span>
            <strong>{muscle.label}</strong>
          </div>
        </div>

        <div className="recovery-score" style={{ borderColor: recoveryBandColor(recovery.recovery) }}>
          <div>
            <span>Recuperación</span>
            <strong>{recovery.recovery}%</strong>
          </div>
          <div>
            <span>Estado</span>
            <strong>{recoveryBandName(recovery.recovery)}</strong>
          </div>
          <div>
            <span>Horas aprox.</span>
            <strong>{recovery.hoursLeft} h</strong>
          </div>
        </div>

        <p className="advice-text">{getReadinessAdvice(recovery)}</p>

        <div className="muscle-selector" aria-label="Selector de músculos">
          {MUSCLES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selectedMuscle ? "is-selected" : ""}
              onClick={() => onSelectMuscle(item.id)}
              style={{ ["--muscle-color" as string]: recoveryBandColor(recoveryMap[item.id].recovery) }}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>

        <div className="factor-list">
          {recovery.factors.slice(0, 5).map((factor) => (
            <div key={factor}>
              <span />
              <p>{factor}</p>
            </div>
          ))}
        </div>

        <div className="legend">
          <span style={{ background: "#d83b2d" }}>Rojo</span>
          <span style={{ background: "#e46f2d" }}>Naranjo</span>
          <span style={{ background: "#e0b72f" }}>Amarillo</span>
          <span style={{ background: "#9ccf56" }}>Verde claro</span>
          <span style={{ background: "#2e9d62" }}>Verde</span>
        </div>
      </section>

      <section className="coach-panel">
        <div className="panel-heading">
          <BrainCircuit size={20} />
          <div>
            <span>Coach IA</span>
            <strong>Modo local · LLM-ready</strong>
          </div>
        </div>

        <div className="chat-log">
          {messages.map((message) => (
            <article key={message.id} className={`chat-message ${message.role}`}>
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <form className="coach-form" onSubmit={askCoach}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pregunta qué entrenar, comer o recuperar"
          />
          <button className="icon-button solid" type="submit" aria-label="Enviar pregunta">
            <Send size={17} />
          </button>
        </form>

        <details className="payload-preview">
          <summary>
            <ClipboardList size={16} />
            Ver payload para LLM real
          </summary>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </details>
      </section>
    </div>
  );
}
