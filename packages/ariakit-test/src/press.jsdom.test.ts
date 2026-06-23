// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest";
import { press } from "./index.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

test("press.Enter activates a default button in jsdom", async () => {
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

  await press.Enter(input);

  expect(onClick).toHaveBeenCalledOnce();
  expect(onSubmit).toHaveBeenCalledOnce();
});

test("press.Enter does not resubmit an image submitter after external validation", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const externalInput = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onInvalid = vi.fn((event: Event) => event.preventDefault());
  form.id = "form";
  submitter.type = "image";
  externalInput.required = true;
  externalInput.setAttribute("form", form.id);
  externalInput.addEventListener("invalid", onInvalid);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form, externalInput);

  await press.Enter(input);

  expect(onInvalid).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
});

test("press.Enter does not resubmit an image submitter after stopped validation", async () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submitter = document.createElement("input");
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onInvalid = vi.fn((event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  });
  input.required = true;
  submitter.type = "image";
  window.addEventListener("invalid", onInvalid, true);
  form.addEventListener("submit", onSubmit);
  form.append(input, submitter);
  document.body.append(form);

  try {
    await press.Enter(input);

    expect(onInvalid).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener("invalid", onInvalid, true);
  }
});
