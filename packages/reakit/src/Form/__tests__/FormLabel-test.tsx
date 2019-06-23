import * as React from "react";
import { render } from "@testing-library/react";
import { unstable_FormLabel as FormLabel } from "../FormLabel";

test("render", () => {
  const { baseElement } = render(
    <FormLabel baseId="base" name="a" label="b" values={{ a: "" }} />
  );
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <label
          for="base-a"
          id="base-a-label"
        >
          b
        </label>
      </div>
    </body>
  `);
});
