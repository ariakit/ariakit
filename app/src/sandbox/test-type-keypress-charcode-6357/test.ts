// @vitest-environment jsdom
import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("Enter in a textarea fires a keypress with charCode 13", async () => {
  await press.Enter(q.textbox.ensure("Comment"));

  expect(q.status.ensure("Last char code")).toHaveTextContent("13");
  expect(q.status.ensure("Submitted")).toHaveTextContent("1");
});
