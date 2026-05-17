export type MuscleId =
  | "chest"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "forearms"
  | "abs"
  | "traps"
  | "upperBack"
  | "lats"
  | "lowerBack"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

export type AppTab = "nutrition" | "training" | "body";

export type MealType = "Desayuno" | "Almuerzo" | "Cena" | "Snack";

export type Goal = "Definición" | "Mantención" | "Volumen" | "Rendimiento";

export type ActivityLevel = "Sedentario" | "Ligero" | "Moderado" | "Alto" | "Muy alto";

export interface MacroPlan {
  maintenanceCalories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  activityMultiplier: number;
  calculatedAt: string;
}

export interface Profile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  chestCm: number;
  armCm: number;
  neckCm: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  calorieTarget: number;
  proteinTarget: number;
  defaultSleepHours: number;
  macroPlan?: MacroPlan;
}

export interface FoodEntry {
  id: string;
  date: string;
  meal: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SupplementEntry {
  id: string;
  date: string;
  name: string;
  dose: string;
  recoveryImpact: number;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  exercise: string;
  muscleId: MuscleId;
  sets: number;
  reps: number;
  weightKg: number;
  setDetails?: WorkoutSet[];
  rpe: number;
  durationMin: number;
  source: "manual" | "huawei" | "health-connect";
}

export interface DailyWellness {
  date: string;
  steps: number;
  activeCalories: number;
  sleepHours: number;
  sleepScore: number;
  hrvMs?: number;
  source: "manual" | "huawei" | "health-connect";
}

export interface AppState {
  profile: Profile;
  foods: FoodEntry[];
  supplements: SupplementEntry[];
  workouts: WorkoutEntry[];
  wellness: DailyWellness[];
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MuscleRecovery {
  muscleId: MuscleId;
  recovery: number;
  fatigue: number;
  hoursLeft: number;
  lastTrained?: string;
  weeklySets: number;
  loadScore: number;
  confidence: number;
  factors: string[];
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
