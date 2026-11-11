import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the code as written, without the marks", async () => {
  await click(q.button("Copy disclosure.tsx"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  const copied = await navigator.clipboard.readText();
  expect(copied).toContain("  const [open, setOpen] = useState(false);\n");
  expect(copied).toContain(
    "<button aria-expanded={open} onClick={() => setOpen(!open)}>",
  );
});
