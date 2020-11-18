import * as React from "react";
import { render, screen, axe } from "reakit-test-utils";
import AlertTest from "..";

test("a11y", async () => {
  const { baseElement } = render(<AlertTest />);
  expect(await axe(baseElement)).toHaveNoViolations();
});

test("markup", () => {
  render(<AlertTest />);
  expect(screen.getByRole("alert")).toMatchInlineSnapshot(`
    <dialog
      open=""
      role="alert"
    >
      Alert
    </dialog>
  `);
});
