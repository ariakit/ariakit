import * as Ariakit from "@ariakit/react";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { useCompositeSelectableContext } from "@ariakit/react-components/composite/composite-selectable-context";
import { CompositeSelectableProvider } from "@ariakit/react-components/composite/composite-selectable-provider";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";
import type { CompositeSelectableStoreState } from "@ariakit/react-components/composite/composite-selectable-store";
import { clsx } from "clsx";
import {
  BadgeCheck,
  Check,
  EyeOff,
  FileText,
  Keyboard,
  LockKeyhole,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { documents, providerDocuments } from "./data.ts";
import type { SelectionDocument } from "./data.ts";

type SelectableMode = CompositeSelectableStoreState["selectableMode"];
type SelectableBehavior = CompositeSelectableStoreState["selectableBehavior"];

interface PolicyOption<T extends string> {
  label: string;
  value: T;
}

interface PolicyGroupProps<T extends string> {
  label: string;
  name: string;
  options: readonly PolicyOption<T>[];
  value: T;
  setValue: (value: T) => void;
}

const modeOptions = [
  { label: "Multiple", value: "multiple" },
  { label: "Single", value: "single" },
  { label: "Frozen", value: "none" },
] as const satisfies readonly PolicyOption<SelectableMode>[];

const behaviorOptions = [
  { label: "Toggle", value: "toggle" },
  { label: "Replace", value: "replace" },
] as const satisfies readonly PolicyOption<SelectableBehavior>[];

function PolicyGroup<T extends string>({
  label,
  name,
  options,
  value,
  setValue,
}: PolicyGroupProps<T>) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="ak-segmented w-fit">
        {options.map((option) => (
          <label key={option.value} className="ak-segmented-button">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => setValue(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface DocumentOptionProps {
  document: SelectionDocument;
  selectable?: boolean;
  showOptInState?: boolean;
}

function DocumentOption({
  document,
  selectable = true,
  showOptInState,
}: DocumentOptionProps) {
  return (
    <Ariakit.CompositeItem
      id={document.id}
      role="option"
      aria-label={document.title}
      disabled={document.disabled}
      accessibleWhenDisabled={document.disabled}
      render={<CompositeSelectable selectable={selectable} />}
      className={clsx(
        "ak-option group grid w-full cursor-default grid-cols-[auto_1fr_auto] items-center gap-3 text-left",
        "data-active-item:outline-2 data-active-item:outline-offset-[-2px] data-active-item:outline-primary",
        "data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-15",
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "grid size-6 place-items-center rounded-full border transition-colors",
          "group-data-[selected]:border-primary group-data-[selected]:bg-primary group-data-[selected]:text-white",
        )}
      >
        <Check className="size-3.5 opacity-0 group-data-[selected]:opacity-100" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{document.title}</span>
        <span className="ak-ink-70 block truncate text-sm">
          {document.description}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        {document.disabled && <LockKeyhole aria-hidden className="size-3.5" />}
        <span
          className={clsx(
            "ak-badge",
            showOptInState && selectable && "ak-badge-primary",
          )}
        >
          {showOptInState
            ? selectable
              ? "Included"
              : "Opt-in off"
            : document.tag}
        </span>
      </span>
    </Ariakit.CompositeItem>
  );
}

interface SelectionSummaryProps {
  items: readonly SelectionDocument[];
  label: string;
  selectedIds: readonly string[];
}

function SelectionSummary({
  items,
  label,
  selectedIds,
}: SelectionSummaryProps) {
  const selectedTitles = selectedIds.map((id) => {
    return items.find((item) => item.id === id)?.title ?? id;
  });
  return (
    <output aria-label={label} className="ak-ink-70 min-w-0 truncate text-sm">
      {selectedTitles.length
        ? `${selectedTitles.length} selected: ${selectedTitles.join(", ")}`
        : "Nothing selected"}
    </output>
  );
}

function ProviderExample() {
  const store = useCompositeSelectableContext();
  const selectedIds = Ariakit.useStoreState(store, "selectedIds") ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Provider shorthand</h2>
          <p className="ak-ink-70 mt-1 max-w-xl text-sm">
            The Composite and its items receive the selectable store without a
            store prop.
          </p>
        </div>
        <button
          type="button"
          className="ak-button-classic"
          onClick={() => store?.deselectAll()}
        >
          Clear queue
        </button>
      </div>
      <Ariakit.Composite
        role="listbox"
        aria-label="Provider reading queue"
        className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none"
      >
        {providerDocuments.map((document) => (
          <DocumentOption key={document.id} document={document} />
        ))}
      </Ariakit.Composite>
      <SelectionSummary
        items={providerDocuments}
        label="Provider selection"
        selectedIds={selectedIds}
      />
    </div>
  );
}

interface ItemOptionProps {
  ariaCurrent?: boolean;
  badge: string;
  description: string;
  icon: ReactNode;
  id: string;
  role?: "option" | "menuitem" | "menuitemcheckbox";
  selectOnClick?: boolean;
  selectOnEnter?: boolean;
  selectedAttribute?: "aria-selected" | "aria-checked" | false;
  title: string;
}

function ItemOption({
  ariaCurrent,
  badge,
  description,
  icon,
  id,
  role = "option",
  selectOnClick,
  selectOnEnter,
  selectedAttribute,
  title,
}: ItemOptionProps) {
  return (
    <Ariakit.CompositeItem
      id={id}
      role={role}
      aria-label={title}
      aria-current={ariaCurrent || undefined}
      render={
        <CompositeSelectable
          selectOnClick={selectOnClick}
          selectOnEnter={selectOnEnter}
          selectedAttribute={selectedAttribute}
        />
      }
      className={clsx(
        "group grid min-h-28 cursor-default grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-2xl border p-4 text-left transition",
        "ak-layer ak-layer-darken-3 hover:ak-layer-hover",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-[selected]:border-primary data-[selected]:ak-layer-primary data-[selected]:ak-layer-mix-10",
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "ak-layer ak-layer-lighten-8 grid size-9 place-items-center rounded-xl",
          "group-data-[selected]:bg-primary group-data-[selected]:text-white",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">{title}</span>
          <span className="ak-badge ak-badge-secondary">{badge}</span>
        </span>
        <span className="ak-ink-70 mt-1 block text-sm">{description}</span>
      </span>
      <span
        aria-hidden
        className="col-span-2 h-1 overflow-hidden rounded-full bg-current opacity-10"
      >
        <span className="block h-full w-0 bg-primary transition-all group-data-[selected]:w-full" />
      </span>
    </Ariakit.CompositeItem>
  );
}

const itemOptionLabels: Record<string, string> = {
  "keyboard-activation": "Keyboard activation",
  "pointer-or-space": "Pointer or Space",
  "checked-semantics": "Checked semantics",
  "host-owned-state": "Host-owned state",
};

function ItemOptionsLab() {
  const activationStore = useCompositeSelectableStore({ focusLoop: true });
  const stateStore = useCompositeSelectableStore({
    defaultSelectedIds: ["checked-semantics"],
    focusLoop: true,
    selectableMode: "single",
  });
  const activationIds = Ariakit.useStoreState(activationStore, "selectedIds");
  const stateIds = Ariakit.useStoreState(stateStore, "selectedIds");
  const hostOwnedState = stateIds.includes("host-owned-state");
  const selectedLabels = [...activationIds, ...stateIds].map(
    (id) => itemOptionLabels[id] ?? id,
  );

  return (
    <section
      id="item-options"
      aria-labelledby="item-options-title"
      className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-5 p-4 shadow-xl sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="ak-badge-primary mb-3 w-fit">Item options</span>
          <h2 id="item-options-title" className="text-2xl font-semibold">
            Interaction lab
          </h2>
          <p
            id="item-options-hint"
            className="ak-ink-70 mt-2 max-w-2xl text-sm"
          >
            Focus a card to try <kbd className="ak-kbd">Enter</kbd> or
            <kbd className="ak-kbd mx-1">Space</kbd>. The selection bar shows
            state even when its ARIA attribute is hidden.
          </p>
        </div>
        <button
          type="button"
          className="ak-button"
          onClick={() => {
            activationStore.deselectAll();
            stateStore.deselectAll();
          }}
        >
          Clear lab
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-semibold">Activation gates</h3>
            <span className="ak-ink-70 text-xs">Listbox options</span>
          </div>
          <Ariakit.Composite
            store={activationStore}
            role="listbox"
            aria-label="Activation gate lab"
            aria-describedby="item-options-hint"
            className="grid gap-3 outline-none"
          >
            <ItemOption
              id="keyboard-activation"
              title="Keyboard activation"
              description="Click keeps the state. Enter or Space toggles it."
              badge="Click off"
              icon={<Keyboard className="size-4.5" />}
              selectOnClick={false}
            />
            <ItemOption
              id="pointer-or-space"
              title="Pointer or Space"
              description="Enter keeps the state. Click or Space toggles it."
              badge="Enter off"
              icon={<MousePointer2 className="size-4.5" />}
              selectOnEnter={false}
            />
          </Ariakit.Composite>
        </div>

        <div className="grid content-start gap-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-semibold">State ownership</h3>
            <span className="ak-ink-70 text-xs">Menu items</span>
          </div>
          <Ariakit.Composite
            store={stateStore}
            role="menu"
            aria-label="Selection state lab"
            aria-describedby="item-options-hint"
            className="grid gap-3 outline-none"
          >
            <ItemOption
              id="checked-semantics"
              role="menuitemcheckbox"
              title="Checked semantics"
              description="Selection is exposed through aria-checked."
              badge="aria-checked"
              icon={<BadgeCheck className="size-4.5" />}
              selectedAttribute="aria-checked"
            />
            <ItemOption
              id="host-owned-state"
              role="menuitem"
              title="Host-owned state"
              description="Automatic selection ARIA is replaced by aria-current."
              badge="ARIA override"
              icon={<EyeOff className="size-4.5" />}
              ariaCurrent={hostOwnedState}
              selectedAttribute={false}
            />
          </Ariakit.Composite>
        </div>
      </div>

      <output
        aria-label="Item option lab selection"
        className="ak-ink-70 min-w-0 truncate text-sm"
      >
        {selectedLabels.length
          ? `${selectedLabels.length} selected: ${selectedLabels.join(", ")}`
          : "Nothing selected"}
      </output>
    </section>
  );
}

export default function Example() {
  const [selectableMode, setSelectableMode] =
    useState<SelectableMode>("multiple");
  const [selectableBehavior, setSelectableBehavior] =
    useState<SelectableBehavior>("toggle");
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([
    "product-roadmap",
    "customer-interviews",
  ]);
  const [legalReviewSelectable, setLegalReviewSelectable] = useState(false);
  const store = useCompositeSelectableStore({
    focusLoop: true,
    selectedIds,
    setSelectedIds,
    selectableMode,
    selectableBehavior,
  });

  return (
    <main className="ak-layer ak-layer-canvas min-h-dvh p-4 sm:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="grid gap-3 py-4 text-center">
          <span className="ak-badge-primary mx-auto">
            <Sparkles aria-hidden className="ak-badge-icon size-3.5" />
            Experimental API
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Selection studio
          </h1>
          <p className="ak-ink-70 mx-auto max-w-2xl text-balance">
            Compare selection policies while focus, membership, and range
            anchors remain independent.
          </p>
        </header>

        <section
          id="playground"
          aria-labelledby="playground-title"
          className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border grid gap-6 p-4 shadow-xl sm:p-6 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(22rem,1.3fr)]"
        >
          <div className="grid content-start gap-6">
            <div>
              <span className="ak-badge-secondary mb-3">
                <FileText aria-hidden className="ak-badge-icon size-3.5" />
                Controlled store
              </span>
              <h2 id="playground-title" className="text-2xl font-semibold">
                Policy explorer
              </h2>
              <p id="playground-hint" className="ak-ink-70 mt-2 text-sm">
                Use <kbd className="ak-kbd">Shift</kbd> for a range and
                <kbd className="ak-kbd mx-1">Ctrl/⌘</kbd> for an additive
                gesture in replace mode.
              </p>
              <p className="ak-ink-70 mt-2 text-xs">
                Touch/pen check: use device emulation and tap two rows in
                Replace mode. Each tap toggles one row. Shift and Ctrl/⌘
                modifiers are ignored, and the range anchor stays unchanged.
              </p>
            </div>

            <PolicyGroup
              label="Selection mode"
              name="selection-mode"
              options={modeOptions}
              value={selectableMode}
              setValue={setSelectableMode}
            />
            <PolicyGroup
              label="Activation behavior"
              name="selection-behavior"
              options={behaviorOptions}
              value={selectableBehavior}
              setValue={setSelectableBehavior}
            />

            <label className="ak-frame ak-frame-field/field ak-layer ak-layer-darken-3 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                aria-label="Include Legal review in selection"
                checked={legalReviewSelectable}
                onChange={(event) => {
                  setLegalReviewSelectable(event.currentTarget.checked);
                }}
                className="size-4 accent-(--color-primary)"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Include Legal review in selection
                </span>
                <span className="ak-ink-70 block text-xs">
                  The same mounted element changes eligibility.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="ak-button-classic"
                onClick={() => store.selectAll()}
              >
                Select all
              </button>
              <button
                type="button"
                className="ak-button"
                onClick={() => store.deselectAll()}
              >
                Clear selection
              </button>
            </div>
          </div>

          <div className="grid min-w-0 content-start gap-3">
            <Ariakit.Composite
              store={store}
              role="listbox"
              aria-label="Selection policy explorer"
              aria-describedby="playground-hint"
              className="ak-frame ak-frame-container/1 ak-layer ak-layer-darken-3 grid gap-1 p-1 outline-none"
            >
              {documents.map((document) => {
                const isLegalReview = document.id === "legal-review";
                const isDisabled = "disabled" in document && document.disabled;
                return (
                  <DocumentOption
                    key={document.id}
                    document={document}
                    selectable={
                      isLegalReview ? legalReviewSelectable : !isDisabled
                    }
                    showOptInState={isLegalReview}
                  />
                );
              })}
            </Ariakit.Composite>
            <SelectionSummary
              items={documents}
              label="Playground selection"
              selectedIds={selectedIds}
            />
          </div>
        </section>

        <ItemOptionsLab />

        <section
          id="provider"
          aria-label="Provider example"
          className="ak-frame ak-frame-card/0 ak-layer ak-layer-lighten-6 ak-frame-border p-4 shadow-xl sm:p-6"
        >
          <CompositeSelectableProvider
            defaultSelectedIds={["shape-the-narrative"]}
            selectableBehavior="toggle"
            focusLoop
          >
            <ProviderExample />
          </CompositeSelectableProvider>
        </section>
      </div>
    </main>
  );
}
