import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("ignores inherited object selector properties", async ({ q }) => {
    await test
      .expect(q.status("Inherited selector keys"))
      .toHaveText("own,toString,valueOf");
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("does not run inherited object selectors", async ({ q }) => {
    await test.expect(q.status("Inherited selector calls")).toHaveText("0");
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/7058
  test("does not subscribe to inherited object selector properties", async ({
    q,
  }) => {
    await q.button("Update inherited selector key").click();

    await test.expect(q.status("Unexpected selector calls")).toHaveText("0");
  });
});
