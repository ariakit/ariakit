import * as React from "react";
import { render } from "reakit-test-utils";
import { HiddenDisclosure } from "../HiddenDisclosure";

const props: Parameters<typeof HiddenDisclosure>[0] = {
  toggle: jest.fn,
  baseId: "test"
};

test("render", () => {
  render(<HiddenDisclosure {...props}>disclosure</HiddenDisclosure>);
  expect(console).toHaveWarned();
});
