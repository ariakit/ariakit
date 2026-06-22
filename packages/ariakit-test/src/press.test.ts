import { expect, test, vi } from "vitest";
import { press } from "./index.ts";

function getTextInput() {
  const input = document.createElement("input");
  input.value = "hello world";
  document.body.append(input);
  input.focus();
  return input;
}

// A scripted click dispatched on a disabled control fires its listeners in jsdom
// and real browsers; happy-dom drops it, but `dispatch` normalizes that (see
// dispatch.ts), so these run in the default happy-dom. They guard the disabled
// gate on the synthetic Space/Enter activation: without the gate, the activation
// dispatches a click that — once normalized — would reach the listener here.
test("press.up does not activate a disabled control on Space release", async () => {
  const button = document.createElement("button");
  button.disabled = true;
  const onClick = vi.fn();
  button.addEventListener("click", onClick);
  document.body.append(button);

  await press.up.Space(button);

  expect(onClick).not.toHaveBeenCalled();
});

test("press.down does not activate a control that disables itself on Enter", async () => {
  const button = document.createElement("button");
  const onClick = vi.fn();
  button.addEventListener("click", onClick);
  button.addEventListener("keydown", () => {
    button.disabled = true;
  });
  document.body.append(button);
  button.focus();

  // The Enter keydown disables the button before the synthetic activation runs;
  // a browser wouldn't click the now-disabled control, so neither should this.
  await press.down.Enter();

  expect(onClick).not.toHaveBeenCalled();
});

test("press.Enter does not submit a form with a disabled default button", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn();
  button.type = "submit";
  button.disabled = true;
  button.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, button);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter does not submit a form with a fieldset-disabled default button", async () => {
  const form = document.createElement("form");
  const fieldset = document.createElement("fieldset");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn();
  button.type = "submit";
  fieldset.disabled = true;
  button.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  fieldset.append(button);
  form.append(input, fieldset);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter does not submit a form with a disabled image submitter", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn();
  submitter.type = "image";
  submitter.disabled = true;
  submitter.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter activates the default button for implicit submission", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn();
  button.type = "submit";
  button.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, button);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  } finally {
    form.remove();
  }
});

test("press.Enter activates a default button with pointer-events none", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn();
  button.type = "submit";
  button.style.pointerEvents = "none";
  button.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, button);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  } finally {
    form.remove();
  }
});

test("press.Enter respects default button click preventDefault", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
  button.type = "submit";
  button.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, button);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter dispatches a composed default button click", async () => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const form = document.createElement("form");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onHostClick = vi.fn((event: MouseEvent) => event.preventDefault());
  button.type = "submit";
  host.addEventListener("click", onHostClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, button);
  shadowRoot.append(form);
  document.body.append(host);

  try {
    await press.Enter(input);

    expect(onHostClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    host.remove();
  }
});

test("press.Enter respects image submitter click preventDefault", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
  submitter.type = "image";
  submitter.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  Object.defineProperty(form, "elements", {
    configurable: true,
    value: [input],
  });
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter activates an image submitter for implicit submission", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onClick = vi.fn();
  let submittedBy: HTMLElement | null = null;
  const onSubmit = vi.fn((event: SubmitEvent) => {
    submittedBy = event.submitter;
    event.preventDefault();
  });
  submitter.type = "image";
  submitter.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(submittedBy).toBe(submitter);
  } finally {
    form.remove();
  }
});

test("press.Enter does not resubmit an image submitter after validation", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  let invalidEvents = 0;
  input.required = true;
  submitter.type = "image";
  submitter.addEventListener("click", () => {
    input.dispatchEvent(new Event("invalid", { cancelable: true }));
  });
  form.addEventListener("invalid", () => invalidEvents++, true);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(invalidEvents).toBe(1);
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    form.remove();
  }
});

test("press.Enter submits an image submitter before queued click microtasks", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  submitter.type = "image";
  submitter.addEventListener("click", () => {
    queueMicrotask(() => {
      submitter.disabled = true;
    });
  });
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(submitter.disabled).toBe(true);
  } finally {
    form.remove();
  }
});

test("press.Enter submits a single-input form without a submit button", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  form.addEventListener("submit", onSubmit);
  form.append(input);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onSubmit).toHaveBeenCalledOnce();
  } finally {
    form.remove();
  }
});

test("press.Home with shiftKey keeps the anchor of a forward selection", async () => {
  const input = getTextInput();
  input.setSelectionRange(6, 8, "forward");

  await press.Home(input, { shiftKey: true });

  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe(6);
  expect(input.selectionDirection).toBe("backward");
});

test("press.End with shiftKey keeps the anchor of a backward selection", async () => {
  const input = getTextInput();
  input.setSelectionRange(4, 6, "backward");

  await press.End(input, { shiftKey: true });

  expect(input.selectionStart).toBe(6);
  expect(input.selectionEnd).toBe(11);
  expect(input.selectionDirection).toBe("forward");
});

test("press.Enter on a textarea emits an Enter keypress charCode", async () => {
  const textarea = document.createElement("textarea");
  const onKeyPress = vi.fn();
  textarea.addEventListener("keypress", onKeyPress);
  document.body.append(textarea);

  await press.Enter(textarea);

  expect(onKeyPress).toHaveBeenCalledOnce();
  expect(onKeyPress).toHaveBeenLastCalledWith(
    expect.objectContaining({ charCode: 13 }),
  );
});
