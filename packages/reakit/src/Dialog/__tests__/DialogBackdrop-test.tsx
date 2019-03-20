import * as React from "react";
import { render } from "react-testing-library";

import { DialogBackdrop } from "../DialogBackdrop";

test("render", () => {
  const { baseElement } = render(<DialogBackdrop />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="__reakit-portal"
  >
    <div
      aria-hidden="true"
      hidden=""
      style="position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px;"
    />
  </div>
</body>
`);
});

test("render visible", () => {
  const { baseElement } = render(<DialogBackdrop visible />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div />
  <div
    class="__reakit-portal"
  >
    <div
      aria-hidden="false"
      style="position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px;"
    />
  </div>
</body>
`);
});
