import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("Enter in a textarea fires a keypress with charCode 13", async ({
    q,
  }) => {
    await q.button("Run simulated Enter").click();

    await test.expect(q.status("Last char code")).toHaveText("13");
    await test.expect(q.status("Submitted")).toHaveText("1");
  });
});
