import { click, hover, q } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

afterEach(async () => {
  await hoverOutside();
});

test("show/hide tooltip on hover", async () => {
  await hover(q.button("Accessibility Shortcuts"));
  expect(await q.tooltip.wait()).toBeVisible();
  await hoverOutside();
  expect(q.tooltip()).not.toBeInTheDocument();
});

test("hide tooltip by clicking on menu button", async () => {
  await hover(q.button("Accessibility Shortcuts"));
  expect(await q.tooltip.wait()).toBeVisible();
  await click(q.button("Accessibility Shortcuts"));
  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  expect(q.tooltip()).not.toBeInTheDocument();
});
