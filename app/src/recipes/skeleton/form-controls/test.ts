import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// The simulated request takes 1.5 seconds.
const timeout = 3000;

test("enables the form after the account loads", async () => {
  expect(q.status()).toHaveTextContent("Loading account");
  expect(q.textbox.maybe("Name")).not.toBeInTheDocument();
  expect(q.button("Save changes")).toBeDisabled();
  // The placeholders stay for at least 200 ms after the data arrives.
  await expect
    .poll(() => q.textbox.maybe("Name"), { timeout })
    .toBeInTheDocument();
  expect(q.status()).toHaveTextContent("Account loaded");
  expect(q.textbox("Name")).toHaveValue("Ana Souza");
  expect(q.checkbox("Email me about product updates")).toBeChecked();
  expect(q.button("Save changes")).toBeEnabled();
});
