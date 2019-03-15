import * as React from "react";
import { render } from "react-testing-library";
import { Tab } from "../Tab";

const props = {
  baseId: "base",
  refId: "tab",
  refs: [],
  activeRef: null,
  selectedRef: null,
  lastActiveRef: null,
  getFirst: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  moveTo: jest.fn(),
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
    <Tab {...props} activeRef="tab">
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
    <Tab {...props} activeRef="tab" selectedRef="tab">
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
