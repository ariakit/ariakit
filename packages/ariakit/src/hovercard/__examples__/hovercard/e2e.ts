import { navigateToExamplePage } from "ariakit-test-utils/e2e";
import { waitFor } from "pptr-testing-library";

navigateToExamplePage(__dirname);

test("edit", async () => {
  await page.mouse.move(0, 0);
  const document = await page.getDocument();
  const [link] = await document.getAllByText("@ariakitjs");
  await link?.hover();
  await waitFor(() => document.getByRole("dialog", { name: "Ariakit" }));
  const dialog = await document.getByRole("dialog", { name: "Ariakit" });
  const follow = await dialog?.findByText("Follow");
  await follow?.hover();
});
