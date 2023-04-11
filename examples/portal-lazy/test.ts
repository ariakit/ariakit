import { getByRole, getByText, waitFor } from "@ariakit/test";

test("loading button", async () => {
  expect(getByText("Loading")).toBeInTheDocument();
  await waitFor(() => getByRole("button", { name: "Button" }));
});
