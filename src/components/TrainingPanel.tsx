import { AlertTriangle, BarChart3, Dumbbell, Plus, RefreshCw, Sparkles, Trash2, Watch } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { SearchPicker } from "./SearchPicker";
import { exerciseCatalog } from "../data/catalog";
import type { ExerciseCatalogItem } from "../data/catalog";
import { MUSCLE_BY_ID, MUSCLES } from "../data/muscles";
import { getOvertrainingAlerts, getTrainingSuggestion, getWeeklyTrainingDistribution } from "../engine/insights";
import { createId, getWellnessForDate } from "../engine/recovery";
import type { AppState, MuscleId, MuscleRecovery, WorkoutEntry, WorkoutSet } from "../types";

interface TrainingPanelProps {
  state: AppState;
  selectedDate: string;
  recoveryMap: Record<MuscleId, MuscleRecovery>;
  onChange: (state: AppState) => void;
}

const makeDefaultSets = (count: number, reps = 8, weightKg = 70): WorkoutSet[] =>
  Array.from({ length: count }, (_, index) => ({ setNumber: index + 1, reps, weightKg }));
const exercisePickerItems = exerciseCatalog.map((exercise) => ({
  ...exercise,
  title: exercise.name,
  subtitle: `${MUSCLE_BY_ID[exercise.muscleId].label} · ${exercise.pattern}`,
  meta: `${exercise.defaultSets}x${exercise.defaultReps} · ${exercise.defaultWeightKg} kg`,
  searchText: `${exercise.name} ${exercise.pattern} ${MUSCLE_BY_ID[exercise.muscleId].label} ${exercise.tags.join(" ")}`,
}));

