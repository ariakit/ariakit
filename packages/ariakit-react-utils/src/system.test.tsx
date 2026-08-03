import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { createElement, createHook, forwardRef } from "./system.tsx";
import type { Props } from "./types.ts";

interface LevelOptions {
  level?: string;
}

// This pair reproduces the shape every component hook chain uses: the inner
// hook owns the prop and its fallback, while the outer hook computes a value
// for a prop it doesn't destructure and then lets the caller's props win by
// spreading them last.
const useInner = createHook<"div", LevelOptions>(function useInner({
  level = "inner-default",
  ...props
}) {
  return { ...props, "data-level": level };
});

const useOuter = createHook<"div", LevelOptions>(function useOuter(props) {
  return useInner({ level: "outer-computed", ...props });
});

// Ariakit's own `forwardRef` passes the ref as a prop, so the rule's expected
// parameter never applies.
// oxlint-disable-next-line forward-ref-uses-ref
const Outer = forwardRef(function Outer(props: Props<"div", LevelOptions>) {
  return createElement("div", useOuter(props));
});

function getLevel(element: ReactElement) {
  return renderToStaticMarkup(element).match(/data-level="([^"]*)"/)?.[1];
}

test("an explicitly undefined prop falls through to the computed default", () => {
  expect(getLevel(<Outer level={undefined} />)).toBe("outer-computed");
});

test("an omitted prop falls through to the computed default", () => {
  expect(getLevel(<Outer />)).toBe("outer-computed");
});

test("an explicitly defined prop still overrides the computed default", () => {
  expect(getLevel(<Outer level="caller" />)).toBe("caller");
});
