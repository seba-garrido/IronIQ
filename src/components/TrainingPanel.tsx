import { Dumbbell, Plus, RefreshCw, Trash2, Watch } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { MUSCLES } from "../data/muscles";
import { createId, getWellnessForDate } from "../engine/recovery";
import type { AppState, MuscleId, WorkoutEntry, WorkoutSet } from "../types";

interface TrainingPanelProps {
  state: AppState;
  selectedDate: string;
  onChange: (state: AppState) => void;
}

const makeDefaultSets = (count: number, reps = 8, weightKg = 70): WorkoutSet[] =>
  Array.from({ length: count }, (_, index) => ({ setNumber: index + 1, reps, weightKg }));

export function TrainingPanel({ state, selectedDate, onChange }: TrainingPanelProps) {
  const [exercise, setExercise] = useState("Press banca");
  const [muscleId, setMuscleId] = useState<MuscleId>("chest");
  const [sets, setSets] = useState(4);
  const [setDetails, setSetDetails] = useState<WorkoutSet[]>(() => makeDefaultSets(4));
  const [rpe, setRpe] = useState(8);
  const [durationMin, setDurationMin] = useState(35);

  const workouts = useMemo(
    () => state.workouts.filter((workout) => workout.date === selectedDate),
    [state.workouts, selectedDate],
  );
  const wellness = getWellnessForDate(state, selectedDate);

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

        <form className="entry-form" onSubmit={addWorkout}>
          <label className="span-2">
            Ejercicio
            <input value={exercise} onChange={(event) => setExercise(event.target.value)} />
          </label>
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
