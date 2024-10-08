import { click, q, waitFor } from "@ariakit/test";

test("https://github.com/ariakit/ariakit/issues/4115", async () => {
  expect(q.text("Content")).not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await waitFor(() =>
    expect(q.text("Content")).not.toHaveAttribute("data-animating"),
  );

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await waitFor(() =>
    expect(q.text("Content")).not.toHaveAttribute("data-animating"),
  );
});
