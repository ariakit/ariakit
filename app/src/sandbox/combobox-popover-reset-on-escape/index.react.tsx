import * as Ariakit from "@ariakit/react";
import { useComboboxPopover } from "@ariakit/react-components/combobox/combobox-popover";
import { useRef, useState } from "react";
import type { ReactNode } from "react";

const values = ["Apple", "Banana", "Grape"];

function Select({
  label,
  unmount,
  resetOnEscape,
  hideOnEscape,
  children,
}: {
  label: string;
  unmount: boolean;
  resetOnEscape?: boolean | (() => boolean);
  hideOnEscape?: Ariakit.ComboboxPopoverProps["hideOnEscape"];
  children?: ReactNode;
}) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple" selectOnMove>
      <Ariakit.ComboboxSelect aria-label={label}>
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        unmountOnHide={unmount}
        resetOnEscape={resetOnEscape}
        hideOnEscape={hideOnEscape}
      >
        {children}
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// One keypress reaches the dialog twice, because a composite re-dispatches it
// onto the active item. The counts make the proxy dispatch visible and prove
// the public resetOnEscape callback runs once for an accepted close, and not at
// all when the popover stays open.
function Counted({
  controlled,
  vetoClose,
  vetoOnce,
  vetoBeforeMove,
  vetoWithSelection,
}: {
  controlled?: boolean;
  vetoClose?: boolean;
  vetoOnce?: boolean;
  vetoBeforeMove?: boolean;
  vetoWithSelection?: boolean;
}) {
  const [reset, setReset] = useState(0);
  const [close, setClose] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const hasOneShotVeto = !!(vetoOnce || vetoBeforeMove || vetoWithSelection);
  const [vetoReady, setVetoReady] = useState(!hasOneShotVeto);
  const [open, setOpen] = useState(false);
  const store = Ariakit.useComboboxStore({
    open: controlled ? open : undefined,
    setOpen: controlled
      ? (nextOpen) => {
          if (nextOpen) {
            setOpen(true);
          }
        }
      : undefined,
    defaultSelectedValue: "Apple",
    selectOnMove: true,
  });
  const vetoOnceRef = useRef(hasOneShotVeto);
  const label = vetoWithSelection
    ? "Vetoed with selection"
    : vetoBeforeMove
      ? "Vetoed before move"
      : vetoOnce
        ? "Vetoed once"
        : vetoClose
          ? "Vetoed"
          : "Counted";
  const ariaLabel = controlled ? "Controlled counted" : label;
  return (
    <Ariakit.ComboboxProvider store={store}>
      <Ariakit.ComboboxSelect aria-label={ariaLabel}>
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <div role="status" aria-label={`${ariaLabel} counts`}>
        {`reset:${reset} close:${close} events:${events.join(",")}`}
      </div>
      {hasOneShotVeto && (
        <div role="status" aria-label={`${label} ready`}>
          {vetoReady ? "ready" : "waiting"}
        </div>
      )}
      <Ariakit.ComboboxPopover
        onClose={(event) => {
          setClose((value) => value + 1);
          setEvents((value) => [...value, "close"]);
          if (vetoClose || vetoOnceRef.current) {
            if (vetoWithSelection) {
              store.setSelectedValue("Banana");
            }
            event.preventDefault();
            if (vetoOnceRef.current) {
              setTimeout(() => {
                vetoOnceRef.current = false;
                setVetoReady(true);
              });
            }
          }
        }}
        resetOnEscape={() => {
          setReset((value) => value + 1);
          setEvents((value) => [...value, "reset"]);
          return true;
        }}
      >
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
          }}
        >
          Swallows escape
        </button>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
        {vetoBeforeMove && (
          <button
            type="button"
            onClick={() => {
              store.setSelectedValue("Banana");
            }}
          >
            Set selection after veto
          </button>
        )}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function DescendantClose() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    selectOnMove: true,
  });

  return (
    <Ariakit.ComboboxProvider store={store}>
      <Ariakit.ComboboxSelect aria-label="Descendant close">
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            store.hide();
          }}
        >
          Consumes Escape and closes
        </button>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// https://github.com/ariakit/ariakit/issues/5695
