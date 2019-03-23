import * as React from "react";
import { render } from "react-testing-library";
import { FormRemoveButton } from "../FormRemoveButton";

test("render", () => {
  const { baseElement } = render(
    <FormRemoveButton
      name="a"
      index={1}
      values={{ a: ["a", "b"] }}
      remove={jest.fn()}
    />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      role="button"
      tabindex="0"
      type="button"
    />
  </div>
</body>
`);
});
