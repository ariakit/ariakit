import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names each rating with its word and starts without one", async () => {
  const group = q.within(q.radiogroup("How was the support you got?"));
  for (const name of ["Terrible", "Bad", "Okay", "Good", "Great"]) {
    expect(group.radio(name)).not.toBeChecked();
  }
  await click(group.text("Good"));
  expect(group.radio("Good")).toBeChecked();
});
