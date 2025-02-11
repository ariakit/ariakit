import { click, q } from "@ariakit/test";

test("render as", async () => {
  expect(q.group("render-as")).toMatchInlineSnapshot(`
    <div
      aria-label="render-as"
      role="group"
    >
      <div>
        1
      </div>
      <p>
        2
      </p>
      <span
        data-inner="true"
        data-outer="true"
      >
        3
      </span>
      <button
        aria-label="merged2"
        class="outer inner"
        data-both="inner"
        data-inner="true"
        data-outer="true"
        style="--outer: value; --inner: value;"
      >
        4 (inner)
      </button>
      <button
        aria-label="values2"
      />
      <button
        aria-label="merged3"
        class="top middle bottom"
        data-both="bottom"
        data-inner="true"
        data-middle="true"
        data-outer="true"
        style="--top: value; --middle: value; --bottom: value;"
      >
        5 (bottom)
      </button>
      <button
        aria-label="values3"
      />
    </div>
  `);

  expect(q.button("values2")?.textContent).toMatchInlineSnapshot(`""`);
  await click(q.button("merged2"));
  expect(q.button("values2")?.textContent).toMatchInlineSnapshot(
    `"inner, outer"`,
  );

  expect(q.button("values3")?.textContent).toMatchInlineSnapshot(`""`);
  await click(q.button("merged3"));
  expect(q.button("values3")?.textContent).toMatchInlineSnapshot(
    `"bottom, middle, top"`,
  );
});

test("dynamically render as", async () => {
  // TODO [port]: doesn't work in Solid yet.
  const qq = q.within(q.group("dynamic-render-as"));

  expect(qq.text("Dynamic component render")?.tagName).toBe("P");
  await click(qq.button("Toggle dynamic"));
  expect(qq.text("Dynamic component render")?.tagName).toBe("SPAN");
  await click(qq.button("Toggle dynamic"));
  expect(qq.text("Dynamic component render")?.tagName).toBe("P");
});

// TODO:
// - test render function
// - test wrapElement
