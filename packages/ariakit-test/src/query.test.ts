import { afterEach, expect, test } from "vitest";
import { q } from "./query.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

test("lazy role queries run when called", () => {
  const dialog = q.dialog.lazy("Name");

  expect(dialog()).toBeNull();

  document.body.innerHTML = `<div role="dialog" aria-label="Name">First</div>`;
  const firstDialog = dialog();

  expect(firstDialog).toHaveTextContent("First");

  document.body.innerHTML = `<div role="dialog" aria-label="Name">Second</div>`;

  expect(dialog()).not.toBe(firstDialog);
  expect(dialog()).toHaveTextContent("Second");
});

test("lazy role query variants run the matching variant", () => {
  const dialog = q.dialog.ensure.lazy("Visible");
  const hiddenDialog = q.dialog.includesHidden.lazy("Hidden");
  const dialogs = q.dialog.all.lazy("Visible");

  document.body.innerHTML = `
    <div role="dialog" aria-label="Hidden" inert>Hidden</div>
    <div role="dialog" aria-label="Visible">Visible</div>
  `;

  expect(dialog()).toHaveTextContent("Visible");
  expect(hiddenDialog()).toHaveTextContent("Hidden");
  expect(dialogs()).toHaveLength(1);
});

test("lazy role queries can be scoped with within", () => {
  document.body.innerHTML = `
    <section role="region" aria-label="Wrapper"></section>
    <div role="dialog" aria-label="Scoped">Outside</div>
  `;

  const region = q.region.ensure("Wrapper");
  const dialog = q.within(region).dialog.lazy("Scoped");

  expect(dialog()).toBeNull();

  region.innerHTML = `<div role="dialog" aria-label="Scoped">Inside</div>`;

  expect(dialog()).toHaveTextContent("Inside");
});

test("lazy text and label queries run when called", () => {
  const text = q.text.lazy<HTMLButtonElement>("Submit");
  const input = q.labeled.lazy<HTMLInputElement>("Email");

  expect(text()).toBeNull();
  expect(input()).toBeNull();

  document.body.innerHTML = `
    <button>Submit</button>
    <label>Email<input /></label>
  `;

  expect(text()).toHaveTextContent("Submit");
  expect(text()).toBeInstanceOf(HTMLButtonElement);
  expect(input()).toBeInstanceOf(HTMLInputElement);
});
