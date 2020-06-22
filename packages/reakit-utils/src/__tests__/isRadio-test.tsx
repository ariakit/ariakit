import * as React from "react";
import { render } from "reakit-test-utils";
import { isRadio } from "../isRadio";

test("isRadio", () => {
  const { getByText, getByLabelText } = render(
    <>
      <input type="radio" aria-label="item1" />
      <input type="text" aria-label="item2" />
      <label>
        <input type="radio" />
        <span aria-label="item3" />
      </label>
      <div>
        <input id="radio1" type="radio" />
        <label htmlFor="radio1">item4</label>
      </div>
      <div>
        <label htmlFor="radio2">item5</label>
        <input id="radio2" type="radio" />
      </div>
    </>
  );

  expect(isRadio(getByLabelText("item1"))).toBe(true);
  expect(isRadio(getByLabelText("item2"))).toBe(false);
  expect(isRadio(getByLabelText("item3"))).toBe(true);
  expect(isRadio(getByText("item4"))).toBe(true);
  expect(isRadio(getByText("item5"))).toBe(true);
});
