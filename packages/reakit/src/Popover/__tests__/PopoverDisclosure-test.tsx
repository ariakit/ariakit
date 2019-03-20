import * as React from "react";
import { render } from "react-testing-library";

import { PopoverDisclosure } from "../PopoverDisclosure";

const props: Parameters<typeof PopoverDisclosure>[0] = {
  hiddenId: "popover",
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
      role="button"
      tabindex="0"
    >
      disclosure
    </button>
  </div>
</body>
`);
});
