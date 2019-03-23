import * as React from "react";
import { render } from "react-testing-library";
import { FormPushButton } from "../FormPushButton";

test("render", () => {
  const { baseElement } = render(
    <FormPushButton name="a" value="c" values={{ a: ["b"] }} push={jest.fn()} />
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
