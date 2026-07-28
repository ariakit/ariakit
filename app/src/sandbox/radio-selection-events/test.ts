import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("selects basic radios by click", async () => {
  const apple = q.radio("Basic apple");
  const orange = q.radio("Basic orange");
  const watermelon = q.radio("Basic watermelon");
  expect(apple).toHaveAttribute("aria-checked", "false");
  expect(orange).toHaveAttribute("aria-checked", "false");
  expect(watermelon).toHaveAttribute("aria-checked", "false");

  await click(apple);
  expect(apple).toBeChecked();
  expect(orange).not.toBeChecked();
  expect(watermelon).not.toBeChecked();

  await click(watermelon);
  expect(apple).not.toBeChecked();
  expect(watermelon).toBeChecked();
});

test("focuses and selects the first radio with Tab and Space", async () => {
  const apple = q.radio("Basic apple");
  await press.Tab();
  expect(apple).toHaveFocus();
  expect(apple).not.toBeChecked();
  await press.Space();
  expect(apple).toHaveFocus();
  expect(apple).toBeChecked();
});

for (const key of ["ArrowRight", "ArrowDown"] as const) {
  test(`moves forward with ${key}`, async () => {
    await press.Tab();
    await press(key);
    expect(q.radio("Basic orange")).toHaveFocus();
    expect(q.radio("Basic orange")).toBeChecked();
    await press(key);
    expect(q.radio("Basic orange")).not.toBeChecked();
    expect(q.radio("Basic watermelon")).toHaveFocus();
    expect(q.radio("Basic watermelon")).toBeChecked();
  });
}

for (const key of ["ArrowLeft", "ArrowUp"] as const) {
  test(`moves backward and wraps with ${key}`, async () => {
    await press.Tab();
    await press(key);
    expect(q.radio("Basic watermelon")).toHaveFocus();
    expect(q.radio("Basic watermelon")).toBeChecked();
    await press(key);
    expect(q.radio("Basic watermelon")).not.toBeChecked();
    expect(q.radio("Basic orange")).toHaveFocus();
    expect(q.radio("Basic orange")).toBeChecked();
  });
}

test("uses the checked default radio as the group tab stop", async () => {
  expect(q.radio("Default apple")).not.toBeChecked();
  expect(q.radio("Default orange")).toBeChecked();
  expect(q.radio("Default watermelon")).not.toBeChecked();

  await press.Tab();
  await press.Tab();
  expect(q.radio("Default orange")).toHaveFocus();
  await press.ArrowDown();
  expect(q.radio("Default watermelon")).toHaveFocus();
  expect(q.radio("Default watermelon")).toBeChecked();
  await press.ArrowDown();
  expect(q.radio("Default apple")).toHaveFocus();
  expect(q.radio("Default apple")).toBeChecked();
});

test("does not change a native radio when focus returns to it", async () => {
  await click(q.radio("Native apple"));
  expect(q.status("Native change count")).toHaveTextContent("1");
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.status("Native change count")).toHaveTextContent("3");
  await press.Tab();
  await press.ShiftTab();
  expect(q.status("Native change count")).toHaveTextContent("3");
});

test("does not change an already checked custom radio", async () => {
  await click(q.radio("Custom apple"));
  expect(q.status("Custom change count")).toHaveTextContent("1");
  await click(q.radio("Custom apple"));
  expect(q.status("Custom change count")).toHaveTextContent("1");
});
