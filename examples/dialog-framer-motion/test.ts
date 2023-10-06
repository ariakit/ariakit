import { version } from "react";
import { click, press, q, waitFor } from "@ariakit/test";

const is17 = version.startsWith("17");

describe.skipIf(is17)("dialog-framer-motion", () => {
  test("show/hide on click", async () => {
    expect(q.dialog()).not.toBeInTheDocument();
    await click(q.button("Show modal"));
    expect(q.dialog()).toBeVisible();
    expect(q.button("OK")).toHaveFocus();
    await click(q.button("OK"));
    expect(q.dialog()).toBeVisible();
    expect(q.button("Show modal")).toHaveFocus();
    await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
    expect(q.button("Show modal")).toHaveFocus();
  });

  test("prevent body scroll", async () => {
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    await press.Tab();
    await press.Enter();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    expect(q.dialog()).toBeVisible();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await press.Enter();
    expect(q.dialog()).toBeVisible();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });
});
