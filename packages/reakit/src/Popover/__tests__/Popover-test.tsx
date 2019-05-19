import * as React from "react";
import { render } from "react-testing-library";
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
          style="display: none; z-index: 999;"
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
          style="z-index: 999;"
          tabindex="-1"
        >
          popover
        </div>
      </div>
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
      <div>
        <div
          aria-label="popover"
          aria-modal="false"
          class="hidden"
          data-dialog="true"
          hidden=""
          id="popover"
          role="dialog"
          style="display: none; z-index: 999;"
          tabindex="-1"
        >
          test
        </div>
      </div>
    </body>
  `);
});
