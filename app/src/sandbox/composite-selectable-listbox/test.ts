import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("exposes selection and opt-in state through ARIA", () => {
  expect(q.listbox("Selection policy explorer")).toHaveAttribute(
    "aria-multiselectable",
    "true",
  );
  expect(q.option("2027 product roadmap")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(q.option("2027 product roadmap")).toHaveAttribute("data-selected");
  expect(q.option("Research synthesis")).toHaveAttribute(
    "aria-selected",
    "false",
  );
  expect(q.option("Legal review")).not.toHaveAttribute("aria-selected");
  expect(q.option("Security audit")).toHaveAttribute("aria-disabled", "true");
  expect(q.option("Security audit")).not.toHaveAttribute("aria-selected");

  expect(q.listbox("Provider reading queue")).toHaveAttribute(
    "aria-multiselectable",
    "true",
  );
  expect(q.option("Shape the narrative")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("applies controlled behavior and mode policies", async () => {
  const launch = q.option("Launch checklist");
  await click(launch);
  expect(launch).toHaveAttribute("aria-selected", "true");
  await click(launch);
  expect(launch).toHaveAttribute("aria-selected", "false");

  await click(q.radio("Replace"));
  await click(q.option("2027 product roadmap"));
  await click(launch, { shiftKey: true });
  expect(q.option("2027 product roadmap")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(q.option("Customer interviews")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(launch).toHaveAttribute("aria-selected", "true");
  expect(q.option("Legal review")).not.toHaveAttribute("aria-selected");
  expect(q.status("Playground selection")).toHaveTextContent(
    "3 selected: 2027 product roadmap, Customer interviews, Launch checklist",
  );

  await click(q.radio("Single"));
  await click(q.option("Research synthesis"));
  expect(q.option("Research synthesis")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(q.option("2027 product roadmap")).not.toHaveAttribute("aria-selected");
  expect(q.listbox("Selection policy explorer")).not.toHaveAttribute(
    "aria-multiselectable",
  );

  await click(q.radio("Frozen"));
  await click(launch);
  expect(q.option("Research synthesis")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(launch).not.toHaveAttribute("aria-selected");
});

// https://github.com/ariakit/ariakit/issues/7114
test("matches Select All by locale-aware character", async () => {
  const roadmap = q.option("2027 product roadmap");
  const launch = q.option("Launch checklist");

  await press("q", roadmap, { ctrlKey: true, code: "KeyA" });
  expect(launch).toHaveAttribute("aria-selected", "false");

  await press("a", roadmap, { ctrlKey: true, code: "KeyQ" });
  expect(q.status("Playground selection")).toHaveTextContent(
    "4 selected: 2027 product roadmap, Customer interviews, Launch checklist, Research synthesis",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps an item mounted while its selectable state changes", async () => {
  const legalReview = q.option("Legal review");
  expect(legalReview).not.toHaveAttribute("aria-selected");

  await click(q.checkbox("Include Legal review in selection"));
  expect(q.option("Legal review")).toBe(legalReview);
  expect(legalReview).toBeInTheDocument();
  expect(legalReview).toHaveAttribute("aria-selected", "false");

  await click(legalReview);
  expect(legalReview).toHaveAttribute("aria-selected", "true");
  expect(legalReview).toHaveAttribute("data-selected");

  await click(q.option("Collect field notes"));
  expect(q.status("Provider selection")).toHaveTextContent(
    "2 selected: Shape the narrative, Collect field notes",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("applies item activation gates", async () => {
  const keyboardActivation = q.option("Keyboard activation");
  expect(keyboardActivation).toHaveAttribute("aria-selected", "false");

  await click(keyboardActivation);
  expect(keyboardActivation).toHaveAttribute("aria-selected", "false");
  await press.Enter(keyboardActivation);
  expect(keyboardActivation).toHaveAttribute("aria-selected", "true");

  const pointerOrSpace = q.option("Pointer or Space");
  await press.Enter(pointerOrSpace);
  expect(pointerOrSpace).toHaveAttribute("aria-selected", "false");
  await press.Space(pointerOrSpace);
  expect(pointerOrSpace).toHaveAttribute("aria-selected", "true");
});

// https://github.com/ariakit/ariakit/issues/7114
test("customizes or suppresses the selection attribute", async () => {
  const checkedSemantics = q.menuitemcheckbox("Checked semantics");
  expect(checkedSemantics).toHaveAttribute("aria-checked", "true");
  expect(checkedSemantics).not.toHaveAttribute("aria-selected");

  const hostOwnedState = q.menuitem("Host-owned state");
  expect(hostOwnedState).not.toHaveAttribute("aria-selected");
  expect(hostOwnedState).not.toHaveAttribute("aria-checked");
  expect(hostOwnedState).not.toHaveAttribute("aria-current");
  await click(hostOwnedState);
  expect(hostOwnedState).toHaveAttribute("data-selected");
  expect(hostOwnedState).toHaveAttribute("aria-current", "true");
  expect(checkedSemantics).toHaveAttribute("aria-checked", "false");
  expect(hostOwnedState).not.toHaveAttribute("aria-selected");
  expect(hostOwnedState).not.toHaveAttribute("aria-checked");
  expect(q.status("Item option lab selection")).toHaveTextContent(
    "1 selected: Host-owned state",
  );
});
