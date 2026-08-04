import * as Ariakit from "@ariakit/react";
import { useComboboxItem } from "@ariakit/react-components/combobox/combobox-item";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Cherry",
  "Clementine",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragon fruit",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Jackfruit",
  "Kiwi",
  "Kumquat",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Melon",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

const rendererItems = fruits.map((value) => ({
  id: `renderer-${value.toLowerCase().replace(/\s+/g, "-")}`,
  value,
}));

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

interface FruitItemsProps {
  /**
   * Renders explicit item ids, so an item that is replaced comes back under the
   * id the store already points at. React generates a new id per mount, which
   * would make the replacement a different logical item.
   */
  idPrefix?: string;
}

function FruitItems({ idPrefix }: FruitItemsProps) {
  return (
    <>
      {fruits.map((fruit) => (
        <Ariakit.ComboboxItem
          key={fruit}
          id={idPrefix ? `${idPrefix}-${slugify(fruit)}` : undefined}
          value={fruit}
          style={{
            display: "block",
            padding: "4px 8px",
          }}
        />
      ))}
    </>
  );
}

/**
 * Renders the fruit list under a fresh React key every time the popup opens,
 * the way an app that swaps in a freshly loaded list does. Every item node is
 * replaced while the popup is still being positioned, but their ids keep
 * pointing at the same logical items.
 */
function RemountingFruitItems({ idPrefix }: FruitItemsProps) {
  const combobox = Ariakit.useComboboxContext();
  const mounted = Ariakit.useStoreState(combobox, "mounted");
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    setGeneration((value) => value + 1);
  }, [mounted]);

  return <FruitItems key={generation} idPrefix={idPrefix} />;
}

function DelayedFruitItems() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timeout);
  }, []);
  if (!mounted) return null;
  return <FruitItems />;
}

interface RefreshListButtonProps {
  /** The item the refreshed list highlights. */
  activeId: string;
  label: string;
  onRefresh: () => void;
}

/**
 * Refreshes the list and highlights a different item in one action, the way an
 * app that re-runs its query and points at the new best match does. Neither
 * half moves, so neither supersedes the request this fixture parks, and that
 * request carries no `id`, so a changed active item doesn't end it either.
 *
 * The highlight is a synchronous store write and the replacement only lands on
 * the commit after it, which is what puts the new active item in place before
 * anything resolves again. Deferring the highlight would remove that ordering,
 * and with it the only thing a re-resolution could get wrong.
 */
function RefreshListButton({
  activeId,
  label,
  onRefresh,
}: RefreshListButtonProps) {
  const combobox = Ariakit.useComboboxContext();
  return (
    // Refuses the focus a click would take, because moving focus out of the
    // composite abandons the request this exists to exercise.
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        combobox?.setActiveId(activeId);
        onRefresh();
      }}
    >
      {`Refresh ${label} list`}
    </button>
  );
}

