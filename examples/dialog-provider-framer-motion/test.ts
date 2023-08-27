import { version } from "react";
import { click, getByRole, press, queryByRole, waitFor } from "@ariakit/test";

const getButton = (name: string) => getByRole("button", { name });
const getDialog = () => queryByRole("dialog");

const is17 = version.startsWith("17");

describe.skipIf(is17)("dialog-framer-motion", () => {
  test("show/hide on click", async () => {
    expect(getDialog()).not.toBeInTheDocument();
    await click(getButton("Show modal"));
    await waitFor(() => expect(getDialog()).toBeVisible());
    expect(getButton("OK")).toHaveFocus();
    await click(getButton("OK"));
    expect(getDialog()).toBeVisible();
    await waitFor(() => expect(getDialog()).not.toBeInTheDocument());
  });

  test("prevent body scroll", async () => {
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    await press.Tab();
    await press.Enter();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await waitFor(() => expect(getDialog()).toBeVisible());
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await press.Enter();
    expect(getDialog()).toBeVisible();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await waitFor(() => expect(getDialog()).not.toBeInTheDocument());
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });
});