export function TrainingPanel({ state, selectedDate, recoveryMap, onChange }: TrainingPanelProps) {
  const [exercise, setExercise] = useState("Press banca");
  const [muscleId, setMuscleId] = useState<MuscleId>("chest");
  const [sets, setSets] = useState(4);
  const [setDetails, setSetDetails] = useState<WorkoutSet[]>(() => makeDefaultSets(4));
  const [rpe, setRpe] = useState(8);
  const [durationMin, setDurationMin] = useState(35);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const workouts = useMemo(
    () => state.workouts.filter((workout) => workout.date === selectedDate),
    [state.workouts, selectedDate],
  );
  const wellness = getWellnessForDate(state, selectedDate);
  const suggestion = useMemo(
    () => getTrainingSuggestion(state, selectedDate, recoveryMap),
    [state, selectedDate, recoveryMap],
  );
  const alerts = useMemo(
    () => getOvertrainingAlerts(state, selectedDate, recoveryMap),
    [state, selectedDate, recoveryMap],
  );
  const weeklyDistribution = useMemo(
    () => getWeeklyTrainingDistribution(state, selectedDate),
    [state, selectedDate],
  );
  const maxDailySets = Math.max(1, ...weeklyDistribution.daily.map((item) => item.sets));
  const maxMuscleSets = Math.max(1, ...weeklyDistribution.muscles.map((item) => item.sets));

  const updateSetCount = (nextSets: number) => {
    const safeSets = Math.max(1, Math.min(12, nextSets || 1));
    setSets(safeSets);
    setSetDetails((current) => {
      const fallback = current[current.length - 1] ?? { setNumber: 1, reps: 8, weightKg: 70 };
      return Array.from({ length: safeSets }, (_, index) => {
        const existing = current[index] ?? fallback;
        return {
          setNumber: index + 1,
          reps: Math.max(1, existing.reps),
          weightKg: Math.max(0, existing.weightKg),
        };
      });
    });
  };

  const updateSetDetail = (setNumber: number, field: "reps" | "weightKg", value: number) => {
    setSetDetails((current) =>
      current.map((set) => (set.setNumber === setNumber ? { ...set, [field]: Math.max(0, value) } : set)),
    );
  };

  const summarizeSets = (details: WorkoutSet[]) => {
    const averageReps = Math.round(details.reduce((total, set) => total + set.reps, 0) / details.length);
    const averageWeight =
      Math.round((details.reduce((total, set) => total + set.weightKg, 0) / details.length) * 10) / 10;

    return { averageReps, averageWeight };
  };

  const getWorkoutSetDetails = (workout: WorkoutEntry) => {
    return workout.setDetails?.length ? workout.setDetails : makeDefaultSets(workout.sets, workout.reps, workout.weightKg);
  };

  const formatWorkoutSets = (workout: WorkoutEntry) => {
    return getWorkoutSetDetails(workout)
      .map((set) => `S${set.setNumber}: ${set.reps}x${set.weightKg}kg`)
      .join(" | ");
  };

  const addWorkout = (event: FormEvent) => {
    event.preventDefault();
    if (!exercise.trim()) return;

    const cleanSetDetails = setDetails.map((set, index) => ({
      setNumber: index + 1,
      reps: Math.max(1, set.reps),
      weightKg: Math.max(0, set.weightKg),
    }));
    const { averageReps, averageWeight } = summarizeSets(cleanSetDetails);

    const entry: WorkoutEntry = {
      id: createId("workout"),
      date: selectedDate,
      exercise: exercise.trim(),
      muscleId,
      sets: cleanSetDetails.length,
      reps: averageReps,
      weightKg: averageWeight,
      setDetails: cleanSetDetails,
      rpe,
      durationMin,
      source: "manual",
    };

    onChange({ ...state, workouts: [entry, ...state.workouts] });
  };

  const removeWorkout = (id: string) => {
    onChange({ ...state, workouts: state.workouts.filter((workout) => workout.id !== id) });
  };

  const importHuaweiDemo = () => {
    const importedWorkout: WorkoutEntry = {
      id: createId("huawei"),
      date: selectedDate,
      exercise: "Huawei Health - Carrera zona 2",
      muscleId: "calves",
      sets: 3,
      reps: 11,
      weightKg: 0,
      setDetails: [
        { setNumber: 1, reps: 12, weightKg: 0 },
        { setNumber: 2, reps: 12, weightKg: 0 },
        { setNumber: 3, reps: 10, weightKg: 0 },
      ],
      rpe: 6.5,
      durationMin: 42,
      source: "huawei",
    };

    const existingWellness = state.wellness.filter((item) => item.date !== selectedDate);
    onChange({
      ...state,
      workouts: [importedWorkout, ...state.workouts],
      wellness: [
        {
          date: selectedDate,
          steps: 11840,
          activeCalories: 690,
          sleepHours: 6.8,
          sleepScore: 74,
          hrvMs: 45,
          source: "huawei",
        },
        ...existingWellness,
      ],
    });
  };

  const selectExercise = (item: ExerciseCatalogItem) => {
    setExercise(item.name);
    setMuscleId(item.muscleId);
    setRpe(8);
    setDurationMin(Math.max(20, item.defaultSets * 8));
    updateSetCount(item.defaultSets);
    setSetDetails(makeDefaultSets(item.defaultSets, item.defaultReps, item.defaultWeightKg));
  };

  const totalSets = workouts.reduce((total, workout) => total + getWorkoutSetDetails(workout).length, 0);
  const totalMinutes = workouts.reduce((total, workout) => total + workout.durationMin, 0);

  return (
    <div className="workspace-grid two-columns">
      <section className="tool-panel">
        <div className="panel-heading">
          <Dumbbell size={20} />
          <div>
            <span>Calendario de fuerza</span>
            <strong>{selectedDate}</strong>
          </div>
        </div>

        <div className="training-metrics">
          <div>
            <strong>{workouts.length}</strong>
            <span>ejercicios</span>
          </div>
          <div>
            <strong>{totalSets}</strong>
            <span>series</span>
          </div>
          <div>
            <strong>{totalMinutes}</strong>
            <span>minutos</span>
          </div>
        </div>

        <button className="secondary-button full-width" type="button" onClick={() => setShowSuggestion((value) => !value)}>
          <Sparkles size={16} />
          Sugerencia de entrenamiento IronIQ
        </button>

        {showSuggestion && (
          <section className="insight-card training-suggestion" aria-label="Sugerencia de entrenamiento">
            <div className="insight-card__header">
              <Sparkles size={18} />
              <div>
                <span>Sugerencia para hoy</span>
                <strong>{suggestion.title}</strong>
              </div>
            </div>
            <p>{suggestion.detail}</p>
            {suggestion.exercises.length > 0 && (
              <div className="suggestion-chips">
                {suggestion.exercises.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
            {suggestion.avoid.length > 0 && (
              <small>
                Cuidar:{" "}
                {suggestion.avoid
                  .map((item) => `${item.muscle.shortLabel} (${item.recovery}%, ${item.hoursLeft} h)`)
                  .join(" · ")}
              </small>
            )}
          </section>
        )}

        <form className="entry-form" onSubmit={addWorkout}>
          <div className="span-2">
            <SearchPicker
              emptyText="No encontré ejercicios con ese nombre."
              items={exercisePickerItems}
              label="Ejercicio"
              onSelect={selectExercise}
              placeholder="Buscar press, sentadilla, remo..."
              renderBadge={(item) => <span className="picker-muscle-badge">{MUSCLE_BY_ID[item.muscleId].shortLabel}</span>}
              title="Buscar ejercicio"
              value={exercise || "Seleccionar ejercicio"}
            />
          </div>
          <label>
            Musculo principal
            <select value={muscleId} onChange={(event) => setMuscleId(event.target.value as MuscleId)}>
              {MUSCLES.map((muscle) => (
                <option key={muscle.id} value={muscle.id}>
                  {muscle.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Series
            <input
              type="number"
              min="1"
              max="12"
              value={sets}
              onChange={(event) => updateSetCount(Number(event.target.value))}
            />
          </label>
          <label>
            RPE
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={rpe}
              onChange={(event) => setRpe(Number(event.target.value))}
            />
          </label>
          <label>
            Duracion min
            <input
              type="number"
              min="1"
              value={durationMin}
              onChange={(event) => setDurationMin(Number(event.target.value))}
            />
          </label>

          <div className="set-editor span-2">
            <div className="set-editor__header">
              <span>Serie</span>
              <span>Reps</span>
              <span>Peso kg</span>
            </div>
            {setDetails.map((set) => (
              <div className="set-row" key={set.setNumber}>
                <strong>{set.setNumber}</strong>
                <input
                  type="number"
                  min="1"
                  value={set.reps}
                  aria-label={`Repeticiones serie ${set.setNumber}`}
                  onChange={(event) => updateSetDetail(set.setNumber, "reps", Number(event.target.value))}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weightKg}
                  aria-label={`Peso serie ${set.setNumber}`}
                  onChange={(event) => updateSetDetail(set.setNumber, "weightKg", Number(event.target.value))}
                />
              </div>
            ))}
          </div>

          <button className="primary-button span-2" type="submit">
            <Plus size={18} />
            Agregar entrenamiento
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <Watch size={20} />
          <div>
            <span>Sincronizacion wearable</span>
            <strong>{wellness.source === "huawei" ? "Huawei conectado" : "Modo manual"}</strong>
          </div>
        </div>

        <div className="wearable-strip">
          <div>
            <strong>{wellness.steps.toLocaleString("es-CL")}</strong>
            <span>pasos</span>
          </div>
          <div>
            <strong>{wellness.activeCalories}</strong>
            <span>kcal activas</span>
          </div>
          <div>
            <strong>{wellness.sleepHours.toFixed(1)} h</strong>
            <span>sueno</span>
          </div>
        </div>

        <button className="secondary-button full-width" type="button" onClick={importHuaweiDemo}>
          <RefreshCw size={16} />
          Simular importacion Huawei Health
        </button>

        <p className="integration-note">Conector preparado para autorizacion Health Kit o Health Connect.</p>

        <section className="insight-card overtraining-alerts" aria-label="Alertas de sobreentrenamiento">
          <div className="insight-card__header">
            <AlertTriangle size={18} />
            <div>
              <span>Alertas de sobreentrenamiento</span>
              <strong>{alerts.length ? `${alerts.length} señales activas` : "Sin alertas críticas"}</strong>
            </div>
          </div>
          <div className="alert-list">
            {alerts.map((alert) => (
              <article className={`alert-item is-${alert.severity}`} key={`${alert.title}-${alert.detail}`}>
                <strong>{alert.title}</strong>
                <span>{alert.detail}</span>
              </article>
            ))}
            {alerts.length === 0 && <p>Volumen, recuperación y balance semanal se ven dentro de rango.</p>}
          </div>
        </section>

        <section className="history-panel" aria-label="Historial muscular semanal">
          <div className="panel-heading compact-heading">
            <BarChart3 size={18} />
            <div>
              <span>Historial muscular</span>
              <strong>Distribución semanal</strong>
            </div>
          </div>
          <div className="weekly-bars">
            {weeklyDistribution.daily.map((item) => (
              <div className="weekly-bar" key={item.date}>
                <span>{item.date.slice(8, 10)}</span>
                <strong style={{ height: `${Math.max(8, (item.sets / maxDailySets) * 78)}%` }} />
                <small>{item.sets}</small>
              </div>
            ))}
          </div>
          <div className="muscle-load-bars">
            {weeklyDistribution.muscles.slice(0, 7).map((item) => (
              <div className="load-row" key={item.muscleId}>
                <span>{MUSCLE_BY_ID[item.muscleId].shortLabel}</span>
                <div>
                  <strong style={{ width: `${Math.max(7, (item.sets / maxMuscleSets) * 100)}%` }} />
                </div>
                <small>{item.sets}</small>
              </div>
            ))}
            {weeklyDistribution.muscles.length === 0 && <p className="empty-state">Aún no hay series esta semana.</p>}
          </div>
        </section>

        <div className="list-stack">
          {workouts.map((workout) => (
            <article className="row-item" key={workout.id}>
              <div>
                <span>{workout.source === "manual" ? "Manual" : "Huawei Health"}</span>
                <strong>{workout.exercise}</strong>
                <small>
                  {getWorkoutSetDetails(workout).length} series | RPE {workout.rpe} | {workout.durationMin} min
                </small>
                <small className="set-summary">{formatWorkoutSets(workout)}</small>
              </div>
              <button
                className="icon-button danger"
                type="button"
                onClick={() => removeWorkout(workout.id)}
                aria-label="Eliminar entrenamiento"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
          {workouts.length === 0 && <p className="empty-state">No hay entrenamientos registrados para este dia.</p>}
        </div>
      </section>
    </div>
  );
}
