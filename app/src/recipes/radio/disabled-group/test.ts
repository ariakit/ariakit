import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("disables the group after the vote and keeps focus on the button", async () => {
  const group = q.within(q.radiogroup("What should we build next?"));
  const vote = q.button("Vote");
  expect(vote).toHaveAttribute("aria-disabled", "true");
  await click(group.radio("Mobile app"));
  expect(vote).not.toHaveAttribute("aria-disabled");
  await click(vote);
  expect(q.status()).toHaveTextContent("Thanks. You voted for Mobile app.");
  expect(group.radio("Mobile app")).toBeChecked();
  expect(group.radio("Mobile app")).toBeDisabled();
  expect(group.radio("Dark mode for reports")).toBeDisabled();
  expect(vote).toHaveAttribute("aria-disabled", "true");
  expect(vote).toHaveFocus();
});
