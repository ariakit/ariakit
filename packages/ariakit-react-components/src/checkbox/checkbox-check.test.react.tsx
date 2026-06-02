import { render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { CheckboxCheck } from "./checkbox-check.tsx";

test("does not render function children when unchecked", async () => {
  const invalidChildren = () => "checked";

  await render(
    // @ts-expect-error Testing runtime children outside the typed API.
    <CheckboxCheck checked={false}>{invalidChildren}</CheckboxCheck>,
  );

  const check = document.querySelector("span");

  expect(check?.textContent).toBe("");
  expect(check?.childElementCount).toBe(0);
});
