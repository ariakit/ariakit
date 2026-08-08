import { afterAll, expect, test } from "vitest";

function getConnectionHook() {
  const nodePrototype = window.Node.prototype;
  const symbol = Object.getOwnPropertySymbols(nodePrototype).find(
    (symbol) => symbol.description === "connectedToNode",
  );
  if (!symbol) return;
  const descriptor = Object.getOwnPropertyDescriptor(nodePrototype, symbol);
  const method = descriptor?.value;
  if (!descriptor) return;
  if (typeof method !== "function") return;
  return { descriptor, method, symbol };
}

const connectionHook = getConnectionHook();
const htmlElementPrototype = window.HTMLElement.prototype;
const formPrototype = window.HTMLFormElement.prototype;
const selectPrototype = window.HTMLSelectElement.prototype;
const originalHTMLElementDescriptor = connectionHook
  ? Object.getOwnPropertyDescriptor(htmlElementPrototype, connectionHook.symbol)
  : undefined;
const originalFormDescriptor = connectionHook
  ? Object.getOwnPropertyDescriptor(formPrototype, connectionHook.symbol)
  : undefined;
const originalSelectDescriptor = connectionHook
  ? Object.getOwnPropertyDescriptor(selectPrototype, connectionHook.symbol)
  : undefined;
let formConnections = 0;
let selectConnections = 0;

if (connectionHook) {
  const { descriptor, method, symbol } = connectionHook;
  Object.defineProperty(htmlElementPrototype, symbol, {
    ...descriptor,
    value: function connectedToNode(this: Node) {
      if (this instanceof window.HTMLFormElement) {
        formConnections++;
      }
      Reflect.apply(method, this, []);
    },
  });
  Object.defineProperty(selectPrototype, symbol, {
    configurable: true,
    get() {
      return function connectedToNode(this: Node) {
        selectConnections++;
        Reflect.apply(method, this, []);
      };
    },
  });

  await import("./shims.ts");
  formConnections = 0;
  selectConnections = 0;
}

const customHTMLElementDescriptor = connectionHook
  ? Object.getOwnPropertyDescriptor(htmlElementPrototype, connectionHook.symbol)
  : undefined;
const customSelectDescriptor = connectionHook
  ? Object.getOwnPropertyDescriptor(selectPrototype, connectionHook.symbol)
  : undefined;

afterAll(() => {
  if (!connectionHook) return;
  const { symbol } = connectionHook;
  if (originalFormDescriptor) {
    Object.defineProperty(formPrototype, symbol, originalFormDescriptor);
  } else {
    Reflect.deleteProperty(formPrototype, symbol);
  }
  if (originalSelectDescriptor) {
    Object.defineProperty(selectPrototype, symbol, originalSelectDescriptor);
  } else {
    Reflect.deleteProperty(selectPrototype, symbol);
  }
  if (originalHTMLElementDescriptor) {
    Object.defineProperty(
      htmlElementPrototype,
      symbol,
      originalHTMLElementDescriptor,
    );
  } else {
    Reflect.deleteProperty(htmlElementPrototype, symbol);
  }
});

const happyDOMTest = connectionHook ? test : test.skip;

happyDOMTest("leaves an inherited connection hook unchanged", () => {
  if (!connectionHook) return;
  const container = document.createElement("div");
  const form = document.createElement("form");
  const input = document.createElement("input");
  form.append(input);

  container.append(form);

  expect(formConnections).toBeGreaterThan(0);
  expect(Object.hasOwn(formPrototype, connectionHook.symbol)).toBe(false);
  expect(
    Object.getOwnPropertyDescriptor(
      htmlElementPrototype,
      connectionHook.symbol,
    ),
  ).toEqual(customHTMLElementDescriptor);
});

happyDOMTest("leaves an accessor connection hook unchanged", () => {
  if (!connectionHook) return;
  const container = document.createElement("div");
  const select = document.createElement("select");
  const option = document.createElement("option");
  select.append(option);

  container.append(select);

  expect(selectConnections).toBeGreaterThan(0);
  expect(
    Object.getOwnPropertyDescriptor(selectPrototype, connectionHook.symbol),
  ).toEqual(customSelectDescriptor);
});
