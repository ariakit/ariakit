import { afterEach, expect, test } from "vitest";
import { computeAccessibleName } from "./__dom/accessible-name.ts";
import { cleanup } from "./__dom/render.ts";
import { q, render } from "./react.tsx";

// This file renders several different trees into `document.body` across tests.
// This repo's Vitest doesn't enable `globals`, so there's no global `afterEach`
// for `render`'s built-in auto-cleanup to hook into; register it here (mirroring
// Testing Library's manual-cleanup pattern) so trees don't accumulate and
// cross-match between tests.
afterEach(cleanup);

test("native elements resolve their implicit ARIA roles", async () => {
  await render(
    <div>
      <code>code</code>
      <blockquote>quote</blockquote>
      <p>paragraph</p>
      <time>time</time>
      <strong>strong</strong>
      <del>deleted</del>
      <ins>inserted</ins>
      <meter value={0.5}>50%</meter>
    </div>,
  );
  expect(q.code()).toBeInTheDocument();
  expect(q.blockquote()).toBeInTheDocument();
  expect(q.paragraph()).toBeInTheDocument();
  expect(q.time()).toBeInTheDocument();
  expect(q.strong()).toBeInTheDocument();
  expect(q.deletion()).toBeInTheDocument();
  expect(q.insertion()).toBeInTheDocument();
  expect(q.meter()).toBeInTheDocument();
});

test("a <summary> is not matched as a button", async () => {
  await render(
    <details>
      <summary>Toggle</summary>
      content
    </details>,
  );
  // `<summary>` resolves to `button` only for the accessible name algorithm;
  // role-based button queries must not pick it up (matching Testing Library).
  expect(q.button()).toBe(null);
  expect(q.group()).toBeInTheDocument();
});

test("<th scope> resolves to columnheader or rowheader", async () => {
  await render(
    <table>
      <tbody>
        <tr>
          <th>Column</th>
          <th scope="row">Row</th>
        </tr>
      </tbody>
    </table>,
  );
  expect(q.columnheader()).toHaveTextContent("Column");
  expect(q.rowheader()).toHaveTextContent("Row");
});

test("native role mappings stay decoupled from the accessible name", async () => {
  await render(
    <div>
      <code aria-label="labelled code">x</code>
      <strong aria-label="labelled strong">x</strong>
      <p aria-label="labelled paragraph">x</p>
      <button>
        <meter value={5}>five</meter>
      </button>
    </div>,
  );
  // Name-prohibited roles like `code`/`strong`/`paragraph` are recognized by
  // the query but keep their authored accessible name — the query role table
  // is decoupled from the accessible name algorithm, which still sees these
  // elements as having no role.
  expect(q.code("labelled code")).toBeInTheDocument();
  expect(computeAccessibleName(q.code.ensure())).toBe("labelled code");
  expect(computeAccessibleName(q.strong.ensure())).toBe("labelled strong");
  expect(computeAccessibleName(q.paragraph.ensure())).toBe(
    "labelled paragraph",
  );
  // A `<meter>` contributes its text content (not its range value) to a
  // parent's accessible name.
  expect(computeAccessibleName(q.button.ensure())).toBe("five");
});

test("role queries reject state filters the role can't carry", async () => {
  await render(<button>Save</button>);
  // `button` supports neither `aria-selected` nor range values, and `level` is
  // only valid on `heading` — matching Testing Library, these throw instead of
  // silently returning no match.
  expect(() => q.button("Save", { selected: true })).toThrow(
    '"aria-selected" is not supported on role "button".',
  );
  expect(() => q.button("Save", { checked: true })).toThrow(
    '"aria-checked" is not supported on role "button".',
  );
  expect(() => q.button("Save", { value: { now: 1 } })).toThrow(
    '"aria-valuenow" is not supported on role "button".',
  );
  expect(() => q.button("Save", { level: 2 })).toThrow(
    'Role "button" cannot have "level" property.',
  );
  // `aria-busy`/`aria-current` are global, but the `none` role carries no ARIA
  // props at all, so even those are rejected on it — matching Testing Library.
  expect(() => q.none(undefined, { busy: true })).toThrow(
    '"aria-busy" is not supported on role "none".',
  );
});

test("role queries accept state filters the role supports", async () => {
  await render(
    <div>
      <button aria-pressed="true">Bold</button>
      <button aria-expanded="true">Menu</button>
      <h2>Title</h2>
    </div>,
  );
  expect(q.button("Bold", { pressed: true })).toBeInTheDocument();
  expect(q.button("Menu", { expanded: true })).toBeInTheDocument();
  expect(q.heading("Title", { level: 2 })).toBeInTheDocument();
  // The global `aria-busy` is supported on a normal role like `button`.
  expect(q.button("Bold", { busy: false })).toBeInTheDocument();
});

test("form and region landmarks require an accessible name", async () => {
  await render(
    <div>
      <form aria-label="named form">a</form>
      <form>unnamed form</form>
      <section aria-label="named region">b</section>
      <section>unnamed section</section>
    </div>,
  );
  // Only the named landmarks match — an unnamed <form>/<section> is not a
  // landmark (Testing Library treats it as generic; this package matches no
  // role for it, since `generic` isn't queryable here).
  expect(q.form.all()).toHaveLength(1);
  expect(q.form()).toHaveAccessibleName("named form");
  expect(q.region.all()).toHaveLength(1);
  expect(q.region()).toHaveAccessibleName("named region");
});
