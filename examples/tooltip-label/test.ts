import { click, hover, q, waitFor } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(q.tooltip("Bold")).not.toBeInTheDocument();
  await hover(q.button("Bold"));
  await waitFor(() => expect(q.tooltip("Bold")).toBeVisible());
  await hoverOutside();
  expect(q.tooltip("Bold")).not.toBeInTheDocument();
});

test("do not hide tooltip on click", async () => {
  await hover(q.button("Bold"));
  await waitFor(() => expect(q.tooltip("Bold")).toBeVisible());
  await click(q.button("Bold"));
  expect(q.tooltip("Bold")).toBeVisible();
  await hoverOutside();
  expect(q.tooltip("Bold")).not.toBeInTheDocument();
});
