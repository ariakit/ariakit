import { click, focus, press, q } from "@ariakit/test";
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
