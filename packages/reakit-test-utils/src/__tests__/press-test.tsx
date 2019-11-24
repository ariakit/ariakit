import * as React from "react";
import { render } from "../react-testing-library";
import { press } from "../press";

test("press", async () => {
  const called = [] as string[];
  const { getByText } = render(
    <button
      onKeyDown={event => called.push(event.type)}
      onClick={event => called.push(event.type)}
      onKeyUp={event => called.push(event.type)}
    >
      button
    </button>
  );
  const button = getByText("button");
  press.Enter(button);
  expect(called).toEqual(["keydown", "click", "keyup"]);
});
