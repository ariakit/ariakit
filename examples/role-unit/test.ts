import { click, q } from "@ariakit/test";

test("render", async () => {
  expect(q.group("render")).toMatchInlineSnapshot(`
    <div
      aria-label="render"
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
