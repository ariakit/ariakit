import { getByText } from "@ariakit/test";

test("render correctly", async () => {
  expect(
    getByText("I am portal and I am detached at the bottom of the page."),
  ).toBeInTheDocument();
});
