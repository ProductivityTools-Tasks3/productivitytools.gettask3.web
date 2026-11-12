import React, { useEffect, useMemo, useState } from "react";
import apiService from "../../services/apiService";

function formatLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateKey(dateValue) {
  if (!dateValue) return null;
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    if (trimmed.startsWith("0001-01-01")) return null;
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
  }
  const parsed = new Date(dateValue);
  if (isNaN(parsed.getTime()) || parsed.getFullYear() <= 1) return null;
  return formatLocalDateKey(parsed);
}

export function collectDescendantTasks(bagNode) {
  const tasks = [];
  if (!bagNode || !Array.isArray(bagNode.elements)) return tasks;

  function walk(items) {
    for (const item of items) {
      if (!item || item.status === "Deleted") continue;
      if (item.type === "Task" || item.type === 1) {
        tasks.push(item);
      }
      if (Array.isArray(item.elements) && item.elements.length > 0) {
        walk(item.elements);
      }
    }
  }

  walk(bagNode.elements);
  return tasks;
}

export function buildLast7DaysStats(bagElement, referenceDate = new Date()) {
  const baseDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - offset);
    const dateKey = formatLocalDateKey(d);
    days.push({
      dateKey,
      label: dateKey.slice(5),
      completed: 0,
      todo: 0,
    });
  }

  const tasks = collectDescendantTasks(bagElement);

  for (const task of tasks) {
    const createdKey =
      toDateKey(task.created || task.Created) ||
      toDateKey(task.initialization || task.Initialization);
    const isFinished = task.status === "Finished";
    const finishedKey = isFinished ? toDateKey(task.finished || task.Finished) : null;

    for (const day of days) {
      if (isFinished && finishedKey === day.dateKey) {
        day.completed += 1;
      }

      const existedOnDay = !createdKey || createdKey <= day.dateKey;
      const openAtEndOfDay = !isFinished || (finishedKey != null && finishedKey > day.dateKey);
      if (existedOnDay && openAtEndOfDay) {
        day.todo += 1;
      }
    }
  }

  const totalCompleted = days.reduce((sum, day) => sum + day.completed, 0);
  const currentTodo = days.length > 0 ? days[days.length - 1].todo : 0;

  return {
    days,
    totalCompleted,
    currentTodo,
  };
}

function BarChartCard({ title, summaryLabel, summaryValue, days, valueKey, variant, loading }) {
  const maxValue = Math.max(1, ...days.map((d) => d[valueKey]));

  return (
    <div className={`bag-chart-card bag-chart-${variant}`} data-testid={`bag-chart-${valueKey}`}>
      <div className="bag-chart-header">
        <span className="bag-chart-title">{title}</span>
        <span className="bag-chart-summary">
          {summaryLabel}: <strong>{summaryValue}</strong>
        </span>
      </div>

      <div className="bag-chart-body">
        {loading && <div className="bag-chart-loading">Loading...</div>}
        <div className="bag-chart-bars" role="img" aria-label={title}>
          {days.map((day, idx) => {
            const value = day[valueKey];
            const heightPct = value > 0 ? Math.max(8, Math.round((value / maxValue) * 100)) : 0;
            const isToday = idx === days.length - 1;

            return (
              <div
                key={day.dateKey}
                className={`bag-chart-col ${isToday ? "is-today" : ""}`}
                title={`${day.dateKey}: ${value}`}
              >
                <span className="bag-chart-value" data-testid={`bar-value-${valueKey}-${day.dateKey}`}>
                  {value}
                </span>
                <div className="bag-chart-track">
                  <div
                    className={`bag-chart-bar ${value === 0 ? "is-zero" : ""}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="bag-chart-label">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BagCharts({ bagElement, treeVersion = 0, referenceDate }) {
  const [last7DaysNode, setLast7DaysNode] = useState(null);
  const [loading, setLoading] = useState(false);

  const elementId = bagElement?.elementId;
  const elementType = bagElement?.type;

  useEffect(() => {
    if (elementId === null || elementId === undefined) {
      setLast7DaysNode(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.resolve(apiService.getLast7DaysTree?.(elementId))
      .then((data) => {
        if (!cancelled && data) {
          setLast7DaysNode(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch last 7 days data for bag", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [elementId, elementType, treeVersion]);

  const effectiveBag =
    last7DaysNode && last7DaysNode.elementId === elementId ? last7DaysNode : bagElement;

  const stats = useMemo(
    () => buildLast7DaysStats(effectiveBag, referenceDate),
    [effectiveBag, referenceDate]
  );

  return (
    <div className="bag-charts-container" data-testid="bag-charts">
      <BarChartCard
        title="Completed tasks (last 7 days)"
        summaryLabel="Total"
        summaryValue={stats.totalCompleted}
        days={stats.days}
        valueKey="completed"
        variant="completed"
        loading={loading}
      />
      <BarChartCard
        title="Tasks to do (last 7 days)"
        summaryLabel="Today"
        summaryValue={stats.currentTodo}
        days={stats.days}
        valueKey="todo"
        variant="todo"
        loading={loading}
      />
    </div>
  );
}