interface FixtureProps {
  /**
   * Whether the popup takes focus once it is placed. Turning it off leaves the
   * presentation as the only thing that can bring an item into view.
   */
  autoFocusOnShow?: boolean;
  /** Holds the fruit options until an external control renders them. */
  controlledItems?: boolean;
  defaultOpen?: boolean;
  defaultSelectedValue: string | string[];
  delayedItems?: boolean;
  focusTarget?: boolean;
  focusTrapTarget?: boolean;
  /**
   * Holds the popup in its positioning window until a control releases it, so a
   * presentation stays parked while something else acts on the popup. Releasing
   * only ends the wait: this never calls the positioning it is handed, so the
   * popup stays at its pre-placement origin, away from its select.
   */
  holdPlacement?: boolean;
  input?: boolean;
  /** Renders explicit item ids under this prefix. */
  itemIdPrefix?: string;
  /** Keeps the popup open while focus leaves it. */
  keepOpen?: boolean;
  label: string;
  listScrollport?: boolean;
  nestedScrollports?: boolean;
  moveFocusOnOpen?: boolean;
  /** Puts the element focus moves to outside the popup instead of inside it. */
  outsideFocusTarget?: boolean;
  /**
   * Drops the popup's own scrollport so the nearest scrollport for its items is
   * the page, which is what makes a stale presentation move the page rather
   * than the popup's list.
   */
  pageScrollport?: boolean;
  popupStyle?: CSSProperties;
  /**
   * Adds a control that highlights this item and replaces every item node under
   * a stable id. Its replacement half is ignored alongside
   * `remountItemsOnOpen`, which owns the item keys.
   */
  refreshListActiveId?: string;
  /** Replaces every item node under a stable id while the popup opens. */
  remountItemsOnOpen?: boolean;
  showFocusHistory?: boolean;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  autoFocusOnShow,
  controlledItems,
  defaultOpen,
  defaultSelectedValue,
  delayedItems,
  focusTarget,
  focusTrapTarget,
  holdPlacement,
  input,
  itemIdPrefix,
  keepOpen,
  label,
  listScrollport,
  nestedScrollports,
  moveFocusOnOpen,
  outsideFocusTarget,
  pageScrollport,
  popupStyle,
  refreshListActiveId,
  remountItemsOnOpen,
  showFocusHistory,
  unmountOnHide,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (target: string) => {
    if (!showFocusHistory) return;
    setFocusHistory((history) => [...history, target]);
  };
  const setFocusTarget = (element: HTMLElement | null) => {
    focusTargetRef.current = element;
  };
  const releaseRef = useRef<(() => void) | null>(null);
  const [generation, setGeneration] = useState(0);
  const [showControlledItems, setShowControlledItems] = useState(false);
  const updatePosition = () =>
    new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });
  const items = (
    <>
      {focusTarget && !outsideFocusTarget && (
        <Ariakit.ComboboxItem
          ref={setFocusTarget}
          style={{ display: "block", padding: "4px 8px" }}
          value="Focus target"
        />
      )}
      {remountItemsOnOpen ? (
        <RemountingFruitItems idPrefix={itemIdPrefix} />
      ) : delayedItems ? (
        <DelayedFruitItems />
      ) : controlledItems && !showControlledItems ? null : (
        <FruitItems key={generation} idPrefix={itemIdPrefix} />
      )}
      {/* An item rendered without a value, at the end of the list so it's
      always out of view. */}
      <Ariakit.ComboboxItem style={{ display: "block", padding: "4px 8px" }}>
        {`No ${label.toLowerCase()}`}
      </Ariakit.ComboboxItem>
    </>
  );
  return (
    <Ariakit.ComboboxProvider
      defaultOpen={defaultOpen}
      defaultSelectedValue={defaultSelectedValue}
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      {showFocusHistory && (
        <p
          style={{
            background: "white",
            border: "1px solid gray",
            boxSizing: "border-box",
            padding: 8,
            width: 320,
          }}
        >
          Open the select. Expected focus history: input → focus target. An
          extra input means the popup pulled focus back. Current focus history:{" "}
          <output aria-label={`${label} focus history`}>
            {focusHistory.length ? focusHistory.join(" → ") : "none"}
          </output>
        </p>
      )}
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        autoFocusOnShow={autoFocusOnShow}
        {...(holdPlacement ? { updatePosition } : null)}
        unmountOnHide={unmountOnHide}
        hideOnInteractOutside={!keepOpen}
        // A popup that is taller than the viewport would otherwise be flipped
        // above the select, which puts the last items back in view.
        flip={!pageScrollport}
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          ...(pageScrollport || listScrollport
            ? null
            : {
                maxHeight: nestedScrollports ? 160 : 120,
                overflow: "auto",
              }),
          ...popupStyle,
        }}
      >
        {input && (
          <Ariakit.ComboboxInput
            aria-label={`Search ${label}`}
            onFocus={() => {
              recordFocus("input");
              if (!moveFocusOnOpen) return;
              queueMicrotask(() => {
                // An in-popup target is meant to be scrolled into its popup by
                // this focus. A page-level one is not: letting the browser
                // scroll to it would put the fixture's own movement in the way
                // of what the test measures.
                focusTargetRef.current?.focus({
                  preventScroll: outsideFocusTarget,
                });
              });
            }}
          />
        )}
        {listScrollport || nestedScrollports ? (
          <>
            {nestedScrollports && (
              <p style={{ height: 200, margin: 0 }}>Available fruit</p>
            )}
            <Ariakit.ComboboxList style={{ maxHeight: 120, overflow: "auto" }}>
              {items}
            </Ariakit.ComboboxList>
          </>
        ) : (
          items
        )}
      </Ariakit.ComboboxPopover>
      {focusTarget && outsideFocusTarget && (
        <button
          data-focus-trap={focusTrapTarget ? "" : undefined}
          type="button"
          tabIndex={0}
          ref={setFocusTarget}
          onFocus={() => recordFocus("focus target")}
        >
          {`${label} focus target`}
        </button>
      )}
      {controlledItems && (
        <button type="button" onClick={() => setShowControlledItems(true)}>
          {`Render ${label.toLowerCase()} items`}
        </button>
      )}
      {refreshListActiveId && (
        <RefreshListButton
          activeId={refreshListActiveId}
          label={label}
          onRefresh={() => setGeneration((value) => value + 1)}
        />
      )}
      {holdPlacement && (
        // Refuses focus for the same reason as `RefreshListButton`.
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            releaseRef.current?.();
            releaseRef.current = null;
          }}
        >
          {`Finish ${label} positioning`}
        </button>
      )}
    </Ariakit.ComboboxProvider>
  );
}

