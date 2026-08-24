import * as Ariakit from "@ariakit/react";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { clsx } from "clsx";
import { FlaskConical, Search, Sparkles } from "lucide-react";
import { matchSorter } from "match-sorter";
import { useMemo, useState, useTransition } from "react";
import list from "./list.ts";

const itemClassName = clsx(
  "ak-option group flex cursor-default scroll-m-2 items-center gap-2 opacity-[var(--item-opacity,1)] outline-none transition",
  "hover:ak-layer-primary hover:ak-layer-mix-10 data-[active-item]:ak-layer-primary data-[active-item]:text-white",
  "data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-20",
);

const experimentItems = [
  {
    id: "range-start",
    label: "Range start",
    description: "Explicitly composed anchor",
  },
  {
    id: "composite-selection-disabled",
    label: "Composite opt-out",
    description: "selectable={false}",
  },
  {
    id: "range-end",
    label: "Range end",
    description: "Explicitly composed target",
  },
  {
    id: "native-selection-disabled",
    label: "Native handler off",
    description: "selectValueOnClick callback returns false",
  },
  {
    id: "legacy-toggle",
    label: "Legacy toggle",
    description: "Uncomposed item",
  },
  {
    id: "selection-guide",
    label: "Selection guide",
    description: "Modifier click keeps navigation separate",
  },
] as const;

