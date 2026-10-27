import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("marks every section in order when the body scrolls", async ({ q }) => {
    const nav = q.navigation("On this page");
    // Scroll the body in small steps, as a wheel does, and read the current
    // link after the frame that updates it.
    const seen = await nav.evaluate(async (element) => {
      const { body } = document;
      const names: string[] = [];
      const max = body.scrollHeight - body.clientHeight;
      for (let top = 0; top <= max + 8; top += 8) {
        body.scrollTop = top;
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const name = element.querySelector("[aria-current]")?.textContent;
        if (name && names.at(-1) !== name) {
          names.push(name);
        }
      }
      return names;
    });
    // The short final sections become current as the activation line slides
    // down at the end of the body.
    test
      .expect(seen)
      .toEqual(["Overview", "Usage", "Styling", "Notes", "Credits"]);
    await test
      .expect(query(nav).link("Credits"))
      .toHaveAttribute("aria-current", "location");
  });
});
