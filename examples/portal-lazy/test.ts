import { q } from "@ariakit/test";

test("loading button", async () => {
  expect(await q.button.wait("Button")).toBeInTheDocument();
});
