import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

const spyOnAlert = () => vi.spyOn(window, "alert").mockImplementation(() => {});

test("disabled select is visually and semantically disabled", () => {
  const button = q.combobox("Favorite fruit");
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).toHaveStyle("pointer-events: none");
});

test("disabled select cannot be opened with click", async () => {
  await click(q.combobox("Favorite fruit"));
  expect(q.listbox()).not.toBeInTheDocument();
});

test("disabled select cannot be opened with keyboard", async () => {
  await press.Tab();

  expect(q.button("Submit")).toHaveFocus();

  await press.ArrowDown();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("disabled select does not submit value", async () => {
  using alert = spyOnAlert();
  await press.Tab();
  await press.Enter();
  expect(alert).toHaveBeenCalledWith(null);
});

// https://github.com/ariakit/ariakit/issues/6892
test("accessible disabled selects do not submit values", async () => {
  await click(q.button("Submit transformed selects"));

  expect(q.status()).toHaveTextContent(/^select-rendered, combobox-rendered$/);
});

// https://github.com/ariakit/ariakit/issues/6892
test("aria-disabled selects do not submit values", async () => {
  expect(q.combobox("Select aria disabled")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(q.combobox("Combobox aria disabled")).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  await click(q.button("Submit transformed selects"));

  expect(q.status()).toHaveTextContent(/^select-rendered, combobox-rendered$/);
});

// https://github.com/ariakit/ariakit/issues/6892
test("rendered disabled selects do not submit values", async () => {
  await click(q.checkbox("Disable rendered selects"));

  expect(q.combobox("Select rendered")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(q.combobox("Combobox rendered")).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  await click(q.button("Submit transformed selects"));

  expect(q.status()).toHaveTextContent("No values submitted");
});
