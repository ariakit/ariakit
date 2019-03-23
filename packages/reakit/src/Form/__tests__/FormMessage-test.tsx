import * as React from "react";
import { render } from "react-testing-library";
import { FormMessage } from "../FormMessage";

test("render", () => {
  const { baseElement } = render(
    <FormMessage
      name="a"
      touched={{ a: true }}
      errors={{ a: "b" }}
      messages={{}}
    />
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <div
      role="alert"
    >
      b
    </div>
  </div>
</body>
`);
});
