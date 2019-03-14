import * as React from "react";
import { render } from "react-testing-library";
import { Popover } from "../Popover";

const props = {
  refId: "popover",
  "aria-label": "popover"
};

test("render", () => {
  const { baseElement } = render(<Popover {...props}>popover</Popover>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="__reakit-portal"
  >
    <div
      aria-hidden="true"
      aria-label="popover"
      aria-modal="true"
      hidden=""
      id="popover"
      role="dialog"
      tabindex="-1"
    >
      popover
    </div>
  </div>
</body>
`);
});

test("render visible", () => {
  const { baseElement } = render(
    <Popover {...props} visible>
      popover
    </Popover>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    aria-hidden="true"
    style="position: fixed;"
    tabindex="0"
  />
  <div
    class="__reakit-portal"
  >
    <div
      aria-hidden="false"
      aria-label="popover"
      aria-modal="true"
      id="popover"
      role="dialog"
      tabindex="-1"
    >
      popover
    </div>
  </div>
  <div
    aria-hidden="true"
    style="position: fixed;"
    tabindex="0"
  />
</body>
`);
});

test("render non-modal", () => {
  const { baseElement } = render(
    <Popover {...props} modal={false}>
      test
    </Popover>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="__reakit-portal"
  >
    <div
      aria-hidden="true"
      aria-label="popover"
      aria-modal="false"
      hidden=""
      id="popover"
      role="dialog"
      tabindex="-1"
    >
      test
    </div>
  </div>
</body>
`);
});
