import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832
test("activates a far item reached through typeahead", async () => {
  const select = q.combobox("Selected fruit");
  await click(select);
  await type("ly");

  expect(q.option("Lychee")).toHaveAttribute("data-active-item");
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7033
test("honors initial focus when the dialog is inside a shadow root", async () => {
  await click(q.button("Open shadow-root focus dialog"));

  const shadowRoot = document.querySelector<HTMLElement>(
    "[data-shadow-root-dialog-host]",
  )?.shadowRoot;
  await expect
    .poll(() => shadowRoot?.activeElement?.getAttribute("aria-label"))
    .toBe("Shadow-root initial focus field");
  expect(q.status("Shadow-root dialog focus history")).toHaveTextContent(
    "app focus → initial focus",
  );
});

// https://github.com/ariakit/ariakit/issues/7033
test("focuses a dialog after its store changes", async () => {
  await click(q.button("Open store A"));
  expect(q.textbox("Store A initial focus")).toHaveFocus();

  await click(q.button("Open store B"));

  expect(q.textbox("Store B initial focus")).toHaveFocus();
  expect(q.status("Store swap focus history")).toHaveTextContent(
    "open store A → store A input → open store B → store B input",
  );
});

// https://github.com/ariakit/ariakit/issues/7033
test("uses the current disclosure in delayed auto-focus", async () => {
  const previousDisclosure = q.button("Open disclosure swap dialog");

  await click(previousDisclosure);

  expect(previousDisclosure).toHaveFocus();
  expect(q.status("Disclosure swap focus history")).toHaveTextContent(
    "input → previous disclosure",
  );
});
