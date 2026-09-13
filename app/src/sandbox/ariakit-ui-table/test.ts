import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7481
test("names declarative and composed tables with native captions", () => {
  for (const title of ["Declarative rows", "Composed parts"]) {
    const table = q.within(q.article(title)).table();
    const caption = q.within(table).caption();
    expect(caption).toBeVisible();
    expect(table).toHaveAccessibleName(caption.textContent ?? "");
    expect(table.firstElementChild).toBe(caption);
  }
});

// https://github.com/ariakit/ariakit/issues/7481
test("supports optional caption parts before declarative and appended rows", async () => {
  const fixture = q.within(q.article("Caption options"));
  const table = fixture.table();
  for (const format of ["Text", "Props", "Element", "Zero", "Hidden"]) {
    await click(fixture.button(format));
    if (format === "Hidden") {
      expect(q.within(table).caption.maybe()).not.toBeInTheDocument();
    } else {
      expect(table).toHaveAccessibleName(
        format === "Zero" ? "0" : "Component inventory",
      );
      expect(table.firstElementChild).toBe(q.within(table).caption());
    }
    expect(q.within(table).row.all()).toHaveLength(2);
    expect(
      q
        .within(table)
        .cell.all()
        .map((cell) => cell.textContent),
    ).toEqual(["Button", "Covered", "Tabs", "Expanded"]);
  }
});
