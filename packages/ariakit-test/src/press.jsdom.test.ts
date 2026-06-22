// @vitest-environment jsdom

import { expect, test, vi } from "vitest";
import { press } from "./index.ts";

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

  try {
    await press.Enter(input);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  } finally {
    form.remove();
  }
});
