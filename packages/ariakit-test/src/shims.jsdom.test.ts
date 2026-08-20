// @vitest-environment jsdom

import { expect, test } from "vitest";
import { click, dispatch, hover, press } from "./index.ts";

function createIframeButton() {
  const container = document.createElement("div");
  const iframe = document.createElement("iframe");
  container.append(iframe);
  document.body.append(container);
  const iframeWindow = iframe.contentDocument?.defaultView;
  if (!iframeWindow) throw new Error("Unable to reach the iframe window");
  const button = iframeWindow.document.createElement("button");
  iframeWindow.document.body.append(button);
  return {
    container,
    iframe,
    iframeWindow,
    button,
    [Symbol.dispose]() {
      container.remove();
    },
  };
}

test("constructs clipboard events from ClipboardEventInit", () => {
  const clipboardData = { getData: () => "a,b" };
  // jsdom has no `DataTransfer` constructor, so use the smallest test double
  // that can prove the fallback preserves the caller's object.
  // @ts-expect-error
  const event = new ClipboardEvent("paste", { clipboardData });
  expect(event.clipboardData).toBe(clipboardData);
  expect(new ClipboardEvent("paste").clipboardData).toBeNull();
  // Web IDL converts a null dictionary to an empty dictionary.
  // https://webidl.spec.whatwg.org/#es-dictionary
  // @ts-expect-error
  expect(new ClipboardEvent("paste", null).clipboardData).toBeNull();
});

test("applies layout shims in an iframe realm before hovering", async () => {
  using fixture = createIframeButton();
  const { button, iframeWindow } = fixture;
  const hiddenButton = iframeWindow.document.createElement("button");
  hiddenButton.style.display = "none";
  iframeWindow.document.body.append(hiddenButton);
  const received: string[] = [];
  button.addEventListener("pointerover", (event) => received.push(event.type));
  hiddenButton.addEventListener("pointerover", (event) =>
    received.push(event.type),
  );

  await hover(button);
  await hover(hiddenButton);

  expect(received).toEqual(["pointerover"]);
  expect(button.getClientRects()[0]).toMatchObject({ width: 1, height: 1 });
  expect(hiddenButton.getClientRects()).toHaveLength(0);
});

test("does not hover content inside a hidden iframe ancestor", async () => {
  using fixture = createIframeButton();
  const { button, container } = fixture;
  container.style.display = "none";
  const received: string[] = [];
  button.addEventListener("pointerover", (event) => received.push(event.type));

  await hover(button);

  expect(received).toEqual([]);
  expect(button.getClientRects()).toHaveLength(0);
});

test("does not interact with content inside a pointer-inert iframe", async () => {
  using fixture = createIframeButton();
  const { button, container, iframe, iframeWindow } = fixture;
  container.style.pointerEvents = "none";
  const received: string[] = [];
  for (const event of ["pointerover", "pointermove", "pointerdown", "click"]) {
    button.addEventListener(event, () => received.push(event));
  }

  await hover(button);
  await click(button);

  expect(received).toEqual([]);
  expect(iframeWindow.getComputedStyle(button).pointerEvents).toBe("auto");
  expect(getComputedStyle(iframe).pointerEvents).toBe("none");
});

test("applies focus shims in an iframe realm before clicking", async () => {
  using fixture = createIframeButton();
  const { button, iframeWindow } = fixture;
  const received: string[] = [];
  button.addEventListener("pointerdown", (event) => received.push(event.type));
  button.addEventListener("click", (event) => received.push(event.type));

  await click(button);

  expect(received).toEqual(["pointerdown", "click"]);
  expect(iframeWindow.document.activeElement).toBe(button);
});

test("applies browser shims in an iframe realm before pressing", async () => {
  using fixture = createIframeButton();
  const { button } = fixture;
  const received: string[] = [];
  button.addEventListener("keydown", (event) => received.push(event.type));
  button.addEventListener("click", (event) => received.push(event.type));
  button.addEventListener("keyup", (event) => received.push(event.type));

  await press.Enter(button);

  expect(received).toEqual(["keydown", "click", "keyup"]);
});

test("installs ClipboardEvent in an iframe realm before dispatching", async () => {
  using fixture = createIframeButton();
  const { button, iframeWindow } = fixture;
  const clipboardData = { getData: () => "a,b" };
  let received: ClipboardEvent | undefined;
  button.addEventListener("paste", (event) => {
    received = event;
  });

  // jsdom has no `DataTransfer` constructor, so use the smallest test double
  // that can prove the fallback preserves the caller's object.
  await dispatch.paste(button, { clipboardData });

  expect(received).toBeInstanceOf(iframeWindow.ClipboardEvent);
  expect(received).not.toBeInstanceOf(ClipboardEvent);
  expect(received?.clipboardData).toBe(clipboardData);
});

test("leaves an environment that already implements mouse event members alone", () => {
  // jsdom implements the full `getModifierState`, including the `modifier*`
  // init members the happy-dom fallback cannot see, so replacing it would
  // silently downgrade every jsdom suite. Pin that guard from jsdom, since the
  // happy-dom default project makes it look redundant. Dropping the `x`/`y`
  // guard installs an equivalent accessor, so it has no such check.
  const event = new MouseEvent("auxclick", {
    modifierCapsLock: true,
    clientX: 3,
    clientY: 4,
  });
  expect(event.getModifierState("CapsLock")).toBe(true);
  expect([event.x, event.y]).toEqual([3, 4]);
});

test("leaves an environment with a conformant modifier state alone", () => {
  // jsdom already matches UI Events here, so the shim must leave it alone
  // rather than record the initializer itself. Pin that guard from jsdom, since
  // the happy-dom default project makes it look redundant.
  const event = new KeyboardEvent("keydown", {
    altKey: true,
    modifierCapsLock: true,
  });
  expect([
    event.getModifierState("CapsLock"),
    event.getModifierState("AltGraph"),
    event.getModifierState("alt"),
  ]).toEqual([true, false, false]);
  // Both implementations answer those the same way. `Super` is what separates
  // them: jsdom reports the spec member that Chromium, Firefox, and WebKit all
  // ignore, so the shim doesn't record it and would report false here.
  const superEvent = new KeyboardEvent("keydown", { modifierSuper: true });
  expect(superEvent.getModifierState("Super")).toBe(true);
  // That discriminator only holds while the two tables differ, so assert the
  // replacement itself as well. jsdom's method is a branded WebIDL operation
  // and rejects a foreign `this`; the shim installs a plain function, which
  // answers `true` here instead of throwing. The error comes from jsdom's
  // realm, so match that it throws rather than its constructor identity.
  expect(() =>
    KeyboardEvent.prototype.getModifierState.call(
      { altKey: true } as unknown as KeyboardEvent,
      "Alt",
    ),
  ).toThrow();
});
