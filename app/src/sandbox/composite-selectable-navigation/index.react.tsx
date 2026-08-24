import * as Ariakit from "@ariakit/react";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";
import { ArrowDown, CornerDownRight, MousePointer2 } from "lucide-react";
import { useState } from "react";

const optionClassName =
  "ak-option cursor-default text-left data-[active-item]:outline-2 data-[active-item]:outline-offset-[-2px] data-[active-item]:outline-primary data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-15";

const wrappedGridItems = [
  { id: "alpha" },
  { id: "alpha-left", rowId: "alpha" },
  { id: "alpha-right", rowId: "alpha" },
  { id: "beta" },
  { id: "beta-left", rowId: "beta" },
  { id: "beta-right", rowId: "beta" },
];

const wrappedGridRangeDelegate = {
  getKeysInRange(fromId: string, toId: string) {
    const rowIds = ["alpha", "beta"];
    const fromIndex = rowIds.indexOf(fromId);
    const toIndex = rowIds.indexOf(toId);
    if (fromIndex < 0) return null;
    if (toIndex < 0) return null;
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    return rowIds.slice(startIndex, endIndex + 1);
  },
  getOrderedKeys: () => ["alpha", "beta"],
};

const axisGridItems = [
  { id: "axis-top" },
  { id: "axis-top-cell", rowId: "axis-top" },
  { id: "axis-bottom" },
  { id: "axis-bottom-cell", rowId: "axis-bottom" },
];

const axisGridRangeDelegate = {
  getKeysInRange(fromId: string, toId: string) {
    const rowIds = ["axis-top", "axis-bottom"];
    const fromIndex = rowIds.indexOf(fromId);
    const toIndex = rowIds.indexOf(toId);
    if (fromIndex < 0) return null;
    if (toIndex < 0) return null;
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    return rowIds.slice(startIndex, endIndex + 1);
  },
  getOrderedKeys: () => ["axis-top", "axis-bottom"],
};

const elementlessItems = [
  { id: "elementless-first" },
  { id: "elementless-terminal" },
];

function SelectionStatus({
  label,
  names,
}: {
  label: string;
  names: readonly string[];
}) {
  return (
    <output aria-label={label} className="ak-ink-70 text-sm">
      {names.length
        ? `${names.length} selected: ${names.join(", ")}`
        : "Nothing selected"}
    </output>
  );
}

function OpenBoundaryList() {
  const store = Ariakit.useCompositeStore({
    focusLoop: false,
    orientation: "vertical",
  });
  const [defaultPrevented, setDefaultPrevented] = useState<boolean | null>(
    null,
  );

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Open boundary</h3>
        <span className="ak-badge-secondary">Plain composite</span>
      </div>
      <div
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          if (!event.shiftKey) return;
          setDefaultPrevented(event.defaultPrevented);
        }}
      >
        <Ariakit.Composite
          store={store}
          role="listbox"
          aria-label="Plain boundary list"
          className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none"
        >
          <Ariakit.CompositeItem
            id="plain-start"
            role="option"
            render={<button type="button" />}
            className={optionClassName}
          >
            Starting item
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem
            id="plain-terminal"
            role="option"
            render={<button type="button" />}
            className={optionClassName}
          >
            Terminal item
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      </div>
      <output aria-label="Boundary key result" className="ak-ink-70 text-sm">
        {defaultPrevented == null
          ? "Focus the terminal item, then press Shift+ArrowDown."
          : defaultPrevented
            ? "Default action prevented"
            : "Default action allowed"}
      </output>
    </section>
  );
}

interface LoopBoundaryProps {
  badge: string;
  firstId: string;
  firstLabel: string;
  listLabel: string;
  pageResultLabel?: string;
  resultLabel: string;
  selectable?: boolean;
  shortcutResultLabel?: string;
  store: Ariakit.CompositeStore;
  terminalId: string;
  terminalLabel: string;
  title: string;
}

