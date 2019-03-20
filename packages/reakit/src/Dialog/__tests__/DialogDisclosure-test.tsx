import * as React from "react";
import { render } from "react-testing-library";

import { DialogDisclosure } from "../DialogDisclosure";

const props: Parameters<typeof DialogDisclosure>[0] = {
  hiddenId: "dialog",
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
      role="button"
      tabindex="0"
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
      role="button"
      tabindex="0"
    >
      disclosure
    </button>
  </div>
</body>
`);
});
