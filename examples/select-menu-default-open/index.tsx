import "./style.css";
import { useMemo, useState } from "react";
import { allFilters } from "./all-filters.js";
import {
  FilterMenu,
  FilterMenuItem,
  FilterMenuItemCheckbox,
  FilterMenuSeparator,
} from "./filter-menu.jsx";
import { FilterSelect, FilterSelectItem } from "./filter-select.jsx";

type Filters = Record<string, string | undefined>;

export default function Example() {
  const [filters, setFilters] = useState<Filters>({});
  const visibleFilters = useMemo(() => Object.keys(filters), [filters]);
  const menuValues = useMemo(() => ({ visibleFilters }), [visibleFilters]);

  return (
    <div className="wrapper">
      <div className="search-wrapper">
        <input type="text" placeholder="Search" className="input" />
        <FilterMenu
          label={`Filters (${visibleFilters.length})`}
          values={menuValues}
          onValuesChange={(values: typeof menuValues) => {
            setFilters((filters) =>
              Object.fromEntries(
                values.visibleFilters.map((label) => [label, filters[label]]),
              ),
            );
          }}
        >
          {allFilters.map((filter) => (
            <FilterMenuItemCheckbox
              name="visibleFilters"
              key={filter.label}
              value={filter.label}
            />
          ))}
          <FilterMenuSeparator />
          <FilterMenuItem onClick={() => setFilters({})}>
            Clear all
          </FilterMenuItem>
        </FilterMenu>
      </div>
      <div className="filters">
        {visibleFilters.map((label) => (
          <FilterSelect
            key={label}
            label={label}
            defaultValue=""
            defaultOpen={!filters[label]}
            value={filters[label]}
            onChange={(value: string) => {
              setFilters((filters) => ({ ...filters, [label]: value }));
            }}
            onRemove={() => {
              setFilters((filters) => {
                const { [label]: _, ...rest } = filters;
                return rest;
              });
            }}
          >
            {allFilters
              .find((f) => f.label === label)
              ?.values.map((value) => (
                <FilterSelectItem key={value} value={value} />
              ))}
          </FilterSelect>
        ))}
      </div>
    </div>
  );
}
