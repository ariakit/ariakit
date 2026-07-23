import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3729
test.each(["Disclosure first", "Anchor first"])(
  "keeps the explicit anchor when the %s disclosure is clicked",
  async (label) => {
    const anchor = q.status.ensure(`${label} current anchor`);
    expect(anchor).toHaveTextContent("explicit");

    await click(q.button(`Open ${label}`));

    expect(anchor).toHaveTextContent("explicit");
    expect(q.dialog(`${label} details`)).toBeVisible();
  },
);

test("falls back to the disclosure when the explicit anchor unmounts", async () => {
  const label = "Disclosure first";
  const anchor = q.status.ensure(`${label} current anchor`);

  await click(q.button(`Open ${label}`));
  await click(q.button(`Remove ${label} anchor`));

  expect(anchor).toHaveTextContent("button");
  expect(q.dialog(`${label} details`)).toBeVisible();
});

test("clears the disclosure fallback when it unmounts", async () => {
  const label = "Disclosure first";

  await click(q.button(`Open ${label}`));
  await click(q.button(`Remove ${label} anchor`));
  await click(q.button(`Remove ${label} disclosure`));

  expect(q.status(`${label} current anchor`)).toHaveTextContent("none");
  expect(q.status(`${label} current disclosure`)).toHaveTextContent("none");
  expect(q.dialog(`${label} details`)).toBeVisible();
});

test("keeps MenuButton as the disclosure for MenuAnchor", async () => {
  const button = q.button("Open Menu");

  await click(button);

  expect(q.menu("Menu items")).toBeVisible();
  expect(q.status("Menu current anchor")).toHaveTextContent("explicit");
  expect(q.status("Menu current disclosure")).toHaveTextContent("button");

  await press("Escape");
  expect(button).toHaveFocus();
});

test("preserves SelectAnchor when Select opens", async () => {
  await click(q.combobox("Open Select"));

  expect(q.listbox("Select items")).toBeVisible();
  expect(q.status("Select current anchor")).toHaveTextContent("explicit");
});

test.each([
  ["Explicit", "explicit"],
  ["Input", "input"],
  ["Disclosure", "button"],
] as const)("uses the %s Combobox anchor", async (label, expectedAnchor) => {
  await click(q.button(`Open ${label} Combobox`));

  expect(q.listbox(`${label} Combobox items`)).toBeVisible();
  expect(q.status(`${label} Combobox current anchor`)).toHaveTextContent(
    expectedAnchor,
  );
  expect(q.status(`${label} Combobox current disclosure`)).toHaveTextContent(
    label === "Disclosure" ? "button" : "input",
  );

  await press("Escape");
  expect(q.listbox(`${label} Combobox items`)).not.toBeInTheDocument();
});

test("uses ComboboxDisclosure when the combobox input unmounts", async () => {
  await click(q.button("Open Input Combobox"));
  await click(q.button("Remove Input Combobox input"));

  expect(q.status("Input Combobox current anchor")).toHaveTextContent("button");
  expect(q.status("Input Combobox current disclosure")).toHaveTextContent(
    "button",
  );
  expect(q.listbox("Input Combobox items")).toBeVisible();
});

test("provides the Combobox store to disclosure descendants", () => {
  expect(q.status("Scoped Combobox context")).toHaveTextContent("right");
});
