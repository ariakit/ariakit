import * as React from "react";
import { render, click, press } from "reakit-test-utils";
import { Checkbox, CheckboxOptions, CheckboxHTMLProps } from "../Checkbox";

test("render", () => {
  const { baseElement } = render(<Checkbox />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <input
          aria-checked="false"
          role="checkbox"
          type="checkbox"
          value=""
        />
      </div>
    </body>
  `);
});

test("render disabled", () => {
  const { baseElement } = render(<Checkbox disabled />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      aria-disabled="true"
      disabled=""
      role="checkbox"
      style="pointer-events: none;"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});

test("render disabled focusable", () => {
  const { baseElement } = render(<Checkbox disabled focusable />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      aria-disabled="true"
      role="checkbox"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});

test("render checked", () => {
  const { baseElement } = render(<Checkbox checked />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="true"
      checked=""
      role="checkbox"
      type="checkbox"
      value=""
    />
  </div>
</body>
`);
});

test("click", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox onClick={fn} /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(fn).toHaveBeenCalledTimes(0);
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox onClick={fn} disabled /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("click disabled focusable", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox onClick={fn} disabled focusable /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).toHaveFocus();
});

test("focus disabled", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox disabled /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).not.toHaveFocus();
});

test("focus disabled focusable", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox disabled focusable /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).toHaveFocus();
});

test("non-native checkbox click", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(fn).toHaveBeenCalledTimes(0);
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native checkbox click disabled", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} disabled /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native checkbox click disabled focusable", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} disabled focusable /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  click(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native checkbox focus", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).toHaveFocus();
});

test("non-native checkbox focus disabled", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" disabled /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).not.toHaveFocus();
});

test("non-native checkbox focus disabled focusable", () => {
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" disabled focusable /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).not.toHaveFocus();
  checkbox.focus();
  expect(checkbox).toHaveFocus();
});

test("non-native checkbox space", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  press.Space(checkbox);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native checkbox space disabled", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} disabled /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  press.Space(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native checkbox space disabled focusable", () => {
  const fn = jest.fn();
  const { getByLabelText } = render(
    <label>
      <Checkbox as="div" onClick={fn} disabled focusable /> checkbox
    </label>
  );
  const checkbox = getByLabelText("checkbox");
  press.Space(checkbox);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("indeterminate", () => {
  const Comp = (props: CheckboxOptions & CheckboxHTMLProps) => (
    <label>
      <Checkbox {...props} /> checkbox
    </label>
  );
  const { getByLabelText, rerender } = render(<Comp />);
  const checkbox = getByLabelText("checkbox");
  expect(checkbox).toHaveAttribute("aria-checked", "false");
  rerender(<Comp state="indeterminate" />);
  expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  rerender(<Comp state />);
  expect(checkbox).toHaveAttribute("aria-checked", "true");
});
