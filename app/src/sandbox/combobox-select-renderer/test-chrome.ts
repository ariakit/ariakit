import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3913
  test("updates items when an initially empty scroller gains overflow", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    // The empty renderer connects the explicit ref in passive effects, but
    // exposes no rendered item that can signal when those effects finish.
    await flushFrames(page);
    await q.button("Load async items").click();
    await test.expect(asyncOptions.option("Async item 1")).toBeVisible();

    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });

    await test
      .expect(q.status("Async scroll status"))
      .toHaveText("Scroll observed: yes");
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3913
  test("disables viewport updates when the scroll element is null", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    // The empty renderer connects the explicit ref in passive effects, but
    // exposes no rendered item that can signal when those effects finish.
    await flushFrames(page);
    await q.button("Load async items").click();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

    await q.button("Disable scroll element and double item size").click();
    // Disabling viewport updates intentionally leaves the rendered window
    // unchanged, so wait through the passive update before asserting that
    // absence of change.
    await flushFrames(page);

    await test.expect(asyncOptions.option("Async item 51")).toHaveCount(1);
    await test.expect(asyncOptions.option("Async item 26")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/issues/3913
  test("disables viewport updates when a scroll element ref resolves to null", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Async items");
    const asyncOptions = query(scroller);

    await q.button("Connect scroll element").click();
    // The empty renderer connects the explicit ref in passive effects, but
    // exposes no rendered item that can signal when those effects finish.
    await flushFrames(page);
    await q.button("Load async items").click();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await test.expect(asyncOptions.option("Async item 51")).toBeVisible();

    await q.button("Disconnect scroll element and double item size").click();
    // Disconnecting viewport updates intentionally leaves the rendered window
    // unchanged, so wait through the passive update before asserting that
    // absence of change.
    await flushFrames(page);

    await test.expect(asyncOptions.option("Async item 51")).toHaveCount(1);
    await test.expect(asyncOptions.option("Async item 26")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633347050
  test("auto-detects the scroller for omitted nested renderers", async ({
    q,
  }) => {
    const scroller = q.listbox("Nested auto items");
    const nestedOptions = query(scroller);

    await test.expect(nestedOptions.option("Async item 1")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });

    await test.expect(nestedOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633348139
  test("accepts a direct scroll element with a current property", async ({
    page,
    q,
  }) => {
    const scroller = q.listbox("Direct element items");
    const directOptions = query(scroller);

    await test.expect(directOptions.option("Async item 1")).toBeVisible();
    await q.button("Use direct scroll element").click();
    // The renderer accepts the direct element in passive effects, but the
    // rendered window stays unchanged until the subsequent scroll.
    await flushFrames(page);
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });

    await test.expect(directOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3633901198
  test("resolves an ancestor ref after the initial commit", async ({ q }) => {
    const scroller = q.listbox("Initial ref items");
    const initialRefOptions = query(scroller);

    await test.expect(initialRefOptions.option("Async item 1")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });

    await test.expect(initialRefOptions.option("Async item 51")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/6806#discussion_r3635028432
  test("revalidates an inherited scroll target before passive updates", async ({
    q,
  }) => {
    const scroller = q.listbox("Inherited target items");
    const inheritedOptions = query(scroller);
    const mountedItems = q.status("Inherited target mounts");

    await test.expect(inheritedOptions.option("Async item 1")).toBeVisible();
    await scroller.evaluate((element) => {
      element.scrollTop = 2000;
      element.dispatchEvent(new Event("scroll"));
    });
    await test.expect(inheritedOptions.option("Async item 51")).toBeVisible();

    await q.button("Clear inherited target mount log").click();
    await test.expect(mountedItems).toHaveText("Mounted items: none");
    await q.button("Use inner scroll element and update child class").click();

    await test.expect(mountedItems).toContainText(/Async item 2(?:,|$)/);
    await test.expect(mountedItems).not.toContainText(/Async item 49(?:,|$)/);

    await q.button("Clear inherited target mount log").click();
    await test.expect(mountedItems).toHaveText("Mounted items: none");
    await q.button("Use outer scroll element and increase overscan").click();

    await test.expect(mountedItems).toContainText(/Async item 51(?:,|$)/);
    await test.expect(mountedItems).not.toContainText(/Async item 5(?:,|$)/);
  });

  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

      // https://github.com/ariakit/ariakit/pull/6806#discussion_r3635526619
      test("releases the explicit scroll target in automatic mode", async ({
        page,
        q,
      }) => {
        const status = q.status("Controller lifetime status");
        await test.expect(status).toContainText("Explicit target ready: yes");

        await q.button("Use automatic scroll element").click();
        for (let revision = 1; revision <= 6; revision += 1) {
          await q.button("Rerender lifetime probe").click();
          await test.expect(status).toContainText(`Revision: ${revision}`);
        }

        const cdp = await page.context().newCDPSession(page);
        await cdp.send("HeapProfiler.collectGarbage");
        await q.button("Check released scroll element").click();

        await test.expect(status).toContainText("Released: yes");
      });
    });
  }
});
