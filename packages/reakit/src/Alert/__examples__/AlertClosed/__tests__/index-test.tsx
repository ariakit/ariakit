import * as React from "react";
import { render, screen, axe } from "reakit-test-utils";
import AlertClosed from "..";

test("a11y", async () => {
  const { baseElement } = render(<AlertClosed />);
  expect(await axe(baseElement)).toHaveNoViolations();
});

test("markup", () => {
  render(<AlertClosed />);
  expect(screen.getByRole("alert")).toMatchInlineSnapshot(`
    <div
      role="button"
      tabindex="0"
    >
      Div
    </div>
  `);
});
