import { afterAll, expect, test } from "vitest";

const nodePrototype = window.Node.prototype;
const connectedToNodeSymbol = Object.getOwnPropertySymbols(nodePrototype).find(
  (symbol) => symbol.description === "connectedToNode",
);
if (!connectedToNodeSymbol) {
  throw new Error("Missing happy-dom connectedToNode symbol");
}
const connectedToNodeDescriptor = Object.getOwnPropertyDescriptor(
  nodePrototype,
  connectedToNodeSymbol,
);
const originalConnectedToNode = connectedToNodeDescriptor?.value;
if (
  !connectedToNodeDescriptor ||
  typeof originalConnectedToNode !== "function"
) {
  throw new Error("Missing happy-dom connectedToNode method");
}

const htmlElementPrototype = window.HTMLElement.prototype;
const originalHTMLElementDescriptor = Object.getOwnPropertyDescriptor(
  htmlElementPrototype,
  connectedToNodeSymbol,
);
const formPrototype = window.HTMLFormElement.prototype;
const originalFormDescriptor = Object.getOwnPropertyDescriptor(
  formPrototype,
  connectedToNodeSymbol,
);
const selectPrototype = window.HTMLSelectElement.prototype;
const originalSelectDescriptor = Object.getOwnPropertyDescriptor(
  selectPrototype,
  connectedToNodeSymbol,
);
let formConnections = 0;
let selectConnections = 0;

Object.defineProperty(htmlElementPrototype, connectedToNodeSymbol, {
  ...connectedToNodeDescriptor,
  value: function connectedToNode(this: Node) {
    if (this instanceof window.HTMLFormElement) {
      formConnections++;
    }
    Reflect.apply(originalConnectedToNode, this, []);
  },
});
Object.defineProperty(selectPrototype, connectedToNodeSymbol, {
  configurable: true,
  get() {
    return function connectedToNode(this: Node) {
      selectConnections++;
      Reflect.apply(originalConnectedToNode, this, []);
    };
  },
});

const customHTMLElementDescriptor = Object.getOwnPropertyDescriptor(
  htmlElementPrototype,
  connectedToNodeSymbol,
);
const customSelectDescriptor = Object.getOwnPropertyDescriptor(
  selectPrototype,
  connectedToNodeSymbol,
);
await import("./shims.ts");
formConnections = 0;
selectConnections = 0;

afterAll(() => {
  if (originalFormDescriptor) {
    Object.defineProperty(
      formPrototype,
      connectedToNodeSymbol,
      originalFormDescriptor,
    );
  } else {
    Reflect.deleteProperty(formPrototype, connectedToNodeSymbol);
  }
  if (originalSelectDescriptor) {
    Object.defineProperty(
      selectPrototype,
      connectedToNodeSymbol,
      originalSelectDescriptor,
    );
  } else {
    Reflect.deleteProperty(selectPrototype, connectedToNodeSymbol);
  }
  if (originalHTMLElementDescriptor) {
    Object.defineProperty(
      htmlElementPrototype,
      connectedToNodeSymbol,
      originalHTMLElementDescriptor,
    );
  } else {
    Reflect.deleteProperty(htmlElementPrototype, connectedToNodeSymbol);
  }
});

test("leaves an inherited connection hook unchanged", () => {
  const container = document.createElement("div");
  const form = document.createElement("form");
  const input = document.createElement("input");
  form.append(input);

  container.append(form);

  expect(formConnections).toBeGreaterThan(0);
  expect(Object.hasOwn(formPrototype, connectedToNodeSymbol)).toBe(false);
  expect(
    Object.getOwnPropertyDescriptor(
      htmlElementPrototype,
      connectedToNodeSymbol,
    ),
  ).toEqual(customHTMLElementDescriptor);
});

test("leaves an accessor connection hook unchanged", () => {
  const container = document.createElement("div");
  const select = document.createElement("select");
  const option = document.createElement("option");
  select.append(option);

  container.append(select);

  expect(selectConnections).toBeGreaterThan(0);
  expect(
    Object.getOwnPropertyDescriptor(selectPrototype, connectedToNodeSymbol),
  ).toEqual(customSelectDescriptor);
});
