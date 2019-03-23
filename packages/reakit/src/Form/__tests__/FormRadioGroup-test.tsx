import * as React from "react";
import { render } from "react-testing-library";
import { FormRadioGroup } from "../FormRadioGroup";

test("render", () => {
  const { baseElement } = render(
    <FormRadioGroup touched={{ a: true }} errors={{}} name="a" />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <fieldset
      aria-invalid="false"
      role="radiogroup"
    />
  </div>
</body>
`);
});