function getId(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function getSelectionText(selectedValues: readonly string[]) {
  if (!selectedValues.length) return "Nothing selected";
  return `${selectedValues.length} selected: ${selectedValues.join(", ")}`;
}

interface FoodOptionProps {
  label?: string;
  value: string;
}

function FoodOption({ label, value }: FoodOptionProps) {
  return (
    <Ariakit.ComboboxItem
      id={`food-${getId(label ?? value)}`}
      value={value}
      aria-label={label}
      focusOnHover
      resetValueOnSelect={label ? false : undefined}
      render={<CompositeSelectable />}
      className={itemClassName}
    >
      <Ariakit.ComboboxItemCheck />
      <span className="min-w-0 flex-1 truncate">{label ?? value}</span>
      {label && <span className="ak-badge-secondary">Same value</span>}
    </Ariakit.ComboboxItem>
  );
}

interface ExperimentItemsProps {
  onGateCall: () => void;
  searchValue: string;
}

function ExperimentItems({ onGateCall, searchValue }: ExperimentItemsProps) {
  const query = searchValue.toLowerCase();
  const matches = experimentItems.filter((item) =>
    item.label.toLowerCase().includes(query),
  );

  return matches.map((item) => {
    const content = (
      <>
        <Ariakit.ComboboxItemCheck />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{item.label}</span>
          <span className="ak-ink-70 block text-xs group-data-[active-item]:text-white">
            {item.description}
          </span>
        </span>
      </>
    );

    if (item.id === "native-selection-disabled") {
      return (
        <Ariakit.ComboboxItem
          key={item.id}
          id={item.id}
          value={item.label}
          aria-label={item.label}
          selectValueOnClick={() => {
            onGateCall();
            return false;
          }}
          render={<CompositeSelectable />}
          className={itemClassName}
        >
          {content}
        </Ariakit.ComboboxItem>
      );
    }

    if (item.id === "composite-selection-disabled") {
      return (
        <Ariakit.ComboboxItem
          key={item.id}
          id={item.id}
          value={item.label}
          aria-label={item.label}
          render={<CompositeSelectable selectable={false} />}
          className={itemClassName}
        >
          {content}
        </Ariakit.ComboboxItem>
      );
    }

    if (item.id === "range-start" || item.id === "range-end") {
      return (
        <Ariakit.ComboboxItem
          key={item.id}
          id={item.id}
          value={item.label}
          aria-label={item.label}
          render={<CompositeSelectable />}
          className={itemClassName}
        >
          {content}
        </Ariakit.ComboboxItem>
      );
    }

    if (item.id === "selection-guide") {
      return (
        <Ariakit.ComboboxItem
          key={item.id}
          id={item.id}
          value={item.label}
          aria-label={item.label}
          render={
            <CompositeSelectable render={<a href="#selection-contract" />} />
          }
          className={itemClassName}
        >
          {content}
        </Ariakit.ComboboxItem>
      );
    }

    return (
      <Ariakit.ComboboxItem
        key={item.id}
        id={item.id}
        value={item.label}
        aria-label={item.label}
        className={itemClassName}
      >
        {content}
      </Ariakit.ComboboxItem>
    );
  });
}

export default function Example() {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [selectedValues, setSelectedValues] = useState(["Bacon"]);
  const [gateCallCount, setGateCallCount] = useState(0);

  const matches = useMemo(() => matchSorter(list, searchValue), [searchValue]);
  const showDuplicateApple =
    searchValue.toLowerCase() === "apple" && matches.includes("Apple");
  const showExperimentItems = experimentItems.some((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <Ariakit.ComboboxProvider
      selectedValue={selectedValues}
      setSelectedValue={setSelectedValues}
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
        <div className="mx-auto grid w-full max-w-5xl gap-6">
          <header className="grid gap-3 py-4 text-center">
            <span className="ak-badge-primary mx-auto">
              <Sparkles aria-hidden className="ak-badge-icon size-3.5" />
              Explicit composition
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Editable range picker
            </h1>
            <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
              Search a long menu, toggle exact values, or hold Shift while you
              click to extend a range. Duplicate rows share one value.
            </p>
          </header>

          <section className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-4 shadow-xl sm:p-6 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(20rem,1.2fr)]">
            <div className="grid content-start gap-5">
              <div id="selection-contract">
                <span className="ak-badge-secondary mb-3">
                  <FlaskConical
                    aria-hidden
                    className="ak-badge-icon size-3.5"
                  />
                  API experiment
                </span>
                <h2 className="text-2xl font-semibold">Selection contract</h2>
                <p className="ak-ink-70 mt-2 text-sm">
                  The host detects each explicit
                  <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
                    CompositeSelectable
                  </code>
                  opt-in and leaves click mutation to the composed behavior.
                </p>
              </div>

              <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-4">
                <p className="text-sm font-semibold">Try these gestures</p>
                <ul className="ak-ink-70 grid gap-2 text-sm">
                  <li>
                    Click a row to set the range anchor, then
                    <kbd className="ak-kbd mx-1">Shift</kbd> + click another
                    row.
                  </li>
                  <li>
                    <kbd className="ak-kbd">Ctrl/⌘ A</kbd> stays native in the
                    editable field and selects its text.
                  </li>
                  <li>
                    Filter after selecting to keep hidden values selected.
                  </li>
                  <li>
                    Type <kbd className="ak-kbd">apple</kbd> to reveal two rows
                    backed by the same value.
                  </li>
                  <li>
                    Modifier-click the Selection guide row to navigate without
                    changing the selection.
                  </li>
                </ul>
              </div>

              <output
                aria-label="Editable selection"
                className="ak-ink-70 text-sm"
              >
                {getSelectionText(selectedValues)}
              </output>
              <output aria-label="Gate calls" className="ak-ink-70 text-sm">
                Gate callback calls: {gateCallCount}
              </output>
              <ul
                aria-label="Selected foods"
                className="flex min-h-8 flex-wrap gap-2"
              >
                {selectedValues.map((value) => (
                  <li key={value} className="ak-badge-primary">
                    {value}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid content-start gap-2">
              <Ariakit.ComboboxLabel className="label">
                Your favorite food
              </Ariakit.ComboboxLabel>
              <div className="relative">
                <Search
                  aria-hidden
                  className="ak-ink-50 pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2"
                />
                <Ariakit.Combobox
                  placeholder="e.g., Apple, Burger"
                  className="combobox w-full pl-9"
                />
              </div>
              <p className="ak-ink-70 text-xs">
                The lab rows at the end compare disabled native selection,
                disabled composition, and unchanged legacy toggling.
              </p>
              <Ariakit.ComboboxPopover
                sameWidth
                gutter={8}
                className="relative z-50 flex max-h-[min(var(--popover-available-height,300px),300px)] flex-col overflow-auto overscroll-contain rounded-lg border border-solid border-gray-250 bg-white p-2 text-black shadow-lg outline-none aria-busy:[--item-opacity:0.5] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-lg-dark"
                aria-busy={isPending}
              >
                {matches.map((value) => (
                  <FoodOption key={value} value={value} />
                ))}
                {showDuplicateApple && (
                  <FoodOption label="Apple — market pick" value="Apple" />
                )}
                {showExperimentItems && (
                  <>
                    <Ariakit.ComboboxSeparator className="my-2" />
                    <ExperimentItems
                      searchValue={searchValue}
                      onGateCall={() => {
                        setGateCallCount((count) => count + 1);
                      }}
                    />
                  </>
                )}
                {!matches.length && !showExperimentItems && (
                  <div className="no-results">No results found</div>
                )}
              </Ariakit.ComboboxPopover>
            </div>
          </section>
        </div>
      </main>
    </Ariakit.ComboboxProvider>
  );
}
