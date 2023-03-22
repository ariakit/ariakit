import { click, getByRole, render } from "@ariakit/test";
import Example from "./index.js";

test("change controlled state", async () => {
  render(<Example />);
  expect(getByRole("checkbox")).toBeChecked();
  await click(getByRole("checkbox"));
  expect(getByRole("checkbox")).not.toBeChecked();
});
