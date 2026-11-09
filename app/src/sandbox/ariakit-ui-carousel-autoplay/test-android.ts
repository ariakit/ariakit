import { withFramework } from "#app/test-utils/preview.ts";
import { expectMove, expectNoMove } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A touch that pans the row ends its pointer at once, so only touch events
  // keep autoplay paused while the finger rests on the row. Playwright has no
  // touch pan, so the test sends touch events to Chromium, which pans the row
  // natively.
  test("pauses while a finger rests on the row", async ({
    context,
    page,
    q,
  }) => {
    const region = q.region("People");
    await region.scrollIntoViewIfNeeded();
    const box = await region.boundingBox();
    if (!box) throw new Error("The carousel has no box");
    const session = await context.newCDPSession(page);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 3;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    // The pan stays under half a slide, so the slides that show don't change.
    for (let step = 1; step <= 4; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - step * 15, y }],
      });
    }
    await expectNoMove(page, region);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expectMove(region);
  });

  test("plays again after its finger lifts before one outside", async ({
    context,
    page,
    q,
  }) => {
    const region = q.region("People");
    await region.scrollIntoViewIfNeeded();
    const box = await region.boundingBox();
    const outsideBox = await q.heading("Several").boundingBox();
    if (!box || !outsideBox) throw new Error("A target has no box");
    const session = await context.newCDPSession(page);
    const inside = {
      id: 0,
      x: box.x + box.width / 2,
      y: box.y + box.height / 3,
    };
    const outside = {
      id: 1,
      x: outsideBox.x + outsideBox.width / 2,
      y: outsideBox.y + outsideBox.height / 2,
    };
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [outside],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [outside, inside],
    });
    // A touch end lifts the fingers in the order of their ids, so the one on
    // the carousel lifts while the one outside still touches the screen.
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expectMove(region);
  });
});
