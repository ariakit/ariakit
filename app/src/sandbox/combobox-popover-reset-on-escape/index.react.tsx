import * as Ariakit from "@ariakit/react";
import { useState } from "react";
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
// onto the active item. The counts make it visible that both the public
// resetOnEscape callback and the dialog's report run once per keypress, and not
// at all when a descendant keeps the popover open.
function Counted({ vetoClose }: { vetoClose?: boolean }) {
  const [reset, setReset] = useState(0);
  const [hide, setHide] = useState(0);
  const label = vetoClose ? "Vetoed" : "Counted";
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple" selectOnMove>
      <Ariakit.ComboboxSelect aria-label={label}>
        <Ariakit.ComboboxSelectedValue />
      </Ariakit.ComboboxSelect>
      <div role="status" aria-label={`${label} counts`}>
        {`reset:${reset} hide:${hide}`}
      </div>
      <Ariakit.ComboboxPopover
        onClose={(event) => {
          if (!vetoClose) return;
          event.preventDefault();
        }}
        resetOnEscape={() => {
          setReset((value) => value + 1);
          return true;
        }}
        unstable_onEscapeHide={() => setHide((value) => value + 1)}
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
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
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
      {/* Vetoing the close restores the open state synchronously, so the key
      didn't actually close anything and nothing should be restored. */}
      <Counted vetoClose />
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
