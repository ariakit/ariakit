import { click, press, q, type } from "@ariakit/test";
import { expect, test, vi } from "vitest";

function nextTask() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve);
  });
}

// https://github.com/ariakit/ariakit/issues/5058
test("mirrors every selected value in the form control", async () => {
  await click(q.combobox("Favorite fruits"));
  await click(q.option("Apple"));
  await click(q.option("Orange"));

  expect(q.combobox("Favorite fruits")).not.toHaveAttribute("name");

  const input = q.combobox("Favorite fruits") as HTMLInputElement;
  const form = input.form!;
  expect(new FormData(form).getAll("fruits")).toEqual(["apple", "orange"]);
});

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3623740406
test("mirrors selected values when composite is false", () => {
  const form = q.form("Non-composite fruits") as HTMLFormElement;
  const formData = new FormData(form);
  const input = q.combobox("Non-composite fruits") as HTMLInputElement;

  expect(formData.getAll("non-composite-fruits")).toEqual(["apple"]);
  expect(input.form).toBe(form);
});

// https://github.com/ariakit/ariakit/pull/6795#discussion_r3625787623
test("omits aria-disabled selected values", () => {
  const form = q.form.ensure("Disabled fruits") as HTMLFormElement;

  expect(q.combobox("Disabled fruits")).toBeDisabled();
  expect(new FormData(form).getAll("disabled-fruits")).toEqual([]);
});

test("preserves the name for a single selected value", () => {
  expect(q.combobox("Single fruit")).toHaveAttribute("name", "single-fruit");
});

