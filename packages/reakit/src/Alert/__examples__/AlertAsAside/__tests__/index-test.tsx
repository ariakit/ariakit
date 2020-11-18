import * as React from "react";
import { render, screen, axe } from "reakit-test-utils";
import AlertAsAside from "..";

test("a11y", async () => {
  const { baseElement } = render(<AlertAsAside />);
  expect(await axe(baseElement)).toHaveNoViolations();
});

test("markup", () => {
  render(<AlertAsAside />);
  expect(screen.getByRole("alert")).toMatchInlineSnapshot(`
    <aside
      open=""
      role="alert"
    >
      Alert
    </aside>
  `);
});