function MountingDefaultOpenFixture() {
  const [mounted, setMounted] = useState(false);
  if (mounted) {
    return (
      <Fixture
        autoFocusOnShow={false}
        defaultOpen
        defaultSelectedValue="Mango"
        label="Default-open centered fruit"
      />
    );
  }
  return (
    <button type="button" onClick={() => setMounted(true)}>
      Mount default-open centered fruit
    </button>
  );
}

function MountingDelayedDefaultOpenFixture() {
  const [mounted, setMounted] = useState(false);
  if (mounted) {
    return (
      <Fixture
        autoFocusOnShow={false}
        defaultOpen
        defaultSelectedValue="Watermelon"
        delayedItems
        label="Delayed default-open centered fruit"
      />
    );
  }
  return (
    <button type="button" onClick={() => setMounted(true)}>
      Mount delayed default-open centered fruit
    </button>
  );
}

function MountingDelayedDefaultOpenFocusEscapeFixture() {
  const [mounted, setMounted] = useState(false);
  if (mounted) {
    return (
      <Fixture
        autoFocusOnShow={false}
        controlledItems
        defaultOpen
        defaultSelectedValue="Watermelon"
        focusTarget
        keepOpen
        label="Delayed default-open focus escape fruit"
        outsideFocusTarget
      />
    );
  }
  return (
    <button type="button" onClick={() => setMounted(true)}>
      Mount delayed default-open focus escape fruit
    </button>
  );
}

function RenderCountedComboboxItem() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const props = useComboboxItem({
    value: "Apple",
    children: "Apple",
    style: { display: "block", padding: "4px 8px" },
  });
  return <Ariakit.Role {...props} data-render-count={renderCount.current} />;
}

function ItemRenderCountFixture() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Mango">
      <Ariakit.ComboboxSelectLabel>
        Render-counted fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover autoFocusOnShow={false} unmountOnHide={false}>
        <RenderCountedComboboxItem />
        <Ariakit.ComboboxItem value="Mango">Mango</Ariakit.ComboboxItem>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function VirtualizedSelectFixture() {
  const combobox = Ariakit.useComboboxStore({
    defaultItems: rendererItems,
    defaultSelectedValue: "Apple",
    selectOnMove: true,
  });
  return (
    <>
      <Ariakit.ComboboxSelectLabel store={combobox}>
        Virtualized fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={combobox} />
      <Ariakit.ComboboxPopover
        store={combobox}
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        <ComboboxRenderer
          store={combobox}
          items={rendererItems}
          itemSize={32}
          overscan={0}
        >
          {({ value, ...item }) => (
            <Ariakit.ComboboxItem
              key={item.id}
              {...item}
              value={value}
              style={{
                ...item.style,
                boxSizing: "border-box",
                display: "block",
                height: 32,
                padding: "4px 8px",
              }}
            />
          )}
        </ComboboxRenderer>
      </Ariakit.ComboboxPopover>
    </>
  );
}

