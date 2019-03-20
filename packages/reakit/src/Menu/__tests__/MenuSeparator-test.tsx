import * as React from "react";
import { render } from "react-testing-library";

import { MenuSeparator } from "../MenuSeparator";

test("render", () => {
  const { baseElement } = render(<MenuSeparator />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <hr
      aria-orientation="horizontal"
      role="separator"
    />
  </div>
</body>
`);
});
