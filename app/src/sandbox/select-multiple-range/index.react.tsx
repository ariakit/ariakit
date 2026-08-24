import * as Ariakit from "@ariakit/react";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import {
  Backpack,
  Keyboard,
  Layers3,
  MousePointerClick,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface GearItem {
  value: string;
  category: string;
  description: string;
  disabled?: boolean;
  href?: string;
}

const gear: readonly GearItem[] = [
  {
    value: "Compass",
    category: "Navigation",
    description: "Reliable bearing when the trail disappears.",
  },
  {
    value: "Field notebook",
    category: "Planning",
    description: "Weatherproof pages for routes and observations.",
  },
  {
    value: "Water filter",
    category: "Hydration",
    description: "Compact filtration for a full day outside.",
  },
  {
    value: "Headlamp",
    category: "Lighting",
    description: "Hands-free light with a low-power red mode.",
  },
  {
    value: "First-aid kit",
    category: "Safety",
    description: "Core supplies for common trail injuries.",
  },
  {
    value: "Satellite uplink",
    category: "Unavailable",
    description: "Reserved by another expedition this week.",
    disabled: true,
  },
  {
    value: "Emergency radio",
    category: "Safety",
    description: "Weather alerts and two-way communication.",
  },
  {
    value: "Thermal blanket",
    category: "Shelter",
    description: "Ultralight protection from wind and cold.",
  },
  {
    value: "Signal mirror",
    category: "Safety",
    description: "A daylight signal that works without batteries.",
  },
  {
    value: "Trail guide",
    category: "Reference",
    description: "A composed link that keeps navigation separate.",
    href: "#field-kit-notes",
  },
];

const initialValue = ["Field notebook", "Water filter"];

function getId(value: string) {
  return `field-kit-${value.toLowerCase().replaceAll(" ", "-")}`;
}

function renderSelectValue(value: readonly string[]) {
  if (!value.length) return "Choose field kit gear";
  if (value.length === 1) return value[0];
  return `${value.length} items packed`;
}

function renderSelection(value: readonly string[]) {
  if (!value.length) return "Nothing packed yet";
  return `${value.length} packed: ${value.join(", ")}`;
}

export default function Example() {
  const [value, setValue] = useState<string[]>(initialValue);
  const availableGear = gear.filter((item) => !item.disabled);

  return (
    <Ariakit.SelectProvider value={value} setValue={setValue}>
      <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header className="grid gap-3 py-4 text-center">
            <span className="ak-badge-primary mx-auto">
              <Sparkles aria-hidden className="ak-badge-icon size-3.5" />
              Legacy API experiment
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pack a field kit by range
            </h1>
            <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
              A multi-value Select now understands pointer and keyboard ranges
              through its existing item markup.
            </p>
          </header>

          <section className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-4 shadow-xl sm:p-6 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(22rem,1.2fr)]">
            <div className="grid content-start gap-5">
              <div id="field-kit-notes">
                <span className="ak-badge-secondary mb-3">
                  <Backpack aria-hidden className="ak-badge-icon size-3.5" />
                  Automatic Select integration
                </span>
                <h2 className="text-2xl font-semibold">Expedition manifest</h2>
                <p className="ak-ink-70 mt-2 text-sm">
                  The gear rows use automatic Select integration. The final
                  Trail guide row composes a link to test navigation without
                  duplicating selection state.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <article className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-2 p-4">
                  <MousePointerClick aria-hidden className="ak-ink-50 size-6" />
                  <h3 className="text-sm font-semibold">Pointer range</h3>
                  <p className="ak-ink-70 text-sm">
                    Click one row, then Shift-click another row to include the
                    available gear between them.
                  </p>
                </article>
                <article className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-2 p-4">
                  <Keyboard aria-hidden className="ak-ink-50 size-6" />
                  <h3 className="text-sm font-semibold">Keyboard range</h3>
                  <p className="ak-ink-70 text-sm">
                    Move once to seat the anchor, then hold
                    <kbd className="ak-kbd mx-1">Shift</kbd> with the arrow
                    keys.
                  </p>
                </article>
              </div>

              <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Layers3 aria-hidden className="size-4" />
                    Current manifest
                  </span>
                  <span className="ak-badge-primary">
                    {value.length}/{availableGear.length}
                  </span>
                </div>
                <output
                  aria-label="Field kit selection"
                  className="ak-ink-70 text-sm"
                >
                  {renderSelection(value)}
                </output>
                <ul
                  aria-label="Packed field kit gear"
                  className="flex min-h-7 flex-wrap gap-2"
                >
                  {value.map((item) => (
                    <li key={item} className="ak-badge-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="ak-button-classic"
                  onClick={() => {
                    setValue(availableGear.map((item) => item.value));
                  }}
                >
                  Pack all available gear
                </button>
                <button
                  type="button"
                  className="ak-button"
                  onClick={() => setValue(initialValue)}
                >
                  <RotateCcw aria-hidden className="size-4" />
                  Reset manifest
                </button>
                <button
                  type="button"
                  className="ak-button"
                  onClick={() => setValue([])}
                >
                  Clear manifest
                </button>
              </div>
            </div>

            <div className="grid min-w-0 content-start gap-3">
              <Ariakit.SelectLabel className="ak-ink-70 text-sm font-semibold">
                Field kit gear
              </Ariakit.SelectLabel>
              <Ariakit.Select className="ak-button-classic w-full justify-between">
                <span className="truncate">{renderSelectValue(value)}</span>
                <Ariakit.SelectArrow />
              </Ariakit.Select>
              <p className="ak-ink-70 text-xs">
                Open the list and try Shift-click or Shift with the arrow keys.
                The unavailable uplink is skipped by every range.
              </p>

              <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 mt-2 grid gap-2 p-4">
                <p className="text-sm font-semibold">No item composition</p>
                <code className="ak-ink-70 overflow-x-auto text-xs">
                  {'<SelectItem value="Compass" />'}
                </code>
              </div>

              <Ariakit.SelectPopover
                gutter={8}
                sameWidth
                unmountOnHide={false}
                className="ak-select-popover z-50 max-h-[28rem] overflow-auto p-2 shadow-xl"
              >
                {gear.map((item) => (
                  <Ariakit.SelectItem
                    key={item.value}
                    id={getId(item.value)}
                    value={item.value}
                    aria-label={item.value}
                    disabled={item.disabled}
                    render={
                      item.href ? (
                        <CompositeSelectable render={<a href={item.href} />} />
                      ) : undefined
                    }
                    className="ak-select-item group grid w-full cursor-default grid-cols-[auto_1fr_auto] items-center gap-3 text-left aria-selected:ak-layer-primary aria-selected:ak-layer-mix-15 data-active-item:outline-2 data-active-item:outline-offset-[-2px] data-active-item:outline-primary"
                  >
                    <span className="grid size-6 place-items-center rounded-full border border-current/20 group-aria-selected:border-primary group-aria-selected:bg-primary group-aria-selected:text-white">
                      <Ariakit.SelectItemCheck className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.value}</span>
                      <span className="ak-ink-70 block truncate text-sm">
                        {item.description}
                      </span>
                    </span>
                    <span
                      className={
                        item.disabled ? "ak-badge" : "ak-badge-secondary"
                      }
                    >
                      {item.category}
                    </span>
                  </Ariakit.SelectItem>
                ))}
              </Ariakit.SelectPopover>
            </div>
          </section>
        </div>
      </main>
    </Ariakit.SelectProvider>
  );
}
