import * as React from "react";
import { render, fireEvent, click, focus, press } from "reakit-test-utils";
import { getActiveElement } from "reakit-utils/getActiveElement";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeRow as CompositeRow,
  unstable_CompositeItem as CompositeItem
} from "..";

test("first item is active", () => {
  const Test = () => {
    const item = useCompositeState();
    return (
      <>
        <CompositeItem {...item}>item1</CompositeItem>
        <CompositeItem {...item}>item2</CompositeItem>
        <CompositeItem {...item}>item3</CompositeItem>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  expect(item1).toHaveAttribute("tabindex", "0");
});

test("move focus with arrow keys", () => {
  const Test = () => {
    const composite = useCompositeState();
    return (
      <>
        <button>button1</button>
        <CompositeItem {...composite}>item1</CompositeItem>
        <CompositeItem {...composite}>item2</CompositeItem>
        <CompositeItem {...composite}>item3</CompositeItem>
        <button>button2</button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button1 = getByText("button1");
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  const button2 = getByText("button2");
  focus(button1);
  press.Tab();
  expect(item1).toHaveFocus();
  press.ArrowRight();
  expect(item2).toHaveFocus();
  press.Tab();
  expect(button2).toHaveFocus();
  press.ShiftTab();
  expect(item2).toHaveFocus();
  press.ArrowDown();
  expect(item3).toHaveFocus();
  press.ArrowLeft();
  expect(item2).toHaveFocus();
  press.ArrowUp();
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  expect(item1).toHaveFocus();
});

test("move focus with arrow keys when some items are disabled", () => {
  const Test = () => {
    const composite = useCompositeState();
    return (
      <>
        <CompositeItem {...composite}>item1</CompositeItem>
        <CompositeItem {...composite} disabled>
          item2
        </CompositeItem>
        <CompositeItem {...composite} disabled focusable>
          item3
        </CompositeItem>
        <CompositeItem {...composite}>item4</CompositeItem>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item3 = getByText("item3");
  const item4 = getByText("item4");
  focus(item1);
  press.ArrowRight();
  expect(item3).toHaveFocus();
  press.ArrowDown();
  expect(item4).toHaveFocus();
  press.ArrowLeft();
  expect(item3).toHaveFocus();
  press.ArrowUp();
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  expect(item1).toHaveFocus();
});

test("move focus with arrow keys horizontal", () => {
  const Test = () => {
    const composite = useCompositeState({ orientation: "horizontal" });
    return (
      <>
        <CompositeItem {...composite}>item1</CompositeItem>
        <CompositeItem {...composite}>item2</CompositeItem>
        <CompositeItem {...composite}>item3</CompositeItem>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  focus(item1);
  press.ArrowRight();
  expect(item2).toHaveFocus();
  press.ArrowDown();
  expect(item2).toHaveFocus();
  press.ArrowRight();
  expect(item3).toHaveFocus();
  press.ArrowRight();
  expect(item3).toHaveFocus();
  press.ArrowLeft();
  expect(item2).toHaveFocus();
  press.ArrowUp();
  expect(item2).toHaveFocus();
  press.ArrowLeft();
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  expect(item1).toHaveFocus();
});

test("move focus with arrow keys vertical", () => {
  const Test = () => {
    const composite = useCompositeState({ orientation: "vertical" });
    return (
      <>
        <CompositeItem {...composite}>item1</CompositeItem>
        <CompositeItem {...composite}>item2</CompositeItem>
        <CompositeItem {...composite}>item3</CompositeItem>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  focus(item1);
  press.ArrowDown();
  expect(item2).toHaveFocus();
  press.ArrowRight();
  expect(item2).toHaveFocus();
  press.ArrowDown();
  expect(item3).toHaveFocus();
  press.ArrowDown();
  expect(item3).toHaveFocus();
  press.ArrowUp();
  expect(item2).toHaveFocus();
  press.ArrowLeft();
  expect(item2).toHaveFocus();
  press.ArrowUp();
  expect(item1).toHaveFocus();
  press.ArrowUp();
  expect(item1).toHaveFocus();
});

test("keep DOM order", () => {
  const Test = ({ renderItem2 = false }) => {
    const composite = useCompositeState();
    return (
      <>
        <CompositeItem {...composite}>composite1</CompositeItem>
        {renderItem2 && (
          <CompositeItem {...composite}>composite2</CompositeItem>
        )}
        <CompositeItem {...composite}>composite3</CompositeItem>
      </>
    );
  };
  const { getByText, rerender } = render(<Test />);
  const composite1 = getByText("composite1");
  const composite3 = getByText("composite3");
  focus(composite1);
  expect(composite1).toHaveFocus();

  press.ArrowRight();
  expect(composite3).toHaveFocus();

  rerender(<Test renderItem2 />);
  expect(composite3).toHaveFocus();

  const composite2 = getByText("composite2");

  press.ArrowLeft();
  expect(composite2).toHaveFocus();
});

test("move focus with arrow keys aria-activedescendant", () => {
  const Test = () => {
    const composite = useCompositeState({
      unstable_focusStrategy: "aria-activedescendant"
    });
    return (
      <>
        <button>button1</button>
        <Composite {...composite} role="toolbar" aria-label="composite">
          <CompositeItem {...composite}>item1</CompositeItem>
          <CompositeItem {...composite}>item2</CompositeItem>
          <CompositeItem {...composite}>item3</CompositeItem>
        </Composite>
        <button>button2</button>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const composite = getByLabelText("composite");
  const button1 = getByText("button1");
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  const button2 = getByText("button2");
  focus(button1);
  press.Tab();
  expect(composite).toHaveFocus();
  press.ArrowRight();
  expect(item1).toHaveFocus();
  press.ArrowRight();
  expect(item2).toHaveFocus();
  press.Tab();
  expect(button2).toHaveFocus();
  press.ShiftTab();
  expect(item2).toHaveFocus();
  press.ArrowDown();
  expect(item3).toHaveFocus();
  press.ArrowLeft();
  expect(item2).toHaveFocus();
  press.ArrowUp();
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  expect(item1).toHaveFocus();
});
