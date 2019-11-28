import * as React from "react";
import { render } from "../render";
import { click } from "../click";
import { useAllEvents } from "./useAllEvents";

test("click", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  click(button);
  expect(button).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover button",
      "pointerenter button",
      "mouseover button",
      "mouseenter button",
      "pointermove button",
      "mousemove button",
      "pointerdown button",
      "mousedown button",
      "focus button",
      "focusin button",
      "pointerup button",
      "mouseup button",
      "click button",
    ]
  `);
});

test("click disabled", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} disabled>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  click(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover button",
      "pointerenter button",
      "pointermove button",
      "pointerdown button",
      "pointerup button",
    ]
  `);
});

test("click disabled after clicking non-disabled", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref1 = React.useRef<HTMLButtonElement>(null);
    const ref2 = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref1, stack);
    useAllEvents(ref2, stack);
    return (
      <>
        <button ref={ref1}>button1</button>
        <button ref={ref2} disabled>
          button2
        </button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button1 = getByText("button1");
  const button2 = getByText("button2");

  click(button1);
  expect(button1).toHaveFocus();
  click(button2);
  expect(button1).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover button1",
      "pointerenter button1",
      "mouseover button1",
      "mouseenter button1",
      "pointermove button1",
      "mousemove button1",
      "pointerdown button1",
      "mousedown button1",
      "focus button1",
      "focusin button1",
      "pointerup button1",
      "mouseup button1",
      "click button1",
      "pointermove button1",
      "mousemove button1",
      "pointerout button1",
      "pointerleave button1",
      "mouseout button1",
      "mouseleave button1",
      "pointerover button2",
      "pointerenter button2",
      "pointermove button2",
      "pointerdown button2",
      "pointerup button2",
    ]
  `);
});

test("click within focusable container", () => {
  const Test = () => {
    return (
      <div tabIndex={-1}>
        parent
        <div>child</div>
      </div>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const parent = getByText("parent");
  const child = getByText("child");

  expect(baseElement).toHaveFocus();
  click(child);
  expect(parent).toHaveFocus();
});

test("click disabled within focusable container", () => {
  const Test = () => {
    return (
      <div tabIndex={-1}>
        <button disabled>button</button>
      </div>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const button = getByText("button");

  expect(baseElement).toHaveFocus();
  click(button);
  expect(baseElement).toHaveFocus();
});

test("click label htmlFor", () => {
  const stack = [] as string[];
  const Test = () => {
    const label = React.useRef<HTMLLabelElement>(null);
    const input = React.useRef<HTMLInputElement>(null);
    useAllEvents(label, stack);
    useAllEvents(input, stack);
    return (
      <>
        <label ref={label} htmlFor="input">
          label
        </label>
        <input ref={input} id="input" />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const label = getByText("label");
  const input = getByLabelText("label");

  click(label);
  expect(input).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover label",
      "pointerenter label",
      "mouseover label",
      "mouseenter label",
      "pointermove label",
      "mousemove label",
      "pointerdown label",
      "mousedown label",
      "pointerup label",
      "mouseup label",
      "click label",
      "focus input",
      "focusin input",
      "click input",
    ]
  `);
});

test("click label wrapping input", () => {
  const stack = [] as string[];
  const Test = () => {
    const label = React.useRef<HTMLLabelElement>(null);
    const input = React.useRef<HTMLInputElement>(null);
    useAllEvents(label, stack);
    useAllEvents(input, stack);
    return (
      <label ref={label}>
        label
        <input ref={input} id="input" />
      </label>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const label = getByText("label");
  const input = getByLabelText("label");

  click(label);
  expect(input).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover label",
      "pointerenter label",
      "mouseover label",
      "mouseenter label",
      "pointermove label",
      "mousemove label",
      "pointerdown label",
      "mousedown label",
      "pointerup label",
      "mouseup label",
      "click label",
      "focus input",
      "focusin input",
      "focusin input",
      "click input",
      "click input",
    ]
  `);
});

test("click label htmlFor disabled input", () => {
  const stack = [] as string[];
  const Test = () => {
    const label = React.useRef<HTMLLabelElement>(null);
    const input = React.useRef<HTMLInputElement>(null);
    useAllEvents(label, stack);
    useAllEvents(input, stack);
    return (
      <>
        <label ref={label} htmlFor="input">
          label
        </label>
        <input ref={input} id="input" disabled />
      </>
    );
  };
  const { getByText, baseElement } = render(<Test />);
  const label = getByText("label");

  click(label);
  expect(baseElement).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover label",
      "pointerenter label",
      "mouseover label",
      "mouseenter label",
      "pointermove label",
      "mousemove label",
      "pointerdown label",
      "mousedown label",
      "pointerup label",
      "mouseup label",
      "click label",
    ]
  `);
});

