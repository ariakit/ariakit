import { click, hover, press, q, waitFor } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(q.tooltip()).not.toBeInTheDocument();
  await hover(q.link());
  await waitFor(() => expect(q.tooltip()).toBeVisible());
  await hoverOutside();
  expect(q.tooltip()).toBeVisible();
  await waitFor(() => expect(q.tooltip()).not.toBeInTheDocument());
});

test("show tooltip on focus", async () => {
  expect(q.tooltip()).not.toBeInTheDocument();
  await press.Tab();
  expect(q.tooltip()).toBeVisible();
  await click(document.body);
  expect(q.tooltip()).toBeVisible();
  await waitFor(() => expect(q.tooltip()).not.toBeInTheDocument());
});

test("click on tooltip and press esc", async () => {
  expect(q.tooltip()).not.toBeInTheDocument();
  await hover(q.link());
  await waitFor(() => expect(q.tooltip()).toBeVisible());
  await click(q.tooltip()!);
  expect(q.tooltip()).toBeVisible();
  await press.Escape();
  expect(q.link()).toHaveFocus();
  await waitFor(() => expect(q.tooltip()).not.toBeInTheDocument());
});
