import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureGroup,
} from "#app/examples/_lib/html/disclosure.react.tsx";

const tasks = [
  {
    title: "Set up payments",
    tasks: [
      { title: "Choose how to accept payments", checked: true },
      { title: "Create a one-off product", checked: true },
      { title: "View Checkout docs", checked: true },
    ],
  },
  {
    title: "Set up invoices",
    tasks: [
      { title: "Add your branding", checked: true },
      { title: "Create an invoice", checked: true },
    ],
  },
  {
    title: "Verify your business",
    tasks: [
      { title: "Verify your email", checked: true },
      { title: "Complete your profile", checked: false },
    ],
  },
  {
    title: "Go live",
    tasks: [{ title: "Send your invoice", checked: false }],
  },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full rounded-full overflow-hidden ak-layer-pop">
      <div
        className="h-full bg-[var(--ak-primary)] transition-[width] duration-300"
        style={{ width: `${value * 100}%` }}
        role="progressbar"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

export default function Example() {
  const firstPending = tasks.find((t) => !t.tasks.every((t) => t.checked));
  const totalTasks = tasks.reduce((total, t) => total + t.tasks.length, 0);
  const totalCompleted = tasks.reduce(
    (total, t) => total + t.tasks.filter((t) => t.checked).length,
    0,
  );
  const progress = totalCompleted / totalTasks;

  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const group of tasks) {
        for (const task of group.tasks) {
          initial[`${group.title}-${task.title}`] = task.checked;
        }
      }
      return initial;
    },
  );

  const toggleTask = (groupTitle: string, taskTitle: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [`${groupTitle}-${taskTitle}`]: !prev[`${groupTitle}-${taskTitle}`],
    }));
  };

  return (
    <div className="w-90 max-w-[100cqi] grid gap-4">
      <div className="ak-frame-card/1 ak-layer ak-bordering grid gap-(--ak-frame-padding)">
        <div className="ak-frame-field grid gap-4">
          <h2 className="font-semibold">Setup guide</h2>
          <ProgressBar value={progress} />
          <p className="text-sm ak-text/60">
            {totalCompleted} of {totalTasks} tasks completed
          </p>
        </div>
        <DisclosureGroup>
          {tasks.map((group) => {
            const length = group.tasks.length;
            const checked = group.tasks.filter(
              (task) => checkedTasks[`${group.title}-${task.title}`],
            ).length;
            const groupProgress = checked / length;
            const completed = groupProgress === 1;
            return (
              <Disclosure
                key={group.title}
                defaultOpen={group.title === firstPending?.title}
              >
                <DisclosureButton
                  indicator="chevron-down-end"
                  className={
                    completed
                      ? "group-open/disclosure:opacity-100 not-group-open/disclosure:ak-text/60 not-group-open/disclosure:line-through not-group-open/disclosure:font-normal"
                      : ""
                  }
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex items-center justify-center size-5 rounded-full text-xs font-medium ak-layer-pop"
                      style={{
                        background: `conic-gradient(var(--ak-primary) ${groupProgress * 100}%, transparent 0)`,
                      }}
                    >
                      <span className="size-3 rounded-full ak-layer-current" />
                    </span>
                    {group.title}
                  </span>
                </DisclosureButton>
                <DisclosureContent>
                  <ul className="grid gap-1 p-2">
                    {group.tasks.map((task) => {
                      const isChecked =
                        checkedTasks[`${group.title}-${task.title}`];
                      return (
                        <li key={task.title}>
                          <label className="ak-button justify-start text-wrap font-normal cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                toggleTask(group.title, task.title)
                              }
                              className="sr-only peer"
                            />
                            <span
                              className={`size-4 rounded border flex items-center justify-center ${isChecked ? "bg-[var(--ak-primary)] border-[var(--ak-primary)]" : "ak-layer-pop"}`}
                            >
                              {isChecked && (
                                <svg
                                  className="size-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                            <span
                              className={
                                isChecked ? "line-through ak-text/60" : ""
                              }
                            >
                              {task.title}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </DisclosureContent>
              </Disclosure>
            );
          })}
        </DisclosureGroup>
      </div>
    </div>
  );
}
