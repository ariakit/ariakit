import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/3729
test.each(["Disclosure first", "Anchor first", "Provider store"])(
  "keeps the explicit anchor when the %s disclosure is clicked",
  async (label) => {
    const anchor = q.status.ensure(`${label} current anchor`);
    expect(anchor).toHaveTextContent("explicit");

    await click(q.button(`Open ${label}`));

    expect(anchor).toHaveTextContent("explicit");
  },
);

test("falls back to the disclosure when the explicit anchor unmounts", async () => {
  const label = "Disclosure first";
  const anchor = q.status.ensure(`${label} current anchor`);

  await click(q.button(`Open ${label}`));
  await click(q.button(`Remove ${label} anchor`));

  expect(anchor).toHaveTextContent("none");
});

test("clears a disclosure fallback when its element unmounts", async () => {
  const anchor = q.status.ensure("Removable disclosure current anchor");

  await click(q.button("Open removable disclosure"));
  await click(q.button("Remove Popover disclosure"));
  expect(anchor).toHaveTextContent("explicit");
  expect(q.status("Removable disclosure current disclosure")).toHaveTextContent(
    "none",
  );

  await click(q.button("Remove Popover anchor"));
  expect(anchor).toHaveTextContent("none");
});

test("preserves MenuAnchor when MenuButton opens the menu", async () => {
  const anchor = q.status.ensure("Menu current anchor");
  expect(anchor).toHaveTextContent("explicit");

  const button = q.button("Open Menu");
  await click(button);

  expect(anchor).toHaveTextContent("explicit");

  await press("Escape");
  expect(button).toHaveFocus();
});

test("preserves a consumer MenuButton anchor override", async () => {
  const anchor = q.status.ensure("Override Menu current anchor");

  await click(q.button("Open Override Menu"));

  expect(anchor).toHaveTextContent("group");
});

test("preserves SelectAnchor when Select opens", async () => {
  const anchor = q.status.ensure("Select current anchor");
  expect(anchor).toHaveTextContent("explicit");

  await click(q.combobox("Open Select"));

  expect(anchor).toHaveTextContent("explicit");
});

test("preserves ComboboxAnchor when ComboboxDisclosure opens", async () => {
  const anchor = q.status.ensure("Combobox current anchor");
  expect(anchor).toHaveTextContent("explicit");
  expect(q.status("Combobox current disclosure")).toHaveTextContent(
    "disclosure",
  );

  await click(q.button("Open Combobox"));

  expect(anchor).toHaveTextContent("explicit");
  expect(q.status("Combobox current disclosure")).toHaveTextContent(
    "disclosure",
  );
});

test("falls back to Combobox after ComboboxAnchor unmounts", async () => {
  const anchor = q.status.ensure("Combobox current anchor");

  await click(q.button("Remove Combobox anchor"));
  expect(anchor).toHaveTextContent("none");

  await click(q.button("Open Combobox"));
  expect(anchor).toHaveTextContent("none");

  await click(q.button("Remove Combobox input"));
  expect(anchor).toHaveTextContent("none");
});

test("tracks ComboboxDisclosure across default-open mount transitions", async () => {
  const disclosure = q.status.ensure(
    "Default open Combobox current disclosure",
  );
  expect(disclosure).toHaveTextContent("second-disclosure");

  await click(q.button("Remove second default open Combobox disclosure"));
  expect(disclosure).toHaveTextContent("first-disclosure");

  await click(q.button("Remove first default open Combobox disclosure"));
  expect(disclosure).toHaveTextContent("combobox");

  await click(q.button("Mount first default open Combobox disclosure"));
  expect(disclosure).toHaveTextContent("first-disclosure");

  await click(q.button("Remove all default open Combobox controls"));
  expect(disclosure).toHaveTextContent("none");
});

test("toggles once when ComboboxDisclosure is composed", async () => {
  await click(q.button("Open composed Combobox"));

  expect(q.listbox("Composed Combobox items")).toBeVisible();
  expect(q.status("Composed Combobox current anchor")).toHaveTextContent(
    "none",
  );
});

test("registers HovercardAnchor when a disclosure is present", async () => {
  const anchor = q.status.ensure("Hovercard current anchor");
  expect(anchor).toHaveTextContent("none");

  await click(q.button("Mount Hovercard anchor"));

  expect(anchor).toHaveTextContent("first");

  await click(q.button("Mount second Hovercard anchor"));

  expect(anchor).toHaveTextContent("first");
});
