import * as React from "react";
import { render, click } from "reakit-test-utils";
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
