import { click, hover, press, q, waitFor } from "@ariakit/test";

const tooltip = "https://ariakit.org/examples/tooltip-framer-motion";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hover(q.link());
  await waitFor(() => expect(q.tooltip(tooltip)).toBeVisible());
  await hoverOutside();
  expect(q.tooltip(tooltip)).toBeVisible();
  await waitFor(() => expect(q.tooltip(tooltip)).not.toBeInTheDocument());
});

test("show tooltip on focus", async () => {
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await press.Tab();
  expect(q.tooltip(tooltip)).toBeVisible();
  await click(document.body);
  expect(q.tooltip(tooltip)).toBeVisible();
  await waitFor(() => expect(q.tooltip(tooltip)).not.toBeInTheDocument());
});

test("click on tooltip and press esc", async () => {
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hover(q.link());
  await waitFor(() => expect(q.tooltip(tooltip)).toBeVisible());
  await click(q.tooltip(tooltip)!);
  expect(q.tooltip(tooltip)).toBeVisible();
  await press.Escape();
  expect(q.link()).toHaveFocus();
  await waitFor(() => expect(q.tooltip(tooltip)).not.toBeInTheDocument());
});
