import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6308
//
// happy-dom duplicate of the Object.prototype.toString path in
// `test-browser.ts`. The raw-React-child render path stays browser-only: after
// the fix React raises its invalid-child error, whose dev-mode console.error
// would trip `failOnConsole` here even though the Symbol crash is gone.
test("inspecting a form.names.* value resolves to an object tag instead of throwing", async () => {
  // `Object.prototype.toString.call(name)` probes `Symbol.toStringTag`, which
  // must resolve gracefully so the call returns an `[object …]` tag instead of
  // throwing "Cannot convert a Symbol value to a string" (the fix yields
  // "[object Object]", a coercing workaround "[object String]").
  await click(q.button("Inspect field name"));
  expect(q.status()).toHaveTextContent(/^\[object \w+\]$/);
});
