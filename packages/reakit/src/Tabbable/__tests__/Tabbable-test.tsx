import * as React from "react";
import { render, click, focus, press } from "reakit-test-utils";
import { Tabbable, TabbableProps } from "../Tabbable";

test("render", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      data-tabbable="true"
    >
      tabbable
    </button>
  `);
});

test("render disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  data-tabbable="true"
  disabled=""
  style="pointer-events: none;"
>
  tabbable
</button>
`);
});

test("render disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
<button
  aria-disabled="true"
  data-tabbable="true"
>
  tabbable
</button>
`);
});

test("click", () => {
  const fn = jest.fn();
  const { getByText } = render(<Tabbable onClick={fn}>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(fn).toHaveBeenCalledTimes(0);
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("click enabled after disabled", () => {
  const fn = jest.fn();
  const { getByText, rerender } = render(
    <Tabbable onClick={fn} disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  rerender(<Tabbable onClick={fn}>tabbable</Tabbable>);
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).not.toHaveFocus();
});

test("focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("non-native button click", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(fn).toHaveBeenCalledTimes(0);
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native button click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button focus", () => {
  const { getByText } = render(<Tabbable as="div">tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("non-native button focus disabled", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).not.toHaveFocus();
});

test("non-native button focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("non-native button space/enter", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  press.Enter(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
  press.Space(tabbable);
  expect(fn).toHaveBeenCalledTimes(2);
});

test("non-native button space/enter disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" disabled onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  press.Enter(tabbable);
  press.Space(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button space/enter metaKey", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  press.Enter(tabbable, { metaKey: true });
  press.Space(tabbable, { metaKey: true });
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button space/enter disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" disabled focusable onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  press.Enter(tabbable);
  press.Space(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus nested native tabbables", () => {
  const { getByText } = render(
    <Tabbable as="div">
      tabbable<button>button</button>
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  focus(button);
  expect(button).toHaveFocus();
});

test("press enter on Tabbable as another non-native Tabbable", () => {
  const onClick = jest.fn();
  const NonNativeTabbable = React.forwardRef<HTMLDivElement, TabbableProps>(
    (props, ref) => <Tabbable as="div" ref={ref} {...props} />
  );
  const { getByText } = render(
    <Tabbable as={NonNativeTabbable} onClick={onClick}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  press.Enter(tabbable);
  expect(onClick).toHaveBeenCalledTimes(1);
});
