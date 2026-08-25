import { expect, test } from "vitest";
import { list, listItemConnector, listItemMarker } from "./list.ts";

// Regression coverage: the $checked variant carries a "false" branch, so
// clava gives it an implicit static false default. Without the explicit
// undefined that clears it, every plain bullet resolved as a check slot and
// painted the empty ring meant for unchecked rows.
test("leaves $checked undefined so plain bullets stay bullets", () => {
  const variants = listItemMarker.getVariants({});
  expect(variants.$checked).toBeUndefined();
  expect(variants.$check).toBe(false);
  expect(listItemMarker.html({}).class).not.toContain("ui-list-ul:ring");
});

test("turns the bullet into a check slot as soon as a check state exists", () => {
  expect(listItemMarker.getVariants({ $checked: false }).$check).toBe(true);
  expect(listItemMarker.getVariants({ $checked: true }).$check).toBe(true);
  // Progress on its own is a check state too: the legacy check recipe took
  // $progress without $checked, and a bullet has nowhere to draw the arc.
  expect(listItemMarker.getVariants({ $progress: 0.5 }).$check).toBe(true);
  // The bullet reshapes the disc box; a check slot must keep it.
  for (const variants of [{ $checked: false }, { $progress: 0.5 }]) {
    expect(listItemMarker.html(variants).class).not.toContain(
      "ui-list-ul:rounded-none",
    );
  }
});

// Regression coverage: the last row was once found by counting how deep the
// connector sat under its li, which broke on nested lists and again on the
// extra element a hydrated disclosure adds. The list publishes the answer
// instead, and the off value has to stay on the root so a nested list shadows
// the flag of the list around it.
test("publishes the last row as a channel the connector reads", () => {
  const className = list.html({}).class;
  expect(className).toContain("[--list-last-row:0]");
  expect(className).toContain("[&>li:last-of-type]:[--list-last-row:1]");
  expect(listItemConnector.html({}).class).toContain(
    "ui-list-last-row:h-[calc(100%-var(--list-connector-top))]",
  );
});

// The segment grows out of the ordered chip, so both must resolve the same
// surface channel rather than repeating a value.
test("paints the connector from the marker's surface channel", () => {
  expect(listItemConnector.getVariants({}).$lightnessOffset).toBe(
    "var(--list-marker-lightness, 2.4)",
  );
  expect(list.html({ $ordered: true }).class).toContain(
    "[--list-marker-lightness:2.4]",
  );
});

// The list publishes the marker surfaces so the recipe reads them through the
// layer primitive instead of hand-written ak-layer-6 and ak-layer-12.
test("reads its surface from the channel that matches the marker kind", () => {
  const bullet = listItemMarker.getVariants({});
  expect(bullet.$lightnessOffset).toBe("var(--list-marker-lightness, 0)");
  expect(bullet.$borderWeight).toBe("bold");

  const unchecked = listItemMarker.getVariants({ $checked: false });
  expect(unchecked.$lightnessOffset).toBe("var(--list-check-lightness, 0)");
  expect(unchecked.$borderWeight).toBe(25);

  // A completed marker paints the brand color straight, with no neutral
  // surface or edge underneath it.
  const checked = listItemMarker.getVariants({ $checked: true });
  expect(checked.$layer).toBe("brand");
  expect(checked.$contrast).toBe(50);
  expect(checked.$lightnessOffset).toBeUndefined();
  expect(checked.$borderWeight).toBeUndefined();
});

// The marker must not open a frame context: it positions itself against the
// row's --ak-frame-padding, which ak-frame would rewrite on the marker.
test("keeps the marker outside the frame system", () => {
  expect(listItemMarker.html({}).class.split(" ")).not.toContain("ak-frame");
});
