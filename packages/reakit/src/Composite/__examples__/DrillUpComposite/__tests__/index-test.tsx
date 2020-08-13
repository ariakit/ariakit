import * as React from "react";
import { render, click, axe } from "reakit-test-utils";
import DillUpComposite from "..";

test("mount and unmount", () => {
  const { getByText: text, queryByLabelText: label } = render(
    <DillUpComposite />
  );
  expect(label("composite")).toBeInTheDocument();
  click(text("Toggle Toolbar"));
  expect(label("composite")).not.toBeInTheDocument();
  click(text("Toggle Toolbar"));
  expect(label("composite")).toBeInTheDocument();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<DillUpComposite />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
