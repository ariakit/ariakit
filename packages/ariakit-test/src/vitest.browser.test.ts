import { click, hover, press, q, rightClick, type } from "@ariakit/test";
import { afterEach, expect, test } from "vitest";
import { server } from "vitest/browser";

interface PointerInteractionCase {
  eventType: "click" | "contextmenu" | "pointermove";
  name: string;
  run: (element: Element, options: PointerEventInit) => Promise<void>;
}

const pointerInteractions = [
  { eventType: "click", name: "click", run: click },
  { eventType: "contextmenu", name: "right click", run: rightClick },
  { eventType: "pointermove", name: "hover", run: hover },
] satisfies PointerInteractionCase[];

const explicitCoordinates = [
  { clientX: 10, clientY: 10 },
  { clientX: 10 },
  { clientY: 10 },
  { clientX: 110, clientY: 110 },
];

const unsupportedPointerOptions = [
  {
    name: "inherited",
    create: () =>
      Object.create({
        pointerType: "pen",
        pressure: 0.5,
      }) as PointerEventInit,
  },
  {
    name: "non-enumerable",
    create: () => {
      const options: PointerEventInit = {};
      Object.defineProperties(options, {
        pointerType: { value: "pen" },
        pressure: { value: 0.5 },
      });
      return options;
    },
  },
];

afterEach(() => {
  document.body.replaceChildren();
});

test("uses trusted provider interactions", async () => {
  const button = document.createElement("button");
  button.textContent = "Button";
  const input = document.createElement("input");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  document.body.append(button, input, checkbox);

  let buttonClicks = 0;
  button.addEventListener("click", () => buttonClicks++);

  const trustedEvents = new Map<string, boolean>();
  for (const eventType of [
    "pointerover",
    "click",
    "contextmenu",
    "input",
    "keydown",
  ]) {
    document.addEventListener(
      eventType,
      (event) => trustedEvents.set(eventType, event.isTrusted),
      { once: true },
    );
  }

  await hover(q.button("Button"));
  await click(q.button("Button"));
  await rightClick(q.button("Button"));
  await press.Enter(button);
  await type("a", input);
  await press.Space(checkbox);

  let bodyKeydownTrusted = false;
  document.body.addEventListener("keydown", (event) => {
    bodyKeydownTrusted = event.isTrusted;
  });
  await press.Escape(document.body);

  expect(buttonClicks).toBe(2);
  expect(input).toHaveValue("a");
  expect(checkbox).toBeChecked();
  expect(bodyKeydownTrusted).toBe(true);
  expect(Object.fromEntries(trustedEvents)).toEqual({
    pointerover: true,
    click: true,
    contextmenu: true,
    input: true,
    keydown: true,
  });
});

test("uses trusted provider interactions for supported options", async () => {
  const button = document.createElement("button");
  button.textContent = "Button";
  document.body.appendChild(button);

  const clicks: Array<[boolean, boolean]> = [];
  button.addEventListener("click", (event) => {
    clicks.push([event.shiftKey, event.isTrusted]);
  });

  await click(button, { shiftKey: true });

  expect(clicks).toEqual([[true, true]]);
});

test("tabs within the focused test iframe", async () => {
  const first = document.createElement("button");
  first.tabIndex = 0;
  first.textContent = "First";
  const second = document.createElement("button");
  second.tabIndex = 0;
  second.textContent = "Second";
  document.body.append(first, second);

  await press.Tab();
  expect(first).toHaveFocus();
  await press.Tab();
  expect(second).toHaveFocus();
  await press.ShiftTab();
  expect(first).toHaveFocus();
});

test("uses stable locators without overwriting application mutations", async () => {
  const button = document.createElement("button");
  button.id = "portal/_vitest_";
  button.textContent = "Button";
  const testIdAttribute = server.config.browser.locators.testIdAttribute;
  button.setAttribute(testIdAttribute, "before");
  let testIdDuringClick: string | null = null;
  let temporaryAttributesDuringClick: string[] = [];
  button.addEventListener("click", () => {
    testIdDuringClick = button.getAttribute(testIdAttribute);
    temporaryAttributesDuringClick = button
      .getAttributeNames()
      .filter((name) => name.startsWith("data-ariakit-test-target-"));
    button.setAttribute(testIdAttribute, "after");
  });
  document.body.appendChild(button);

  await click(button);

  expect(testIdDuringClick).toBe("before");
  expect(temporaryAttributesDuringClick).toEqual([]);
  expect(button).toHaveAttribute(testIdAttribute, "after");
});

test("simulates pointer movement that Playwright cannot reproduce", async () => {
  const button = document.createElement("button");
  button.textContent = "Button";
  document.body.appendChild(button);

  const movements: Array<[number, number, boolean]> = [];
  button.addEventListener("pointermove", (event) => {
    movements.push([event.movementX, event.movementY, event.isTrusted]);
  });

  await hover(button, { movementX: 10, movementY: -5 });

  expect(movements).toEqual([[10, -5, false]]);
});

