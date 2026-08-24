import * as Ariakit from "@ariakit/react";
import { Boxes, Keyboard, Sparkles } from "lucide-react";
import { useState } from "react";
import list from "./list.ts";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

function getId(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function getSelectionText(value: readonly string[]) {
  if (!value.length) return "Nothing selected";
  return `${value.length} selected: ${value.join(", ")}`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <Ariakit.ComboboxProvider selectedValue={value} setSelectedValue={setValue}>
      <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
        <div className="mx-auto grid w-full max-w-5xl gap-6">
          <header className="grid gap-3 py-4 text-center">
            <span className="ak-badge-primary mx-auto">
              <Sparkles aria-hidden className="ak-badge-icon size-3.5" />
              Automatic integration
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Select with ranges
            </h1>
            <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
              A multi-value ComboboxSelect gets keyboard range selection from
              its existing store. Its item markup does not opt in to a new
              component.
            </p>
          </header>

          <section className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-4 shadow-xl sm:p-6 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(20rem,1.2fr)]">
            <div className="grid content-start gap-5">
              <div>
                <span className="ak-badge-secondary mb-3">
                  <Keyboard aria-hidden className="ak-badge-icon size-3.5" />
                  No item composition
                </span>
                <h2 className="text-2xl font-semibold">Native select feel</h2>
                <p className="ak-ink-70 mt-2 text-sm">
                  Open the list, move without Shift to seat an anchor, then hold
                  Shift and use an arrow key to grow or shrink the range.
                </p>
              </div>

              <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-4">
                <p className="text-sm font-semibold">Keyboard recipe</p>
                <ol className="ak-ink-70 grid list-decimal gap-2 pl-5 text-sm">
                  <li>Open Favorite food.</li>
                  <li>Move to a new anchor with an arrow key.</li>
                  <li>
                    Hold <kbd className="ak-kbd">Shift</kbd> and continue with
                    <kbd className="ak-kbd ml-1">↑</kbd> or
                    <kbd className="ak-kbd ml-1">↓</kbd>.
                  </li>
                </ol>
              </div>

              <output
                aria-label="Automatic selection"
                className="ak-ink-70 text-sm"
              >
                {getSelectionText(value)}
              </output>
              <ul
                aria-label="Automatically selected foods"
                className="flex min-h-8 flex-wrap gap-2"
              >
                {value.map((item) => (
                  <li key={item} className="ak-badge-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid content-start gap-2">
              <Ariakit.ComboboxSelectLabel className="label">
                Favorite food
              </Ariakit.ComboboxSelectLabel>
              <Ariakit.ComboboxSelect className="combobox justify-between">
                <span className="truncate">{renderValue(value)}</span>
                <Ariakit.ComboboxSelectArrow />
              </Ariakit.ComboboxSelect>
              <p className="ak-ink-70 text-xs">
                Click still toggles one row. Shift with keyboard movement is
                handled by the composed store.
              </p>
              <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 mt-2 grid gap-3 p-4">
                <Boxes aria-hidden className="ak-ink-50 size-8" />
                <p className="text-sm font-semibold">
                  {list.length} ordered values
                </p>
                <p className="ak-ink-70 text-sm">
                  Range order follows the registered collection, independent of
                  the order in which values were selected.
                </p>
              </div>
              <Ariakit.ComboboxPopover
                gutter={4}
                sameWidth
                unmountOnHide
                className="popover max-h-72 overflow-auto p-2"
              >
                {list.map((item) => (
                  <Ariakit.ComboboxItem
                    key={item}
                    id={`select-food-${getId(item)}`}
                    value={item}
                    className="ak-option flex items-center gap-2"
                  >
                    <Ariakit.ComboboxItemCheck />
                    {item}
                  </Ariakit.ComboboxItem>
                ))}
              </Ariakit.ComboboxPopover>
            </div>
          </section>
        </div>
      </main>
    </Ariakit.ComboboxProvider>
  );
}
