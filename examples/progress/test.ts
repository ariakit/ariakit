import { q } from "@ariakit/test";

// Test if the progress bar element is present in the document
test("progress bar is rendered", () => {
  expect(q.progressbar()).toBeInTheDocument();
});

// Test if the progress bar has the correct ARIA attributes
test("progress bar has correct value", () => {
  const progress = q.progressbar();
  if (!progress) {
    throw new Error("Progress bar not found in the document");
  }
  expect(progress).toHaveAttribute("aria-valuenow", "40");
  expect(progress).toHaveAttribute("aria-valuemin", "0");
  expect(progress).toHaveAttribute("aria-valuemax", "100");
  expect(progress).toHaveAttribute("aria-valuetext", "40%");
});

// Test if the visual width of the progress indicator matches the ARIA value
test("progress indicator width matches aria value", () => {
  const progress = q.progressbar();
  if (!progress) {
    throw new Error("Progress bar not found in the document");
  }

  const indicator = document.querySelector(".progress-indicator");
  if (!indicator) {
    throw new Error("Progress indicator not found in the document");
  }

  const valuenow = progress.getAttribute("aria-valuenow");
  const computedStyle = window.getComputedStyle(indicator);

  expect(computedStyle.width).toBe(`${valuenow}%`);
});

// Test if the displayed percentage text matches the ARIA value
test("progress value display matches aria value", () => {
  const progress = q.progressbar();
  if (!progress) {
    throw new Error("Progress bar not found in the document");
  }

  const valueDisplay = document.querySelector(".progress-value");
  if (!valueDisplay) {
    throw new Error("Progress value display not found in the document");
  }

  const valuenow = progress.getAttribute("aria-valuenow");

  expect(valueDisplay.textContent?.trim()).toBe(`${valuenow}%`);
});

// Test if the label text is displayed correctly
test("progress label is correctly displayed", () => {
  const labelElement = document.querySelector(".progress-label");
  if (!labelElement) {
    throw new Error("Progress label not found in the document");
  }

  expect(labelElement.textContent?.trim()).toBe("Uploading:");
});
