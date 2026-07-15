import { render } from "@ariakit/test/react";
import { useLayoutEffect } from "react";
import { expect, test } from "vitest";
import { useDialogStack } from "./use-dialog-stack.ts";

interface TestProps {
  dialog: HTMLElement | null;
  results: HTMLElement[][];
}

function Test({ dialog, results }: TestProps) {
  const [stackedElements] = useDialogStack(dialog, true);
  results.push(stackedElements);
  return null;
}

test("reuses the empty result when the dialog registers", async () => {
  const results: HTMLElement[][] = [];
  const { rerender } = await render(<Test dialog={null} results={results} />);

  await rerender(
    <Test dialog={document.createElement("div")} results={results} />,
  );

  expect(results.every((elements) => elements.length === 0)).toBe(true);
  expect(new Set(results).size).toBe(1);
});

interface StackTestProps {
  background: HTMLElement;
  foreground: HTMLElement;
  backdrop: HTMLElement;
  results: HTMLElement[][];
}

function StackTest({
  background,
  foreground,
  backdrop,
  results,
}: StackTestProps) {
  useDialogStack(background, true);
  const [stackedElements, setBackdrop] = useDialogStack(foreground, true);
  results.push(stackedElements);

  useLayoutEffect(() => {
    setBackdrop(backdrop);
    return () => setBackdrop(null);
  }, [backdrop, setBackdrop]);

  return null;
}

test("reuses the empty result when the frontmost entry updates", async () => {
  const results: HTMLElement[][] = [];
  await render(
    <StackTest
      background={document.createElement("div")}
      foreground={document.createElement("div")}
      backdrop={document.createElement("div")}
      results={results}
    />,
  );

  expect(results.length).toBeGreaterThan(1);
  expect(results.every((elements) => elements.length === 0)).toBe(true);
  expect(new Set(results).size).toBe(1);
});
