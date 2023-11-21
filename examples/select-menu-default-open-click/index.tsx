import "./style.css";
import { useMemo, useState } from "react";
import { allFilters } from "../select-menu-default-open/all-filters.js";
import {
  FilterMenu,
  FilterMenuItem,
  FilterMenuSeparator,
} from "../select-menu-default-open/filter-menu.jsx";
import {
  FilterSelect,
  FilterSelectItem,
} from "../select-menu-default-open/filter-select.jsx";

type Filters = Record<string, string | undefined>;

export default function Example() {
  const [filters, setFilters] = useState<Filters>({});
  const visibleFilters = useMemo(() => Object.keys(filters), [filters]);
  return (
    <div className="wrapper">
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
        <FilterMenu label={`Filters (${visibleFilters.length})`}>
          {allFilters.map((filter) => (
            <FilterMenuItem
              key={filter.label}
              onClick={() => {
                setFilters((filters) => ({
                  ...filters,
                  [filter.label]: filters[filter.label],
                }));
              }}
            >
              {filter.label}
            </FilterMenuItem>
          ))}
          <FilterMenuSeparator />
          <FilterMenuItem onClick={() => setFilters({})}>
            Clear all
          </FilterMenuItem>
        </FilterMenu>
      </div>
    </div>
  );
}