// https://github.com/ariakit/ariakit/issues/1861
test("resets an uncontrolled combobox with its form", async () => {
  const name = q.textbox.ensure("Name");
  const homeTown = q.combobox.ensure("Home town");

  await type("Chance", name);
  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset address"));

  expect(name).toHaveValue("");
  expect(homeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("resets the form value before reset returns", async () => {
  const form = q.form.ensure("Address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Home town");

  await type("Boston", homeTown);
  form.reset();

  expect(new FormData(form).get("homeTown")).toBe("");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("submits the reset value in the same task", async () => {
  const form = q.form.ensure("Address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Home town");
  let value: FormDataEntryValue | null = null;
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      value = new FormData(form).get("homeTown");
    },
    { once: true },
  );

  await type("Boston", homeTown);
  form.reset();
  form.requestSubmit();

  expect(value).toBe("");
});

// https://github.com/ariakit/ariakit/issues/1861
test("resets when reset event propagation is stopped", async () => {
  const form = q.form.ensure("Address");
  const name = q.textbox.ensure("Name");
  const homeTown = q.combobox.ensure("Home town");
  form.addEventListener("reset", (event) => event.stopPropagation(), {
    once: true,
  });

  await type("Chance", name);
  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset address"));

  expect(name).toHaveValue("");
  expect(homeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("preserves a value set after reset in the same task", async () => {
  const homeTown = q.combobox.ensure("Home town");

  await type("Boston", homeTown);
  await click(q.button("Reset and replace address"));
  await nextTask();

  expect(homeTown).toHaveValue("Paris");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("does not overwrite a replacement after propagation stops", async () => {
  const form = q.form.ensure("Address");
  const homeTown = q.combobox.ensure("Home town");
  form.addEventListener("reset", (event) => event.stopPropagation(), {
    once: true,
  });

  await type("Boston", homeTown);
  await click(q.button("Reset and replace address"));
  await nextTask();

  expect(homeTown).toHaveValue("Paris");
});

// https://github.com/ariakit/ariakit/issues/1861
test("resets a combobox to its default value", async () => {
  const birthPlace = q.combobox.ensure("Birth place");

  await type("San Diego", birthPlace);
  await press("Escape", birthPlace);
  await click(q.button("Reset address"));

  expect(birthPlace).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/issues/1861
test("uses the store reset value when the input has a defaultValue prop", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  await click(q.button("Show default value prop address"));
  expect(consoleError.mock.calls.flat().join(" ")).toContain(
    "both value and defaultValue",
  );
  consoleError.mockRestore();

  const form = q.form.ensure("Default value prop address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Default value prop home town");

  await type("Boston", homeTown);
  form.reset();

  expect(new FormData(form).get("defaultValuePropHomeTown")).toBe("London");
  expect(homeTown).toHaveValue("London");
  expect(homeTown).toHaveProperty("defaultValue", "London");

  await type("Madrid", homeTown);
  form.reset();

  expect(new FormData(form).get("defaultValuePropHomeTown")).toBe("London");
  expect(homeTown).toHaveValue("London");
  expect(homeTown).toHaveProperty("defaultValue", "London");
});

// https://github.com/ariakit/ariakit/issues/1861
test("resets a combobox associated with an explicit form", async () => {
  const formerHomeTown = q.combobox.ensure("Former home town");

  await type("Boston", formerHomeTown);
  await press("Escape", formerHomeTown);
  await click(q.button("Reset address"));

  expect(formerHomeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/issues/1861
test("preserves a controlled value on form reset", async () => {
  const homeTown = q.combobox.ensure("Controlled home town");

  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset controlled address"));

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("preserves the value when a Document listener cancels reset", async () => {
  const form = q.form.ensure("Address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Home town");
  document.addEventListener("reset", (event) => event.preventDefault(), {
    once: true,
  });

  await type("Boston", homeTown);
  form.reset();
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("preserves the value when a Window listener cancels reset", async () => {
  const form = q.form.ensure("Address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Home town");
  window.addEventListener("reset", (event) => event.preventDefault(), {
    once: true,
  });

  await type("Boston", homeTown);
  form.reset();
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("preserves a caller-controlled element value on form reset", async () => {
  const homeTown = q.combobox.ensure("Controlled element home town");

  await type("Boston", homeTown);
  await click(q.button("Reset controlled element address"));
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
test("preserves an equal caller-controlled render function value", async () => {
  const form = q.form.ensure("Controlled function address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Controlled function home town");

  await type("Boston", homeTown);
  form.reset();

  expect(new FormData(form).get("controlledFunctionHomeTown")).toBe("Boston");
  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060245
test("does not overwrite a controlled render after propagation stops", async () => {
  const form = q.form.ensure("Controlled element address") as HTMLFormElement;
  const homeTown = q.combobox.ensure("Controlled element home town");
  form.addEventListener("reset", (event) => event.stopPropagation(), {
    once: true,
  });

  await type("Boston", homeTown);
  await click(q.button("Reset and replace controlled element address"));
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
  expect(new FormData(form).get("controlledElementHomeTown")).toBe("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
test("preserves a value controlled by a composed store", async () => {
  const homeTown = q.combobox.ensure("Controlled store home town");

  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset controlled store address"));
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
test("preserves a value controlled by a sibling store", async () => {
  const homeTown = q.combobox.ensure("Sibling controlled store home town");

  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset sibling controlled store address"));
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
test("resets a value not owned by a partially shared store", async () => {
  const homeTown = q.combobox.ensure("Partially shared home town");

  await type("Boston", homeTown);
  await click(q.button("Reset partially shared address"));

  expect(homeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060253
test("preserves a value controlled by a tag store", async () => {
  const form = q.form.ensure("Controlled tag address");
  const homeTown = q.combobox.ensure("Controlled tag home town");

  await type("Boston", homeTown);
  await press("Escape", homeTown);
  await click(q.button("Reset controlled tag address"));
  await nextTask();

  expect(homeTown).toHaveValue("Boston");
  expect(form).toHaveAttribute("data-value-changes", "[]");
});

// https://github.com/ariakit/ariakit/issues/1861
test("clears inline autocomplete on form reset", async () => {
  const homeTown = q.combobox.ensure("Inline home town");

  await click(homeTown);
  await type("B", homeTown);
  expect(homeTown).toHaveValue("Boston");
  await click(q.button("Reset inline address"));

  expect(homeTown).toHaveValue("");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3632060250
test("restores inline autocomplete when reopening", async () => {
  const homeTown = q.combobox.ensure("Inline auto select home town");

  await click(homeTown);
  expect(homeTown).toHaveValue("Boston");
  await press("Escape", homeTown);
  await click(q.button("Reset inline address"));
  expect(homeTown).toHaveValue("");
  await click(homeTown);

  expect(homeTown).toHaveValue("Boston");
});

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
test.each(["Effect", "Layout effect", "Render effect"])(
  "resets synchronously from %s",
  async (label) => {
    const form = q.form(label + " address");
    const homeTown = q.combobox(label + " home town");

    await type("Boston", homeTown);
    await click(q.button(`Reset ${label.toLowerCase()} address`));

    expect(form).toHaveAttribute("data-after-reset", "");
    expect(form).toHaveAttribute("data-on-submit", "");
    expect(homeTown).toHaveValue("");
  },
);

// https://github.com/ariakit/ariakit/pull/6803#discussion_r3633543035
test("resets a pass-through render with setValueOnChange disabled", async () => {
  const form = q.form("Programmatic render effect address");
  const homeTown = q.combobox("Programmatic render effect home town");

  await click(q.button("Reset programmatic render effect address"));

  expect(form).toHaveAttribute("data-after-reset", "");
  expect(form).toHaveAttribute("data-on-submit", "");
  expect(homeTown).toHaveValue("");
});
