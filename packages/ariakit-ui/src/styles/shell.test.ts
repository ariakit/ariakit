import { expect, test } from "vitest";
import { frame } from "./frame.ts";
import {
  getShellBlurStep,
  shell,
  shellBleed,
  shellFooter,
  shellHeader,
  shellHeaderCenter,
  shellHeaderEnd,
  shellHeaderStart,
  shellMain,
  shellSidebar,
  shellSidebarBackdrop,
  shellSidebarBody,
} from "./shell.ts";
import type { ShellOverlayBelowValue } from "./shell.ts";

function classes(className: string) {
  return className.split(/\s+/).filter(Boolean);
}

test("the shell root declares every token as a class and re-declares them for a nested shell", () => {
  const { className, style } = shell.jsx();
  expect(style).toEqual({});
  const names = classes(className);
  for (const token of [
    "[--shell-sidebar-width:16rem]",
    "[--shell-start-1-width:var(--shell-sidebar-width)]",
    "[--shell-start-2-width:var(--shell-sidebar-width)]",
    "[--shell-end-1-width:var(--shell-sidebar-width)]",
    "[--shell-end-2-width:var(--shell-sidebar-width)]",
    "[--shell-header-height:3.25rem]",
    "[--shell-duration:300ms]",
    "motion-reduce:[--shell-motion:0]",
    "[--shell-header-offset:0px]",
    "[&:has(>.shell-header[data-sticky])]:[--shell-header-offset:var(--shell-header-height)]",
    "[.shell>&]:col-[main]",
    "[.shell>&]:[--shell-sidebar-width:inherit]",
    "[.shell>&]:[--shell-duration:inherit]",
    "[.shell>&]:[--shell-motion:inherit]",
    "[.shell>&]:[--shell-gutter:inherit]",
    "ak-layer-transparent",
  ]) {
    expect(names).toContain(token);
  }
  // The four slot widths are not inherited by a nested shell.
  expect(names).not.toContain("[.shell>&]:[--shell-start-1-width:inherit]");
});

test("a single side width sets the slot at the edge and a pair sets both slots", () => {
  expect(shell.jsx({ $startWidth: 64 }).style).toEqual({
    "--shell-start-1-width": "calc(var(--spacing) * (64))",
  });
  expect(shell.jsx({ $startWidth: [16, 64] }).style).toEqual({
    "--shell-start-1-width": "calc(var(--spacing) * (16))",
    "--shell-start-2-width": "calc(var(--spacing) * (64))",
  });
  expect(shell.jsx({ $endWidth: "12rem" }).style).toEqual({
    "--shell-end-1-width": "12rem",
  });
  expect(shell.jsx({ $endWidth: ["12rem", 20] }).style).toEqual({
    "--shell-end-1-width": "12rem",
    "--shell-end-2-width": "calc(var(--spacing) * (20))",
  });
  expect(
    shell.jsx({ $sidebarWidth: 60, $headerHeight: 14, $duration: 600 }).style,
  ).toEqual({
    "--shell-sidebar-width": "calc(var(--spacing) * (60))",
    "--shell-header-height": "calc(var(--spacing) * (14))",
    "--shell-duration": "600ms",
  });
  expect(shell.jsx({ $duration: "1s" }).style).toEqual({
    "--shell-duration": "1s",
  });
});

