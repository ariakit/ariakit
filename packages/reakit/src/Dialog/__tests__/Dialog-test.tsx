import * as React from "react";
import { render } from "react-testing-library";
import { Dialog } from "../Dialog";

const props: Parameters<typeof Dialog>[0] = {
  unstable_hiddenId: "dialog",
  "aria-label": "dialog"
};

test("render", () => {
  const { baseElement } = render(<Dialog {...props}>dialog</Dialog>);
  expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div />
          <div
            class="__reakit-portal"
          >
            <div
              aria-hidden="true"
              aria-label="dialog"
              aria-modal="true"
              data-dialog="true"
              hidden=""
              id="dialog"
              role="dialog"
              style="z-index: 999;"
              tabindex="-1"
            >
              dialog
            </div>
          </div>
        </body>
    `);
});

test("render visible", () => {
  const { baseElement } = render(
    <Dialog {...props} visible>
      dialog
    </Dialog>
  );
  expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div />
          <div
            aria-hidden="true"
            class="__reakit-focus-trap"
            style="position: fixed;"
            tabindex="0"
          />
          <div
            class="__reakit-portal"
          >
            <div
              aria-hidden="false"
              aria-label="dialog"
              aria-modal="true"
              data-dialog="true"
              id="dialog"
              role="dialog"
              style="z-index: 999;"
              tabindex="-1"
            >
              dialog
            </div>
          </div>
          <div
            aria-hidden="true"
            class="__reakit-focus-trap"
            style="position: fixed;"
            tabindex="0"
          />
        </body>
    `);
});

test("render non-modal", () => {
  const { baseElement } = render(
    <Dialog {...props} unstable_modal={false}>
      test
    </Dialog>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <div
          aria-hidden="true"
          aria-label="dialog"
          aria-modal="false"
          class="__reakit-portal"
          data-dialog="true"
          hidden=""
          id="dialog"
          role="dialog"
          style="z-index: 999;"
          tabindex="-1"
        >
          test
        </div>
      </div>
    </body>
  `);
});
