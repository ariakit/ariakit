import { afterEach, expect, test } from "vitest";
import { q } from "./query.ts";
import "./shims.ts";

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
  const hiddenDialog = q.dialog.hidden.lazy("Hidden");
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

test("lazy text and label query variants run the matching variant", async () => {
  const text = q.text.ensure.lazy("Ready");
  const texts = q.text.all.lazy("Submit");
  const waitedTexts = q.text.wait.all.lazy("Submit");
  const allWaitedTexts = q.text.all.wait.lazy("Submit");
  const ensuredTexts = q.text.ensure.all.lazy("Submit");
  const allEnsuredTexts = q.text.all.ensure.lazy("Submit");
  const label = q.labeled.ensure.lazy<HTMLInputElement>("Name");
  const labels = q.labeled.all.lazy<HTMLInputElement>("Email");
  const waitedLabels = q.labeled.wait.all.lazy<HTMLInputElement>("Email");
  const allWaitedLabels = q.labeled.all.wait.lazy<HTMLInputElement>("Email");
  const ensuredLabels = q.labeled.ensure.all.lazy<HTMLInputElement>("Email");
  const allEnsuredLabels = q.labeled.all.ensure.lazy<HTMLInputElement>("Email");

  document.body.innerHTML = `
    <button>Submit</button>
    <button>Submit</button>
    <span>Ready</span>
    <label>Name<input /></label>
    <label>Email<input /></label>
    <label>Email<input /></label>
  `;

  expect(text()).toHaveTextContent("Ready");
  expect(texts()).toHaveLength(2);
  await expect(waitedTexts()).resolves.toHaveLength(2);
  await expect(allWaitedTexts()).resolves.toHaveLength(2);
  expect(ensuredTexts()).toHaveLength(2);
  expect(allEnsuredTexts()).toHaveLength(2);
  expect(label()).toBeInstanceOf(HTMLInputElement);
  expect(labels()).toHaveLength(2);
  await expect(waitedLabels()).resolves.toHaveLength(2);
  await expect(allWaitedLabels()).resolves.toHaveLength(2);
  expect(ensuredLabels()).toHaveLength(2);
  expect(allEnsuredLabels()).toHaveLength(2);
});
