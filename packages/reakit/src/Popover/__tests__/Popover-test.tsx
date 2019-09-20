import * as React from "react";
import { render } from "@testing-library/react";
import { Popover } from "../Popover";

const props: Parameters<typeof Popover>[0] = {
  unstable_hiddenId: "popover",
  "aria-label": "popover"
};

test("render", () => {
  const { baseElement } = render(<Popover {...props}>popover</Popover>);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-label="popover"
          aria-modal="false"
          class="hidden"
          data-dialog="true"
          hidden=""
          id="popover"
          role="dialog"
          style="display: none;"
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
      <div>
        <div
          aria-label="popover"
          aria-modal="false"
          data-dialog="true"
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

test("render modal", () => {
  const { baseElement } = render(
    <Popover {...props} modal>
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
          aria-label="popover"
          aria-modal="true"
          class="hidden"
          data-dialog="true"
          hidden=""
          id="popover"
          role="dialog"
          style="display: none;"
          tabindex="-1"
        >
          test
        </div>
      </div>
    </body>
  `);
});
