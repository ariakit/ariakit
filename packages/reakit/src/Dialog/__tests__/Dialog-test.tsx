import * as React from "react";
import { render } from "react-testing-library";
import { Dialog } from "../Dialog";

const props = {
  refId: "test",
  label: "test"
};

test("render", () => {
  const { baseElement } = render(<Dialog {...props}>test</Dialog>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="portal"
  >
    <div
      aria-hidden="true"
      aria-label="test"
      aria-modal="true"
      hidden=""
      id="test"
      role="dialog"
      tabindex="-1"
    >
      test
    </div>
  </div>
</body>
`);
});

test("render visible", () => {
  const { baseElement } = render(
    <Dialog {...props} visible>
      test
    </Dialog>
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
    class="portal"
  >
    <div
      aria-hidden="false"
      aria-label="test"
      aria-modal="true"
      id="test"
      role="dialog"
      tabindex="-1"
    >
      test
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
    <Dialog {...props} modal={false}>
      test
    </Dialog>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="portal"
  >
    <div
      aria-hidden="true"
      aria-label="test"
      aria-modal="false"
      hidden=""
      id="test"
      role="dialog"
      tabindex="-1"
    >
      test
    </div>
  </div>
</body>
`);
});