test("click checkbox", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return <input type="checkbox" ref={ref} aria-label="checkbox" />;
  };
  const { getByLabelText } = render(<Test />);
  const checkbox = getByLabelText("checkbox");

  expect(checkbox).not.toBeChecked();
  click(checkbox);
  expect(checkbox).toBeChecked();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover checkbox",
      "pointerenter checkbox",
      "mouseover checkbox",
      "mouseenter checkbox",
      "pointermove checkbox",
      "mousemove checkbox",
      "pointerdown checkbox",
      "mousedown checkbox",
      "focus checkbox",
      "focusin checkbox",
      "pointerup checkbox",
      "mouseup checkbox",
      "click checkbox",
      "input checkbox",
      "change checkbox",
    ]
  `);
});

test("click checkbox label htmlFor", () => {
  const stack = [] as string[];
  const Test = () => {
    const label = React.useRef<HTMLLabelElement>(null);
    const checkbox = React.useRef<HTMLInputElement>(null);
    useAllEvents(label, stack);
    useAllEvents(checkbox, stack);
    return (
      <>
        <label htmlFor="checkbox" ref={label}>
          label
        </label>
        <input type="checkbox" ref={checkbox} id="checkbox" />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const label = getByText("label");
  const checkbox = getByLabelText("label");

  expect(checkbox).not.toBeChecked();
  click(label);
  expect(checkbox).toBeChecked();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover label",
      "pointerenter label",
      "mouseover label",
      "mouseenter label",
      "pointermove label",
      "mousemove label",
      "pointerdown label",
      "mousedown label",
      "pointerup label",
      "mouseup label",
      "click label",
      "focus checkbox",
      "focusin checkbox",
      "click checkbox",
      "input checkbox",
      "change checkbox",
    ]
  `);
});

test("click label preventDefault onClick", () => {
  const stack = [] as string[];
  const Test = () => {
    const label = React.useRef<HTMLLabelElement>(null);
    const input = React.useRef<HTMLInputElement>(null);
    useAllEvents(label, stack);
    useAllEvents(input, stack);
    return (
      <>
        <label
          ref={label}
          onClick={event => event.preventDefault()}
          htmlFor="input"
        >
          label
        </label>
        <input ref={input} id="input" />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const label = getByText("label");
  const input = getByLabelText("label");

  click(label);
  expect(input).not.toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover label",
      "pointerenter label",
      "mouseover label",
      "mouseenter label",
      "pointermove label",
      "mousemove label",
      "pointerdown label",
      "mousedown label",
      "pointerup label",
      "mouseup label",
      "click label",
    ]
  `);
});

test("click on safari", () => {
  const previousUserAgent = window.navigator.userAgent;
  Object.defineProperty(window.navigator, "userAgent", {
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
    writable: true
  });

  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  click(button);
  expect(button).not.toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover button",
      "pointerenter button",
      "mouseover button",
      "mouseenter button",
      "pointermove button",
      "mousemove button",
      "pointerdown button",
      "mousedown button",
      "focus button",
      "focusin button",
      "blur button",
      "focusout button",
      "pointerup button",
      "mouseup button",
      "click button",
    ]
  `);

  Object.defineProperty(window.navigator, "userAgent", {
    value: previousUserAgent
  });
});
