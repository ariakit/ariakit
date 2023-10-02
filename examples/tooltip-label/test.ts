import { click, hover, q, waitFor } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(q.text("Bold")).not.toBeVisible();
  await hover(q.button("Bold"));
  await waitFor(() => expect(q.text("Bold")).toBeVisible());
  await hoverOutside();
  expect(q.text("Bold")).not.toBeVisible();
});

test("do not hide tooltip on click", async () => {
  await hover(q.button("Bold"));
  await waitFor(() => expect(q.text("Bold")).toBeVisible());
  await click(q.button("Bold"));
  expect(q.text("Bold")).toBeVisible();
  await hoverOutside();
  expect(q.text("Bold")).not.toBeVisible();
});