function NativeAutoFocusFixture() {
  const dialog = Ariakit.useDialogStore();
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const focusTargetRef = useRef<HTMLInputElement>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (target: string) => {
    setFocusHistory((history) => [...history, target]);
  };
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    const nestedHost = host.ownerDocument.createElement("div");
    const nestedRoot = nestedHost.attachShadow({ mode: "open" });
    const input = host.ownerDocument.createElement("input");
    input.setAttribute("aria-label", "Native auto-focus shadow target");
    const onFocus = () => {
      setFocusHistory((history) => [...history, "shadow target"]);
    };
    input.addEventListener("focus", onFocus);
    nestedRoot.append(input);
    root.append(nestedHost);
    focusTargetRef.current = input;
    return () => {
      focusTargetRef.current = null;
      input.removeEventListener("focus", onFocus);
      nestedHost.remove();
    };
  }, []);
  return (
    <>
      <Ariakit.DialogDisclosure store={dialog}>
        Native auto-focus dialog
      </Ariakit.DialogDisclosure>
      <div ref={shadowHostRef} />
      <p>
        Open the dialog. Expected focus history: input → shadow target. An extra
        input means the dialog pulled focus back. Current focus history:{" "}
        <output aria-label="Native auto-focus history">
          {focusHistory.length ? focusHistory.join(" → ") : "none"}
        </output>
      </p>
      <Ariakit.Dialog
        store={dialog}
        hideOnInteractOutside={false}
        modal={false}
        portal={false}
        unmountOnHide
      >
        <input
          aria-label="Native auto-focus input"
          autoFocus
          onFocus={() => {
            recordFocus("input");
            focusTargetRef.current?.focus();
          }}
        />
      </Ariakit.Dialog>
    </>
  );
}

function ShadowRootDialogFixture() {
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (target: string) => {
    setFocusHistory((history) => [...history, target]);
  };
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    const portal = host.ownerDocument.createElement("div");
    root.append(portal);
    setPortalElement(portal);
    return () => portal.remove();
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFocusHistory([]);
          setOpen(true);
        }}
      >
        Open shadow-root focus dialog
      </button>
      <div ref={shadowHostRef} data-shadow-root-dialog-host />
      <p>
        Open the dialog. Expected focus history: app focus → initial focus. If
        the history stops at app focus, the shadow host hid that focus was still
        inside the dialog. Current focus history:{" "}
        <output aria-label="Shadow-root dialog focus history">
          {focusHistory.length ? focusHistory.join(" → ") : "none"}
        </output>
      </p>
      {portalElement && (
        <Ariakit.Portal portalElement={portalElement}>
          <Ariakit.Dialog
            aria-label="Shadow-root focus dialog"
            hideOnInteractOutside={false}
            initialFocus={initialFocusRef}
            modal={false}
            onClose={() => setOpen(false)}
            open={open}
            portal={false}
            unmountOnHide
          >
            <input
              aria-label="Shadow-root app focus field"
              autoFocus
              onFocus={() => recordFocus("app focus")}
            />
            <input
              ref={initialFocusRef}
              aria-label="Shadow-root initial focus field"
              onFocus={() => recordFocus("initial focus")}
            />
          </Ariakit.Dialog>
        </Ariakit.Portal>
      )}
    </>
  );
}

