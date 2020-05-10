import * as React from "react";
import { render } from "reakit-test-utils";
import { isTextField } from "../isTextField";

test("isTextField", () => {
  const { getByLabelText } = render(
    <>
      <div aria-label="item1" />
      <textarea aria-label="item2" />
      <input type="submit" aria-label="item3" />
      <input type="text" aria-label="item4" />
      <input type="text" disabled aria-label="item5" />
      <input type="text" readOnly aria-label="item6" />
    </>
  );
  expect(isTextField(getByLabelText("item1"))).toBe(false);
  expect(isTextField(getByLabelText("item2"))).toBe(true);
  expect(isTextField(getByLabelText("item3"))).toBe(false);
  expect(isTextField(getByLabelText("item4"))).toBe(true);
  expect(isTextField(getByLabelText("item5"))).toBe(true);
  expect(isTextField(getByLabelText("item6"))).toBe(true);
});