test("keeps pointer transitions simulated after a fallback", async () => {
  const first = document.createElement("button");
  first.textContent = "First";
  const second = document.createElement("button");
  second.textContent = "Second";
  document.body.append(first, second);

  const events: Array<[string, string, boolean]> = [];
  for (const element of [first, second]) {
    for (const eventType of ["pointerenter", "pointerleave"]) {
      element.addEventListener(eventType, (event) => {
        events.push([event.type, element.textContent ?? "", event.isTrusted]);
      });
    }
  }

  await hover(first, { movementX: 0 });
  events.length = 0;
  await hover(second);

  expect(events).toEqual([
    ["pointerleave", "First", false],
    ["pointerenter", "Second", false],
  ]);
});

test.each(unsupportedPointerOptions)(
  "simulates $name pointer options that Playwright cannot reproduce",
  async ({ create }) => {
    const button = document.createElement("button");
    button.textContent = "Button";
    document.body.appendChild(button);

    const movements: Array<[string, number, boolean]> = [];
    button.addEventListener("pointermove", (event) => {
      movements.push([event.pointerType, event.pressure, event.isTrusted]);
    });

    await hover(button, create());

    expect(movements).toEqual([["pen", 0.5, false]]);
  },
);

test.each(pointerInteractions)(
  "simulates explicit $name coordinates",
  async ({ eventType, run }) => {
    const button = document.createElement("button");
    button.textContent = "Button";
    button.style.position = "fixed";
    button.style.left = "100px";
    button.style.top = "100px";
    button.style.width = "100px";
    button.style.height = "40px";
    button.style.border = "8px solid transparent";
    button.style.boxSizing = "border-box";
    document.body.appendChild(button);

    const events: Array<[number, number, boolean]> = [];
    button.addEventListener(eventType, (event) => {
      if (!(event instanceof MouseEvent)) {
        throw new TypeError(`Unexpected ${eventType} event`);
      }
      events.push([event.clientX, event.clientY, event.isTrusted]);
    });

    for (const options of explicitCoordinates) {
      await run(button, options);
      expect(events).toEqual([
        [options.clientX ?? 0, options.clientY ?? 0, false],
      ]);
      events.length = 0;
    }
  },
);

test("keeps disabled interactions native", async () => {
  const disabledButton = document.createElement("button");
  disabledButton.disabled = true;
  disabledButton.textContent = "Disabled button";
  const disabledContextButton = disabledButton.cloneNode(true) as HTMLElement;
  const ariaDisabledButton = document.createElement("button");
  ariaDisabledButton.ariaDisabled = "true";
  ariaDisabledButton.textContent = "ARIA disabled button";
  document.body.append(
    disabledButton,
    disabledContextButton,
    ariaDisabledButton,
  );

  const disabledEvents: Array<[string, boolean]> = [];
  for (const eventType of ["pointerdown", "pointerup", "click"]) {
    disabledButton.addEventListener(eventType, (event) => {
      disabledEvents.push([event.type, event.isTrusted]);
    });
  }

  let contextMenuTrusted = false;
  disabledContextButton.addEventListener("contextmenu", (event) => {
    contextMenuTrusted = event.isTrusted;
  });

  let ariaClickTrusted = false;
  ariaDisabledButton.addEventListener("click", (event) => {
    ariaClickTrusted = event.isTrusted;
  });

  await click(disabledButton);
  await rightClick(disabledContextButton);
  await click(ariaDisabledButton);

  expect(disabledEvents).toEqual([
    ["pointerdown", true],
    ["pointerup", true],
  ]);
  expect(contextMenuTrusted).toBe(server.browser !== "firefox");
  expect(ariaClickTrusted).toBe(true);
});

test("uses native hit testing for elements that ignore pointer events", async () => {
  const parent = document.createElement("div");
  const button = document.createElement("button");
  button.style.pointerEvents = "none";
  button.textContent = "Button";
  parent.appendChild(button);
  document.body.appendChild(parent);

  const trustedEvents = new Map<string, boolean>();
  for (const eventType of ["pointerover", "contextmenu"]) {
    parent.addEventListener(eventType, (event) => {
      trustedEvents.set(eventType, event.isTrusted);
    });
  }

  await hover(button);
  await rightClick(button);

  expect(Object.fromEntries(trustedEvents)).toEqual({
    pointerover: true,
    contextmenu: true,
  });
});

test("simulates option clicks that Playwright cannot reproduce", async () => {
  const select = document.createElement("select");
  const apple = document.createElement("option");
  const banana = document.createElement("option");
  apple.textContent = "Apple";
  banana.textContent = "Banana";
  select.append(apple, banana);
  document.body.append(select);

  const trustedEvents: boolean[] = [];
  for (const eventType of ["input", "change"]) {
    select.addEventListener(eventType, (event) => {
      trustedEvents.push(event.isTrusted);
    });
  }

  await click(banana);

  expect(select).toHaveFocus();
  expect(banana.selected).toBe(true);
  expect(trustedEvents).toEqual([false, false]);
});

test("applies a keyboard default after a preceding press was prevented", async () => {
  const input = document.createElement("input");
  input.value = "abc";
  document.body.appendChild(input);
  input.focus();
  input.setSelectionRange(0, 0);

  let preventEnd = true;
  input.addEventListener("keydown", (event) => {
    if (event.key !== "End") return;
    if (!preventEnd) return;
    preventEnd = false;
    event.preventDefault();
  });

  await press.End(input);
  expect(input.selectionStart).toBe(0);
  await press.End(input);
  expect(input.selectionStart).toBe(3);
});