function LoopBoundary({
  badge,
  firstId,
  firstLabel,
  listLabel,
  pageResultLabel,
  resultLabel,
  selectable,
  shortcutResultLabel,
  store,
  terminalId,
  terminalLabel,
  title,
}: LoopBoundaryProps) {
  const [defaultPrevented, setDefaultPrevented] = useState<boolean | null>(
    null,
  );
  const [pageResult, setPageResult] = useState<string | null>(null);
  const [shortcutResult, setShortcutResult] = useState<string | null>(null);
  const renderItem = selectable ? (
    <CompositeSelectable />
  ) : (
    <button type="button" />
  );

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="ak-badge-secondary">{badge}</span>
      </div>
      <div
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && event.shiftKey) {
            setDefaultPrevented(event.defaultPrevented);
          }
          if (
            pageResultLabel &&
            event.shiftKey &&
            (event.key === "PageUp" || event.key === "PageDown")
          ) {
            const result = event.defaultPrevented ? "prevented" : "allowed";
            setPageResult(`${event.key} default ${result}`);
          }
          if (event.code !== "KeyA") return;
          if (!event.ctrlKey && !event.metaKey) return;
          const modifier = event.metaKey ? "Meta" : "Control";
          const result = event.defaultPrevented ? "prevented" : "allowed";
          setShortcutResult(`${modifier}+A default ${result}`);
        }}
      >
        <Ariakit.Composite
          store={store}
          role="listbox"
          aria-label={listLabel}
          className={`ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none ${pageResultLabel ? "h-24 overflow-y-auto" : ""}`}
        >
          <Ariakit.CompositeItem
            id={firstId}
            role="option"
            render={renderItem}
            className={optionClassName}
          >
            {firstLabel}
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem
            id={terminalId}
            role="option"
            render={renderItem}
            className={optionClassName}
          >
            {terminalLabel}
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      </div>
      <output aria-label={resultLabel} className="ak-ink-70 text-sm">
        {defaultPrevented == null
          ? "Shift+ArrowDown from the terminal item wraps."
          : defaultPrevented
            ? "Default action prevented"
            : "Default action allowed"}
      </output>
      {pageResultLabel && (
        <output aria-label={pageResultLabel} className="ak-ink-70 text-sm">
          {pageResult ?? "Shift+PageUp/PageDown stops at the range boundary."}
        </output>
      )}
      {shortcutResultLabel && (
        <output aria-label={shortcutResultLabel} className="ak-ink-70 text-sm">
          {shortcutResult ?? "Control/Meta+A keeps its browser default."}
        </output>
      )}
    </section>
  );
}

function PlainLoopBoundary() {
  const store = Ariakit.useCompositeStore({
    focusLoop: true,
    orientation: "vertical",
  });
  return (
    <LoopBoundary
      badge="Plain composite"
      firstId="plain-loop-first"
      firstLabel="Plain loop first"
      listLabel="Plain looping list"
      resultLabel="Plain loop key result"
      store={store}
      terminalId="plain-loop-terminal"
      terminalLabel="Plain loop terminal"
      title="Ordinary Shift loop"
    />
  );
}

function ModeLoopBoundary({ mode }: { mode: "multiple" | "none" | "single" }) {
  const store = useCompositeSelectableStore({
    focusLoop: true,
    orientation: "vertical",
    selectableMode: mode,
  });
  const name =
    mode === "multiple" ? "Multiple" : mode === "none" ? "None" : "Single";
  return (
    <LoopBoundary
      badge={`${name} mode`}
      firstId={`${mode}-first`}
      firstLabel={`${name} first`}
      listLabel={`${name} selection list`}
      pageResultLabel={
        mode === "multiple" ? "Multiple page key result" : undefined
      }
      resultLabel={`${name} loop key result`}
      selectable
      shortcutResultLabel={`${name} select-all result`}
      store={store}
      terminalId={`${mode}-terminal`}
      terminalLabel={`${name} terminal`}
      title={
        mode === "multiple" ? "Range page boundary" : `${name} stays navigable`
      }
    />
  );
}

function GuardedList() {
  const [guardedSelectable, setGuardedSelectable] = useState(true);
  const store = useCompositeSelectableStore({
    focusLoop: false,
    orientation: "vertical",
    selectableBehavior: "replace",
  });
  const items = Ariakit.useStoreState(store, "items");
  const selectedIds = Ariakit.useStoreState(store, "selectedIds");
  const names = selectedIds.map((id) =>
    id === "guarded" ? "Guarded item" : "Following item",
  );

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Movement gate</h3>
        <span className="ak-badge-secondary">Physical focus</span>
      </div>
      <Ariakit.Composite
        store={store}
        role="listbox"
        aria-label="Guarded selectable list"
        className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none"
      >
        <Ariakit.CompositeItem
          id="guarded"
          role="option"
          moveOnKeyPress={false}
          render={<CompositeSelectable selectable={guardedSelectable} />}
          className={optionClassName}
        >
          Guarded item
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem
          id="following"
          role="option"
          render={<CompositeSelectable />}
          className={optionClassName}
        >
          Following item
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
      <label className="ak-frame ak-frame-field/field ak-layer ak-layer-darken-3 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          aria-label="Include guarded item in selection"
          checked={guardedSelectable}
          onChange={(event) => {
            setGuardedSelectable(event.currentTarget.checked);
          }}
          className="size-4 accent-(--color-primary)"
        />
        Include guarded item in selection
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SelectionStatus label="Guarded selection" names={names} />
        <output aria-label="Guarded registry" className="ak-ink-70 text-sm">
          Registered items: {items.length}
        </output>
      </div>
    </section>
  );
}

