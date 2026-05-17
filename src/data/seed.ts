import type { AppState, FoodEntry, SupplementEntry, WorkoutEntry } from "../types";

const dateFromOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const defaultState: AppState = {
  profile: {
    name: "Sebastián",
    age: 30,
    heightCm: 176,
    weightKg: 82,
    waistCm: 84,
    chestCm: 103,
    armCm: 38,
    neckCm: 39,
    goal: "Rendimiento",
    activityLevel: "Moderado",
    calorieTarget: 2650,
    proteinTarget: 165,
    defaultSleepHours: 7.2,
  },
  foods: [
    {
      id: "food-1",
      date: dateFromOffset(0),
      meal: "Desayuno",
      name: "Avena, leche y whey",
      calories: 540,
      protein: 43,
      carbs: 67,
      fat: 12,
    },
    {
      id: "food-2",
      date: dateFromOffset(0),
      meal: "Almuerzo",
      name: "Arroz, pollo y palta",
      calories: 820,
      protein: 58,
      carbs: 86,
      fat: 24,
    },
    {
      id: "food-3",
      date: dateFromOffset(-1),
      meal: "Cena",
      name: "Salmón con papas",
      calories: 690,
      protein: 52,
      carbs: 58,
      fat: 25,
    },
  ] satisfies FoodEntry[],
  supplements: [
    {
      id: "supp-1",
      date: dateFromOffset(0),
      name: "Creatina",
      dose: "5 g",
      recoveryImpact: 4,
    },
    {
      id: "supp-2",
      date: dateFromOffset(-1),
      name: "Magnesio",
      dose: "300 mg",
      recoveryImpact: 2,
    },
  ] satisfies SupplementEntry[],
  workouts: [
    {
      id: "work-1",
      date: dateFromOffset(-1),
      exercise: "Press banca",
      muscleId: "midChest",
      sets: 5,
      reps: 6,
      weightKg: 85,
      rpe: 8.5,
      durationMin: 38,
      source: "manual",
    },
    {
      id: "work-2",
      date: dateFromOffset(-1),
      exercise: "Press militar",
      muscleId: "frontDelts",
      sets: 4,
      reps: 8,
      weightKg: 42,
      rpe: 8,
      durationMin: 24,
      source: "manual",
    },
    {
      id: "work-3",
      date: dateFromOffset(-2),
      exercise: "Sentadilla",
      muscleId: "quads",
      sets: 5,
      reps: 5,
      weightKg: 110,
      rpe: 9,
      durationMin: 42,
      source: "manual",
    },
    {
      id: "work-4",
      date: dateFromOffset(-3),
      exercise: "Dominadas lastradas",
      muscleId: "lats",
      sets: 4,
      reps: 6,
      weightKg: 15,
      rpe: 8,
      durationMin: 28,
      source: "manual",
    },
  ] satisfies WorkoutEntry[],
  wellness: [
    {
      date: dateFromOffset(0),
      steps: 7800,
      activeCalories: 520,
      sleepHours: 6.4,
      sleepScore: 68,
      hrvMs: 42,
      source: "huawei",
    },
    {
      date: dateFromOffset(-1),
      steps: 10200,
      activeCalories: 740,
      sleepHours: 7.1,
      sleepScore: 79,
      hrvMs: 48,
      source: "huawei",
    },
  ],
};
