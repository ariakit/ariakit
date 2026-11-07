import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("filters the roles from the chips in the row", async () => {
  const chips = q.within(q.group("Filter by team"));
  expect(q.status()).toHaveTextContent("2 open roles");
  await click(chips.checkbox("Research"));
  expect(chips.checkbox("Research")).toBeChecked();
  expect(q.status()).toHaveTextContent("3 open roles");
  expect(q.listitem("User researcher")).toBeInTheDocument();
});
