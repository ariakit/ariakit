import * as React from "react";
import { render } from "react-testing-library";
import { FormRadio } from "../FormRadio";

test("render", () => {
  const { baseElement } = render(
    <FormRadio
      name="a"
      value="b"
      values={{ a: "" }}
      update={jest.fn()}
      blur={jest.fn()}
    />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      name="a"
      role="radio"
      tabindex="0"
      type="radio"
      value="b"
    />
  </div>
</body>
`);
});
