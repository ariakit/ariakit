import * as Ariakit from "@ariakit/react";
import type { ComboboxRendererItem } from "@ariakit/react-components/combobox/combobox-renderer";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import type { CompositeRendererItemObject } from "@ariakit/react-components/composite/composite-renderer";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";
import { Check, Database, Layers3, Search, Sparkles } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

const countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Dominica",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kenya",
  "Latvia",
  "Lebanon",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Nepal",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Poland",
  "Portugal",
  "Romania",
  "Rwanda",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Vietnam",
  "Yemen",
  "Zambia",
] as const;

const finitePersistenceLimit = 4;

const defaultMultipleSelection = [
  "France",
  "India",
  "Georgia",
  "Germany",
  "Japan",
  "Mexico",
  "Norway",
  "Zambia",
];

function getItem(country: string) {
  return {
    id: `country-${country.toLowerCase().replaceAll(" ", "-")}`,
    value: country,
    selectable: true,
  } as const;
}

function groupItems(items: ReturnType<typeof getItem>[]) {
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const label = item.value[0] ?? "";
    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }
  return Array.from(groups, ([label, groupedItems]) => ({
    id: `group-${label.toLowerCase()}`,
    label,
    itemSize: 40,
    paddingStart: 32,
    items: groupedItems,
  })) satisfies ComboboxRendererItem[];
}

const defaultItems = countries.map(getItem);

interface MountedToneItem extends CompositeRendererItemObject {
  id: string;
  selectable: true;
  value: string;
}

interface MountedBranchRecord extends CompositeRendererItemObject {
  id: string;
  label: string;
}

const warmItems = [
  { id: "mounted-amber", value: "Amber", selectable: true },
  { id: "mounted-coral", value: "Coral", selectable: true },
] as const satisfies readonly MountedToneItem[];

const coolItems = [
  { id: "mounted-indigo", value: "Indigo", selectable: true },
  { id: "mounted-violet", value: "Violet", selectable: true },
] as const satisfies readonly MountedToneItem[];

const mountedItems = [...warmItems, ...coolItems];

const mountedBranchRecords = [
  {
    id: "mounted-warm-anchor",
    label: "Warm",
    itemSize: 40,
    paddingStart: 32,
    style: { height: 120 },
  },
  {
    id: "mounted-cool-anchor",
    label: "Cool",
    itemSize: 40,
    paddingStart: 32,
    style: { height: 120 },
  },
] as const satisfies readonly MountedBranchRecord[];

function getMountedBranchItems(id: string): readonly MountedToneItem[] {
  return id === mountedBranchRecords[0].id ? warmItems : coolItems;
}

function useCountryMatches(searchValue: string) {
  const [matches, setMatches] = useState(() => groupItems(defaultItems));
  useEffect(() => {
    startTransition(() => {
      const query = searchValue.toLowerCase();
      const filteredItems = defaultItems.filter((item) =>
        item.value.toLowerCase().includes(query),
      );
      setMatches(groupItems(filteredItems));
    });
  }, [searchValue]);
  return matches;
}

interface CountryRendererProps {
  items: ReturnType<typeof groupItems>;
  onMountedSelectedRowCountChange?: (count: number) => void;
  resetValueOnSelect?: boolean;
  selectedValuePersistenceLimit?: number;
  store: Ariakit.ComboboxStore;
}

