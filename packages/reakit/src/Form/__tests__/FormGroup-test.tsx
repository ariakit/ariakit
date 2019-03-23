import * as React from "react";
import { render } from "react-testing-library";
import { FormGroup } from "../FormGroup";

test("render", () => {
  const { baseElement } = render(
    <FormGroup touched={{ a: true }} errors={{}} name="a" />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <fieldset
      aria-invalid="false"
      role="group"
    />
  </div>
</body>
`);
});
