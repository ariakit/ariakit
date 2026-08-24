import { createShortcutStore } from "@ariakit/components/shortcut/shortcut-store";
import type { ReactNode } from "react";
import {
  StrictMode,
  Suspense,
  act,
  createElement,
  startTransition,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";
import { ShortcutCommand } from "./shortcut-command.tsx";
import { useShortcutContext } from "./shortcut-context.tsx";
import { ShortcutInput } from "./shortcut-input.tsx";
import { ShortcutProvider } from "./shortcut-provider.tsx";
import { ShortcutScope } from "./shortcut-scope.tsx";
import {
  useShortcutCommand,
  useShortcutKeys,
  useShortcutStore,
} from "./shortcut-store.ts";
import { Shortcut } from "./shortcut.tsx";

const cleanups: Array<() => void> = [];
const actEnvironment = globalThis as {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;

function renderServer(element: ReactNode) {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const html = renderToString(element);
    const unexpectedErrors = consoleError.mock.calls.filter(([message]) => {
      return !String(message).includes(
        "useLayoutEffect does nothing on the server",
      );
    });
    expect(unexpectedErrors).toEqual([]);
    return html;
  } finally {
    consoleError.mockRestore();
  }
}

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

afterEach(async () => {
  while (cleanups.length) {
    const cleanup = cleanups.pop();
    await act(async () => cleanup?.());
  }
  document.body.replaceChildren();
});

async function render(ui: ReactNode, strictMode = false) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  cleanups.push(() => root.unmount());
  await act(async () => {
    root.render(strictMode ? <StrictMode>{ui}</StrictMode> : ui);
  });
  return container;
}

async function keyDown(
  element: Element,
  key: string,
  init: KeyboardEventInit = {},
) {
  let accepted = false;
  await act(async () => {
    accepted = element.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key,
        ...init,
      }),
    );
  });
  return accepted;
}

function getButton(container: ParentNode, name: string) {
  const buttons = [...container.querySelectorAll("button")];
  const button = buttons.find((element) => element.textContent?.includes(name));
  if (!button) throw new Error(`Missing button: ${name}`);
  return button;
}

