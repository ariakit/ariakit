import * as Ariakit from "@ariakit/react";
import type { RefObject } from "react";
import { useRef } from "react";

const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);
const formName = "preferences";

// React 19 reads the same named property during commits. Scope the collision
// to native browser work so its failure does not hide Ariakit's behavior.
function setFormName(formRef: RefObject<HTMLFormElement | null>, name: string) {
  const form = formRef.current;
  if (!form) return;
  form.name = name;
}

function PreferencesForm({
  formRef,
}: {
  formRef: RefObject<HTMLFormElement | null>;
}) {
  return (
    <form ref={formRef} name={formName}>
      <label>
        Theme
        <input name="theme" defaultValue="System" />
      </label>
    </form>
  );
}

function FullscreenPortal({
  formRef,
}: {
  formRef: RefObject<HTMLFormElement | null>;
}) {
  const fullscreenHostRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = () => {
    const form = formRef.current;
    const host = fullscreenHostRef.current;
    if (!form || !host) return;
    setFormName(formRef, "defaultView");
    const restoreName = () => {
      setFormName(formRef, formName);
    };
    host.ownerDocument.addEventListener("fullscreenchange", restoreName, {
      once: true,
    });
    void host.requestFullscreen().catch(restoreName);
  };

  return (
    <section aria-label="Fullscreen portal">
      <div
        ref={fullscreenHostRef}
        style={{ background: "white", color: "black", minHeight: 200 }}
      >
        <button type="button" onClick={enterFullscreen}>
          Enter portal fullscreen
        </button>
        <Ariakit.Portal>Fullscreen portal content</Ariakit.Portal>
      </div>
    </section>
  );
}

function ComboboxScroll({
  formRef,
}: {
  formRef: RefObject<HTMLFormElement | null>;
}) {
  const setLegacyFormName = () => {
    setFormName(formRef, "defaultView");
  };
  const restoreFormName = () => {
    setFormName(formRef, formName);
  };

  return (
    <section aria-label="Combobox scroll">
      <Ariakit.ComboboxProvider defaultSelectedValue="Item 24">
        <Ariakit.ComboboxSelectLabel>Favorite item</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          aria-label="Favorite item options"
          onPointerDownCapture={setLegacyFormName}
          onFocus={restoreFormName}
          onPointerUp={restoreFormName}
          style={{ maxHeight: 120, overflow: "auto" }}
        >
          {items.map((item) => (
            <Ariakit.ComboboxItem
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
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <main>
      <h1>Preferences</h1>
      <PreferencesForm formRef={formRef} />
      <FullscreenPortal formRef={formRef} />
      <ComboboxScroll formRef={formRef} />
    </main>
  );
}
