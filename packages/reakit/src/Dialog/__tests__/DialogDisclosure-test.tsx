import * as React from "react";
import { render } from "@testing-library/react";
import { DialogDisclosure } from "../DialogDisclosure";

const props: Parameters<typeof DialogDisclosure>[0] = {
  unstable_hiddenId: "dialog",
  toggle: jest.fn
};

test("render", () => {
  const { baseElement } = render(
    <DialogDisclosure {...props}>disclosure</DialogDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="dialog"
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
    <DialogDisclosure {...props} visible>
      disclosure
    </DialogDisclosure>
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="dialog"
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
