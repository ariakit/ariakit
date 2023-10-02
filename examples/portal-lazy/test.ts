import { q } from "@ariakit/test";

test("loading button", async () => {
  expect(q.text("Loading")).toBeInTheDocument();
  expect(await q.button.wait("Button")).toBeInTheDocument();
});
