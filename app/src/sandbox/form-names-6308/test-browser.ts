import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6308
//
// The bug is a catastrophic Symbol coercion crash, so the regression these tests
// lock in is its *absence*. Both the userland workaround (coercing the name) and
// the library fix avoid that crash but reach it differently — the workaround
// renders the path text, the fix surfaces React's own invalid-child error — so
// the assertions accept either graceful outcome rather than one exact message.
withFramework(import.meta.dirname, async ({ test }) => {
  test("rendering a raw form.names.* value does not crash with a Symbol coercion error", async ({
    q,
  }) => {
    // Rendering `{form.names.email}` makes react-dom probe the value for
    // `Symbol.iterator`; accessing that absent symbol must not throw "Cannot
    // convert a Symbol value to a string". The paragraph text survives in every
    // case because the boundary only wraps the name, so wait for it first — that
    // commit also carries the boundary fallback, making the negative assertion
    // below non-racy.
    await q.button("Show field name").click();
    const submittedAs = q.text(/This value is submitted as/);
    await test.expect(submittedAs).toBeVisible();
    await test
      .expect(submittedAs)
      .not.toContainText("Cannot convert a Symbol value to a string");
  });

  test("inspecting a form.names.* value resolves to an object tag instead of throwing", async ({
    q,
  }) => {
    // `Object.prototype.toString.call(name)` probes `Symbol.toStringTag`, which
    // must resolve gracefully so the call returns an `[object …]` tag instead of
    // throwing inside the proxy (the fix yields "[object Object]", a coercing
    // workaround "[object String]").
    await q.button("Inspect field name").click();
    await test.expect(q.status()).toHaveText(/^\[object \w+\]$/);
  });
});
