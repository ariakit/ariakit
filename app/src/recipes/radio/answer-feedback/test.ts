import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("marks the answers with words after a wrong check", async () => {
  const group = q.within(
    q.radiogroup("What should name a group of radio buttons?"),
  );
  const check = q.button("Check");
  expect(check).toHaveAttribute("aria-disabled", "true");
  await click(group.text("A title attribute on the group"));
  await click(check);
  expect(
    group.radio("A title attribute on the group Your answer"),
  ).toBeDisabled();
  expect(
    group.radio("A visible label for the group Correct answer"),
  ).toBeDisabled();
  expect(q.status()).toHaveTextContent(
    "Not quite. A visible label names the group for everyone.",
  );
  expect(q.button("Try again")).toHaveFocus();
});

test("starts over and keeps focus on the button", async () => {
  const group = q.within(
    q.radiogroup("What should name a group of radio buttons?"),
  );
  await click(group.text("A visible label for the group"));
  await click(q.button("Check"));
  expect(q.status()).toHaveTextContent(
    "Correct. A visible label names the group for everyone.",
  );
  await click(q.button("Try again"));
  const check = q.button("Check");
  expect(check).toHaveFocus();
  expect(check).toHaveAttribute("aria-disabled", "true");
  expect(q.status()).toBeEmptyDOMElement();
  expect(group.radio("A visible label for the group")).not.toBeChecked();
  expect(group.radio("A visible label for the group")).toBeEnabled();
});
