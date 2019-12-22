import * as React from "react";
import { render } from "reakit-test-utils";
import { isButton } from "../isButton";

test("isButton", () => {
  const { getByLabelText } = render(
    <>
      <button aria-label="item1" />
      <button type="submit" aria-label="item2" />
      <input type="submit" aria-label="item3" />
      <input type="text" aria-label="item4" />
    </>
  );

  expect(isButton(getByLabelText("item1"))).toBe(true);
  expect(isButton(getByLabelText("item2"))).toBe(true);
  expect(isButton(getByLabelText("item3"))).toBe(true);
  expect(isButton(getByLabelText("item4"))).toBe(false);
});
