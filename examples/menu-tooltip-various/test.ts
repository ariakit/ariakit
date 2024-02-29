import { click, hover, press, q, sleep, type } from "@ariakit/test";

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
    expect(await q.tooltip.wait(label)).toBeVisible();
    await hoverOutside();
    expect(q.tooltip(label)).not.toBeInTheDocument();
  });

  test("hide tooltip by clicking on menu button", async () => {
    await hover(q.button(label));
    expect(await q.tooltip.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.menu(label)).toHaveFocus();
    expect(q.tooltip(label)).not.toBeInTheDocument();
  });

  test("do not show tooltip on hover after clicking on menu button", async () => {
    await hover(q.button(label));
    expect(await q.tooltip.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.tooltip(label)).not.toBeInTheDocument();
    await hover(q.button.includesHidden(label));
    await hover(q.button.includesHidden(label));
    expect(q.tooltip(label)).not.toBeInTheDocument();
  });

  test("but show tooltip on hover after clicking on menu button and then hovering outside unless it's modal", async () => {
    await hover(q.button(label));
    expect(await q.tooltip.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.tooltip(label)).not.toBeInTheDocument();
    await hoverOutside();
    await hover(q.button.includesHidden(label));
    await hover(q.button.includesHidden(label));
    if (label.includes("modal")) {
      expect(q.tooltip(label)).not.toBeInTheDocument();
    } else {
      expect(await q.tooltip.wait(label)).toBeVisible();
    }
  });

  test("show tooltip again after closing menu with esc", async () => {
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    await press.Escape();
    expect(q.menu(label)).not.toBeInTheDocument();
    expect(await q.tooltip.wait(label)).toBeVisible();
  });
});

describe.each(nonModalLabels)("%s", (label) => {
  test("tooltip closes when re-opening the menu", async () => {
    await hover(q.button(label));
    expect(await q.tooltip.wait(label)).toBeVisible();
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.tooltip(label)).not.toBeInTheDocument();
    await hoverOutside();
    await hover(q.button(label));
    expect(await q.tooltip.wait(label)).toBeVisible();
    await click(q.button(label));
    await click(q.button(label));
    expect(q.menu(label)).toBeVisible();
    expect(q.tooltip(label)).not.toBeInTheDocument();
  });

  describe("with timeout", () => {
    beforeEach(async () => {
      await click(q.textbox("Timeout"));
      await type("200");
      expect(q.textbox("Timeout")).toHaveValue("200");
    });

    test("do not show tooltip with timeout after clicking on menu button before the tooltip is shown", async () => {
      await hover(q.button(label));
      expect(q.tooltip(label)).not.toBeInTheDocument();
      await click(q.button(label));
      expect(q.menu(label)).toBeVisible();
      expect(q.tooltip(label)).not.toBeInTheDocument();
      await hover(q.button(label), { movementX: 10, movementY: 10 });
      await sleep(200);
      expect(q.tooltip(label)).not.toBeInTheDocument();
      // Can show tooltip after the mouse re-enters the anchor.
      await hoverOutside();
      await hover(q.button(label));
      expect(q.tooltip(label)).not.toBeInTheDocument();
      expect(await q.tooltip.wait(label)).toBeVisible();
    });
  });
});
