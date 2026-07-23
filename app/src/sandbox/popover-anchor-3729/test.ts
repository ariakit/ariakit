import { click, hover, press, q } from "@ariakit/test";
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

  expect(anchor).toHaveTextContent("none");
  expect(q.dialog(`${label} details`)).toBeVisible();
});

test("clears the disclosure fallback when it unmounts", async () => {
  const label = "Disclosure first";
  const disclosure = q.status.ensure(`${label} current disclosure`);

  await click(q.button(`Open ${label}`));
  await click(q.button(`Remove ${label} anchor`));
  expect(disclosure).toHaveTextContent("button");

  await click(q.button(`Remove ${label} disclosure`));

  expect(disclosure).toHaveTextContent("none");
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

test("clears HovercardAnchor when it unmounts on show", async () => {
  const anchor = q.status.ensure("Hovercard current anchor");
  const disclosure = q.status.ensure("Hovercard current disclosure");
  expect(anchor).toHaveTextContent("hovercard");

  await hover(q.link("Hovercard anchor"));

  await expect.poll(() => q.dialog("Unmount Hovercard")).toBeVisible();
  expect(anchor).toHaveTextContent("none");
  expect(disclosure).toHaveTextContent("none");
});

// https://github.com/ariakit/ariakit/issues/3729
test("clears a custom Hovercard trigger when it unmounts", async () => {
  const disclosure = q.status.ensure("Custom hovercard current disclosure");

  await hover(q.link("Custom hovercard trigger"));
  expect(disclosure).toHaveTextContent("trigger");

  await click(q.button("Remove custom hovercard trigger"));
  expect(disclosure).toHaveTextContent("none");
});

test("preserves SelectAnchor when Select opens", async () => {
  await click(q.combobox("Open Select"));

  expect(q.listbox("Select items")).toBeVisible();
  expect(q.status("Select current anchor")).toHaveTextContent("explicit");
});

test.each([
  ["Explicit", "explicit"],
  ["Input", "none"],
  ["Disclosure", "none"],
] as const)("uses the %s Combobox anchor", async (label, expectedAnchor) => {
  await click(q.button(`Open ${label} Combobox`));

  expect(q.listbox(`${label} Combobox items`)).toBeVisible();
  expect(q.status(`${label} Combobox current anchor`)).toHaveTextContent(
    expectedAnchor,
  );
  expect(q.status(`${label} Combobox current disclosure`)).toHaveTextContent(
    "button",
  );

  await press("Escape");
  expect(q.listbox(`${label} Combobox items`)).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/3729
test("closes when the Combobox input is replaced while open", async () => {
  await click(q.button("Open Input Combobox"));
  await click(q.button("Replace Input Combobox input"));

  const input = q.combobox.ensure("Input Combobox input");
  input.focus();
  await press("Escape", input);

  expect(q.listbox("Input Combobox items")).not.toBeInTheDocument();
});
