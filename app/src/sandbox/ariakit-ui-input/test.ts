import { click, focus, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4001176828
test("skips a leading action when focusing the field from group padding", async () => {
  const field = q.textbox("Draft message");
  await click(field.parentElement);
  expect(field).toHaveFocus();
  await click(q.button("Clear"));
  expect(q.button("Clear")).toHaveFocus();
  expect(field).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4001106872
test("does not focus the field when its help popup is clicked", async () => {
  const field = q.textbox("Contact email");
  await click(q.button("Email help"));
  const help = q.text(
    "Use the email address where you want to receive updates.",
  );
  expect(help).toBeVisible();
  await click(help);
  expect(field).not.toHaveFocus();
  expect(help).toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
test("tabs through composed fields without stopping on their wrappers", async () => {
  for (const [title, name] of [
    ["Field with leading icon", "Filter components"],
    ["Grouped Input", "Handle"],
    ["Share link with copy button", "Share link"],
  ]) {
    const box = q.within(q.article(title));
    await focus(box.button("More info"));
    await press.Tab();
    expect(box.textbox(name)).toHaveFocus();
  }
  await press.Tab();
  expect(q.button("Copy")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
test("focuses the share link from its prefix and preserves the Copy target", async () => {
  await click(q.text("https://"));
  expect(q.textbox("Share link")).toHaveFocus();
  await click(q.button("Copy"));
  expect(q.button("Copy")).toHaveFocus();
  expect(q.textbox("Share link")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
test("does not focus a disabled field from its wrapper", async () => {
  const field = q.textbox("Filter components");
  field.setAttribute("disabled", "");
  await click(field.parentElement);
  expect(field).not.toHaveFocus();
  expect(field.parentElement).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/8053
test("marks an error with an icon unless the icon is removed", () => {
  const marked = q.within(q.article("Error with a long message")).text(
    // The link splits the text, so only the first sentence is matched.
    /^Another account uses this address\./,
  );
  expect(marked.querySelectorAll("svg")).toHaveLength(1);
  const unmarked = q
    .within(q.article("Error without an icon"))
    .text("The code has 6 digits.");
  // No icon part either, so the text starts at the edge, like the hint.
  expect(unmarked.children).toHaveLength(0);
});

// The browser test also checks that the icon label stays out of the field
// description. The description here leaves out SVG labels even when the icon is
// not hidden, so it can't catch that.
// https://github.com/ariakit/ariakit/issues/8053
test("replaces the error icon with another icon", () => {
  const error = q
    .within(q.article("Error with another icon"))
    .text("This account is locked.");
  expect(error.querySelectorAll("svg")).toHaveLength(1);
  expect(error.querySelector("svg[aria-label='Locked']")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/8053
test("removes the error icon when the error text clears", async () => {
  for (const [title, name, text] of [
    ["Error that clears", "Work email", "@example.com"],
    ["Error that keeps its line", "Phone", "23"],
  ] as const) {
    const field = q.within(q.article(title)).textbox(name);
    // The error keeps its element, so the text query would no longer find it
    // once the text clears.
    const error = document.getElementById(
      field.getAttribute("aria-describedby") ?? "",
    );
    expect(error?.querySelectorAll("svg")).toHaveLength(1);
    await type(text, field);
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(error).toBeInTheDocument();
    expect(error?.querySelector("svg")).not.toBeInTheDocument();
  }
});

// https://github.com/ariakit/ariakit/issues/8053
test("shows the error icon when an error appears on blur", async () => {
  const box = q.within(q.article("Error that shows on blur"));
  const field = box.textbox("Username");
  const error = box.alert();
  expect(error).toBeEmptyDOMElement();
  await focus(field);
  await press.Tab();
  expect(error).toHaveTextContent("Remove the spaces.");
  expect(error.querySelectorAll("svg")).toHaveLength(1);
  expect(field).toHaveAccessibleDescription("Remove the spaces.");
});
