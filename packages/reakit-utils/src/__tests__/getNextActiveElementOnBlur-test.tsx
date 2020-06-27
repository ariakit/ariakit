import * as React from "react";
import { render, focus } from "reakit-test-utils";
import { getNextActiveElementOnBlur } from "../getNextActiveElementOnBlur";

test("getNextActiveElementOnBlur", () => {
  const onBlur = jest.fn(getNextActiveElementOnBlur);
  const { getByText: text } = render(
    <>
      <button onBlur={onBlur}>button1</button>
      <button>button2</button>
    </>
  );
  focus(text("button1"));
  expect(onBlur).not.toHaveBeenCalled();
  focus(text("button2"));
  expect(onBlur).toHaveReturnedWith(text("button2"));
});
