import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { Radio } from "../Radio";

test("render", () => {
  const { baseElement } = render(<Radio />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      role="checkbox"
      tabindex="0"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});
