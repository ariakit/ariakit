import * as React from "react";
import { render } from "react-testing-library";
import { FormCheckbox } from "../FormCheckbox";

test("render", () => {
  const { baseElement } = render(
    <FormCheckbox
      name="a"
      values={{ a: false }}
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
      aria-checked="false"
      aria-invalid="false"
      name="a"
      role="checkbox"
      tabindex="0"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});

test("render value", () => {
  const { baseElement } = render(
    <FormCheckbox
      name="a"
      value="b"
      values={{ a: ["b"] as Array<"a" | "b" | "c"> }}
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
      aria-checked="true"
      aria-invalid="false"
      checked=""
      name="a"
      role="checkbox"
      tabindex="0"
      type="checkbox"
      value="b"
    />
  </div>
</body>
`);
});