function IframeDialogFixture() {
  const dialog = Ariakit.useDialogStore();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const dialogFocusRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const iframeFocusRef = useRef<HTMLInputElement>(null);
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    frameRef.current = element;
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);
  const recordFocus = (target: string) => {
    setFocusHistory((history) => [...history, target]);
  };
  return (
    <>
      <Ariakit.DialogDisclosure
        store={dialog}
        onClick={() => setFocusHistory([])}
      >
        Open iframe focus dialog
      </Ariakit.DialogDisclosure>
      <p>
        Open the dialog. Expected focus history: dialog focus → iframe focus →
        initial focus. If the history stops at iframe focus, the frame hid that
        focus was still inside the dialog. Current focus history:{" "}
        <output aria-label="Iframe dialog focus history">
          {focusHistory.length ? focusHistory.join(" → ") : "none"}
        </output>
      </p>
      <Ariakit.Dialog
        store={dialog}
        aria-label="Iframe focus dialog"
        autoFocusOnShow={() => {
          // Stage an app-owned handoff before Dialog queues initial focus.
          dialogFocusRef.current?.focus();
          // Firefox needs the browsing context activated before its field can
          // receive focus from the parent document.
          frameRef.current?.contentWindow?.focus();
          iframeFocusRef.current?.focus();
          return true;
        }}
        hideOnInteractOutside={false}
        initialFocus={initialFocusRef}
        modal={false}
        portal={false}
        unmountOnHide={false}
      >
        <iframe ref={setFrame} title="Initial focus frame" tabIndex={0} />
        {frameBody && (
          <Ariakit.Portal portalElement={frameBody}>
            <input
              ref={iframeFocusRef}
              aria-label="Iframe app focus field"
              onFocus={() => recordFocus("iframe focus")}
            />
          </Ariakit.Portal>
        )}
        <input
          ref={dialogFocusRef}
          aria-label="Iframe dialog focus field"
          onFocus={() => recordFocus("dialog focus")}
        />
        <input
          ref={initialFocusRef}
          aria-label="Iframe initial focus field"
          onFocus={() => recordFocus("initial focus")}
        />
      </Ariakit.Dialog>
    </>
  );
}

function StoreSwapFixture() {
  const dialogA = Ariakit.useDialogStore();
  const dialogB = Ariakit.useDialogStore();
  const [dialog, setDialog] = useState(dialogA);
  const [dialogName, setDialogName] = useState("A");
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const recordFocus = (target: string) => {
    setFocusHistory((history) => [...history, target]);
  };
  const showDialog = (name: string, nextDialog: typeof dialogA) => {
    setDialogName(name);
    setDialog(nextDialog);
    nextDialog.show();
  };
  return (
    <>
      <button
        type="button"
        tabIndex={0}
        onFocus={() => recordFocus("open store A")}
        onClick={() => showDialog("A", dialogA)}
      >
        Open store A
      </button>
      <button
        type="button"
        tabIndex={0}
        onFocus={() => recordFocus("open store B")}
        onClick={() => showDialog("B", dialogB)}
      >
        Open store B
      </button>
      <p>
        Open store A, then store B. Expected focus history: open store A → store
        A input → open store B → store B input. Current focus history:{" "}
        <output aria-label="Store swap focus history">
          {focusHistory.length ? focusHistory.join(" → ") : "none"}
        </output>
      </p>
      <Ariakit.Dialog
        store={dialog}
        hideOnInteractOutside={false}
        initialFocus={initialFocusRef}
        modal={false}
        portal={false}
      >
        <input
          ref={initialFocusRef}
          aria-label={`Store ${dialogName} initial focus`}
          onFocus={() => recordFocus(`store ${dialogName} input`)}
        />
      </Ariakit.Dialog>
    </>
  );
}

function DisclosureSwapFixture() {
  const dialog = Ariakit.useDialogStore();
  const previousDisclosureRef = useRef<HTMLButtonElement>(null);
  const replacementDisclosureRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (target: string) => {
    setFocusHistory((history) => [...history, target]);
  };
  return (
    <>
      <button
        ref={previousDisclosureRef}
        type="button"
        onFocus={() => recordFocus("previous disclosure")}
        onClick={(event) => {
          setFocusHistory([]);
          dialog.setDisclosureElement(event.currentTarget);
          dialog.show();
        }}
      >
        Open disclosure swap dialog
      </button>
      <button ref={replacementDisclosureRef} type="button">
        Replacement disclosure
      </button>
      <p>
        Open the dialog. Expected focus history: input → previous disclosure. An
        extra input means delayed auto-focus used the stale disclosure. Current
        focus history:{" "}
        <output aria-label="Disclosure swap focus history">
          {focusHistory.length ? focusHistory.join(" → ") : "none"}
        </output>
      </p>
      <Ariakit.Dialog
        store={dialog}
        autoFocusOnShow={() => {
          queueMicrotask(() => {
            dialog.setDisclosureElement(replacementDisclosureRef.current);
            previousDisclosureRef.current?.focus();
          });
          return true;
        }}
        hideOnInteractOutside={false}
        initialFocus={initialFocusRef}
        modal={false}
        portal={false}
        unmountOnHide
      >
        <input
          ref={initialFocusRef}
          aria-label="Disclosure swap input"
          autoFocus
          onFocus={() => recordFocus("input")}
        />
      </Ariakit.Dialog>
    </>
  );
}

