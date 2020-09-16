import * as React from "react";
import { render, press, screen, axe } from "reakit-test-utils";
import CompositeVirtualAsProp from "..";

test("navigate through composite items", () => {
  jest.spyOn(window, "alert").mockImplementation();
  render(<CompositeVirtualAsProp />);
  press.Tab();
  press.ArrowDown();
  expect(screen.getByLabelText("events")).toMatchInlineSnapshot(`
    <div
      aria-label="events"
    >
      focus Item 1
      keyup Item 1
      keydown Item 1
      blur Item 1
      blur Item 1
      focus Item 2
      keyup Item 2
    </div>
  `);
});

test("a11y", async () => {
  const { baseElement } = render(<CompositeVirtualAsProp />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
