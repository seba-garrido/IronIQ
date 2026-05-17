import { Calculator, Save, UserRound } from "lucide-react";
import type { ActivityLevel, Goal, MacroPlan, Profile } from "../types";

interface ProfilePanelProps {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

const goals: Goal[] = ["Definición", "Mantención", "Volumen", "Rendimiento"];

const activityOptions: Array<{ value: ActivityLevel; label: string }> = [
  { value: "Sedentario", label: "Sedentario · oficina o poco movimiento" },
  { value: "Ligero", label: "Ligero · 1-3 entrenamientos/semana" },
  { value: "Moderado", label: "Moderado · 3-5 entrenamientos/semana" },
  { value: "Alto", label: "Alto · 5-6 entrenamientos/semana" },
  { value: "Muy alto", label: "Muy alto · doble sesión o trabajo físico" },
];

const activityMultipliers: Record<ActivityLevel, number> = {
  Sedentario: 1.2,
  Ligero: 1.375,
  Moderado: 1.55,
  Alto: 1.725,
  "Muy alto": 1.9,
};

const goalPlan: Record<Goal, { calorieFactor: number; proteinPerKg: number; fatPerKg: number }> = {
  Definición: { calorieFactor: 0.85, proteinPerKg: 2.2, fatPerKg: 0.8 },
  Mantención: { calorieFactor: 1, proteinPerKg: 1.8, fatPerKg: 0.8 },
  Volumen: { calorieFactor: 1.1, proteinPerKg: 2, fatPerKg: 0.9 },
  Rendimiento: { calorieFactor: 1.05, proteinPerKg: 1.9, fatPerKg: 0.8 },
};

const planInputKeys = new Set<keyof Profile>([
  "age",
  "heightCm",
  "weightKg",
  "waistCm",
  "chestCm",
  "armCm",
  "neckCm",
  "goal",
  "activityLevel",
]);

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function calculateMacroPlan(profile: Profile): MacroPlan {
  const weightKg = Math.max(30, profile.weightKg || 0);
  const heightCm = Math.max(80, profile.heightCm || 0);
  const age = Math.max(12, profile.age || 0);
  const activityLevel = profile.activityLevel ?? "Moderado";
  const activityMultiplier = activityMultipliers[activityLevel] ?? activityMultipliers.Moderado;
  const strategy = goalPlan[profile.goal] ?? goalPlan.Rendimiento;

  const estimatedBmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const maintenanceCalories = roundTo(estimatedBmr * activityMultiplier, 10);
  const targetCalories = roundTo(maintenanceCalories * strategy.calorieFactor, 10);
  const protein = Math.round(weightKg * strategy.proteinPerKg);
  const fat = Math.round(weightKg * strategy.fatPerKg);
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fat * 9) / 4));

  return {
    maintenanceCalories,
    targetCalories,
    protein,
    carbs,
    fat,
    activityMultiplier,
    calculatedAt: new Date().toISOString(),
  };
}

const formatNumber = (value: number) => value.toLocaleString("es-CL");

export function ProfilePanel({ profile, onChange }: ProfilePanelProps) {
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    const nextProfile = { ...profile, [key]: value };
    if (planInputKeys.has(key)) nextProfile.macroPlan = undefined;
    onChange(nextProfile);
  };

  const handleCalculate = () => {
    const plan = calculateMacroPlan(profile);
    onChange({
      ...profile,
      activityLevel: profile.activityLevel ?? "Moderado",
      calorieTarget: plan.targetCalories,
      proteinTarget: plan.protein,
      macroPlan: plan,
    });
  };

  return (
    <aside className="profile-panel">
      <div className="panel-heading">
        <UserRound size={20} />
        <div>
          <span>Perfil corporal</span>
          <strong>{profile.name}</strong>
        </div>
      </div>

      <div className="form-grid compact">
        <label>
          Nombre
          <input value={profile.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label>
          Objetivo
          <select value={profile.goal} onChange={(event) => update("goal", event.target.value as Goal)}>
            {goals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </label>
        <label>
          Edad
          <input
            type="number"
            min="12"
            value={profile.age}
            onChange={(event) => update("age", Number(event.target.value))}
          />
        </label>
        <label>
          Altura cm
          <input
            type="number"
            min="80"
            value={profile.heightCm}
            onChange={(event) => update("heightCm", Number(event.target.value))}
          />
        </label>
        <label>
          Peso kg
          <input
            type="number"
            min="30"
            step="0.1"
            value={profile.weightKg}
            onChange={(event) => update("weightKg", Number(event.target.value))}
          />
        </label>
        <label>
          Cintura cm
          <input
            type="number"
            min="40"
            value={profile.waistCm}
            onChange={(event) => update("waistCm", Number(event.target.value))}
          />
        </label>
        <label>
          Pecho cm
          <input
            type="number"
            min="50"
            value={profile.chestCm}
            onChange={(event) => update("chestCm", Number(event.target.value))}
          />
        </label>
        <label>
          Brazo cm
          <input
            type="number"
            min="15"
            value={profile.armCm}
            onChange={(event) => update("armCm", Number(event.target.value))}
          />
        </label>
        <label>
          Cuello cm
          <input
            type="number"
            min="20"
            value={profile.neckCm}
            onChange={(event) => update("neckCm", Number(event.target.value))}
          />
        </label>
        <label className="span-2">
          Nivel de actividad
          <select
            value={profile.activityLevel ?? "Moderado"}
            onChange={(event) => update("activityLevel", event.target.value as ActivityLevel)}
          >
            {activityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button className="primary-button profile-calc-button span-2" type="button" onClick={handleCalculate}>
          <Calculator size={16} />
          Calcular calorías y macros
        </button>
      </div>

      {profile.macroPlan && (
        <section className="macro-plan" aria-live="polite">
          <div className="macro-plan__header">
            <div>
              <span>Plan nutricional</span>
              <strong>{formatNumber(profile.macroPlan.targetCalories)} kcal objetivo</strong>
            </div>
            <small>x{profile.macroPlan.activityMultiplier.toFixed(2)} actividad</small>
          </div>
          <div className="macro-plan__grid">
            <div>
              <span>Mantenimiento</span>
              <strong>{formatNumber(profile.macroPlan.maintenanceCalories)} kcal</strong>
            </div>
            <div>
              <span>Proteína</span>
              <strong>{profile.macroPlan.protein} g</strong>
            </div>
            <div>
              <span>Carbohidratos</span>
              <strong>{profile.macroPlan.carbs} g</strong>
            </div>
            <div>
              <span>Grasas</span>
              <strong>{profile.macroPlan.fat} g</strong>
            </div>
          </div>
        </section>
      )}

      <div className="profile-footer">
        <Save size={16} />
        <span>Guardado automático local</span>
      </div>
    </aside>
  );
}
