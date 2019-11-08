import * as React from "react";
import { render } from "@testing-library/react";
import { PopoverDisclosure } from "../PopoverDisclosure";

const props: Parameters<typeof PopoverDisclosure>[0] = {
  unstable_hiddenId: "popover",
  toggle: jest.fn
};

test("render", () => {
  const { baseElement } = render(
    <PopoverDisclosure {...props}>disclosure</PopoverDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="popover"
          aria-expanded="false"
          aria-haspopup="dialog"
          type="button"
        >
          disclosure
        </button>
      </div>
    </body>
  `);
});

test("render visible", () => {
  const { baseElement } = render(
    <PopoverDisclosure {...props} visible>
      disclosure
    </PopoverDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="popover"
          aria-expanded="true"
          aria-haspopup="dialog"
          type="button"
        >
          disclosure
        </button>
      </div>
    </body>
  `);
});