test("the header is sticky by default and true blur is the middle step", () => {
  const sticky = classes(shellHeader.jsx().className);
  expect(sticky).toContain("sticky");
  expect(sticky).toContain("inset-bs-0");
  expect(sticky).toContain("border-be");
  expect(sticky).toContain("@container/shell-header");
  const still = classes(shellHeader.jsx({ $sticky: false }).className);
  expect(still).not.toContain("sticky");

  expect(getShellBlurStep(true)).toBe("md");
  expect(getShellBlurStep("lg")).toBe("lg");
  expect(getShellBlurStep(false)).toBeUndefined();
  const blur = classes(shellHeader.jsx({ $blur: true }).className);
  expect(blur).toContain("backdrop-blur-md");
  expect(blur).toContain(
    "bg-[color-mix(in_oklab,var(--ak-layer)_80%,transparent)]",
  );
  expect(blur).toContain(
    "supports-[not(backdrop-filter:blur(1px))]:bg-(--ak-layer)",
  );
  expect(blur).toContain(
    "[@media(prefers-reduced-transparency:reduce)]:bg-(--ak-layer)",
  );
  const small = classes(shellHeader.jsx({ $blur: "sm" }).className);
  expect(small).toContain("backdrop-blur-sm");
  expect(small).toContain(
    "bg-[color-mix(in_oklab,var(--ak-layer)_85%,transparent)]",
  );
  const large = classes(shellFooter.jsx({ $blur: "lg" }).className);
  expect(large).toContain("backdrop-blur-lg");
  expect(large).toContain(
    "bg-[color-mix(in_oklab,var(--ak-layer)_75%,transparent)]",
  );
});

test("stacking the center part is a container rule on the bar", () => {
  const names = classes(shellHeader.jsx({ $stackCenter: true }).className);
  expect(names).toContain(
    "@max-[40rem]/shell-header:[&>.shell-bar-center]:col-span-full",
  );
  expect(names).toContain(
    "@max-[40rem]/shell-header:[&>.shell-bar-center]:row-start-2",
  );
});

test("the footer has no sticky variant and pads the safe area", () => {
  expect(shellFooter.variantKeys).not.toContain("$sticky");
  const names = classes(shellFooter.jsx().className);
  expect(names).toContain("pb-[env(safe-area-inset-bottom)]");
  expect(names).toContain("border-bs");
  expect(names).not.toContain("sticky");
});

test("bar parts keep their content minimum unless they shrink, and grow by stretching", () => {
  expect(classes(shellHeaderStart.jsx().className)).toEqual(
    expect.arrayContaining(["col-1", "min-w-auto", "justify-self-start"]),
  );
  expect(classes(shellHeaderCenter.jsx().className)).toEqual(
    expect.arrayContaining(["col-2", "min-w-auto", "justify-self-center"]),
  );
  expect(classes(shellHeaderEnd.jsx().className)).toEqual(
    expect.arrayContaining(["col-3", "min-w-auto", "justify-self-end"]),
  );
  const shrink = classes(shellHeaderEnd.jsx({ $shrink: true }).className);
  expect(shrink).toEqual(
    expect.arrayContaining([
      "max-w-full",
      "min-w-0",
      "overflow-clip",
      "[overflow-clip-margin:0.25rem]",
    ]),
  );
  expect(shrink).not.toContain("min-w-auto");
  const grow = classes(shellHeaderCenter.jsx({ $grow: true }).className);
  expect(grow).toContain("justify-self-stretch");
  expect(grow).not.toContain("justify-self-center");
});

test("a sidebar takes its slot from its side and its order among same-side siblings", () => {
  const start = classes(shellSidebar.jsx().className);
  expect(start).toEqual(
    expect.arrayContaining([
      "col-1",
      "border-e",
      "[--shell-slot-width:var(--shell-start-1-width)]",
      "[.shell-sidebar[data-side=start]~&]:col-2",
      "[.shell-sidebar[data-side=start]~&]:[--shell-slot-width:var(--shell-start-2-width)]",
      "w-(--shell-slot-width)",
      "overflow-clip",
      "z-2",
      "ui-closed:w-0",
      "[&>.shell-sidebar-body]:sticky",
    ]),
  );
  const end = classes(shellSidebar.jsx({ $side: "end" }).className);
  expect(end).toEqual(
    expect.arrayContaining([
      "col-4",
      "border-s",
      "[--shell-slot-width:var(--shell-end-1-width)]",
      "[.shell-sidebar[data-side=end]~&]:col-5",
    ]),
  );
  const still = classes(shellSidebar.jsx({ $sticky: false }).className);
  expect(still).not.toContain("[&>.shell-sidebar-body]:sticky");
});