interface GridRowProps {
  id: string;
  label: string;
}

function GridRow({ id, label }: GridRowProps) {
  return (
    <Ariakit.CompositeRow
      id={id}
      role="row"
      aria-label={`${label} row`}
      render={<CompositeSelectable />}
      className="group grid grid-cols-2 border-t border-black/10 first:border-t-0 data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-15 dark:border-white/10"
    >
      {(["left", "right"] as const).map((side) => (
        <Ariakit.CompositeItem
          key={side}
          id={`${id}-${side}`}
          role="gridcell"
          aria-label={`${label} ${side}`}
          render={<button type="button" />}
          className="min-h-12 px-3 text-left outline-none data-[active-item]:relative data-[active-item]:z-10 data-[active-item]:outline-2 data-[active-item]:outline-offset-[-2px] data-[active-item]:outline-primary"
        >
          {label} {side}
        </Ariakit.CompositeItem>
      ))}
    </Ariakit.CompositeRow>
  );
}

function WrappedGrid() {
  const store = useCompositeSelectableStore({
    focusLoop: false,
    focusWrap: true,
    items: wrappedGridItems,
    rangeDelegate: wrappedGridRangeDelegate,
    selectableBehavior: "replace",
  });
  const selectedIds = Ariakit.useStoreState(store, "selectedIds");
  const names = selectedIds.map((id) => (id === "alpha" ? "Alpha" : "Beta"));

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Wrapped grid</h3>
        <span className="ak-badge-secondary">Row selection</span>
      </div>
      <Ariakit.Composite
        store={store}
        role="grid"
        aria-label="Wrapped selection grid"
        className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 overflow-hidden outline-none"
      >
        <GridRow id="alpha" label="Alpha" />
        <GridRow id="beta" label="Beta" />
      </Ariakit.Composite>
      <SelectionStatus label="Wrapped grid selection" names={names} />
    </section>
  );
}

function AxisLoopBoundary() {
  const gridStore = useCompositeSelectableStore({
    focusLoop: "horizontal",
    items: axisGridItems,
    rangeDelegate: axisGridRangeDelegate,
    selectableBehavior: "replace",
  });
  const elementlessStore = useCompositeSelectableStore({
    defaultActiveId: "elementless-terminal",
    defaultSelectedIds: ["elementless-terminal"],
    focusLoop: "vertical",
    items: elementlessItems,
    orientation: "horizontal",
    virtualFocus: true,
  });
  const [gridResult, setGridResult] = useState<boolean | null>(null);
  const [elementlessResult, setElementlessResult] = useState<boolean | null>(
    null,
  );

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Axis-scoped loops</h3>
        <span className="ak-badge-secondary">Orthogonal edges</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="grid gap-2"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            if (!event.shiftKey) return;
            setGridResult(event.defaultPrevented);
          }}
        >
          <Ariakit.Composite
            store={gridStore}
            role="grid"
            aria-label="Horizontal-only loop grid"
            className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 overflow-hidden outline-none"
          >
            {(["top", "bottom"] as const).map((position) => (
              <Ariakit.CompositeRow
                key={position}
                id={`axis-${position}`}
                role="row"
                render={<CompositeSelectable />}
                className="border-t border-black/10 first:border-t-0 data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-15 dark:border-white/10"
              >
                <Ariakit.CompositeItem
                  id={`axis-${position}-cell`}
                  role="gridcell"
                  aria-label={`Horizontal loop ${position}`}
                  render={<button type="button" />}
                  className="min-h-10 w-full px-3 text-left outline-none data-[active-item]:outline-2 data-[active-item]:outline-offset-[-2px] data-[active-item]:outline-primary"
                >
                  {position === "top" ? "Top row" : "Bottom boundary"}
                </Ariakit.CompositeItem>
              </Ariakit.CompositeRow>
            ))}
          </Ariakit.Composite>
          <output
            aria-label="Horizontal loop vertical boundary result"
            className="ak-ink-70 text-sm"
          >
            {gridResult == null
              ? "Horizontal loop leaves Shift+ArrowDown open."
              : gridResult
                ? "Default action prevented"
                : "Default action allowed"}
          </output>
        </div>
        <div
          className="grid gap-2"
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight") return;
            if (!event.shiftKey) return;
            setElementlessResult(event.defaultPrevented);
          }}
        >
          <Ariakit.Composite
            store={elementlessStore}
            role="listbox"
            aria-label="Vertical-only loop virtual boundary"
            className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid min-h-20 place-items-center p-3 outline-none focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span aria-hidden className="ak-ink-70 text-center text-sm">
              Active item: offscreen terminal
            </span>
          </Ariakit.Composite>
          <output
            aria-label="Vertical loop horizontal boundary result"
            className="ak-ink-70 text-sm"
          >
            {elementlessResult == null
              ? "Vertical loop leaves Shift+ArrowRight open."
              : elementlessResult
                ? "Default action prevented"
                : "Default action allowed"}
          </output>
        </div>
      </div>
    </section>
  );
}

