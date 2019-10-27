import * as React from "react";
import { render } from "@testing-library/react";
import { unstable_FormRemoveButton as FormRemoveButton } from "../FormRemoveButton";

test("render", () => {
  const { baseElement } = render(
    <FormRemoveButton
      baseId="base"
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
          type="button"
        />
      </div>
    </body>
  `);
});
