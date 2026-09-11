import { useState } from "react";
import "./style.css";

const edges = [
  ["Border 1", "ak-frame-border"],
  ["Border 2", "ak-frame-border-2"],
  ["Border 4", "ak-frame-border-4"],
  ["Border 8", "ak-frame-border-8"],
  ["Border 3", "ak-frame-border-[3px]"],
  ["Ring 2", "ak-frame-ring-2"],
  ["Adaptive 2", "ak-frame-bordering-2"],
] as const;

interface GroupProps {
  title: string;
  edge: string;
  vertical?: boolean;
  rtl?: boolean;
  parentClassName?: string;
  itemClassName?: string;
  hideable?: boolean;
  nestedCover?: boolean;
}

function Group({
  title,
  edge,
  vertical = false,
  rtl = false,
  parentClassName = "",
  itemClassName = "",
  hideable = false,
  nestedCover = false,
}: GroupProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  return (
    <section aria-label={title} className="grid gap-2">
      <h2>{title}</h2>
      {hideable && (
        <label>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(event) => setHidden(event.target.checked)}
          />{" "}
          Hide Day and Month
        </label>
      )}
      <div
        role="group"
        aria-label={title}
        dir={rtl ? "rtl" : "ltr"}
        className={`ak-frame ak-frame-xl/0 ak-frame-join flex w-fit ${vertical ? "ak-frame-col flex-col" : "ak-frame-row"} ${parentClassName}`}
      >
        <span hidden>Layout controls</span>
        {["Day", "Week", "Month"].map((label) => (
          <button
            key={label}
            type="button"
            tabIndex={0}
            hidden={hidden && label !== "Week"}
            aria-pressed={selected.includes(label)}
            onClick={() =>
              setSelected((values) =>
                values.includes(label)
                  ? values.filter((value) => value !== label)
                  : [...values, label],
              )
            }
            className={`ak-frame-join-item ak-layer ak-layer-transparent ak-frame ak-frame-lg/2 w-24 h-12 ${edge} hover:ak-layer-10 hover:ak-frame-join-active ${label === "Week" ? "aria-pressed:ak-layer-amber-200" : "aria-pressed:ak-layer-blue-200"} aria-pressed:ak-frame-join-active ak-outline outline-offset-2 focus-visible:outline-2 ${itemClassName}`}
          >
            <span
              className={
                nestedCover
                  ? "ak-text ak-frame ak-frame-cover block"
                  : "ak-text"
              }
            >
              {label}
            </span>
          </button>
        ))}
        <span aria-hidden="true" className="absolute size-0" />
      </div>
    </section>
  );
}

export default function Example() {
  return (
    <main className="ak-layer ak-layer-white dark:ak-layer-gray-950 grid gap-8 p-8">
      {edges.map(([title, edge]) => (
        <Group key={title} title={title} edge={edge} />
      ))}
      <Group title="RTL" edge="ak-frame-border-2" rtl />
      <Group title="Vertical" edge="ak-frame-border-2" vertical />
      <Group title="Vertical ring" edge="ak-frame-ring-2" vertical />
      <Group title="Hidden items" edge="ak-frame-border-2" hideable />
      <Group
        title="Cover"
        edge="ak-frame-border-2"
        itemClassName="ak-frame-cover"
      />
      <Group
        title="Shadow"
        edge="ak-frame-ring-2"
        itemClassName="shadow-[0_6px_8px_red] inset-shadow-[0_2px_2px_blue]"
      />
      <Group
        title="Padded"
        edge="ak-frame-border-2"
        parentClassName="ak-frame-p-4"
      />
      <Group
        title="Auto gap"
        edge="ak-frame-border-2"
        parentClassName="ak-frame-join-auto ak-frame-p-4 gap-(--ak-frame-padding)"
      />
      <Group title="No edge" edge="ak-frame-border-0" />
      <Group title="Nested cover" edge="ak-frame-border-2" nestedCover />
    </main>
  );
}
