import * as Ariakit from "@ariakit/react";
import type { MouseEvent, MutableRefObject } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  getScrollItemIntoView,
  useTrackComboboxSelectPresentation,
} from "../../../../packages/ariakit-react-components/src/combobox/__utils.ts";

const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);

interface CollisionProps {
  formRef: MutableRefObject<HTMLFormElement | null>;
}

function createDefaultViewForm() {
  const form = document.createElement("form");
  form.name = "defaultView";
  form.setAttribute("aria-label", "Preferences");
  const label = document.createElement("label");
  label.textContent = "Theme";
  const input = document.createElement("input");
  input.name = "theme";
  input.defaultValue = "System";
  label.appendChild(input);
  form.appendChild(label);
  return form;
}

function AddDefaultViewCollision({ formRef }: CollisionProps) {
  useLayoutEffect(() => {
    // Keep the real named form across the target layout effects only. React 19
    // has its own direct lookup that would otherwise mask the Ariakit result.
    const form = createDefaultViewForm();
    document.body.appendChild(form);
    formRef.current = form;
    return () => form.remove();
  }, [formRef]);

  return null;
}

interface RemoveCollisionProps extends CollisionProps {
  recordResult: () => void;
}

function RemoveDefaultViewCollision({
  formRef,
  recordResult,
}: RemoveCollisionProps) {
  useLayoutEffect(() => {
    recordResult();
    formRef.current?.remove();
    formRef.current = null;
  }, [formRef, recordResult]);

  return null;
}

function FullscreenPortal() {
  const fullscreenHostRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [mounted, setMounted] = useState(false);

  const enterFullscreen = () => {
    void fullscreenHostRef.current?.requestFullscreen();
  };

  const recordResult = useCallback(() => {
    const portal = document.querySelector('[id="portal/fullscreen-content"]');
    const result = document.getElementById("portal-result");
    if (!result) return;
    const insideFullscreen =
      portal?.parentElement === fullscreenHostRef.current;
    result.textContent = insideFullscreen
      ? "Portal parent: fullscreen"
      : "Portal parent: body";
  }, []);

  return (
    <section aria-label="Fullscreen portal">
      <div
        ref={fullscreenHostRef}
        style={{ background: "white", color: "black", minHeight: 200 }}
      >
        <button type="button" onClick={enterFullscreen}>
          Enter portal fullscreen
        </button>
        <button type="button" onClick={() => setMounted(true)}>
          Mount named form and portal
        </button>
        <div id="portal-result" role="status" aria-label="Portal result">
          Portal parent: pending
        </div>
        {mounted && (
          <>
            <AddDefaultViewCollision formRef={formRef} />
            <Ariakit.Portal id="fullscreen-content">
              Fullscreen portal content
            </Ariakit.Portal>
            <RemoveDefaultViewCollision
              formRef={formRef}
              recordResult={recordResult}
            />
          </>
        )}
      </div>
    </section>
  );
}

function ComboboxScroll() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Item 24",
    virtualFocus: false,
  });
  // Use the same module instance as the callback invoked below so the
  // user-triggered scroll follows the normal select-presentation branch.
  useTrackComboboxSelectPresentation(store);

  const recordResult = useCallback(() => {
    const listbox = document.getElementById("combobox-listbox");
    const item = document.getElementById("combobox-item-24");
    const result = document.getElementById("combobox-result");
    if (!listbox || !item || !result) return;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const visible =
      itemRect.top >= listboxRect.top && itemRect.bottom <= listboxRect.bottom;
    result.textContent = visible
      ? "Selected item: visible"
      : "Selected item: hidden";
  }, []);

  const testScroll = () => {
    const listbox = document.getElementById("combobox-listbox");
    const item = document.getElementById("combobox-item-24");
    if (!listbox || !item) return;
    listbox.scrollTop = 0;
    const form = createDefaultViewForm();
    document.body.appendChild(form);
    try {
      getScrollItemIntoView(store)(item);
    } finally {
      recordResult();
      form.remove();
    }
  };

  const keepPopupOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <section aria-label="Combobox scroll">
      <div id="combobox-result" role="status" aria-label="Combobox result">
        Selected item: pending
      </div>
      <Ariakit.ComboboxProvider store={store}>
        <Ariakit.ComboboxSelectLabel>Favorite item</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          id="combobox-listbox"
          aria-label="Favorite item options"
          style={{ maxHeight: 120, overflow: "auto" }}
        >
          <button
            type="button"
            tabIndex={0}
            onMouseDown={keepPopupOpen}
            onClick={testScroll}
          >
            Scroll selected item with named form
          </button>
          {items.map((item, index) => (
            <Ariakit.ComboboxItem
              id={`combobox-item-${index + 1}`}
              key={item}
              value={item}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

export default function Example() {
  return (
    <main>
      <FullscreenPortal />
      <ComboboxScroll />
    </main>
  );
}
