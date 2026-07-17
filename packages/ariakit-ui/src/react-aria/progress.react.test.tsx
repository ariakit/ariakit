import { render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { Progress } from "./progress.react.tsx";

// Regression coverage: the clava rewrite once dropped rac's render-prop
// contract (function className/style/children were silently discarded).
test("resolves rac render props and merges them with the cv output", async () => {
  await render(
    <Progress
      aria-label="Loading"
      value={0.5}
      className={({ percentage }) => `pct-${percentage}`}
      style={({ percentage }) => ({ opacity: (percentage ?? 0) / 100 })}
    >
      {({ percentage }) => `${percentage}%`}
    </Progress>,
  );
  const progressbar = document.querySelector<HTMLElement>("[role=progressbar]");
  expect(progressbar).not.toBeNull();
  if (!progressbar) return;
  // The resolved function className merges with the cv classes instead of
  // replacing them.
  expect(progressbar.classList.contains("pct-50")).toBe(true);
  expect(progressbar.classList.contains("w-full")).toBe(true);
  // The resolved function style merges with the cv's value channel.
  expect(progressbar.style.opacity).toBe("0.5");
  expect(progressbar.style.getPropertyValue("--progress-value")).toBe("0.5");
  // Function children still receive the rac values.
  expect(progressbar.textContent).toContain("50%");
});
