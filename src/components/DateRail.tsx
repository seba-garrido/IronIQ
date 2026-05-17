import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatShortDate, getDateWindow, toISODate } from "../engine/recovery";

interface DateRailProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonthGrid(cursor: Date) {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const start = new Date(firstOfMonth);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  start.setDate(firstOfMonth.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === cursor.getMonth(),
    };
  });
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DateRail({ selectedDate, onChange }: DateRailProps) {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => new Date(`${selectedDate}T12:00:00`));
  const dates = getDateWindow(selectedDate);
  const monthDays = useMemo(() => getMonthGrid(monthCursor), [monthCursor]);
  const today = toISODate(new Date());

  useEffect(() => {
    setMonthCursor(new Date(`${selectedDate}T12:00:00`));
  }, [selectedDate]);

  const shift = (days: number) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    onChange(toISODate(date));
  };

  const shiftMonth = (months: number) => {
    setMonthCursor((current) => {
      return new Date(current.getFullYear(), current.getMonth() + months, 1, 12);
    });
  };

  const selectDate = (date: string) => {
    onChange(date);
    setIsMonthOpen(false);
  };

  return (
    <div className="date-rail-shell">
      <div className="date-rail" aria-label="Calendario semanal">
        <button className="icon-button" type="button" onClick={() => shift(-7)} aria-label="Semana anterior">
          <ChevronLeft size={18} />
        </button>
        <div className="date-rail__days">
          {dates.map((date) => (
            <button
              className={`date-pill ${date === selectedDate ? "is-active" : ""}`}
              key={date}
              type="button"
              onClick={() => onChange(date)}
            >
              <span>{formatShortDate(date)}</span>
              <strong>{date.slice(8, 10)}</strong>
            </button>
          ))}
        </div>
        <button
          className={`calendar-toggle ${isMonthOpen ? "is-active" : ""}`}
          type="button"
          onClick={() => setIsMonthOpen((current) => !current)}
          aria-expanded={isMonthOpen}
          aria-label="Mostrar calendario mensual"
        >
          <CalendarDays size={17} />
          <span>Mes</span>
        </button>
        <button className="icon-button" type="button" onClick={() => shift(7)} aria-label="Semana siguiente">
          <ChevronRight size={18} />
        </button>
      </div>

      {isMonthOpen && (
        <section className="month-calendar" aria-label="Calendario mensual">
          <div className="month-calendar__header">
            <button className="icon-button" type="button" onClick={() => shiftMonth(-1)} aria-label="Mes anterior">
              <ChevronLeft size={18} />
            </button>
            <strong>{formatMonthLabel(monthCursor)}</strong>
            <button className="icon-button" type="button" onClick={() => shiftMonth(1)} aria-label="Mes siguiente">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="month-calendar__weekdays">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="month-calendar__days">
            {monthDays.map((day) => (
              <button
                className={[
                  "month-day",
                  day.inMonth ? "" : "is-outside",
                  day.date === selectedDate ? "is-selected" : "",
                  day.date === today ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={day.date}
                type="button"
                onClick={() => selectDate(day.date)}
              >
                {day.day}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
