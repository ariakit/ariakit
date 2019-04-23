import * as React from "react";
import { render } from "react-testing-library";
import { VisuallyHidden } from "../VisuallyHidden";

test("render", () => {
  const { baseElement } = render(<VisuallyHidden />);
  expect(baseElement).toMatchInlineSnapshot();
});
