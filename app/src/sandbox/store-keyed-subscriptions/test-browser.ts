import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hydrates deterministic selector counters", async ({ page, q }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        hydrationErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => hydrationErrors.push(error.message));

    // Re-navigate with listeners attached to capture errors from hydration.
    await gotoAndSettle(page, page.url());

    await test.expect(q.status("useStoreState calls")).not.toHaveText("0");
    await test
      .expect(q.status("useStoreStateObject calls"))
      .not.toHaveText("0");
    test.expect(hydrationErrors).toEqual([]);
  });

  test("runs selectors only for subscribed keys", async ({ q }) => {
    const stateCalls = await q.status("useStoreState calls").innerText();
    const objectCalls = await q.status("useStoreStateObject calls").innerText();
    const unkeyedCalls = await q.status("Unkeyed selector calls").innerText();
    const emptyCalls = await q.status("Empty selector calls").innerText();
    const emptyObjectCalls = await q
      .status("Empty object selector calls")
      .innerText();

    await test.expect(q.status("Optional value")).toHaveText("none");

    await q.button("Update bar").click();

    await test.expect(q.status("useStoreState calls")).toHaveText(stateCalls);
    await test
      .expect(q.status("useStoreStateObject calls"))
      .toHaveText(objectCalls);
    await test.expect(q.status("Empty selector calls")).toHaveText(emptyCalls);
    await test
      .expect(q.status("Empty object selector calls"))
      .toHaveText(emptyObjectCalls);
    await test
      .expect(q.status("Unkeyed selector calls"))
      .not.toHaveText(unkeyedCalls);
    await test.expect(q.status("Direct bar")).toHaveText("1");
    await test.expect(q.status("Mixed direct bar")).toHaveText("1");
    await test.expect(q.status("Mixed doubled foo")).toHaveText("0");
    await test.expect(q.status("Runtime bar")).toHaveText("0");

    await q.button("Update foo").click();

    await test
      .expect(q.status("useStoreState calls"))
      .not.toHaveText(stateCalls);
    await test
      .expect(q.status("useStoreStateObject calls"))
      .not.toHaveText(objectCalls);
    await test.expect(q.status("Empty selector calls")).toHaveText(emptyCalls);
    await test
      .expect(q.status("Empty object selector calls"))
      .toHaveText(emptyObjectCalls);
    await test.expect(q.status("Selector value")).toHaveText("1");
    await test.expect(q.status("Object selector value")).toHaveText("1");
    await test.expect(q.status("Direct foo")).toHaveText("1");
    await test.expect(q.status("Mixed doubled foo")).toHaveText("2");
    await test.expect(q.status("Runtime bar")).toHaveText("1");

    await q.button("Use optional store").click();
    await test.expect(q.status("Optional value")).toHaveText("1");

    await q.button("Update foo").click();
    await test.expect(q.status("Optional value")).toHaveText("2");
  });

  test("updates dynamic selector dependencies", async ({ q }) => {
    const selectorValue = q.status("Dynamic selector value");
    const objectValue = q.status("Dynamic object selector value");

    await test.expect(selectorValue).toHaveText("foo:0");
    await test.expect(objectValue).toHaveText("foo:0");

    await q.button("Update bar").click();

    await test.expect(selectorValue).toHaveText("foo:0");
    await test.expect(objectValue).toHaveText("foo:0");

    await q.button("Subscribe to bar").click();

    await test.expect(selectorValue).toHaveText("bar:1");
    await test.expect(objectValue).toHaveText("bar:1");

    await q.button("Update foo").click();

    await test.expect(selectorValue).toHaveText("bar:1");
    await test.expect(objectValue).toHaveText("bar:1");

    await q.button("Update bar").click();

    await test.expect(selectorValue).toHaveText("bar:2");
    await test.expect(objectValue).toHaveText("bar:2");
  });
});
