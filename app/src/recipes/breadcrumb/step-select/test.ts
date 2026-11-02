import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("lists the neighbors and marks the current one", async () => {
  await click(q.combobox("Switch section"));
  expect(q.option("Projects")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Areas")).toHaveAttribute("href", "#areas");
  expect(q.option("Reading list")).toHaveAttribute("href", "#reading-list");
});

test("changes the current step when choosing a neighbor with the keyboard", async () => {
  q.combobox("Switch section").focus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.option.maybe("Areas")).not.toBeInTheDocument();
  expect(q.navigation("Breadcrumb")).toHaveTextContent("Areas");
  expect(q.combobox("Switch section")).toHaveFocus();
});

// A default value would change here without leaving the page.
test("keeps the current step when typing on the closed button", async () => {
  q.combobox("Switch section").focus();
  await type("a");
  expect(q.navigation("Breadcrumb")).toHaveTextContent("Projects");
  expect(q.navigation("Breadcrumb")).not.toHaveTextContent("Areas");
  await press.ArrowDown();
  expect(q.option("Projects")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Areas")).toHaveAttribute("aria-selected", "false");
});
