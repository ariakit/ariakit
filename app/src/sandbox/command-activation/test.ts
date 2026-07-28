import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders an accessible command in the tab order", async () => {
  const command = q.text("Default command");
  expect(command).toHaveAttribute("role", "button");
  expect(command).toHaveAttribute("tabindex", "0");
  await press.Tab();
  expect(command).toHaveFocus();
});

test("activates the default command with Enter and Space", async () => {
  await focus(q.text("Default command"));
  await press.Enter();
  expect(q.status("Default activations")).toHaveTextContent("1");
  await press.Space();
  expect(q.status("Default activations")).toHaveTextContent("2");
});

test("disables only Enter activation", async () => {
  await focus(q.text("Enter disabled"));
  await press.Enter();
  expect(q.status("Enter disabled activations")).toHaveTextContent("0");
  await press.Space();
  expect(q.status("Enter disabled activations")).toHaveTextContent("1");
});

test("disables only Space activation", async () => {
  await focus(q.text("Space disabled"));
  await press.Enter();
  expect(q.status("Space disabled activations")).toHaveTextContent("1");
  await press.Space();
  expect(q.status("Space disabled activations")).toHaveTextContent("1");
});
