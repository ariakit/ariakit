import * as React from "react";
import { render } from "reakit-test-utils";
import { isLabelForRadio } from "../isLabelForRadio";

test("isLabelForRadio", () => {
  const { getByText, getByLabelText } = render(
    <>
      <input type="radio" aria-label="item1" />
      <label>
        <input type="radio" />
        <span aria-label="item2" />
      </label>
      <div>
        <input id="radio1" type="radio" />
        <label htmlFor="radio1">item3</label>
      </div>
      <div>
        <label htmlFor="radio2">item4</label>
        <input id="radio2" type="radio" />
      </div>
    </>
  );

  expect(isLabelForRadio(getByLabelText("item1"))).toBe(false);
  expect(isLabelForRadio(getByLabelText("item2"))).toBe(true);
  expect(isLabelForRadio(getByText("item3"))).toBe(true);
  expect(isLabelForRadio(getByText("item4"))).toBe(true);
});