test("composes a headless declaration with a StrictMode reference", async () => {
  const onTrigger = vi.fn();

  function Commands() {
    const keys = useShortcutKeys({ command: "save" });
    useShortcutCommand({
      command: "save",
      keys: "Control+S",
      onTrigger,
    });
    return (
      <>
        <ShortcutCommand command="save">Save</ShortcutCommand>
        <output>{keys.join(" ")}</output>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <Commands />
    </ShortcutProvider>,
    true,
  );
  const button = getButton(container, "Save");

  await act(async () => button.click());
  expect(onTrigger).toHaveBeenCalledTimes(1);

  await keyDown(button, "s", { code: "KeyS", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(2);
  expect(container.querySelector("output")?.textContent).toContain("Control+S");
});

test("shares the global fallback between hooks and references", async () => {
  const onTrigger = vi.fn();

  function GlobalCommand() {
    useShortcutCommand({
      command: "global-save",
      keys: "Control+G",
      onTrigger,
    });
    return <ShortcutCommand command="global-save">Global save</ShortcutCommand>;
  }

  const container = await render(<GlobalCommand />);
  await act(async () => getButton(container, "Global save").click());
  expect(onTrigger).toHaveBeenCalledTimes(1);
});

test("preserves headless collision order across callback option renders", async () => {
  const onOlderTrigger = vi.fn();
  const onNewerTrigger = vi.fn();

  function Commands() {
    const [version, setVersion] = useState(0);
    useShortcutCommand({
      keys: "Control+H Control+J",
      onTrigger: onOlderTrigger,
      preventDefault: () => version >= 0,
    });
    useShortcutCommand({
      keys: "Control+H Control+J",
      onTrigger: onNewerTrigger,
    });
    return (
      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Render headless options
      </button>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <Commands />
    </ShortcutProvider>,
  );
  const button = getButton(container, "Render headless options");
  await keyDown(button, "h", { code: "KeyH", ctrlKey: true });
  expect(onOlderTrigger).not.toHaveBeenCalled();
  expect(onNewerTrigger).toHaveBeenCalledTimes(1);

  await act(async () => button.click());
  await keyDown(button, "j", { code: "KeyJ", ctrlKey: true });
  expect(onOlderTrigger).not.toHaveBeenCalled();
  expect(onNewerTrigger).toHaveBeenCalledTimes(2);
});

test("preserves rendered collision order across callback option renders", async () => {
  const onOlderTrigger = vi.fn();
  const onNewerTrigger = vi.fn();

  function Commands() {
    const [version, setVersion] = useState(0);
    return (
      <>
        <ShortcutCommand
          enabledInTextbox={() => version >= 0}
          keys="Control+R Control+T"
          onTrigger={onOlderTrigger}
        >
          Older command
        </ShortcutCommand>
        <ShortcutCommand
          enabledInTextbox
          keys="Control+R Control+T"
          onTrigger={onNewerTrigger}
        >
          Newer command
        </ShortcutCommand>
        <button type="button" onClick={() => setVersion((value) => value + 1)}>
          Render command options
        </button>
        <input aria-label="Command target" />
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <Commands />
    </ShortcutProvider>,
  );
  const target = container.querySelector("input");
  if (!target) throw new Error("Missing command target");
  await act(async () => target.focus());
  await keyDown(target, "r", { code: "KeyR", ctrlKey: true });
  expect(onOlderTrigger).not.toHaveBeenCalled();
  expect(onNewerTrigger).toHaveBeenCalledTimes(1);

  await act(async () => getButton(container, "Render command options").click());
  await keyDown(target, "t", { code: "KeyT", ctrlKey: true });
  expect(onOlderTrigger).not.toHaveBeenCalled();
  expect(onNewerTrigger).toHaveBeenCalledTimes(2);
});

test("does not let a scoped pure reference override a global declaration", async () => {
  const onGlobalTrigger = vi.fn();
  const onScopedTrigger = vi.fn();

  function Commands() {
    useShortcutCommand({
      command: "global-save",
      keys: "Control+S",
      onTrigger: onGlobalTrigger,
    });
    return (
      <>
        <ShortcutScope>
          <ShortcutCommand command="global-save">
            Global save reference
          </ShortcutCommand>
          <ShortcutCommand
            command="scoped-save"
            keys="Control+D"
            onTrigger={onScopedTrigger}
          >
            Scoped save declaration
          </ShortcutCommand>
        </ShortcutScope>
        <button type="button">Outside</button>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <Commands />
    </ShortcutProvider>,
  );
  const outside = getButton(container, "Outside");
  await act(async () => outside.focus());
  await keyDown(outside, "s", { code: "KeyS", ctrlKey: true });
  expect(onGlobalTrigger).toHaveBeenCalledTimes(1);
  await keyDown(outside, "d", { code: "KeyD", ctrlKey: true });
  expect(onScopedTrigger).not.toHaveBeenCalled();

  const scoped = getButton(container, "Scoped save declaration");
  await act(async () => scoped.focus());
  await keyDown(scoped, "d", { code: "KeyD", ctrlKey: true });
  expect(onScopedTrigger).toHaveBeenCalledTimes(1);
});

test("stabilizes inline shortcut scope arrays", async () => {
  const onHeadlessTrigger = vi.fn();
  const onRenderedTrigger = vi.fn();

  function Commands() {
    const first = useRef<HTMLButtonElement>(null);
    const second = useRef<HTMLButtonElement>(null);
    useShortcutCommand({
      command: "headless-array",
      keys: "Control+H",
      onTrigger: onHeadlessTrigger,
      scope: [first, second],
    });
    useShortcutKeys({ command: "headless-array" });
    return (
      <>
        <button ref={first} type="button">
          First scope
        </button>
        <button ref={second} type="button">
          Second scope
        </button>
        <ShortcutCommand
          keys="Control+R"
          onTrigger={onRenderedTrigger}
          scope={[first, second]}
        >
          Rendered array command
        </ShortcutCommand>
        <button type="button">Outside</button>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <Commands />
    </ShortcutProvider>,
  );
  const first = getButton(container, "First scope");
  await act(async () => first.focus());
  await keyDown(first, "h", { code: "KeyH", ctrlKey: true });
  expect(onHeadlessTrigger).toHaveBeenCalledTimes(1);

  const second = getButton(container, "Second scope");
  await act(async () => second.focus());
  await keyDown(second, "r", { code: "KeyR", ctrlKey: true });
  expect(onRenderedTrigger).toHaveBeenCalledTimes(1);

  const outside = getButton(container, "Outside");
  await act(async () => outside.focus());
  await keyDown(outside, "h", { code: "KeyH", ctrlKey: true });
  await keyDown(outside, "r", { code: "KeyR", ctrlKey: true });
  expect(onHeadlessTrigger).toHaveBeenCalledTimes(1);
  expect(onRenderedTrigger).toHaveBeenCalledTimes(1);
});

test("reacts to a named command remap", async () => {
  function Commands() {
    const store = useShortcutStore({ platform: "windows" });
    useShortcutCommand({
      store,
      command: "save",
      keys: "Control+S",
      onTrigger: () => {},
    });
    const keys = useShortcutKeys({ store, command: "save" });
    return (
      <ShortcutProvider store={store}>
        <output>{keys.join(" ")}</output>
        <button type="button" onClick={() => store.setKeys("save", "Alt+S")}>
          Remap
        </button>
      </ShortcutProvider>
    );
  }

  const container = await render(<Commands />);
  expect(container.querySelector("output")?.textContent).toContain("Control+S");
  await act(async () => getButton(container, "Remap").click());
  expect(container.querySelector("output")?.textContent).toContain("Alt+S");
});

test("renders nested key elements and command ARIA", async () => {
  const container = await render(
    <ShortcutProvider
      platform="windows"
      glyphs={{ Control: "Ctrl" }}
      keyNames={{ Control: "Control key" }}
    >
      <ShortcutCommand keys="Control+K Alt+K">
        Open <Shortcut />
      </ShortcutCommand>
    </ShortcutProvider>,
  );
  const button = getButton(container, "Open");
  expect(button.getAttribute("aria-keyshortcuts")).toBe("Control+K Alt+K");
  const shortcut = button.querySelector("kbd");
  expect(shortcut?.hasAttribute("aria-label")).toBe(false);
  expect(shortcut?.getAttribute("aria-hidden")).toBe("true");
  expect(shortcut?.getAttribute("dir")).toBe("ltr");
  expect(shortcut?.querySelectorAll(":scope > kbd")).toHaveLength(2);
  expect(shortcut?.querySelector("[data-key=control]")?.textContent).toContain(
    "CtrlControl key",
  );
});

test("rebinds a rendered command observer when its assigned slot changes", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const firstWrapper = document.createElement("div");
  const firstSlot = document.createElement("slot");
  firstWrapper.appendChild(firstSlot);
  const secondWrapper = document.createElement("div");
  const secondSlot = document.createElement("slot");
  secondWrapper.setAttribute("inert", "");
  secondWrapper.appendChild(secondSlot);
  shadowRoot.append(firstWrapper, secondWrapper);
  let assignedSlot: HTMLSlotElement | null = firstSlot;

  const setReference = (element: HTMLButtonElement | null) => {
    if (!element) return;
    Object.defineProperty(element, "assignedSlot", {
      configurable: true,
      get: () => assignedSlot,
    });
  };

  await render(
    <ShortcutProvider platform="windows">
      {createPortal(
        <ShortcutCommand keys="F6" ref={setReference}>
          Slotted command <Shortcut alwaysVisible />
        </ShortcutCommand>,
        host,
      )}
    </ShortcutProvider>,
  );
  const reference = getButton(host, "Slotted command");
  const hint = reference.querySelector<HTMLElement>(":scope > kbd");
  if (!hint) throw new Error("Missing shortcut hint");
  expect(reference.getAttribute("aria-keyshortcuts")).toBe("F6");
  expect(hint.style.visibility).toBe("");

  await act(async () => {
    assignedSlot = secondSlot;
    firstSlot.dispatchEvent(new Event("slotchange"));
  });
  expect(reference.hasAttribute("aria-keyshortcuts")).toBe(false);
  expect(hint.style.visibility).toBe("hidden");

  await act(async () => secondWrapper.removeAttribute("inert"));
  expect(reference.getAttribute("aria-keyshortcuts")).toBe("F6");
  expect(hint.style.visibility).toBe("");
});

test("hides explicit shortcut hints inside an ARIA shortcut command", async () => {
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutCommand keys="Control+K">
        Open <Shortcut data-explicit="" keys="Alt+K" />
      </ShortcutCommand>
    </ShortcutProvider>,
  );
  const shortcut = container.querySelector("[data-explicit]");
  expect(shortcut?.getAttribute("aria-hidden")).toBe("true");
});

test("renders nothing without an alternative for the current platform", async () => {
  const container = await render(
    <ShortcutProvider platform="apple">
      <Shortcut data-platform-shortcut="" keys="pc:Control+K" />
    </ShortcutProvider>,
  );
  expect(container.querySelector("[data-platform-shortcut]")).toBeNull();
});

test("supports render composition and unnamed click handlers", async () => {
  const onTrigger = vi.fn();
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutScope render={<section data-scope="" />}>
        <ShortcutCommand
          render={<a href="#run" />}
          keys="Control+R"
          onTrigger={onTrigger}
        >
          Run <Shortcut render={<span data-shortcut="" />} />
        </ShortcutCommand>
      </ShortcutScope>
    </ShortcutProvider>,
  );
  const reference = container.querySelector("a");
  if (!reference) throw new Error("Missing composed reference");
  await act(async () => reference.click());
  expect(onTrigger).toHaveBeenCalledTimes(1);
  expect(container.querySelector("section[data-scope]")).not.toBeNull();
  const shortcut = reference.querySelector("span[data-shortcut]");
  expect(shortcut?.querySelectorAll(":scope > kbd")).toHaveLength(2);
  expect(shortcut?.getAttribute("aria-hidden")).toBe("true");
});

test("keeps a portalled command in its logical scope", async () => {
  const portal = document.createElement("div");
  document.body.appendChild(portal);
  let count = 0;
  const onScopeFocus = vi.fn();

  function ScopedCommand() {
    useShortcutCommand({
      keys: "Control+P Control+O Control+I",
      onTrigger: () => {
        count += 1;
      },
    });
    return createPortal(
      <>
        <button type="button">First portal origin</button>
        <button type="button">Second portal origin</button>
      </>,
      portal,
    );
  }

  await render(
    <ShortcutProvider platform="windows">
      <ShortcutScope onFocusCapture={onScopeFocus}>
        <ScopedCommand />
      </ShortcutScope>
      <button type="button">Outside</button>
    </ShortcutProvider>,
  );
  const firstPortalButton = getButton(portal, "First portal origin");
  await act(async () => firstPortalButton.focus());
  await keyDown(firstPortalButton, "p", { code: "KeyP", ctrlKey: true });
  expect(count).toBe(1);

  const secondPortalButton = getButton(portal, "Second portal origin");
  await act(async () => secondPortalButton.focus());
  expect(onScopeFocus).toHaveBeenCalledTimes(2);
  await keyDown(secondPortalButton, "o", { code: "KeyO", ctrlKey: true });
  expect(count).toBe(2);

  const outside = getButton(document, "Outside");
  await act(async () => outside.focus());
  await keyDown(outside, "i", { code: "KeyI", ctrlKey: true });
  expect(count).toBe(2);
});

test("keeps an initially autofocused portal in its logical scope", async () => {
  const portal = document.createElement("div");
  document.body.appendChild(portal);
  const onTrigger = vi.fn();

  function ScopedCommand() {
    useShortcutCommand({ keys: "Control+P", onTrigger });
    return createPortal(
      <button type="button" autoFocus>
        Portal origin
      </button>,
      portal,
    );
  }

  await render(
    <ShortcutProvider platform="windows">
      <ShortcutScope>
        <ScopedCommand />
      </ShortcutScope>
    </ShortcutProvider>,
  );
  const portalButton = getButton(portal, "Portal origin");
  expect(document.activeElement).toBe(portalButton);
  await keyDown(portalButton, "p", { code: "KeyP", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);
});

test("keeps a focused portal scope active when its store changes", async () => {
  const firstStore = createShortcutStore({ platform: "windows" });
  const secondStore = createShortcutStore({ platform: "windows" });
  const portal = document.createElement("div");
  document.body.appendChild(portal);
  const onTrigger = vi.fn();

  function ScopedCommand() {
    useShortcutCommand({
      keys: "Control+P Control+O",
      onTrigger,
    });
    return createPortal(<button type="button">Portal origin</button>, portal);
  }

  function App() {
    const [store, setStore] = useState(firstStore);
    return (
      <ShortcutProvider store={store}>
        <ShortcutScope>
          <ScopedCommand />
        </ShortcutScope>
        <button type="button" onClick={() => setStore(secondStore)}>
          Switch store
        </button>
      </ShortcutProvider>
    );
  }

  const container = await render(<App />);
  const portalButton = getButton(portal, "Portal origin");
  await act(async () => portalButton.focus());
  await keyDown(portalButton, "p", { code: "KeyP", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);

  await act(async () => getButton(container, "Switch store").click());
  expect(document.activeElement).toBe(portalButton);
  await keyDown(portalButton, "o", { code: "KeyO", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(2);
});

test("clears a logical portal scope after its focused node unmounts", async () => {
  const portal = document.createElement("div");
  document.body.appendChild(portal);
  const onTrigger = vi.fn();
  // Model browsers that remove focused nodes without dispatching focusout.
  const stopFocusOut = (event: Event) => event.stopPropagation();
  document.addEventListener("focusout", stopFocusOut, true);
  cleanups.push(() =>
    document.removeEventListener("focusout", stopFocusOut, true),
  );

  function ScopedCommand({ mounted }: { mounted: boolean }) {
    useShortcutCommand({
      keys: "Control+P Control+O",
      onTrigger,
    });
    if (!mounted) return null;
    return createPortal(<button type="button">Portal origin</button>, portal);
  }

  function App() {
    const [mounted, setMounted] = useState(true);
    return (
      <ShortcutProvider platform="windows">
        <ShortcutScope>
          <ScopedCommand mounted={mounted} />
        </ShortcutScope>
        <button type="button" onClick={() => setMounted(false)}>
          Remove portal
        </button>
      </ShortcutProvider>
    );
  }

  const container = await render(<App />);
  const portalButton = getButton(portal, "Portal origin");
  await act(async () => portalButton.focus());
  await keyDown(portalButton, "p", { code: "KeyP", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);

  const outside = getButton(container, "Remove portal");
  await act(async () => outside.click());
  await act(async () => outside.focus());
  await keyDown(outside, "o", { code: "KeyO", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);
});

test("resolves a portalled hint against its owner document", async () => {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const frameDocument = frame.contentDocument;
  if (!frameDocument) throw new Error("Missing frame document");
  const frameBody = frameDocument.body;
  const store = createShortcutStore({ platform: "windows" });
  const release = store.attach(frameDocument);
  cleanups.push(release);

  function FrameCommand() {
    useShortcutCommand({
      command: "frame-command",
      keys: "Control+F",
      onTrigger: () => {},
    });
    return createPortal(
      <>
        <button type="button">Frame origin</button>
        <Shortcut command="frame-command" data-frame-shortcut="" />
      </>,
      frameBody,
    );
  }

  function FrameOutside() {
    return createPortal(
      <button type="button">Frame outside</button>,
      frameBody,
    );
  }

  await render(
    <ShortcutProvider store={store}>
      <ShortcutScope>
        <FrameCommand />
      </ShortcutScope>
      <FrameOutside />
    </ShortcutProvider>,
  );
  const frameOrigin = getButton(frameDocument, "Frame origin");
  const shortcut = frameDocument.querySelector<HTMLElement>(
    "[data-frame-shortcut]",
  );
  if (!shortcut) throw new Error("Missing frame shortcut");

  await act(async () => frameOrigin.focus());
  expect(shortcut.style.visibility).toBe("");

  const outside = getButton(frameDocument, "Frame outside");
  await act(async () => outside.focus());
  expect(shortcut.style.visibility).toBe("hidden");
});

test("records, cancels, clears, and preserves Tab navigation", async () => {
  const setKeys = vi.fn<(keys: string | null) => void>();
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutInput
        aria-label="Shortcut"
        defaultKeys="Control+K"
        setKeys={setKeys}
      />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");
  expect(input.readOnly).toBe(true);

  await act(async () => input.focus());
  expect(input.hasAttribute("data-shortcut-recording")).toBe(true);
  await keyDown(input, "Control", { code: "ControlLeft", ctrlKey: true });
  expect(input.value).toContain("Ctrl");
  await keyDown(input, "s", { code: "KeyS", ctrlKey: true });
  expect(setKeys).toHaveBeenLastCalledWith("Control+S");
  expect(input.hasAttribute("data-shortcut-recording")).toBe(false);

  await act(async () => input.click());
  const tabAccepted = await keyDown(input, "Tab", { code: "Tab" });
  expect(tabAccepted).toBe(true);
  await keyDown(input, "Escape", { code: "Escape" });
  expect(setKeys).toHaveBeenCalledTimes(1);

  await act(async () => input.click());
  await keyDown(input, "Backspace", { code: "Backspace" });
  expect(setKeys).toHaveBeenLastCalledWith(null);
});

test("ignores AltGraph while recording", async () => {
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutInput aria-label="Shortcut" />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");
  await act(async () => input.focus());

  const altGraph = new KeyboardEvent("keydown", {
    altKey: true,
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    key: "AltGraph",
  });
  await act(async () => input.dispatchEvent(altGraph));
  expect(altGraph.defaultPrevented).toBe(false);
  expect(input.value).toBe("");

  const altGraphCharacter = new KeyboardEvent("keydown", {
    altKey: true,
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    key: "€",
  });
  Object.defineProperty(altGraphCharacter, "getModifierState", {
    value: (key: string) => key === "AltGraph",
  });
  await act(async () => input.dispatchEvent(altGraphCharacter));
  expect(altGraphCharacter.defaultPrevented).toBe(false);
  expect(input.value).toBe("");
});

test("announces recorded keys with readable key names", async () => {
  const container = await render(
    <ShortcutProvider platform="apple" keyNames={{ Control: "Custom control" }}>
      <ShortcutInput aria-label="Shortcut" />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");

  await act(async () => input.focus());
  await keyDown(input, "s", { code: "KeyS", ctrlKey: true });
  expect(container.querySelector("[aria-live]")?.textContent).toBe(
    "Custom control + S",
  );
});

test("clears controlled recording progress when recording stops", async () => {
  function ControlledInput() {
    const [recording, setRecording] = useState(true);
    return (
      <>
        <ShortcutInput
          aria-label="Shortcut"
          keys="Control+K"
          recording={recording}
          setRecording={setRecording}
        />
        <button type="button" onClick={() => setRecording(false)}>
          Stop recording
        </button>
        <button type="button" onClick={() => setRecording(true)}>
          Start recording
        </button>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <ControlledInput />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");
  const configuredValue = input.value;

  await keyDown(input, "Control", { code: "ControlLeft", ctrlKey: true });
  expect(input.value).not.toBe(configuredValue);
  await act(async () => getButton(container, "Stop recording").click());
  expect(input.readOnly).toBe(true);
  expect(input.value).toBe(configuredValue);
  await act(async () => getButton(container, "Start recording").click());
  expect(input.readOnly).toBe(false);
  expect(input.value).toBe(configuredValue);
});

test("keeps recording state from a suspended render out of events", async () => {
  const setKeys = vi.fn();
  const suspended = new Promise<void>(() => {});

  function Suspend({ active }: { active: boolean }) {
    if (active) throw suspended;
    return null;
  }

  function App() {
    const [recording, setRecording] = useState(false);
    return (
      <>
        <Suspense fallback={<span>Loading</span>}>
          <ShortcutInput
            aria-label="Shortcut"
            recording={recording}
            setRecording={setRecording}
            setKeys={setKeys}
          />
          <Suspend active={recording} />
        </Suspense>
        <button
          type="button"
          onClick={() => {
            startTransition(() => setRecording(true));
          }}
        >
          Start suspended recording
        </button>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <App />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");
  await act(async () =>
    getButton(container, "Start suspended recording").click(),
  );
  expect(input.readOnly).toBe(true);
  await keyDown(input, "s", { code: "KeyS", ctrlKey: true });
  expect(setKeys).not.toHaveBeenCalled();
});

test("keeps controlled recording active until the parent changes it", async () => {
  const setKeys = vi.fn();
  const setRecording = vi.fn();
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutInput
        aria-label="Shortcut"
        recording
        setKeys={setKeys}
        setRecording={setRecording}
      />
    </ShortcutProvider>,
  );
  const input = container.querySelector("input");
  if (!input) throw new Error("Missing shortcut input");

  const dispatchChord = (key: string, code: string) => {
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code,
        ctrlKey: true,
        key,
      }),
    );
  };
  await act(async () => {
    dispatchChord("s", "KeyS");
    dispatchChord("s", "KeyS");
    dispatchChord("d", "KeyD");
  });

  expect(setKeys.mock.calls).toEqual([
    ["Control+S"],
    ["Control+S"],
    ["Control+D"],
  ]);
  expect(setRecording).toHaveBeenCalledTimes(3);
});

test("preserves provider ancestry through a shortcut scope", async () => {
  const onTrigger = vi.fn();

  function App() {
    const [enabled, setEnabled] = useState(false);
    return (
      <ShortcutProvider enabled={enabled} platform="windows">
        <button type="button" onClick={() => setEnabled(true)}>
          Enable root
        </button>
        <ShortcutScope>
          <ShortcutProvider>
            <ShortcutCommand keys="Control+N" onTrigger={onTrigger}>
              Nested command <Shortcut data-nested-shortcut="" />
            </ShortcutCommand>
          </ShortcutProvider>
        </ShortcutScope>
      </ShortcutProvider>
    );
  }

  const container = await render(<App />);
  const command = getButton(container, "Nested command");
  const shortcut = container.querySelector<HTMLElement>(
    "[data-nested-shortcut]",
  );
  if (!shortcut) throw new Error("Missing nested shortcut");
  expect(command.hasAttribute("aria-keyshortcuts")).toBe(false);
  expect(shortcut.style.visibility).toBe("hidden");
  await act(async () => command.focus());
  await keyDown(command, "n", { code: "KeyN", ctrlKey: true });
  expect(onTrigger).not.toHaveBeenCalled();

  await act(async () => getButton(container, "Enable root").click());
  expect(command.getAttribute("aria-keyshortcuts")).toBe("Control+N");
  expect(shortcut.style.visibility).toBe("");
  await act(async () => command.focus());
  await keyDown(command, "n", { code: "KeyN", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);
});

test("bypasses only scope visibility with alwaysVisible", async () => {
  const container = await render(
    <ShortcutProvider platform="windows">
      <ShortcutScope>
        <Shortcut data-out-of-scope="" keys="Control+K" alwaysVisible />
      </ShortcutScope>
      <ShortcutProvider enabled={false}>
        <Shortcut data-disabled="" keys="Control+D" alwaysVisible />
      </ShortcutProvider>
    </ShortcutProvider>,
  );
  const outOfScope = container.querySelector<HTMLElement>(
    "[data-out-of-scope]",
  );
  const disabled = container.querySelector<HTMLElement>("[data-disabled]");
  if (!outOfScope || !disabled) throw new Error("Missing shortcut hints");
  expect(outOfScope.hasAttribute("data-in-scope")).toBe(false);
  expect(outOfScope.style.visibility).toBe("");
  expect(disabled.style.visibility).toBe("hidden");
});

test("uses an exact framework-independent provider store", async () => {
  const store = createShortcutStore({ platform: "windows" });
  const onClick = vi.fn();
  await render(
    <ShortcutProvider store={store}>
      <ShortcutCommand command="save" keys="Control+S" onClick={onClick}>
        Save
      </ShortcutCommand>
    </ShortcutProvider>,
  );
  expect(store.trigger("save")).toBe(true);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("syncs props only to the selected framework-independent store", async () => {
  const firstStore = createShortcutStore({ platform: "windows" });
  const secondStore = createShortcutStore({ platform: "windows" });
  interface StoreCommit {
    store: ReturnType<typeof createShortcutStore>;
    platform: string;
  }
  const commits: StoreCommit[] = [];

  function State() {
    const store = useShortcutContext();
    // oxlint-disable-next-line react/hooks -- public hook method
    const platform = store.useState("platform");
    useLayoutEffect(() => {
      commits.push({ store: store.unstable_getStore(), platform });
    });
    return <output>{platform}</output>;
  }

  function App() {
    const [store, setStore] = useState<ReturnType<
      typeof createShortcutStore
    > | null>(firstStore);
    const [platform, setPlatform] = useState<"apple" | "windows">("windows");
    return (
      <>
        <ShortcutProvider store={store} platform={platform}>
          <State />
        </ShortcutProvider>
        <button
          type="button"
          onClick={() => {
            setStore(secondStore);
            setPlatform("apple");
          }}
        >
          Switch store
        </button>
        <button
          type="button"
          onClick={() => {
            setStore(null);
            setPlatform("windows");
          }}
        >
          Use owned store
        </button>
      </>
    );
  }

  const container = await render(<App />);
  await act(async () => getButton(container, "Switch store").click());
  expect(firstStore.getState().platform).toBe("windows");
  expect(secondStore.getState().platform).toBe("apple");
  expect(container.querySelector("output")?.textContent).toBe("apple");

  const ownedCommitStart = commits.length;
  await act(async () => getButton(container, "Use owned store").click());
  const ownedCommits = commits.slice(ownedCommitStart);
  expect(ownedCommits.length).toBeGreaterThan(0);
  expect(ownedCommits.every(({ store }) => store !== secondStore)).toBe(true);
  expect(ownedCommits[0]?.platform).toBe("windows");
  expect(secondStore.getState().platform).toBe("apple");
  expect(container.querySelector("output")?.textContent).toBe("windows");
});

test("keeps an externally owned nested store active after Provider unmount", async () => {
  const parent = createShortcutStore({ platform: "windows" });
  const store = createShortcutStore({ unstable_parent: parent });
  const onTrigger = vi.fn();
  const unregister = store.registerCommand({
    command: "external",
    keys: "Control+E",
    onTrigger,
  });
  cleanups.push(unregister);

  function App() {
    const [mounted, setMounted] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setMounted(false)}>
          Unmount
        </button>
        {mounted && <ShortcutProvider store={store} />}
      </>
    );
  }

  const container = await render(<App />);
  expect(store.trigger("external")).toBe(true);
  await act(async () => getButton(container, "Unmount").click());
  expect(store.trigger("external")).toBe(true);
  expect(onTrigger).toHaveBeenCalledTimes(2);
});

test("updates inherited state through a child store useState method", async () => {
  const parent = createShortcutStore({ platform: "windows" });

  function Child() {
    const store = useShortcutStore();
    // oxlint-disable-next-line react/hooks -- public hook method
    const platform = store.useState("platform");
    return (
      <ShortcutProvider store={store}>
        <output>{platform}</output>
      </ShortcutProvider>
    );
  }

  function App() {
    return (
      <ShortcutProvider store={parent}>
        <button
          type="button"
          onClick={() => parent.setState("platform", "apple")}
        >
          Change platform
        </button>
        <Child />
      </ShortcutProvider>
    );
  }

  const container = await render(<App />);
  expect(container.querySelector("output")?.textContent).toContain("windows");
  await act(async () => getButton(container, "Change platform").click());
  expect(container.querySelector("output")?.textContent).toContain("apple");
});

test("does not update keyed store state consumers for registry revisions", async () => {
  const onRender = vi.fn();

  function State() {
    const store = useShortcutContext();
    // oxlint-disable-next-line react/hooks -- public hook method
    const enabled = store.useState("enabled");
    useLayoutEffect(() => {
      onRender();
    });
    return (
      <>
        <output>{String(enabled)}</output>
        <button type="button" onClick={() => store.setEnabled(false)}>
          Disable
        </button>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider platform="windows">
      <State />
      <ShortcutCommand keys="Control+K">Command</ShortcutCommand>
      <button type="button">Outside</button>
    </ShortcutProvider>,
  );
  const initialRenders = onRender.mock.calls.length;

  await act(async () => getButton(container, "Command").focus());
  await act(async () => getButton(container, "Outside").focus());
  expect(onRender).toHaveBeenCalledTimes(initialRenders);

  await act(async () => getButton(container, "Disable").click());
  expect(container.querySelector("output")?.textContent).toBe("false");
  expect(onRender).toHaveBeenCalledTimes(initialRenders + 1);
});

test("does not update global keyed state consumers for registry revisions", async () => {
  const onRender = vi.fn();

  function State() {
    const store = useShortcutContext();
    // oxlint-disable-next-line react/hooks -- public hook method
    const enabled = store.useState("enabled");
    useLayoutEffect(() => {
      onRender();
    });
    return <output>{String(enabled)}</output>;
  }

  const container = await render(
    <>
      <State />
      <ShortcutCommand keys="Control+K">Global command</ShortcutCommand>
      <button type="button">Outside</button>
    </>,
  );
  const initialRenders = onRender.mock.calls.length;

  await act(async () => getButton(container, "Global command").focus());
  await act(async () => getButton(container, "Outside").focus());
  expect(onRender).toHaveBeenCalledTimes(initialRenders);
});

test("resumes display inheritance after explicit props are omitted", async () => {
  function State() {
    const store = useShortcutContext();
    // oxlint-disable-next-line react/hooks -- public hook method
    const state = store.useState();
    return (
      <output>
        {state.platform}:{state.glyphs.Control}:{state.keyNames.Control}
      </output>
    );
  }

  function Child() {
    const [explicit, setExplicit] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setExplicit((value) => !value)}>
          Toggle explicit
        </button>
        <ShortcutProvider
          platform={explicit ? "windows" : undefined}
          glyphs={explicit ? { Control: "Child" } : undefined}
          keyNames={explicit ? { Control: "Child name" } : undefined}
        >
          <State />
        </ShortcutProvider>
      </>
    );
  }

  const container = await render(
    <ShortcutProvider
      platform="apple"
      glyphs={{ Control: "Parent" }}
      keyNames={{ Control: "Parent name" }}
    >
      <Child />
    </ShortcutProvider>,
  );
  const toggle = getButton(container, "Toggle explicit");
  const output = container.querySelector("output");
  expect(output?.textContent).toContain("windows:Child:Child name");
  await act(async () => toggle.click());
  expect(output?.textContent).toContain("apple:Parent:Parent name");
  await act(async () => toggle.click());
  expect(output?.textContent).toContain("windows:Child:Child name");
});

test("cleans up a conditional nested store before remounting", async () => {
  const onTrigger = vi.fn();

  function Child() {
    useShortcutCommand({
      keys: "Control+R",
      onTrigger,
    });
    return null;
  }

  function App() {
    const [mounted, setMounted] = useState(true);
    return (
      <ShortcutProvider platform="windows">
        <button type="button" onClick={() => setMounted((value) => !value)}>
          Toggle
        </button>
        {mounted && (
          <ShortcutProvider>
            <Child />
          </ShortcutProvider>
        )}
      </ShortcutProvider>
    );
  }

  const container = await render(<App />);
  const toggle = getButton(container, "Toggle");
  await keyDown(toggle, "r", { code: "KeyR", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(1);
  await act(async () => toggle.click());
  await act(async () => toggle.click());
  await keyDown(toggle, "r", { code: "KeyR", ctrlKey: true });
  expect(onTrigger).toHaveBeenCalledTimes(2);
});

test("omits automatic output during SSR and renders explicit output", () => {
  const automatic = renderServer(
    <ShortcutProvider>
      <ShortcutCommand keys="Control+K">
        Open <Shortcut />
      </ShortcutCommand>
    </ShortcutProvider>,
  );
  expect(automatic).not.toContain("aria-keyshortcuts");
  expect(automatic).not.toContain("<kbd");

  const explicit = renderServer(
    <ShortcutProvider platform="windows">
      <ShortcutCommand keys="Control+K Alt+K">
        Open <Shortcut />
      </ShortcutCommand>
    </ShortcutProvider>,
  );
  expect(explicit).toContain('aria-keyshortcuts="Control+K Alt+K"');
  expect(explicit).toContain("<kbd");
});

test("keeps disabled provider output unavailable during SSR", () => {
  const html = renderServer(
    <ShortcutProvider enabled={false} platform="windows">
      <ShortcutCommand keys="Control+K">
        Open <Shortcut />
      </ShortcutCommand>
    </ShortcutProvider>,
  );

  expect(html).not.toContain("aria-keyshortcuts");
  expect(html).toContain("visibility:hidden");
});

test("applies an inherited command override during SSR", () => {
  const html = renderServer(
    <ShortcutProvider platform="windows" keys={{ save: "Alt+S" }}>
      <ShortcutProvider>
        <ShortcutCommand command="save" keys="Control+S">
          Save <Shortcut />
        </ShortcutCommand>
      </ShortcutProvider>
    </ShortcutProvider>,
  );

  expect(html).toContain('aria-keyshortcuts="Alt+S"');
  expect(html).not.toContain('aria-keyshortcuts="Control+S"');
  expect(html).toContain('data-key="alt"');
});

test("renders a pre-registered named command and inherited hint during SSR", () => {
  const store = createShortcutStore({ platform: "windows" });
  const unregister = store.registerCommand({
    command: "save",
    keys: "Control+S",
    onTrigger: () => {},
  });
  cleanups.push(unregister);

  const html = renderServer(
    <ShortcutProvider store={store}>
      <ShortcutCommand command="save">
        Save <Shortcut />
      </ShortcutCommand>
    </ShortcutProvider>,
  );

  expect(html).toContain('aria-keyshortcuts="Control+S"');
  expect(html).toContain('data-key="control"');
  expect(html).toContain('data-key="s"');
});

test("keeps automatic markup empty through the first hydration render", async () => {
  function App() {
    return (
      <ShortcutProvider>
        <ShortcutCommand keys="Control+K">
          Open <Shortcut />
        </ShortcutCommand>
      </ShortcutProvider>
    );
  }

  const container = document.createElement("div");
  container.innerHTML = renderServer(createElement(App));
  document.body.appendChild(container);
  expect(container.querySelector("kbd")).toBeNull();
  const root = hydrateRoot(container, createElement(App));
  cleanups.push(() => root.unmount());
  expect(container.querySelector("kbd")).toBeNull();
  await act(async () => {});
  expect(container.querySelector("kbd")).not.toBeNull();
});
