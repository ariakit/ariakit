import * as React from "react";
import { render } from "react-testing-library";
import { Group } from "../Group";

test("render", () => {
  const { baseElement } = render(<Group />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <div
      role="group"
    />
  </div>
</body>
`);
});
