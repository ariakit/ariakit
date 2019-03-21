import * as React from "react";
import { render } from "react-testing-library";
import { FormInput } from "../FormInput";

test("render", () => {
  const { baseElement } = render(
    <FormInput
      name="a"
      value="b"
      values={{ a: "" }}
      touched={{}}
      errors={{}}
      update={jest.fn()}
      blur={jest.fn()}
    />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-invalid="false"
      name="a"
      value="b"
    />
  </div>
</body>
`);
});
