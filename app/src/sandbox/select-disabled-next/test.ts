import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("closed select does not move to a disabled item", async () => {
  await press.Tab();

  expect(q.combobox.ensure("Single disabled fruit")).toHaveFocus();
  expect(
    q.status.ensure("Single disabled fruit active item"),
  ).toHaveTextContent("None");
  expect(q.status.ensure("Single disabled fruit value")).toHaveTextContent(
    "None",
  );
  expect(
    q.status.ensure("Single disabled fruit item disabled"),
  ).toHaveTextContent("true");
  expect(
    q.status.ensure("Single disabled fruit rendered disabled"),
  ).toHaveTextContent("false");

  await press.ArrowDown();

  expect(
    q.status.ensure("Single disabled fruit active item"),
  ).toHaveTextContent("None");
  expect(q.status.ensure("Single disabled fruit value")).toHaveTextContent(
    "None",
  );
});

test("closed select skips controlled disabled items", async () => {
  await press.Tab();
  await press.Tab();

  expect(q.combobox.ensure("Mixed fruit")).toHaveFocus();
  expect(q.status.ensure("Mixed fruit active item")).toHaveTextContent("None");
  expect(q.status.ensure("Mixed fruit value")).toHaveTextContent("None");
  expect(q.status.ensure("Mixed fruit item disabled")).toHaveTextContent(
    "true",
  );
  expect(q.status.ensure("Mixed fruit rendered disabled")).toHaveTextContent(
    "false",
  );

  await press.ArrowDown();

  expect(q.status.ensure("Mixed fruit active item")).toHaveTextContent(
    "orange",
  );
  expect(q.status.ensure("Mixed fruit value")).toHaveTextContent("Orange");

  await press.ArrowUp();

  expect(q.status.ensure("Mixed fruit active item")).toHaveTextContent(
    "orange",
  );
  expect(q.status.ensure("Mixed fruit value")).toHaveTextContent("Orange");
});

test("closed select skips valueless items", async () => {
  await press.Tab();
  await press.Tab();
  await press.Tab();

  expect(q.combobox.ensure("Valueless fruit")).toHaveFocus();
  expect(q.status.ensure("Valueless fruit active item")).toHaveTextContent(
    "None",
  );
  expect(q.status.ensure("Valueless fruit value")).toHaveTextContent("None");

  await press.ArrowDown();

  expect(q.status.ensure("Valueless fruit active item")).toHaveTextContent(
    "pear",
  );
  expect(q.status.ensure("Valueless fruit value")).toHaveTextContent("Pear");
});
