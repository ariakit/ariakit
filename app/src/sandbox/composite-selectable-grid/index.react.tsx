import * as Ariakit from "@ariakit/react";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";
import type { CompositeSelectableStoreState } from "@ariakit/react-components/composite/composite-selectable-store";
import { clsx } from "clsx";
import { Check, Grid3X3, Rows3 } from "lucide-react";
import { useState } from "react";
import { projects } from "./data.ts";
import type { LaunchProject, ProjectStatus } from "./data.ts";

type SelectedIds = CompositeSelectableStoreState["selectedIds"];

const defaultSelectedIds = ["atlas", "beacon"] as const satisfies SelectedIds;

const rowColumns =
  "grid-cols-[minmax(16rem,1.45fr)_minmax(10rem,0.8fr)_minmax(8rem,0.65fr)_minmax(7rem,0.55fr)]";

const cellClassName = clsx(
  "flex min-h-16 items-center px-4 py-3 text-left outline-none",
  "data-active-item:relative data-active-item:z-10 data-active-item:outline-2 data-active-item:outline-offset-[-2px] data-active-item:outline-primary",
);

const statusClassNames: Record<ProjectStatus, string> = {
  "At risk": "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  Done: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  "On track": "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  Planning: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
};

interface ProjectRowProps {
  project: LaunchProject;
}

function ProjectRow({ project }: ProjectRowProps) {
  return (
    <Ariakit.CompositeRow
      id={project.id}
      role="row"
      aria-label={`${project.name} project`}
      render={
        <Ariakit.CompositeItem
          id={project.id}
          typeaheadText={project.name}
          render={<CompositeSelectable />}
        />
      }
      className={clsx(
        "group grid border-t border-black/10 transition-colors dark:border-white/10",
        rowColumns,
        "data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-12",
      )}
    >
      <Ariakit.CompositeItem
        id={`${project.id}-name`}
        role="gridcell"
        aria-label={`${project.name} name`}
        typeaheadText=""
        render={<div />}
        className={clsx(cellClassName, "gap-3")}
      >
        <span
          aria-hidden
          className={clsx(
            "grid size-6 shrink-0 place-items-center rounded-md border transition-colors",
            "group-data-[selected]:border-primary group-data-[selected]:bg-primary group-data-[selected]:text-white",
          )}
        >
          <Check className="size-3.5 opacity-0 group-data-[selected]:opacity-100" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{project.name}</span>
          <span className="ak-ink-70 block truncate text-sm">
            {project.description}
          </span>
        </span>
      </Ariakit.CompositeItem>
      <Ariakit.CompositeItem
        id={`${project.id}-owner`}
        role="gridcell"
        aria-label={`${project.name} owner`}
        typeaheadText=""
        render={<div />}
        className={cellClassName}
      >
        <span className="font-medium">{project.owner}</span>
      </Ariakit.CompositeItem>
      <Ariakit.CompositeItem
        id={`${project.id}-status`}
        role="gridcell"
        aria-label={`${project.name} status`}
        typeaheadText=""
        render={<div />}
        className={cellClassName}
      >
        <span
          className={clsx(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            statusClassNames[project.status],
          )}
        >
          {project.status}
        </span>
      </Ariakit.CompositeItem>
      <Ariakit.CompositeItem
        id={`${project.id}-updated`}
        role="gridcell"
        aria-label={`${project.name} updated`}
        typeaheadText=""
        render={<div />}
        className={clsx(cellClassName, "ak-ink-70 text-sm")}
      >
        {project.updated}
      </Ariakit.CompositeItem>
    </Ariakit.CompositeRow>
  );
}

interface SelectionSummaryProps {
  selectedIds: SelectedIds;
}

function SelectionSummary({ selectedIds }: SelectionSummaryProps) {
  const names = selectedIds.map((id) => {
    return projects.find((project) => project.id === id)?.name ?? id;
  });
  return (
    <output aria-label="Grid selection" className="ak-ink-70 text-sm">
      {names.length
        ? `${names.length} selected: ${names.join(", ")}`
        : "No projects selected"}
    </output>
  );
}

export default function Example() {
  const [selectedIds, setSelectedIds] =
    useState<SelectedIds>(defaultSelectedIds);
  const store = useCompositeSelectableStore({
    focusLoop: true,
    focusWrap: true,
    selectedIds,
    setSelectedIds,
    selectableBehavior: "replace",
    selectableMode: "multiple",
  });

  return (
    <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-col justify-between gap-5 py-4 sm:flex-row sm:items-end">
          <div>
            <span className="ak-badge-primary mb-3">
              <Grid3X3 aria-hidden className="ak-badge-icon size-3.5" />
              Row selection
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Launch portfolio
            </h1>
            <p id="grid-hint" className="ak-ink-70 mt-2 max-w-2xl">
              Focus moves cell by cell. Selection stays on rows. Use
              <kbd className="ak-kbd mx-1">Shift</kbd> with a click or arrow key
              to extend a range.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="ak-button-classic"
              onClick={() => store.selectAll()}
            >
              Select every project
            </button>
            <button
              type="button"
              className="ak-button"
              onClick={() => store.deselectAll()}
            >
              Clear projects
            </button>
          </div>
        </header>

        <section
          aria-label="Selectable project grid example"
          className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <Ariakit.Composite
              store={store}
              role="grid"
              aria-label="Launch portfolio"
              aria-describedby="grid-hint"
              className="min-w-[48rem] outline-none"
            >
              <div
                role="row"
                className={clsx(
                  "ak-layer ak-layer-darken-3 grid text-xs font-semibold tracking-wide uppercase",
                  rowColumns,
                )}
              >
                <span role="columnheader" className="px-4 py-3">
                  Project
                </span>
                <span role="columnheader" className="px-4 py-3">
                  Owner
                </span>
                <span role="columnheader" className="px-4 py-3">
                  Status
                </span>
                <span role="columnheader" className="px-4 py-3">
                  Updated
                </span>
              </div>
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </Ariakit.Composite>
          </div>
          <footer className="ak-layer ak-layer-darken-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-3 dark:border-white/10">
            <SelectionSummary selectedIds={selectedIds} />
            <span className="ak-ink-70 flex items-center gap-2 text-xs">
              <Rows3 aria-hidden className="size-3.5" />
              Cell endpoints resolve to their containing rows
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
