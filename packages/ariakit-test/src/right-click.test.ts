import { afterEach, expect, test } from "vitest";
import { q, rightClick } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

test("rightClick dispatches a secondary click sequence", async () => {
  document.body.innerHTML = `<button type="button">Open menu</button>`;

  const button = q.button.ensure("Open menu");
  const events: string[] = [];
  const mouseEvents: Array<{
    button: number;
    buttons: number;
    shiftKey: boolean;
    type: string;
  }> = [];

  for (const type of [
    "pointerdown",
    "mousedown",
    "focus",
    "contextmenu",
    "pointerup",
    "mouseup",
    "auxclick",
    "click",
  ]) {
    button.addEventListener(type, (event) => {
      events.push(event.type);
      if (event instanceof MouseEvent) {
        mouseEvents.push({
          button: event.button,
          buttons: event.buttons,
          shiftKey: event.shiftKey,
          type: event.type,
        });
      }
    });
  }

  await rightClick(button, { shiftKey: true });

  expect(events).toEqual([
    "pointerdown",
    "mousedown",
    "focus",
    "contextmenu",
    "pointerup",
    "mouseup",
    "auxclick",
  ]);
  expect(mouseEvents).toEqual([
    { type: "pointerdown", button: 2, buttons: 2, shiftKey: true },
    { type: "mousedown", button: 2, buttons: 2, shiftKey: true },
    { type: "contextmenu", button: 2, buttons: 2, shiftKey: true },
    { type: "pointerup", button: 2, buttons: 0, shiftKey: true },
    { type: "mouseup", button: 2, buttons: 0, shiftKey: true },
    { type: "auxclick", button: 2, buttons: 0, shiftKey: true },
  ]);
});

test("rightClick dispatches contextmenu and auxclick after prevented pointerdown", async () => {
  document.body.innerHTML = `<button type="button">Open menu</button>`;

  const button = q.button.ensure("Open menu");
  const events: string[] = [];

  for (const type of [
    "pointerdown",
    "mousedown",
    "focus",
    "contextmenu",
    "pointerup",
    "mouseup",
    "auxclick",
    "click",
  ]) {
    button.addEventListener(type, (event) => {
      events.push(event.type);
      if (event.type === "pointerdown") {
        event.preventDefault();
      }
    });
  }

  await rightClick(button);

  expect(events).toEqual([
    "pointerdown",
    "contextmenu",
    "pointerup",
    "auxclick",
  ]);
});

test("rightClick retargets pointer events on pointer-events none", async () => {
  document.body.innerHTML = `
    <div data-testid="parent">
      <button style="pointer-events: none" type="button">Open menu</button>
    </div>
  `;

  const parent = document.querySelector("[data-testid='parent']");
  const button = q.button.ensure("Open menu");
  const events: string[] = [];

  parent?.addEventListener("pointerdown", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });
  parent?.addEventListener("mousedown", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });
  parent?.addEventListener("contextmenu", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });
  parent?.addEventListener("pointerup", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });
  parent?.addEventListener("mouseup", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });
  parent?.addEventListener("auxclick", (event) => {
    events.push(`parent ${event.type} ${(event.target as Element).tagName}`);
  });

  await rightClick(button);

  expect(events).toEqual([
    "parent pointerdown DIV",
    "parent mousedown DIV",
    "parent contextmenu DIV",
    "parent pointerup DIV",
    "parent mouseup DIV",
    "parent auxclick DIV",
  ]);
});