function ControlledOpen() {
  const [open, setOpen] = useState(false);

  return (
    <Ariakit.ComboboxProvider
      open={open}
      setOpen={(nextOpen) => {
        if (nextOpen) {
          setOpen(true);
        }
      }}
      defaultSelectedValue="Apple"
      selectOnMove
    >
      <Ariakit.ComboboxSelect aria-label="Controlled open">
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function RenderCounted() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    selectOnMove: true,
  });
  const renderCount = useRef(0);
  renderCount.current += 1;

  const props = useComboboxPopover({
    store,
    hideOnInteractOutside: false,
  });

  const focusSelect = () => {
    store.getState().selectElement?.focus();
  };

  return (
    <Ariakit.ComboboxProvider store={store}>
      <Ariakit.ComboboxSelect aria-label="Render counted">
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <output aria-label="Render counted popover renders">
        {renderCount.current}
      </output>
      <button
        type="button"
        onClick={() => {
          store.setSelectedValue("Banana");
        }}
      >
        Set render counted selection
      </button>
      <button
        type="button"
        onClick={() => {
          store.setState("moves", 0);
          focusSelect();
        }}
      >
        Reset render counted moves
      </button>
      <Ariakit.Role {...props}>
        {values.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.Role>
    </Ariakit.ComboboxProvider>
  );
}

function StoreReplacement() {
  const firstStore = Ariakit.useComboboxStore<string>({
    defaultSelectedValue: "Apple",
    selectOnMove: true,
  });
  const secondStore = Ariakit.useComboboxStore<string>({
    defaultSelectedValue: "Banana",
    selectOnMove: true,
  });
  const [store, setStore] = useState(firstStore);
  const props = useComboboxPopover({
    store,
    hideOnInteractOutside: false,
  });

  return (
    <>
      <Ariakit.ComboboxProvider store={store}>
        <Ariakit.ComboboxSelect aria-label="Store replacement">
          <Ariakit.ComboboxSelectedValue />
        </Ariakit.ComboboxSelect>
        <Ariakit.Role {...props}>
          {values.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.Role>
      </Ariakit.ComboboxProvider>
      <button
        type="button"
        onClick={() => {
          secondStore.show();
          setStore(secondStore);
        }}
      >
        Replace open store
      </button>
    </>
  );
}

export default function Example() {
  return (
    <>
      <Select label="Mounted" unmount={false} />
      <Select label="Unmounted" unmount />
      <Select label="Callback" unmount={false} resetOnEscape={() => false} />
      {/* Stopping propagation is the dialog's own way for a handler to own the
      escape key, and unlike preventing the default it leaves no trace on the
      event afterwards. */}
      <Select label="Propagation" unmount={false}>
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.stopPropagation();
          }}
        >
          Stops propagation
        </button>
      </Select>
      {/* Preventing the default inside hideOnEscape doesn't stop the dialog
      from hiding, so the value still has to be restored. */}
      <Select
        label="Prevented"
        unmount={false}
        hideOnEscape={(event) => {
          event.preventDefault();
          return true;
        }}
      />
      <Counted />
      <Counted controlled />
      {/* A prevented close request keeps the popover open, so the previewed
      value should not be restored. */}
      <Counted vetoClose />
      <Counted vetoOnce />
      <Counted vetoBeforeMove />
      <Counted vetoWithSelection />
      <DescendantClose />
      <ControlledOpen />
      <RenderCounted />
      <StoreReplacement />
      <button type="button">External focus target</button>
      <Select label="Descendant" unmount={false}>
        {/* The dialog leaves the popover open when a descendant consumes the
        escape key, so the previewed selection has to survive it. */}
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
          }}
        >
          Handles escape
        </button>
      </Select>
    </>
  );
}
