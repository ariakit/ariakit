import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("extends a multi-value Select with an automatic pointer range", async () => {
  await click(q.combobox("Field kit gear"));
  await click(q.option("Compass"));
  await click(q.option("Emergency radio"), { shiftKey: true });

  expect(q.option("Compass")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Headlamp")).toHaveAttribute("aria-selected", "true");
  expect(q.option("First-aid kit")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Satellite uplink")).toHaveAttribute("aria-disabled", "true");
  expect(q.option("Satellite uplink")).toHaveAttribute(
    "aria-selected",
    "false",
  );
  expect(q.status("Field kit selection")).toHaveTextContent(
    "6 packed: Field notebook, Water filter, Compass, Headlamp, First-aid kit, Emergency radio",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
// Firefox's native multi-select wipes prior groups during keyboard ranges. The
// shared policy keeps the captured base stable while the range grows and shrinks.
test("recomputes a keyboard range without losing prior values", async () => {
  await click(q.combobox("Field kit gear"));
  await press.ArrowDown();
  expect(q.option("Headlamp")).toHaveAttribute("data-active-item");

  await press.ArrowDown(undefined, { shiftKey: true });
  expect(q.status("Field kit selection")).toHaveTextContent(
    "4 packed: Field notebook, Water filter, Headlamp, First-aid kit",
  );

  await press.ArrowUp(undefined, { shiftKey: true });
  expect(q.status("Field kit selection")).toHaveTextContent(
    "3 packed: Field notebook, Water filter, Headlamp",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps direct selection controls on public state", async () => {
  await click(q.button("Pack all available gear"));
  expect(q.status("Field kit selection")).toHaveTextContent(
    "9 packed: Compass, Field notebook, Water filter, Headlamp, First-aid kit, Emergency radio, Thermal blanket, Signal mirror, Trail guide",
  );

  await click(q.button("Clear manifest"));
  expect(q.status("Field kit selection")).toHaveTextContent(
    "Nothing packed yet",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps modified Select link navigation outside selection", async () => {
  await click(q.combobox("Field kit gear"));
  const guide = q.option("Trail guide");
  const selection = q.status("Field kit selection");
  const newTabModifier = navigator.platform.startsWith("Mac")
    ? { metaKey: true }
    : { ctrlKey: true };

  expect(guide).toHaveAttribute("href", "#field-kit-notes");
  await click(guide, newTabModifier);
  expect(guide).toHaveAttribute("aria-selected", "false");
  expect(selection).toHaveTextContent("2 packed: Field notebook, Water filter");

  await click(guide, { altKey: true });
  expect(guide).toHaveAttribute("aria-selected", "false");
  expect(selection).toHaveTextContent("2 packed: Field notebook, Water filter");
});
