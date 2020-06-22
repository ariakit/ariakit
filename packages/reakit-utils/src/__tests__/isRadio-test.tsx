import * as React from "react";
import { render } from "reakit-test-utils";
import { isRadio } from "../isRadio";

test("isRadio", () => {
  const { getByLabelText } = render(
    <>
      <input type="radio" aria-label="item1" />
      <input type="text" aria-label="item2" />
    </>
  );

  expect(isRadio(getByLabelText("item1"))).toBe(true);
  expect(isRadio(getByLabelText("item2"))).toBe(false);
});
