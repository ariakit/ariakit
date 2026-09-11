import { click, press, q } from "@ariakit/test";
import { describe, expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { DisclosureFixturesExamples } from "./pages/disclosure-fixtures.react.tsx";

mountExamples(DisclosureFixturesExamples);

describe("disclosure button store", () => {
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781692
    test(`keeps the ${name.toLowerCase()} button state in sync with its explicit store`, async () => {
      const fixture = q.within(q.article("Disclosure button store"));
      const button = fixture.button(`${name} details`);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).not.toHaveAttribute("data-open");
      await click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button).toHaveAttribute("data-open", "true");
      expect(fixture.text(`${name} details are available.`)).toBeVisible();
      await click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).not.toHaveAttribute("data-open");
      expect(fixture.text(`${name} details are available.`)).not.toBeVisible();
    });
  }
});

describe("disclosure optional content", () => {
  const getFixture = () => q.within(q.article("Disclosure optional content"));

  // The combobox popover renders in a portal, outside the fixture.
  const getPopover = () => {
    const id = getFixture().combobox("Assignee").getAttribute("aria-controls");
    const popover = id ? document.getElementById(id) : null;
    if (!popover) throw new Error("The Assignee combobox controls no popover");
    return q.within(popover);
  };

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550076
  test("omits a false label while keeping the description", async () => {
    const fixture = getFixture();
    const button = fixture.button("Optional title");
    expect(button).not.toHaveAttribute("aria-labelledby");
    // The description is the button's only content, so it names the button and
    // does not describe it with the same text again.
    expect(button).toHaveAccessibleName("Optional title");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(button.querySelectorAll("span[id]")).toHaveLength(1);
    await click(button);
    expect(fixture.text("Optional settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("renders a zero icon before the label and the default indicator", async () => {
    const fixture = getFixture();
    const button = fixture.button(/Unread messages$/);
    expect(button).toHaveTextContent("0Unread messages");
    expect(button.firstElementChild).toHaveTextContent("0");
    expect(button.lastElementChild).toHaveAttribute(
      "data-disclosure-indicator",
    );
    await click(button);
    expect(fixture.text("No unread messages")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019389
  test("preserves a zero description and omits a false description", async () => {
    const fixture = getFixture();
    const button = fixture.button("Pending requests");
    expect(button).toHaveAccessibleDescription("0");
    expect(button).toHaveTextContent("Pending requests0");
    await click(button);
    expect(fixture.text("No requests need review")).toBeVisible();
    const archived = fixture.button("Archived requests");
    expect(archived).not.toHaveAttribute("aria-describedby");
    expect(archived).not.toHaveAttribute("aria-labelledby");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224162
  test("omits optional headings without hiding the filters", async () => {
    const article = q.article("Disclosure optional content");
    const fixture = getFixture();
    expect(fixture.combobox("Assignee")).toBeVisible();
    expect(fixture.combobox("Status")).toBeVisible();
    expect(fixture.button.all(/^$/)).toHaveLength(0);
    expect(
      Array.from(article.querySelectorAll("label")).filter(
        (label) => !label.textContent,
      ),
    ).toHaveLength(0);
    await click(fixture.combobox("Assignee"));
    expect(getPopover().option("Alice")).toBeVisible();
    expect(getPopover().group()).not.toHaveAttribute("aria-labelledby");
    await press.Escape();
    await click(fixture.checkbox("Show filter headings"));
    expect(fixture.button("Project filters")).toBeVisible();
    expect(fixture.combobox.maybe("Assignee")).not.toBeInTheDocument();
    await click(fixture.button("Project filters"));
    expect(fixture.combobox("Assignee")).toBeVisible();
    await click(fixture.combobox("Assignee"));
    expect(getPopover().group("Team")).toBeVisible();
    await press.Escape();
    await click(fixture.button("0"));
    expect(fixture.text("No pending requests")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224487
  test("names a disclosure from its description without a missing label", async () => {
    const fixture = getFixture();
    const button = fixture.button("Advanced options");
    expect(button).not.toHaveAttribute("aria-labelledby");
    // The description names the button, so describing it with the same text
    // would announce it twice.
    expect(button).toHaveAccessibleName("Advanced options");
    expect(button).not.toHaveAttribute("aria-describedby");
    await click(button);
    expect(fixture.text("Advanced controls")).toBeVisible();
  });
});
