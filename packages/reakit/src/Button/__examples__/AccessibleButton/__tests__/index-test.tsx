import * as React from "react";
import { render, axe } from "reakit-test-utils";
import AccessibleButton from "..";

test("a11y", async () => {
  const { baseElement } = render(<AccessibleButton />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
