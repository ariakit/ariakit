import * as React from "react";
import { render } from "../react-testing-library";
import { click } from "../click";

test("click", async () => {
  const called = [] as string[];
  const { getByText } = render(
    <button
      onMouseDown={event => called.push(event.type)}
      onClick={event => called.push(event.type)}
      onMouseUp={event => called.push(event.type)}
    >
      button
    </button>
  );
  const button = getByText("button");
  click(button);
  expect(called).toEqual(["mousedown", "mouseup", "click"]);
});
