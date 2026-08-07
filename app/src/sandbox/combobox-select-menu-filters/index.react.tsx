import * as Ariakit from "@ariakit/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const allFilters = [
  {
    label: "Status",
    values: ["Draft", "Published", "Archived"],
  },
  {
    label: "Language",
    values: ["English", "French", "German"],
  },
  {
    label: "Author",
    values: ["John Doe", "Jane Doe"],
  },
] as const;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

interface FilterSelectProps {
  label: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  value?: string;
  values: readonly string[];
}

function FilterSelect({
  label,
  onChange,
  onRemove,
  value,
  values,
}: FilterSelectProps) {
  const labelId = useId();
  const hasValue = useRef(!!value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const select = Ariakit.useComboboxStore({
    defaultSelectedValue: value ?? "",
    defaultOpen: !value,
    setSelectedValue(nextValue) {
      hasValue.current = !!nextValue;
      onChange(nextValue);
    },
  });
  const storeValue = Ariakit.useStoreState(select, "selectedValue");
  const selectedValue = value || storeValue;
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!select.getState().open) return;
      if (hasValue.current) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      if (!(event.target instanceof Node)) return;
      if (wrapper.contains(event.target)) return;
      const popover = select.getState().popoverElement;
      if (popover?.contains(event.target)) return;
      onRemove();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [onRemove, select]);
  return (
    <div
      ref={wrapperRef}
      className="flex items-center"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        window.setTimeout(() => {
          if (!hasValue.current) {
            onRemove();
          }
        });
      }}
    >
      <Ariakit.ComboboxSelect
        store={select}
        aria-labelledby={labelId}
        className="rounded-l border px-3 py-2"
      >
        <span id={labelId} aria-hidden>
          {label}:{" "}
        </span>
        {selectedValue || "Choose one"}
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        store={select}
        aria-labelledby={labelId}
        gutter={4}
        className="max-h-48 overflow-auto rounded border bg-white p-1"
      >
        {values.map((itemValue) => (
          <Ariakit.ComboboxItem
            key={itemValue}
            value={itemValue}
            onClick={() => {
              hasValue.current = true;
              onChange(itemValue);
            }}
          >
            <Ariakit.ComboboxItemCheck />
            {itemValue}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
      <Ariakit.Button
        className="rounded-r border px-3 py-2"
        aria-label={`Remove ${label} filter`}
        onClick={onRemove}
      >
        &times;
      </Ariakit.Button>
    </div>
  );
}

interface FiltersProps {
  mode: "checkbox" | "click";
}

function Filters({ mode }: FiltersProps) {
  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );
  const visibleFilters = useMemo(() => Object.keys(filters), [filters]);
  const menuValues = useMemo(() => ({ visibleFilters }), [visibleFilters]);
  const updateVisibleFilters: Ariakit.MenuStoreProps["setValues"] = (
    values,
  ) => {
    const nextVisibleFilters = values.visibleFilters;
    if (!isStringArray(nextVisibleFilters)) return;
    setFilters((currentFilters) =>
      Object.fromEntries(
        nextVisibleFilters.map((label) => [label, currentFilters[label]]),
      ),
    );
  };
  return (
    <fieldset className="flex flex-wrap items-end gap-2">
      <legend>
        {mode === "checkbox" ? "Checkbox filters" : "Click filters"}
      </legend>
      {visibleFilters.map((label) => {
        const filter = allFilters.find((item) => item.label === label);
        if (!filter) return null;
        return (
          <FilterSelect
            key={label}
            label={label}
            value={filters[label]}
            values={filter.values}
            onChange={(value) => {
              setFilters((currentFilters) => ({
                ...currentFilters,
                [label]: value,
              }));
            }}
            onRemove={() => {
              setFilters((currentFilters) => {
                const { [label]: _, ...remainingFilters } = currentFilters;
                return remainingFilters;
              });
            }}
          />
        );
      })}
      <Ariakit.MenuProvider
        values={mode === "checkbox" ? menuValues : undefined}
        setValues={mode === "checkbox" ? updateVisibleFilters : undefined}
      >
        <Ariakit.MenuButton className="rounded border px-3 py-2">
          Filters ({visibleFilters.length})
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu gutter={4} className="rounded border bg-white p-1">
          {allFilters.map((filter) =>
            mode === "checkbox" ? (
              <Ariakit.MenuItemCheckbox
                key={filter.label}
                name="visibleFilters"
                value={filter.label}
              >
                <Ariakit.MenuItemCheck />
                {filter.label}
              </Ariakit.MenuItemCheckbox>
            ) : (
              <Ariakit.MenuItem
                key={filter.label}
                onClick={() => {
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    [filter.label]: currentFilters[filter.label],
                  }));
                }}
              >
                {filter.label}
              </Ariakit.MenuItem>
            ),
          )}
          <Ariakit.MenuSeparator />
          <Ariakit.MenuItem onClick={() => setFilters({})}>
            Clear all
          </Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </fieldset>
  );
}

export default function Example() {
  return (
    <main className="grid gap-8">
      <Filters mode="checkbox" />
      <Filters mode="click" />
    </main>
  );
}