export default function Example() {
  return (
    <>
      <Fixture defaultSelectedValue={["Apple"]} label="Selected fruit" />
      <Fixture defaultSelectedValue="Apple" label="Single selected fruit" />
      <div style={{ marginTop: 200 }}>
        <Fixture defaultSelectedValue="Mango" label="Centered fruit" />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Mango"
          label="Nested-list centered fruit"
          listScrollport
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Mango"
          input
          label="Centered filterable fruit"
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Mango"
          label="Centered unmounted fruit"
          unmountOnHide
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <MountingDefaultOpenFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Mango"
          label="Scaled centered fruit"
          popupStyle={{ scale: "0.8" }}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Filterable fruit"
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Focus moving filterable fruit"
          moveFocusOnOpen
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        {/* The popup unmounts while hidden, so the select element is briefly
        the composite again on each open. */}
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Focus moving unmounted fruit"
          moveFocusOnOpen
          unmountOnHide
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Touch filterable fruit"
        />
      </div>
      {/* Virtual focus, and focus leaves the popup entirely while it is still
      being positioned. The presentation the open scheduled must be abandoned
      rather than pulling focus back, and it must not move the page on its way
      out. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          unmountOnHide
        />
      </div>
      {/* The same escape, against a popup that keeps itself open and has no
      scrollport of its own. Nothing left to scroll but the page, so a
      presentation that outlives the escape is visible as a page jump. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          keepOpen
          label="Page escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          pageScrollport
          unmountOnHide
        />
      </div>
      {/* Both variants below turn off the popup's own initial focus, so the
      presentation the open scheduled is the only thing left that can bring the
      selected item into view. They differ only in whether the item nodes are
      replaced while the popup is still being positioned: "Persisting fruit"
      keeps them, "Remounting fruit" replaces every one of them. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          itemIdPrefix="persisting"
          label="Persisting fruit"
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          itemIdPrefix="remounting"
          label="Remounting fruit"
          remountItemsOnOpen
        />
      </div>
      {/* The replacement is driven by a control rather than the open, so it can
      land once the active item has already moved on. The request adopted the
      selected item and nothing abandoned it, so it stays on that one: the newly
      highlighted item is not a presentation target and was never asked for. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          holdPlacement
          itemIdPrefix="parked"
          keepOpen
          label="Parked fruit"
          refreshListActiveId="parked-apple"
        />
      </div>
      {/* The popup stays open after focus leaves, so Dialog's delayed
          auto-focus must not pull focus back into it. */}
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          keepOpen
          label="Focus escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          pageScrollport
          showFocusHistory
          unmountOnHide
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          focusTrapTarget
          input
          keepOpen
          label="Focus trap escaping fruit"
          moveFocusOnOpen
          outsideFocusTarget
          pageScrollport
          showFocusHistory
          unmountOnHide
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <NativeAutoFocusFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <ShadowRootDialogFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <IframeDialogFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <StoreSwapFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <DisclosureSwapFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Mango"
          label="Nested-scrollports fruit"
          nestedScrollports
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          autoFocusOnShow={false}
          defaultSelectedValue="Watermelon"
          label="Page-scroll fruit"
          pageScrollport
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Mango"
          label="Roving centered fruit"
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <MountingDelayedDefaultOpenFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <MountingDelayedDefaultOpenFocusEscapeFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <ItemRenderCountFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <VirtualizedSelectFixture />
      </div>
    </>
  );
}
