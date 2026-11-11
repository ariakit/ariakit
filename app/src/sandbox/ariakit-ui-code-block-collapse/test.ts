import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps the expanded state across file tabs", async () => {
  await click(q.button("Mostrar as 36 linhas"));
  expect(q.tabpanel("use-users.ts")).toHaveFocus();
  // The style sheet is shorter than the lines that the block shows.
  await click(q.tab("users.css"));
  expect(q.button.maybe(/Mostrar/)).not.toBeInTheDocument();
  await click(q.tab("use-users.ts"));
  expect(q.button("Mostrar menos linhas")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("follows the state from outside without moving the focus", async () => {
  const toggle = q.button("Show all lines of use-users.ts");
  await click(toggle);
  expect(q.button("Show fewer lines")).toBeInTheDocument();
  expect(toggle).toHaveFocus();
  await click(q.button("Show fewer lines"));
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(q.button("Show all 36 lines")).toHaveFocus();
});

test("names the copy button after the selected file in another language", async () => {
  expect(q.button("Copiar use-users.ts")).toBeInTheDocument();
  await click(q.tab("users.css"));
  expect(q.button.maybe("Copiar use-users.ts")).not.toBeInTheDocument();
  expect(q.button("Copiar users.css")).toBeInTheDocument();
});

test("doesn't move the focus after a toggle that the page ignores", async () => {
  await click(q.button("Lock the state of use-users.ts"));
  await click(q.button("Show all 36 lines"));
  expect(q.button("Show all 36 lines")).toBeInTheDocument();
  const toggle = q.button("Show all lines of use-users.ts");
  await click(toggle);
  expect(q.button("Show fewer lines")).toBeInTheDocument();
  expect(toggle).toHaveFocus();
});

test("moves the focus to wrapped code that the button expands", async () => {
  await click(q.button("Show all wrapped lines"));
  const collapse = q.button("Show fewer wrapped lines");
  const code = document.getElementById(
    collapse.getAttribute("aria-controls") ?? "",
  );
  expect(code).toHaveFocus();
  expect(code).not.toHaveAttribute("tabindex", "0");
});

test("moves the focus after a state that the page applies in a transition", async () => {
  await click(q.button("Show all lines after a transition"));
  await expect
    .poll(q.region.lazy("Hook that expands in a transition"))
    .toHaveFocus();
  await click(q.button("Show fewer lines after a transition"));
  await expect
    .poll(q.button.lazy("Show all lines after a transition"))
    .toHaveFocus();
});

test("moves the focus to the code from a click on it in a dialog", async () => {
  await click(q.button("Open use-users.ts"));
  const dialog = q.dialog("use-users.ts");
  // The button sits in the area that covers the collapsed code, and a click on
  // the area focuses the dialog around it first.
  const area = q.within(dialog).button("Show all 36 lines").parentElement;
  if (!area) throw new Error("Missing expand area");
  await click(area);
  expect(q.within(dialog).region("Hook in a dialog")).toHaveFocus();
});

test("doesn't move the focus from the body after a toggle that the page ignores", async () => {
  await click(q.button("Lock the state of use-users.ts"));
  await click(q.button("Show all 36 lines"));
  await click(q.text(/^The hook loads the users of a team/));
  expect(q.button("Show all 36 lines")).not.toHaveFocus();
  // A state from outside that doesn't take the focus, such as a keyboard
  // shortcut on the page.
  q.button("Show all lines of use-users.ts").click();
  await expect.poll(q.button.lazy("Show fewer lines")).toBeInTheDocument();
  expect(document.body).toHaveFocus();
});

test("labels the scroll buttons of the file tabs in another language", () => {
  expect(q.button("Arquivos anteriores")).toBeInTheDocument();
  expect(q.button("Próximos arquivos")).toBeInTheDocument();
});
