import { getByRole, getByText, render, waitFor } from "@ariakit/test";
import Example from "./index.js";

test("loading button", async () => {
  render(<Example />);
  expect(getByText("Loading")).toBeInTheDocument();
  await waitFor(() => getByRole("button", { name: "Button" }));
});
