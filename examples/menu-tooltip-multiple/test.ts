import { click, hover, press, q } from "@ariakit/test";

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

const labels = [
  "default",
  "portal",
  "modal",
  "unmount portal",
  "unmount modal",
] as const;

const nonModalLabels = labels.filter((label) => !label.includes("modal"));

afterEach(async () => {
  await hoverOutside();
});

describe.each(labels)("%s", (label) => {
  test("show/hide tooltip on hover", async () => {
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await hoverOutside();
    expect(q.presentation(label)).not.toBeInTheDocument();
  });

  test("hide tooltip by clicking on menu button", async () => {
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.menu(label)).toHaveFocus();
    expect(q.presentation(label)).not.toBeInTheDocument();
  });

  test("do not show tooltip on hover after clicking on menu button", async () => {
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.presentation(label)).not.toBeInTheDocument();
    await hover(q.button.includesHidden(label));
    await hover(q.button.includesHidden(label));
    expect(q.presentation(label)).not.toBeInTheDocument();
  });

  test("but show tooltip on hover after clicking on menu button and then hovering outside unless it's modal", async () => {
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.presentation(label)).not.toBeInTheDocument();
    await hoverOutside();
    await hover(q.button.includesHidden(label));
    await hover(q.button.includesHidden(label));
    if (label.includes("modal")) {
      expect(q.presentation(label)).not.toBeInTheDocument();
    } else {
      expect(await q.presentation.wait(label)).toBeVisible();
    }
  });

  test("show tooltip again after closing menu with esc", async () => {
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    await press.Escape();
    expect(q.menu(label)).not.toBeInTheDocument();
    expect(await q.presentation.wait(label)).toBeVisible();
  });
});

describe.each(nonModalLabels)("%s", (label) => {
  test("tooltip closes when re-opening the menu", async () => {
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.presentation(label)).not.toBeInTheDocument();
    await hoverOutside();
    await hover(q.button(label));
    expect(await q.presentation.wait(label)).toBeVisible();
    await click(q.button(label));
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.presentation(label)).not.toBeInTheDocument();
  });
});