test("overlay mode emits its rules unconditionally or under a shell width step that main flags too", () => {
  const overlay = classes(shellSidebar.jsx({ $overlay: true }).className);
  expect(overlay).toEqual(
    expect.arrayContaining([
      "[--shell-overlay:1]",
      "z-5",
      "w-0",
      "overflow-visible",
      "bg-transparent",
      "border-x-0!",
    ]),
  );
  // One width, one z-index and one overflow per render.
  expect(overlay).not.toContain("w-(--shell-slot-width)");
  expect(overlay).not.toContain("z-2");
  expect(overlay).not.toContain("overflow-clip");

  // The medium step is the default.
  const defaults = classes(shellSidebar.jsx().className);
  expect(defaults).toContain("@max-[48rem]/shell:[--shell-overlay:1]");
  expect(defaults).toContain("@max-[48rem]/shell:w-0");

  // Tailwind needs the literal names, so each step writes the overlay rules out
  // again under its prefix, and main's slot flags name the steps once more.
  // This table is held against both: a step's list must be the unconditional
  // list with the prefix applied, and main must flag the step under the same
  // size once per slot, with no flag for a step outside the table. The step
  // union holds the table itself to the steps the sidebar declares.
  type Step = Exclude<ShellOverlayBelowValue, "none">;
  const steps = {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
  } satisfies Record<Step, string>;
  // Object.keys widens to string; the clause above makes the keys the union.
  const stepNames = Object.keys(steps) as Step[];
  const slots = [
    "--shell-start-1-open",
    "--shell-start-2-open",
    "--shell-end-1-open",
    "--shell-end-2-open",
  ];
  const none = classes(shellSidebar.jsx({ $overlayBelow: "none" }).className);
  expect(none.some((name) => name.startsWith("@max-"))).toBe(false);
  const flagged = classes(
    shellSidebar.jsx({ $overlay: true, $overlayBelow: "none" }).className,
  );
  const overlayRules = flagged.filter((name) => !none.includes(name));
  expect(overlayRules).toContain("[--shell-overlay:1]");
  const stepFlags = classes(shellMain.jsx().className).filter((name) =>
    name.includes("[data-overlay-below="),
  );
  for (const step of stepNames) {
    const prefix = `@max-[${steps[step]}]/shell:`;
    const names = classes(shellSidebar.jsx({ $overlayBelow: step }).className);
    const stepRules = names
      .filter((name) => name.startsWith(prefix))
      .map((name) => name.slice(prefix.length));
    expect(stepRules).toEqual(overlayRules);
    expect(names).toContain("w-(--shell-slot-width)");
    const flags = stepFlags.filter(
      (name) =>
        name.startsWith(prefix) &&
        name.includes(`[data-overlay-below=${step}]`),
    );
    // Each flag ends with the slot it sets.
    const flaggedSlots = flags.map(
      (name) => name.match(/\[(--shell-(?:start|end)-[12]-open):0\]$/)?.[1],
    );
    expect(flaggedSlots).toHaveLength(slots.length);
    expect(new Set(flaggedSlots)).toEqual(new Set(slots));
  }
  expect(stepFlags).toHaveLength(stepNames.length * slots.length);
});

