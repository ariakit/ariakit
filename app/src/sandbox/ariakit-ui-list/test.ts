import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import {
  getClassTokens,
  getDisclosureParts,
} from "../ariakit-ui-disclosure/disclosure.test-helper.ts";

// https://github.com/ariakit/ariakit/issues/7553
test("renders every list disclosure without repeated or important gap classes", () => {
  const buttons = q.button
    .all()
    .filter((button) => button.matches(".disclosure-button"));
  expect(buttons).not.toHaveLength(0);
  for (const button of buttons) {
    const { root, body } = getDisclosureParts(button);
    for (const element of [root, button, body]) {
      const tokens = getClassTokens(element);
      expect(tokens).toEqual([...new Set(tokens)]);
      expect(
        tokens.filter(
          (token) => token.startsWith("gap-") && token.endsWith("!"),
        ),
      ).toEqual([]);
    }
  }
});

// https://github.com/ariakit/ariakit/issues/7553
test("lets a list disclosure count its marker as a leading slot", () => {
  const list = q.within(q.article("Leading marker"));
  const { root: leading } = getDisclosureParts(list.button("Version 3.0"));
  const { root: plain } = getDisclosureParts(list.button("Version 2.9"));
  expect(plain).toHaveAttribute(
    "style",
    "--frame-padding: var(--list-item-padding); --disclosure-ps: calc(var(--py) + (var(--px) - var(--py) + 1lh) * var(--list-guide)); --disclosure-icon: 0;",
  );
  expect(leading).toHaveAttribute(
    "style",
    "--frame-padding: var(--list-item-padding); --disclosure-ps: calc(var(--py) + (var(--px) - var(--py) + 1lh) * var(--list-guide)); --disclosure-icon: 1;",
  );
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
test("keeps a disclosure badge beside the label without a description", async () => {
  const button = q.button("Project tasks 3");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  await click(button);
  expect(q.text("Manage project tasks")).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("keeps a disclosure badge beside a consumer label component with a description", async () => {
  const button = q.button("Team tasks");
  expect(button).toHaveAttribute("aria-labelledby", "list-tasks-label");
  expect(button).toHaveAccessibleDescription("All tasks in this workspace");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  await click(button);
  expect(q.text("Manage team tasks")).not.toBeVisible();
});
// The checked marker remains part of a plain disclosure label when a
// description supplies separate name and description relationships.
test("keeps a disclosure step's checked state in its name", () => {
  const button = q.button("Checked Connect the repository");
  expect(button).toHaveAccessibleDescription("Done on Monday");
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998773048
test("keeps a bare fragment label separate from its description and badge", async () => {
  const button = q.button("Checked Account tasks");
  expect(button).toHaveAccessibleDescription("Manage account tasks");
  expect(
    button.querySelector(":scope > .disclosure-button-slot"),
  ).toHaveTextContent("3");
  await click(button);
  expect(q.text("Update account tasks")).toBeVisible();
});

for (const [name, state, description] of [
  ["Repository connection", "Checked", ""],
  [/Half done/, "Unchecked", "50% complete"],
  ["Workspace access", "Checked", ""],
  ["Account sync", "Unchecked", "25% complete"],
] as const) {
  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998773052
  test(`keeps the status marker without a label: ${name}`, () => {
    const button = q.within(q.article("Disclosure status")).button(name);
    const marker = q.within(button).img(state);
    expect(marker).toBeVisible();
    expect(marker).toHaveAccessibleDescription(description);
  });
}
