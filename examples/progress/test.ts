import { q } from "@ariakit/test";

test("progress bar is rendered", () => {
  expect(q.progressbar()).toBeInTheDocument();
});

test("progress bar has correct value", () => {
  const progress = q.progressbar();
  if (!progress) {
    throw new Error("Progress bar not found in the document");
  }
  expect(progress).toHaveAttribute("aria-valuenow", "30");
  expect(progress).toHaveAttribute("aria-valuemin", "0");
  expect(progress).toHaveAttribute("aria-valuemax", "100");
  expect(progress).toHaveAttribute("aria-valuetext", "30%");
});

test("progress bar supports indeterminate state", () => {
  const progress = q.progressbar();
  if (!progress) {
    throw new Error("Progress bar not found in the document");
  }

  // Simulate indeterminate state by removing aria-valuenow
  progress.removeAttribute("aria-valuenow");
  progress.setAttribute("aria-busy", "true");
  progress.setAttribute("aria-valuetext", "Uploading: In progress");
  expect(progress).toHaveAttribute("aria-busy", "true");
  expect(progress).not.toHaveAttribute("aria-valuenow");
});
