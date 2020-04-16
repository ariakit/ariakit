import * as React from "react";
import { render, hover, wait, focus } from "reakit-test-utils";
import { Tooltip, TooltipReference, useTooltipState } from "..";

afterEach(() => {
  hover(document.body);
});

test("show tooltip on hover", async () => {
  const Test = () => {
    const tooltip = useTooltipState();
    return (
      <>
        <TooltipReference {...tooltip}>reference</TooltipReference>
        <Tooltip {...tooltip}>tooltip</Tooltip>
      </>
    );
  };
  const { baseElement, getByText: text } = render(<Test />);
  expect(text("tooltip")).not.toBeVisible();
  hover(text("reference"));
  await wait(expect(text("tooltip")).toBeVisible);
  hover(baseElement);
  expect(text("tooltip")).not.toBeVisible();
});

test("show only one tooltip", async () => {
  const Test = () => {
    const tooltip1 = useTooltipState();
    const tooltip2 = useTooltipState();
    return (
      <>
        <TooltipReference {...tooltip1}>reference1</TooltipReference>
        <Tooltip {...tooltip1}>tooltip1</Tooltip>
        <TooltipReference {...tooltip2}>reference2</TooltipReference>
        <Tooltip {...tooltip2}>tooltip2</Tooltip>
      </>
    );
  };
  const { getByText: text } = render(<Test />);
  expect(text("tooltip1")).not.toBeVisible();
  expect(text("tooltip2")).not.toBeVisible();
  focus(text("reference1"));
  await wait(expect(text("tooltip1")).toBeVisible);
  expect(text("tooltip2")).not.toBeVisible();
  hover(text("reference2"));
  expect(text("tooltip1")).not.toBeVisible();
  await wait(expect(text("tooltip2")).toBeVisible);
});

test("show tooltip with a timeout", async () => {
  const Test = () => {
    const tooltip = useTooltipState({ unstable_timeout: 250 });
    return (
      <>
        <TooltipReference {...tooltip}>reference</TooltipReference>
        <Tooltip {...tooltip}>tooltip</Tooltip>
      </>
    );
  };
  const { baseElement, getByText: text } = render(<Test />);
  expect(text("tooltip")).not.toBeVisible();
  hover(text("reference"));
  expect(text("tooltip")).not.toBeVisible();
  await wait(expect(text("tooltip")).toBeVisible);
  hover(baseElement);
  expect(text("tooltip")).not.toBeVisible();
});
