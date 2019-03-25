import * as React from "react";
import { render } from "react-testing-library";
import { Tab } from "../Tab";

const props: Parameters<typeof Tab>[0] = {
  unstable_baseId: "base",
  stopId: "tab",
  unstable_stops: [],
  unstable_currentId: null,
  unstable_selectedId: null,
  unstable_pastId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  unstable_move: jest.fn(),
  unstable_select: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn()
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
    <Tab {...props} unstable_currentId="tab">
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
    <Tab {...props} unstable_currentId="tab" unstable_selectedId="tab">
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
