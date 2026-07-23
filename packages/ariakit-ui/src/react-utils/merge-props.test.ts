import { expect, test, vi } from "vitest";
import { mergeProps } from "./merge-props.ts";

test("keeps the base className when the override is an own undefined", () => {
  const props = mergeProps({ className: "base" }, { className: undefined });
  expect(props.className).toBe("base");
});

test("concatenates base and override classNames", () => {
  const props = mergeProps({ className: "base" }, { className: "override" });
  expect(props.className).toBe("base override");
});

test("uses the override className when the base has none", () => {
  const props = mergeProps({}, { className: "override" });
  expect(props.className).toBe("override");
});

test("keeps the base handler when the override is an own undefined", () => {
  const onClick = vi.fn();
  const props = mergeProps({ onClick }, { onClick: undefined });
  expect(props.onClick).toBe(onClick);
});

test("runs the override handler before the base handler", () => {
  const calls: string[] = [];
  const props = mergeProps(
    { onClick: () => calls.push("base") },
    { onClick: () => calls.push("override") },
  );
  props.onClick?.();
  expect(calls).toEqual(["override", "base"]);
});