function VirtualList() {
  const store = useCompositeSelectableStore({
    defaultActiveId: null,
    focusLoop: false,
    orientation: "vertical",
    virtualFocus: true,
  });
  const activeId = Ariakit.useStoreState(store, "activeId");
  const selectedIds = Ariakit.useStoreState(store, "selectedIds");
  const names = selectedIds.map((id) => {
    if (id === "virtual-one") return "Virtual one";
    if (id === "virtual-two") return "Virtual two";
    return "Virtual three";
  });
  const cursor =
    activeId === "virtual-one"
      ? "Virtual one"
      : activeId === "virtual-two"
        ? "Virtual two"
        : activeId === "virtual-three"
          ? "Virtual three"
          : "Composite";

  return (
    <section className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid content-start gap-5 p-5 shadow-xl sm:p-6">
      <div>
        <span className="ak-badge-primary mb-3">
          <MousePointer2 aria-hidden className="ak-badge-icon size-3.5" />
          Virtual focus
        </span>
        <h2 className="text-2xl font-semibold">Start from the container</h2>
        <p className="ak-ink-70 mt-2 text-sm">
          Focus begins on the list itself with no active item. Shift+ArrowDown
          moves the virtual cursor, seats the range anchor, and selects without
          moving DOM focus.
        </p>
      </div>
      <Ariakit.Composite
        store={store}
        role="listbox"
        aria-label="Virtual focus list"
        className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none"
      >
        <Ariakit.CompositeItem
          id="virtual-one"
          role="option"
          render={<CompositeSelectable />}
          className={optionClassName}
        >
          Virtual one
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem
          id="virtual-two"
          role="option"
          render={<CompositeSelectable />}
          className={optionClassName}
        >
          Virtual two
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem
          id="virtual-three"
          role="option"
          render={<CompositeSelectable />}
          className={optionClassName}
        >
          Virtual three
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
      <button
        type="button"
        className="ak-button-classic w-fit"
        onClick={() => store.move("virtual-three")}
      >
        Move cursor to Virtual three
      </button>
      <div className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-3">
        <output aria-label="Virtual cursor" className="text-sm font-semibold">
          Cursor: {cursor}
        </output>
        <SelectionStatus label="Virtual selection" names={names} />
      </div>
    </section>
  );
}

export default function Example() {
  return (
    <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="grid gap-3 py-4 text-center">
          <span className="ak-badge-primary mx-auto">
            <CornerDownRight aria-hidden className="ak-badge-icon size-3.5" />
            Keyboard lab
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Selection navigation boundaries
          </h1>
          <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
            Compare physical and virtual focus when Shift modifies composite
            navigation.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <section className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-5 shadow-xl sm:p-6">
            <div>
              <span className="ak-badge-secondary mb-3">
                <ArrowDown aria-hidden className="ak-badge-icon size-3.5" />
                Physical focus
              </span>
              <h2 className="text-2xl font-semibold">Boundaries stay honest</h2>
              <p className="ak-ink-70 mt-2 text-sm">
                Terminal keys keep their browser default, movement gates stop
                both focus and selection, and grid wrapping crosses rows.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <OpenBoundaryList />
              <PlainLoopBoundary />
              <ModeLoopBoundary mode="none" />
              <ModeLoopBoundary mode="single" />
              <ModeLoopBoundary mode="multiple" />
              <GuardedList />
              <WrappedGrid />
              <AxisLoopBoundary />
            </div>
          </section>

          <VirtualList />
        </div>
      </div>
    </main>
  );
}