test("the backdrop and the body read the column's overlay flag and open state", () => {
  const backdrop = classes(shellSidebarBackdrop.jsx().className);
  expect(backdrop).toEqual(
    expect.arrayContaining([
      "hidden",
      "absolute",
      "inset-0",
      "[@container_style(--shell-overlay:_1)]:block",
      "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-open]>&]:opacity-100",
      "[@container_style(--shell-overlay:_1)]:print:hidden",
    ]),
  );
  const { className, style } = shellSidebarBody.jsx();
  expect(style).toEqual({ "--frame-padding": "calc(var(--spacing) * (4))" });
  const body = classes(className);
  expect(body).toEqual(
    expect.arrayContaining([
      "w-(--shell-slot-width)",
      "[.shell-sidebar[data-side=start]>&]:ms-auto",
      "[.shell-sidebar[data-side=end]>&]:me-auto",
      "transition-[translate,visibility]",
      "[transition-duration:var(--shell-time),0s]",
      "[.shell-sidebar:not([data-open])>&]:invisible",
      "[@container_style(--shell-overlay:_1)]:sticky",
      "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=start]:not([data-open])>&]:-translate-x-full",
      "rtl:[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=start]:not([data-open])>&]:translate-x-full",
    ]),
  );
});

test("main declares its slot flags and emits one template per centering mode", () => {
  const full = classes(shellMain.jsx().className);
  expect(full).toEqual(
    expect.arrayContaining([
      "@container/shell-main",
      "[--shell-start-1-open:0]",
      "[--shell-end-2-open:0]",
      "[.shell:where(:has(>.shell-sidebar[data-side=start][data-open]:not(.shell-sidebar[data-side=start]~*)))>&]:[--shell-start-1-open:1]",
      "[.shell:has(>.shell-sidebar[data-side=start][data-overlay]:not(.shell-sidebar[data-side=start]~*))>&]:[--shell-start-1-open:0]",
      "@max-[48rem]/shell:[.shell:has(>.shell-sidebar[data-side=end][data-overlay-below=md]:not(.shell-sidebar[data-side=end]~*))>&]:[--shell-end-1-open:0]",
      "grid-cols-[[full-start]_var(--shell-gutter)_[content-start]_minmax(0,1fr)_[content-end]_var(--shell-gutter)_[full-end]]",
      "[&_[id]]:[scroll-margin-block-start:calc(var(--shell-header-offset)+1rem)]",
    ]),
  );
  const templates = full.filter((name) => name.startsWith("grid-cols-"));
  expect(templates).toHaveLength(1);
  // Only a centered main animates the slot spaces.
  const spaces =
    "transition-[--shell-start-1-space,--shell-start-2-space,--shell-end-1-space,--shell-end-2-space]";
  expect(full).not.toContain(spaces);

  const centered = classes(shellMain.jsx({ $centered: true }).className);
  const centeredTemplates = centered.filter((name) =>
    name.startsWith("grid-cols-"),
  );
  expect(centeredTemplates).toHaveLength(1);
  expect(centeredTemplates[0]).toContain("var(--shell-comp-start)");
  expect(centered).toContain(spaces);
  expect(centered).toContain(
    "[--shell-start-1-space:calc(var(--shell-start-1-width)*var(--shell-start-1-open))]",
  );
  expect(centered).not.toContain("[--shell-comp-start:0px]");

  const withinMain = classes(shellMain.jsx({ $centered: "main" }).className);
  expect(withinMain).toContain("[--shell-comp-start:0px]");
  expect(withinMain).toContain("[--shell-comp-end:0px]");
  expect(withinMain).not.toContain(spaces);

  expect(shellMain.jsx({ $maxWidth: 256, $gutter: 6 }).style).toEqual({
    "--shell-main-max-width": "calc(var(--spacing) * (256))",
    "--shell-gutter": "calc(var(--spacing) * (6))",
  });
});

test("a bleed on Frame matches the bleed recipe", () => {
  const bleed = classes(shellBleed.jsx().className);
  expect(bleed).toEqual([
    "[.shell-main>&]:col-[full]",
    "[.shell-main>&]:contain-inline-size",
  ]);
  const framed = classes(frame.jsx({ $bleed: true }).className);
  for (const name of bleed) {
    expect(framed).toContain(name);
  }
  expect(classes(frame.jsx().className)).not.toContain(
    "[.shell-main>&]:contain-inline-size",
  );
});