function CountryRenderer({
  items,
  onMountedSelectedRowCountChange,
  resetValueOnSelect,
  selectedValuePersistenceLimit,
  store,
}: CountryRendererProps) {
  const [rendererElement, setRendererElement] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    const updateCount = () => {
      const count =
        rendererElement?.querySelectorAll(
          '[role="option"][aria-selected="true"]',
        ).length ?? 0;
      onMountedSelectedRowCountChange?.(count);
    };
    updateCount();
    if (!rendererElement) return;
    const MutationObserver =
      rendererElement.ownerDocument.defaultView?.MutationObserver;
    if (!MutationObserver) return;
    const observer = new MutationObserver(updateCount);
    observer.observe(rendererElement, {
      attributeFilter: ["aria-selected"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [rendererElement, onMountedSelectedRowCountChange]);

  return (
    <ComboboxRenderer
      ref={setRendererElement}
      store={store}
      items={items.length ? items : 0}
      gap={8}
      overscan={1}
      selectedValuePersistenceLimit={selectedValuePersistenceLimit}
    >
      {({ label, ...group }) => (
        <ComboboxRenderer
          key={group.id}
          {...group}
          id={`${group.id}-renderer`}
          overscan={1}
          selectedValuePersistenceLimit={selectedValuePersistenceLimit}
          render={(props) => (
            <Ariakit.ComboboxGroup {...props}>
              <Ariakit.ComboboxGroupLabel className="ak-layer ak-layer-base sticky top-12 z-10 p-2 font-semibold">
                {label}
              </Ariakit.ComboboxGroupLabel>
              {props.children}
            </Ariakit.ComboboxGroup>
          )}
        >
          {({ value, selectable, ...item }) => (
            <Ariakit.ComboboxItem
              key={item.id}
              {...item}
              value={value}
              resetValueOnSelect={resetValueOnSelect}
              data-range-selectable={selectable || undefined}
              className="ak-option flex items-center justify-between gap-2"
            >
              <span>{value}</span>
              <Ariakit.ComboboxItemCheck />
            </Ariakit.ComboboxItem>
          )}
        </ComboboxRenderer>
      )}
    </ComboboxRenderer>
  );
}

function SingleCountryPicker() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useCountryMatches(searchValue);
  const combobox = Ariakit.useComboboxStore({
    defaultItems,
    defaultSelectedValue: "",
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const selectedValue = Ariakit.useStoreState(combobox, "selectedValue");

  return (
    <article className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid content-start gap-5 p-4 shadow-xl sm:p-6">
      <div>
        <span className="ak-badge-secondary mb-3">
          <Database aria-hidden className="ak-badge-icon size-3.5" />
          Existing single fixture
        </span>
        <h2 className="text-2xl font-semibold">One country</h2>
        <p className="ak-ink-70 mt-2 text-sm">
          The original grouped, searchable, virtualized picker remains intact as
          the control case.
        </p>
      </div>

      <div className="grid gap-2">
        <Ariakit.ComboboxSelectLabel store={combobox} className="label">
          Country
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect
          store={combobox}
          className="combobox justify-between"
        >
          <span className="truncate">
            {selectedValue || "Select a country"}
          </span>
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover
          store={combobox}
          gutter={4}
          sameWidth
          className="popover overflow-auto"
          style={{ maxHeight: 240 }}
        >
          <div className="ak-layer ak-layer-base sticky top-0 z-20 p-2">
            <Ariakit.ComboboxInput
              store={combobox}
              autoSelect
              aria-label="Search countries"
              placeholder="Search..."
              className="combobox"
            />
          </div>
          <Ariakit.ComboboxList store={combobox} aria-label="Country options">
            <CountryRenderer store={combobox} items={matches} />
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </div>
    </article>
  );
}

function getSelectionText(selectedValues: readonly string[]) {
  if (!selectedValues.length) return "Nothing selected";
  return `${selectedValues.length} selected: ${selectedValues.join(", ")}`;
}

function MultipleCountryPicker() {
  const [searchValue, setSearchValue] = useState("");
  const [isPersistenceUnbounded, setPersistenceUnbounded] = useState(false);
  const [mountedSelectedRowCount, setMountedSelectedRowCount] = useState(0);
  const persistenceLimit = isPersistenceUnbounded
    ? Number.POSITIVE_INFINITY
    : finitePersistenceLimit;
  const matches = useCountryMatches(searchValue);
  const combobox = Ariakit.useComboboxStore({
    defaultItems,
    defaultSelectedValue: defaultMultipleSelection,
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const selectedValue = Ariakit.useStoreState(combobox, "selectedValue");

  return (
    <article className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid content-start gap-5 p-4 shadow-xl sm:p-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="ak-badge-primary">
            <Layers3 aria-hidden className="ak-badge-icon size-3.5" />
            Range delegate
          </span>
          <span className="ak-badge-secondary">
            {isPersistenceUnbounded
              ? "Persistence unbounded"
              : `Persistence cap ${finitePersistenceLimit}`}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">Many countries</h2>
        <p className="ak-ink-70 mt-2 text-sm">
          Every data item carries
          <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            selectable: true
          </code>
          so ranges and select-all include rows outside the rendered window.
        </p>
      </div>

      <div className="grid gap-2">
        <Ariakit.ComboboxSelectLabel store={combobox} className="label">
          Multiple countries
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect
          store={combobox}
          className="combobox justify-between"
        >
          <span className="truncate">
            {selectedValue.length
              ? `${selectedValue.length} countries selected`
              : "Select countries"}
          </span>
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Off-window persistence</p>
              <p className="ak-ink-70 mt-1 text-xs">
                The renderer defaults to 32. This demo makes a smaller cap and
                an unbounded mode easy to compare.
              </p>
            </div>
            <div
              role="group"
              aria-label="Persistence limit"
              className="ak-frame ak-frame-container/2 flex gap-1 p-1"
            >
              <button
                type="button"
                aria-pressed={!isPersistenceUnbounded}
                className="ak-button h-8 px-3 text-xs"
                onClick={() => setPersistenceUnbounded(false)}
              >
                Finite · {finitePersistenceLimit}
              </button>
              <button
                type="button"
                aria-pressed={isPersistenceUnbounded}
                className="ak-button h-8 px-3 text-xs"
                onClick={() => setPersistenceUnbounded(true)}
              >
                Unbounded · ∞
              </button>
            </div>
          </div>
          <output aria-label="Persistence mode" className="ak-ink-70 text-xs">
            {isPersistenceUnbounded
              ? "Unbounded: every selected row stays mounted outside the viewport."
              : `Finite: only the latest ${finitePersistenceLimit} selected rows stay mounted outside the viewport.`}
          </output>
          <output
            aria-label="Mounted selected rows"
            className="ak-frame ak-frame-field/field ak-layer ak-layer-lighten-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2"
          >
            <span className="text-lg font-semibold tabular-nums">
              {mountedSelectedRowCount} of {selectedValue.length}
            </span>{" "}
            <span className="ak-ink-70 text-xs">
              selected rows are mounted now. Open the list to measure, and close
              it before switching modes.
            </span>
          </output>
        </div>
        <ul className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 ak-ink-70 mt-2 grid gap-2 p-3 text-xs">
          <li>
            Open the list and press <kbd className="ak-kbd">Ctrl/⌘ A</kbd> while
            the select trigger owns focus to include every off-window item.
          </li>
          <li>
            Filtering narrows the delegate. Select an anchor, then hold Shift
            while moving through later matches without clearing hidden values.
          </li>
          <li>
            In the editable search field, <kbd className="ak-kbd">Ctrl/⌘ A</kbd>
            keeps its native text-selection behavior.
          </li>
        </ul>

        <Ariakit.ComboboxPopover
          store={combobox}
          gutter={4}
          sameWidth
          className="popover overflow-auto"
          style={{ maxHeight: 240 }}
        >
          <div className="ak-layer ak-layer-base sticky top-0 z-20 p-2">
            <div className="relative">
              <Search
                aria-hidden
                className="ak-ink-50 pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2"
              />
              <Ariakit.ComboboxInput
                store={combobox}
                autoSelect
                aria-label="Search multiple countries"
                placeholder="Filter..."
                className="combobox w-full pl-9"
              />
            </div>
          </div>
          <Ariakit.ComboboxList
            store={combobox}
            aria-label="Multiple country options"
          >
            <CountryRenderer
              store={combobox}
              items={matches}
              onMountedSelectedRowCountChange={setMountedSelectedRowCount}
              resetValueOnSelect={false}
              selectedValuePersistenceLimit={persistenceLimit}
            />
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </div>

      <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Stored membership</p>
          <button
            type="button"
            className="ak-button"
            onClick={() => combobox.setSelectedValue([])}
          >
            Clear
          </button>
        </div>
        <output
          aria-label="Virtual selection"
          className="ak-ink-70 max-h-24 overflow-auto text-sm"
        >
          {getSelectionText(selectedValue)}
        </output>
      </div>
    </article>
  );
}

function MountedSiblingPicker() {
  const [showBranches, setShowBranches] = useState(true);
  const store = useCompositeSelectableStore({
    focusLoop: true,
    selectableBehavior: "replace",
  });
  const selectedIds = Ariakit.useStoreState(store, "selectedIds");
  const selectedValues = selectedIds.map((id) => {
    return mountedItems.find((item) => item.id === id)?.value ?? id;
  });

  return (
    <article className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-4 shadow-xl sm:p-6 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <div className="grid content-start gap-4">
        <span className="ak-badge-primary w-fit">
          <Layers3 aria-hidden className="ak-badge-icon size-3.5" />
          Mounted sibling probe
        </span>
        <div>
          <h2 className="text-2xl font-semibold">Order from live branches</h2>
          <p className="ak-ink-70 mt-2 max-w-xl text-sm">
            The two parent records contain no nested item data. Their mounted
            child renderers contribute the selectable rows, while parent anchors
            and live DOM position define one shared order.
          </p>
        </div>
        <ul className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 ak-ink-70 grid gap-2 p-3 text-xs">
          <li>
            Select Coral, then Shift-select Indigo to cross from Warm to Cool.
          </li>
          <li>
            Start from Indigo and Shift-select Coral to verify the same logical
            order in reverse.
          </li>
          <li>
            Switch the root source to <code>0</code>, restore its array, and
            select all four rows.
          </li>
        </ul>
      </div>

      <div className="grid content-start gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <output
            aria-label="Mounted branch source"
            className="ak-badge-secondary"
          >
            Root source: {showBranches ? "array" : "0"}
          </output>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="ak-button h-8 px-3 text-xs"
              onClick={() => setShowBranches((show) => !show)}
            >
              {showBranches
                ? "Hide sibling branches"
                : "Restore sibling branches"}
            </button>
            <button
              type="button"
              className="ak-button h-8 px-3 text-xs"
              onClick={() => store.selectAll()}
            >
              Select all mounted
            </button>
          </div>
        </div>
        <Ariakit.Composite
          store={store}
          role="listbox"
          aria-label="Mounted sibling branches"
          className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid min-h-40 gap-2 p-2 outline-none"
        >
          <CompositeRenderer<MountedBranchRecord>
            items={showBranches ? mountedBranchRecords : 0}
            gap={8}
            overscan={1}
          >
            {({ label, ...group }) => (
              <CompositeRenderer<MountedToneItem>
                key={group.id}
                {...group}
                id={`${group.id}-renderer`}
                items={getMountedBranchItems(group.id)}
                overscan={1}
                render={(props) => (
                  <div
                    {...props}
                    role="group"
                    aria-label={`${label} tones`}
                    className="grid gap-1"
                  >
                    <h3 className="ak-ink-70 px-2 pt-1 text-xs font-semibold uppercase tracking-wide">
                      {label}
                    </h3>
                    {props.children}
                  </div>
                )}
              >
                {({ value, selectable, ...item }) => (
                  <Ariakit.CompositeItem
                    key={item.id}
                    {...item}
                    role="option"
                    aria-label={value}
                    render={<CompositeSelectable />}
                    data-range-selectable={selectable || undefined}
                    className="ak-option group flex items-center justify-between gap-2"
                  >
                    <span>{value}</span>
                    <Check
                      aria-hidden
                      className="size-4 opacity-0 group-data-[selected]:opacity-100"
                    />
                  </Ariakit.CompositeItem>
                )}
              </CompositeRenderer>
            )}
          </CompositeRenderer>
        </Ariakit.Composite>
        <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Mounted membership</p>
            <button
              type="button"
              className="ak-button"
              onClick={() => store.deselectAll()}
            >
              Clear mounted selection
            </button>
          </div>
          <output aria-label="Mounted selection" className="ak-ink-70 text-sm">
            {getSelectionText(selectedValues)}
          </output>
        </div>
      </div>
    </article>
  );
}

export default function Example() {
  return (
    <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="grid gap-3 py-4 text-center">
          <span className="ak-badge-primary mx-auto">
            <Sparkles aria-hidden className="ak-badge-icon size-3.5" />
            Virtualized experiment
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Selection beyond the viewport
          </h1>
          <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
            Compare the existing single picker with multi-selection backed by
            renderer data, filtered range geometry, and bounded persistence.
          </p>
        </header>

        <section className="grid items-start gap-6 lg:grid-cols-2">
          <SingleCountryPicker />
          <MultipleCountryPicker />
          <MountedSiblingPicker />
        </section>
      </div>
    </main>
  );
}
