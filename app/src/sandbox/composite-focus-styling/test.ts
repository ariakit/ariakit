import { click, focus, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("supplements virtual keyboard focus and clears on blur", async () => {
  const bold = q.button("Virtual Bold");
  const italic = q.button("Virtual Italic");
  expect(bold).toHaveAttribute("data-active-item");
  expect(bold).not.toHaveAttribute("data-focus");
  await focus(bold);
  expect(document.activeElement).toBe(q.toolbar("Virtual"));
  expect(bold).toHaveAttribute("data-focus", "true");
  await press.ArrowRight();
  expect(italic).toHaveAttribute("data-focus", "true");
  expect(bold).not.toHaveAttribute("data-focus");
  await press.Tab();
  expect(q.button("Remember Virtual Bold")).toHaveFocus();
  expect(italic).not.toHaveAttribute("data-focus");
  expect(italic).toHaveAttribute("data-active-item");
});

test("uses native CSS for DOM focus", async () => {
  const bold = q.button("Native Bold");
  await focus(bold);
  expect(document.activeElement).toBe(bold);
  expect(bold).not.toHaveAttribute("data-focus");
  await press.ArrowRight();
  expect(document.activeElement).toBe(q.button("Native Italic"));
  expect(q.button("Native Italic")).not.toHaveAttribute("data-focus");
});

for (const name of ["Native", "Virtual"]) {
  test(`supplements ${name} hover focus`, async () => {
    await click(q.button("Outside"));
    const bold = q.button(`${name} Bold`);
    const italic = q.button(`${name} Italic`);
    await hover(bold);
    expect(document.activeElement).toBe(q.toolbar(name));
    expect(bold).toHaveAttribute("data-focus", "true");
    await hover(italic);
    expect(italic).toHaveAttribute("data-focus", "true");
    expect(bold).not.toHaveAttribute("data-focus");
    await hover(q.button("Outside"));
    expect(italic).not.toHaveAttribute("data-focus");
    expect(italic).not.toHaveAttribute("data-active-item");
  });

  test(`does not treat remembered ${name} activity as focus`, async () => {
    const button = q.button(`Remember ${name} Bold`);
    await click(button);
    expect(button).toHaveFocus();
    expect(q.button(`${name} Bold`)).toHaveAttribute("data-active-item");
    expect(q.button(`${name} Bold`)).not.toHaveAttribute("data-focus");
  });
}

test("preserves focus styling on rerender and clears it on item removal", async () => {
  const bold = q.button("Virtual Bold");
  await focus(bold);
  expect(bold).toHaveAttribute("data-focus", "true");
  await press("F2");
  expect(q.text("Virtual revision: 1")).toBeVisible();
  expect(bold).toHaveAttribute("data-focus", "true");
  await press.Delete();
  expect(bold).not.toBeInTheDocument();
  expect(bold).not.toHaveAttribute("data-focus");
  expect(document.activeElement).toBe(q.toolbar("Virtual"));
});

test("clears focus styling when composite behavior is disabled", async () => {
  const bold = q.button("Virtual Bold");
  await focus(bold);
  expect(bold).toHaveAttribute("data-focus", "true");
  await press.Escape();
  expect(bold).not.toHaveAttribute("data-focus");
  expect(bold).toHaveAttribute("data-active-item");
});

test("styles a portalled combobox item while the input retains DOM focus", async () => {
  const input = q.combobox("Fruit");
  await click(input);
  await press.ArrowDown();
  const apple = q.option("Apple");
  expect(apple).toHaveAttribute("data-focus", "true");
  expect(document.activeElement).toBe(input);
  expect(input).not.toHaveAttribute("data-focus");
  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(orange).toHaveAttribute("data-focus", "true");
  expect(apple).not.toHaveAttribute("data-focus");
  await click(q.button("Outside"));
  expect(orange).not.toHaveAttribute("data-focus");
});
