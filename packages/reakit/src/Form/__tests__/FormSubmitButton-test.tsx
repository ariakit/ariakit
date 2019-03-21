import * as React from "react";
import { render } from "react-testing-library";
import { FormSubmitButton } from "../FormSubmitButton";

test("render", () => {
  const { baseElement } = render(<FormSubmitButton submit={jest.fn()} />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      role="button"
      tabindex="0"
      type="submit"
    />
  </div>
</body>
`);
});
