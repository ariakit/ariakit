import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("restores data-enter after a no-transition close", async ({ q }) => {
    const section = q.region("No transition");
    const withinSection = query(section);
    const content = withinSection.text("No transition content");

    await test.expect(content).toBeHidden();
    await test.expect(section).toHaveAttribute("data-animated-state", "true");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeHidden();
    await test.expect(content).not.toHaveAttribute("data-enter");
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");

    await withinSection.button("Toggle No transition").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
  });

  test("unmounts immediately after no-transition enter detection", async ({
    q,
  }) => {
    const section = q.region("Unmount on hide");
    const withinSection = query(section);
    const content = withinSection.text("Unmounted no transition content");

    await test.expect(content).not.toBeAttached();

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await withinSection.button("Toggle Unmount on hide").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
  });

  test("keeps unmountOnHide content mounted for numeric timeouts", async ({
    q,
  }) => {
    const section = q.region("Timed unmount");
    const withinSection = query(section);
    const content = withinSection.text("Timed unmount content");

    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-animated-state", "1000");

    await withinSection.button("Toggle Timed unmount").click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animated-state", "1000");

    await withinSection.button("Toggle Timed unmount").click();
    await test.expect(content).toBeAttached();
    await test.expect(content).toHaveAttribute("data-leave", "true");
    await test.expect(section).toHaveAttribute("data-mounted-state", "true");
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
  });

  // See https://github.com/ariakit/ariakit/issues/6220
  test("unmounts at the longest per-property end time, not max delay + max duration", async ({
    q,
    page,
  }) => {
    const section = q.region("Mixed transition and animation");
    const withinSection = query(section);
    const content = withinSection.text("Animated content");
    const toggle = withinSection.button(
      "Toggle Mixed transition and animation",
    );

    await test.expect(content).not.toBeAttached();

    await toggle.click();
    await test.expect(content).toBeVisible();
    await test.expect(content).toHaveAttribute("data-enter", "true");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    // Hide it and measure how long the content stays mounted. The content has
    // a transition (delay 500ms + duration 10ms = ends at 510ms; see
    // style.css) and a leave animation (delay 0ms + duration 300ms = ends at
    // 300ms), so the longest per-property end time is 510ms. The buggy timeout
    // was max(delays) + max(durations) = 500 + 300 = 800ms, keeping the
    // content mounted ~290ms too long. We measure the unmount delay in the
    // browser because it's the only precise, user-observable signal for "the
    // content stays mounted too long"; Playwright command latency is too coarse
    // to tell 510ms from 800ms.
    const unmountDelay = await page.evaluate(async () => {
      const region = document.querySelector(
        '[aria-label="Mixed transition and animation"]',
      );
      if (!region) {
        throw new Error("Region not found");
      }
      const button = region.querySelector("button");
      if (!button) {
        throw new Error("Toggle button not found");
      }
      return await new Promise<number>((resolve) => {
        let start = 0;
        const observer = new MutationObserver(() => {
          if (!region.querySelector(".content")) {
            observer.disconnect();
            resolve(performance.now() - start);
          }
        });
        observer.observe(region, { childList: true, subtree: true });
        start = performance.now();
        button.click();
      });
    });

    // The content should unmount close to 510ms, not 800ms. 700ms sits well
    // between the two so the assertion fails on the buggy timeout and passes
    // on the fix, with margin for setTimeout/requestAnimationFrame jitter.
    test.expect(unmountDelay).toBeLessThan(700);
    // Sanity check: it still waited for the real animation rather than
    // unmounting immediately.
    test.expect(unmountDelay).toBeGreaterThan(400);

    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
  });

  // See https://github.com/ariakit/ariakit/issues/6220
  test("treats a duration with animation-name: none as no animation", async ({
    q,
  }) => {
    const section = q.region("No animation with duration");
    const withinSection = query(section);
    const content = withinSection.text("No animation content");
    const toggle = withinSection.button("Toggle No animation with duration");

    await test.expect(content).not.toBeAttached();

    await toggle.click();
    await test.expect(content).toBeVisible();
    await test.expect(section).toHaveAttribute("data-animated-state", "false");
    await test.expect(section).toHaveAttribute("data-animating-state", "false");

    await toggle.click();
    await test.expect(content).not.toBeAttached();
    await test.expect(section).toHaveAttribute("data-mounted-state", "false");
  });
});
