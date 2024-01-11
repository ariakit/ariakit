import { click, hover, press, q } from "@ariakit/test";

const tooltip = "https://ariakit.org/components/tooltip";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

afterEach(async () => {
  await hoverOutside();
});

test("show tooltip on hover", async () => {
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hover(q.link());
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await hoverOutside();
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
});

test("do not wait to show the tooltip if it was just hidden", async () => {
  await hover(q.link());
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await hoverOutside();
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hover(q.link());
  expect(q.tooltip(tooltip)).toBeVisible();
});

test("if tooltip was shown on hover, then the anchor received keyboard focus, do not hide on mouseleave", async () => {
  await hover(q.link());
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await press.Tab();
  expect(q.tooltip(tooltip)).toBeVisible();
  await hoverOutside();
  expect(q.tooltip(tooltip)).toBeVisible();
});

test("if tooltip was shown on focus visible, do not hide on mouseleave", async () => {
  await press.Tab();
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await hoverOutside();
  expect(q.tooltip(tooltip)).toBeVisible();
  await hover(q.link());
  expect(q.tooltip(tooltip)).toBeVisible();
  await hoverOutside();
  expect(q.tooltip(tooltip)).toBeVisible();
});

test("click on tooltip and press esc", async () => {
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hover(q.link());
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await click(q.tooltip(tooltip)!);
  expect(q.tooltip(tooltip)).toBeVisible();
  await press.Escape();
  expect(q.link()).toHaveFocus();
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
});

test("show tooltip on focus", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await press.Tab();
  expect(q.tooltip(tooltip)).toBeVisible();
  await press.Tab();
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();

  div.remove();
});

test("do not show tooltip immediately if focus was lost", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  await hover(q.link());
  expect(await q.tooltip.wait(tooltip)).toBeVisible();
  await press.Tab();
  await press.Tab();
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  await hoverOutside();
  await hover(q.link());
  expect(q.tooltip(tooltip)).not.toBeInTheDocument();
  expect(await q.tooltip.wait(tooltip)).toBeVisible();

  div.remove();
});
