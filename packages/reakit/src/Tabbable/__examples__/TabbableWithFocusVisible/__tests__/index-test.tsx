import * as React from "react";
import { render, press, click, type, axe, screen } from "reakit-test-utils";
import TabbableWithFocusVisible from "..";

test("focus visible", () => {
  render(<TabbableWithFocusVisible />);

  click(screen.getByText("Button with focus visible handler"));
  expect(screen.queryByText("I am focused")).toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).not.toBeInTheDocument();
  press.ShiftTab();
  press.Tab();
  expect(screen.queryByText("I am focused")).toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).toBeInTheDocument();

  const input = screen.getByLabelText("Input with focus visible handler:");
  click(input);
  expect(screen.queryByText("I am focused")).toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).not.toBeInTheDocument();
  type("abc", input);
  expect(screen.queryByText("I am focused")).toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).not.toBeInTheDocument();
  press.ShiftTab();
  press.Tab();
  expect(input).toHaveValue("abc");
  expect(screen.queryByText("I am focus visible")).toBeInTheDocument();

  click(
    screen.getByText("Disabled focusable button with focus visible handler")
  );
  expect(screen.queryByText("I am focused")).not.toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).not.toBeInTheDocument();
  click(input);
  press.Tab();
  expect(screen.queryByText("I am focused")).toBeInTheDocument();
  expect(screen.queryByText("I am focus visible")).toBeInTheDocument();
});

test("markup", () => {
  const { container } = render(<TabbableWithFocusVisible />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        style="display: inline-flex; flex-direction: column;"
      >
        <button>
          Button with focus visible handler
        </button>
        <label>
          Input with focus visible handler:
          <br />
          <input />
        </label>
        <button
          aria-disabled="true"
          style="pointer-events: none;"
        >
          Disabled focusable button with focus visible handler
        </button>
      </div>
    </div>
  `);
});

test("a11y", async () => {
  const { baseElement } = render(<TabbableWithFocusVisible />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
