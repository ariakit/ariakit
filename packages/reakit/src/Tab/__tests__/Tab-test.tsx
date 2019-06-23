import * as React from "react";
import { render } from "@testing-library/react";
import { Tab } from "../Tab";

const props: Parameters<typeof Tab>[0] = {
  unstable_baseId: "base",
  stopId: "tab",
  stops: [],
  currentId: null,
  selectedId: null,
  register: jest.fn(),
  unregister: jest.fn(),
  move: jest.fn(),
  select: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<Tab {...props}>tab</Tab>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="base-tab-panel"
          aria-selected="false"
          id="base-tab"
          role="tab"
          tabindex="-1"
        >
          tab
        </button>
      </div>
    </body>
  `);
});

test("render active", () => {
  const { baseElement } = render(
    <Tab {...props} currentId="tab">
      tab
    </Tab>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="base-tab-panel"
          aria-selected="false"
          id="base-tab"
          role="tab"
          tabindex="0"
        >
          tab
        </button>
      </div>
    </body>
  `);
});

test("render active selected", () => {
  const { baseElement } = render(
    <Tab {...props} currentId="tab" selectedId="tab">
      tab
    </Tab>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="base-tab-panel"
          aria-selected="true"
          id="base-tab"
          role="tab"
          tabindex="0"
        >
          tab
        </button>
      </div>
    </body>
  `);
});
