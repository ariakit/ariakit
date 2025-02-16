import { q } from "@ariakit/test";

test("progress bar is rendered", () => {
  expect(q.progressbar()).toBeInTheDocument();
});

test("progress bar has correct value", () => {
  const progress = q.progressbar();
  expect(progress).toHaveAttribute("aria-valuenow", "30");
  expect(progress).toHaveAttribute("aria-valuemin", "0");
  expect(progress).toHaveAttribute("aria-valuemax", "100");
});
