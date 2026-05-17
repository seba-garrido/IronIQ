import { BarChart3, Plus, Scale, Trash2, Utensils } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { SearchPicker } from "./SearchPicker";
import { foodCatalog } from "../data/catalog";
import type { FoodCatalogItem } from "../data/catalog";
import { getMacroCalories, getNutritionHistory } from "../engine/insights";
import { calculateNutritionForDate, createId } from "../engine/recovery";
import type { AppState, FoodEntry, MealType, SupplementEntry } from "../types";

interface NutritionPanelProps {
  state: AppState;
  selectedDate: string;
  onChange: (state: AppState) => void;
}

const mealTypes: MealType[] = ["Desayuno", "Almuerzo", "Cena", "Snack"];
const formatNumber = (value: number) => value.toLocaleString("es-CL");
const foodPickerItems = foodCatalog.map((food) => ({
  ...food,
  title: food.name,
  subtitle: food.serving,
  meta: `${food.calories} kcal · P ${food.protein} · C ${food.carbs} · G ${food.fat}`,
  searchText: `${food.name} ${food.serving} ${food.tags.join(" ")}`,
}));

export function NutritionPanel({ state, selectedDate, onChange }: NutritionPanelProps) {
  const [meal, setMeal] = useState<MealType>("Almuerzo");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(520);
  const [protein, setProtein] = useState(35);
  const [carbs, setCarbs] = useState(55);
  const [fat, setFat] = useState(14);
  const [supplementName, setSupplementName] = useState("Creatina");
  const [dose, setDose] = useState("5 g");

  const foods = useMemo(
    () => state.foods.filter((food) => food.date === selectedDate),
    [state.foods, selectedDate],
  );
  const supplements = useMemo(
    () => state.supplements.filter((supplement) => supplement.date === selectedDate),
    [state.supplements, selectedDate],
  );
  const totals = calculateNutritionForDate(state, selectedDate);
  const macroPlan = state.profile.macroPlan;
  const nutritionHistory = useMemo(() => getNutritionHistory(state, selectedDate), [state, selectedDate]);
  const macroCalories = getMacroCalories(totals);
  const macroTotalCalories = Math.max(1, macroCalories.protein + macroCalories.carbs + macroCalories.fat);
  const maxHistoryCalories = Math.max(1, state.profile.calorieTarget, ...nutritionHistory.map((item) => item.totals.calories));
  const planDelta = macroPlan ? macroPlan.targetCalories - macroPlan.maintenanceCalories : 0;
  const dayDelta = totals.calories - state.profile.calorieTarget;
  const planDeltaLabel = planDelta < 0 ? "Déficit" : planDelta > 0 ? "Superávit" : "Mantención";

  const addFood = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const entry: FoodEntry = {
      id: createId("food"),
      date: selectedDate,
      meal,
      name: name.trim(),
      calories,
      protein,
      carbs,
      fat,
    };

    onChange({ ...state, foods: [entry, ...state.foods] });
    setName("");
  };

  const addSupplement = (event: FormEvent) => {
    event.preventDefault();
    if (!supplementName.trim()) return;

    const lower = supplementName.toLowerCase();
    const impact = lower.includes("creatina")
      ? 4
      : lower.includes("prote")
        ? 3
        : lower.includes("magnes")
          ? 2
          : 1;
    const entry: SupplementEntry = {
      id: createId("supp"),
      date: selectedDate,
      name: supplementName.trim(),
      dose: dose.trim(),
      recoveryImpact: impact,
    };

    onChange({ ...state, supplements: [entry, ...state.supplements] });
  };

  const removeFood = (id: string) => {
    onChange({ ...state, foods: state.foods.filter((food) => food.id !== id) });
  };

  const removeSupplement = (id: string) => {
    onChange({ ...state, supplements: state.supplements.filter((supplement) => supplement.id !== id) });
  };

  const selectFood = (food: FoodCatalogItem) => {
    setName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
  };

  return (
    <div className="workspace-grid two-columns">
      <section className="tool-panel">
        <div className="panel-heading">
          <Utensils size={20} />
          <div>
            <span>Calendario de comidas</span>
            <strong>{selectedDate}</strong>
          </div>
        </div>

        <div className="macro-rings">
          <div>
            <strong>{totals.calories}</strong>
            <span>kcal</span>
            <small>{Math.round((totals.calories / state.profile.calorieTarget) * 100)}% objetivo</small>
          </div>
          <div>
            <strong>{Math.round(totals.protein)} g</strong>
            <span>proteína</span>
            <small>{state.profile.proteinTarget} g objetivo</small>
          </div>
          <div>
            <strong>{Math.round(totals.carbs)} g</strong>
            <span>carbos</span>
            <small>{Math.round(totals.fat)} g grasa</small>
          </div>
        </div>

        {macroPlan && (
          <section className="macro-plan nutrition-plan" aria-label="Plan nutricional">
            <div className="macro-plan__header">
              <div>
                <span>Plan nutricional</span>
                <strong>{formatNumber(macroPlan.targetCalories)} kcal objetivo</strong>
              </div>
              <small>x{macroPlan.activityMultiplier.toFixed(2)} actividad</small>
            </div>
            <div className="macro-plan__grid">
              <div>
                <span>Mantenimiento</span>
                <strong>{formatNumber(macroPlan.maintenanceCalories)} kcal</strong>
              </div>
              <div>
                <span>Proteína</span>
                <strong>{macroPlan.protein} g</strong>
              </div>
              <div>
                <span>Carbohidratos</span>
                <strong>{macroPlan.carbs} g</strong>
              </div>
              <div>
                <span>Grasas</span>
                <strong>{macroPlan.fat} g</strong>
              </div>
              <div>
                <span>{planDeltaLabel}</span>
                <strong>{planDelta === 0 ? "0" : `${planDelta > 0 ? "+" : ""}${formatNumber(planDelta)}`} kcal</strong>
              </div>
              <div>
                <span>Hoy vs objetivo</span>
                <strong>{dayDelta > 0 ? "+" : ""}{formatNumber(dayDelta)} kcal</strong>
              </div>
            </div>
          </section>
        )}

        <section className="history-panel nutrition-history" aria-label="Historial de comidas">
          <div className="panel-heading compact-heading">
            <BarChart3 size={18} />
            <div>
              <span>Historial de comidas</span>
              <strong>Macros y calorías</strong>
            </div>
          </div>

          <div className="macro-stack" aria-label="Distribución de macros del día">
            <span
              className="macro-stack__protein"
              style={{ width: `${(macroCalories.protein / macroTotalCalories) * 100}%` }}
            />
            <span
              className="macro-stack__carbs"
              style={{ width: `${(macroCalories.carbs / macroTotalCalories) * 100}%` }}
            />
            <span className="macro-stack__fat" style={{ width: `${(macroCalories.fat / macroTotalCalories) * 100}%` }} />
          </div>
          <div className="macro-legend">
            <span>Proteína {Math.round((macroCalories.protein / macroTotalCalories) * 100)}%</span>
            <span>Carbos {Math.round((macroCalories.carbs / macroTotalCalories) * 100)}%</span>
            <span>Grasas {Math.round((macroCalories.fat / macroTotalCalories) * 100)}%</span>
          </div>

          <div className="calorie-history">
            {nutritionHistory.map((item) => (
              <div className="calorie-day" key={item.date}>
                <span>{item.date.slice(8, 10)}</span>
                <strong style={{ height: `${Math.max(8, (item.totals.calories / maxHistoryCalories) * 78)}%` }} />
                <small>{Math.round(item.totals.calories / 100) / 10}k</small>
              </div>
            ))}
          </div>
          <div className="calorie-target-note">
            <Scale size={16} />
            <span>Objetivo diario: {formatNumber(state.profile.calorieTarget)} kcal</span>
          </div>
        </section>

        <form className="entry-form" onSubmit={addFood}>
          <label>
            Comida
            <select value={meal} onChange={(event) => setMeal(event.target.value as MealType)}>
              {mealTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="span-2">
            <SearchPicker
              emptyText="No encontré comidas con ese nombre."
              items={foodPickerItems}
              label="Alimento o plato"
              onSelect={selectFood}
              placeholder="Buscar pollo, arroz, avena..."
              title="Buscar comida"
              value={name || "Seleccionar comida"}
            />
          </div>
          <label>
            Kcal
            <input type="number" value={calories} onChange={(event) => setCalories(Number(event.target.value))} />
          </label>
          <label>
            Proteína
            <input type="number" value={protein} onChange={(event) => setProtein(Number(event.target.value))} />
          </label>
          <label>
            Carbos
            <input type="number" value={carbs} onChange={(event) => setCarbs(Number(event.target.value))} />
          </label>
          <label>
            Grasa
            <input type="number" value={fat} onChange={(event) => setFat(Number(event.target.value))} />
          </label>
          <button className="primary-button span-2" type="submit">
            <Plus size={18} />
            Agregar comida
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <span className="panel-dot" />
          <div>
            <span>Registro diario</span>
            <strong>{foods.length} comidas y {supplements.length} suplementos</strong>
          </div>
        </div>

        <div className="list-stack">
          {foods.map((food) => (
            <article className="row-item" key={food.id}>
              <div>
                <span>{food.meal}</span>
                <strong>{food.name}</strong>
                <small>
                  {food.calories} kcal · P {food.protein} · C {food.carbs} · G {food.fat}
                </small>
              </div>
              <button className="icon-button danger" type="button" onClick={() => removeFood(food.id)} aria-label="Eliminar comida">
                <Trash2 size={16} />
              </button>
            </article>
          ))}
          {foods.length === 0 && <p className="empty-state">No hay comidas registradas para este día.</p>}
        </div>

        <form className="supplement-form" onSubmit={addSupplement}>
          <label>
            Suplemento
            <input value={supplementName} onChange={(event) => setSupplementName(event.target.value)} />
          </label>
          <label>
            Dosis
            <input value={dose} onChange={(event) => setDose(event.target.value)} />
          </label>
          <button className="secondary-button" type="submit">
            <Plus size={16} />
            Agregar
          </button>
        </form>

        <div className="supplement-list">
          {supplements.map((supplement) => (
            <button
              className="chip removable"
              key={supplement.id}
              type="button"
              onClick={() => removeSupplement(supplement.id)}
              title="Quitar suplemento"
            >
              {supplement.name} · {supplement.dose}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
