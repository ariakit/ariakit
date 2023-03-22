import { getByText, render } from "@ariakit/test";
import PortalExample from "./index.js";

test("render correctly", async () => {
  render(<PortalExample />);
  expect(
    getByText("I am portal and I am detached at the bottom of the page.")
  ).toBeInTheDocument();
});
