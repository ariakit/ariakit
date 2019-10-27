import * as React from "react";
import { render } from "@testing-library/react";
import { unstable_FormPushButton as FormPushButton } from "../FormPushButton";

test("render", () => {
  const { baseElement } = render(
    <FormPushButton
      baseId="base"
      name="a"
      value="c"
      values={{ a: ["b"] }}
      push={jest.fn()}
    />
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          id="base-a-push"
          type="button"
        />
      </div>
    </body>
  `);
});
