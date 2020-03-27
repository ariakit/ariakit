import * as React from "react";
import { render } from "reakit-test-utils";
import { Hidden } from "../Hidden";

test("render", () => {
  render(<Hidden>hidden</Hidden>);
  expect(console).toHaveWarned();
});
