import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("registers uncontrolled items", async ({ q }) => {
    await test.expect(q.status("Uncontrolled items")).toHaveText("3");
  });

  test("reports controlled store items", async ({ q }) => {
    await test.expect(q.status("Controlled items")).toHaveText("3");
  });

  test("reports controlled provider items", async ({ q }) => {
    await test.expect(q.status("Provider items")).toHaveText("3");
  });

  test("customizes a registered item with getItem", async ({ q }) => {
    await test.expect(q.status("Custom items")).toHaveText("1");
  });

  test("excludes an item when registration is disabled", async ({ q }) => {
    await test.expect(q.status("Registered items")).toHaveText("2");
  });
});
