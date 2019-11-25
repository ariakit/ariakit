import * as React from "react";
import { render } from "../react-testing-library";
import { press } from "../press";
import { useAllEvents } from "./useAllEvents";

test("press enter on button", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  press.Enter(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown button",
      "click button",
      "keyup button",
    ]
  `);
});

test("press enter on button preventDefault", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} onKeyDown={event => event.preventDefault()}>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  press.Enter(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown button",
      "keyup button",
    ]
  `);
});

test("press enter on form input", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLFormElement>(null);
    useAllEvents(ref, stack);
    return (
      <form ref={ref}>
        form
        <input type="hidden" />
        <input type="text" aria-label="input" />
      </form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");
  press.Enter(input);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown ",
      "submit form",
      "keyup ",
    ]
  `);
});

test("press enter on input within form with multiple inputs", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLFormElement>(null);
    useAllEvents(ref, stack);
    return (
      <form ref={ref}>
        form
        <input type="text" aria-label="input1" />
        <input type="text" aria-label="input2" />
      </form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const input1 = getByLabelText("input1");
  press.Enter(input1);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown ",
      "keyup ",
    ]
  `);
});

test("press enter on input within form with multiple inputs with submit button", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLFormElement>(null);
    useAllEvents(ref, stack);
    return (
      <form ref={ref}>
        form
        <input type="text" aria-label="input1" />
        <input type="text" aria-label="input2" />
        <button aria-label="button" />
      </form>
    );
  };
  const { getByLabelText } = render(<Test />);
  const input1 = getByLabelText("input1");
  press.Enter(input1);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown ",
      "submit form",
      "keyup ",
    ]
  `);
});

test("press space on button", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  press.Space(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown button",
      "keyup button",
      "click button",
    ]
  `);
});

test("press space on button preventDefault", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} onKeyUp={event => event.preventDefault()}>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  press.Space(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "keydown button",
      "keyup button",
    ]
  `);
});

test("press tab", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref1 = React.useRef<HTMLButtonElement>(null);
    const ref2 = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref1, stack);
    useAllEvents(ref2, stack);
    return (
      <>
        <button ref={ref1}>button1</button>
        <span>span</span>
        <button ref={ref2}>button2</button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button1 = getByText("button1");
  const button2 = getByText("button2");

  expect(button1).not.toHaveFocus();
  press.Tab();
  expect(button1).toHaveFocus();
  press.Tab();
  expect(button2).toHaveFocus();
  press.Tab();
  expect(button1).toHaveFocus();
  press.ShiftTab();
  expect(button2).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focusin button1",
      "focus button1",
      "keydown button1",
      "focusout button1",
      "focusin button2",
      "blur button1",
      "focus button2",
      "keyup button1",
      "keydown button2",
      "focusout button2",
      "focusin button1",
      "blur button2",
      "focus button1",
      "keyup button2",
      "keydown button1",
      "focusout button1",
      "focusin button2",
      "blur button1",
      "focus button2",
      "keyup button1",
    ]
  `);
});

test("press tab preventDefault", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref1 = React.useRef<HTMLButtonElement>(null);
    const ref2 = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref1, stack);
    useAllEvents(ref2, stack);
    return (
      <>
        <button ref={ref1} onKeyDown={event => event.preventDefault()}>
          button1
        </button>
        <button ref={ref2}>button2</button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button1 = getByText("button1");

  expect(button1).not.toHaveFocus();
  press.Tab();
  expect(button1).toHaveFocus();
  press.Tab();
  expect(button1).toHaveFocus();
  press.ShiftTab();
  expect(button1).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focusin button1",
      "focus button1",
      "keydown button1",
      "keyup button1",
      "keydown button1",
      "keyup button1",
    ]
  `);
});
