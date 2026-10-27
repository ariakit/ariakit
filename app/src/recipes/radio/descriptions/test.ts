import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each option with its label and describes it with its description", () => {
  const group = q.within(q.radiogroup("Who can open this link?"));
  const radio = group.radio("Anyone at Acme");
  expect(radio).toBeChecked();
  expect(radio).toHaveAccessibleDescription(
    "People signed in with an Acme account",
  );
  expect(group.radio("Anyone with the link")).toHaveAccessibleDescription(
    "No sign-in needed",
  );
});
