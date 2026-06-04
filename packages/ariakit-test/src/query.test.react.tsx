import { expect, test } from "vitest";
import { computeAccessibleName } from "./__dom/accessible-name.ts";
import { q, render } from "./react.tsx";

test("native elements resolve their implicit ARIA roles", async () => {
  const { unmount } = await render(
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
  try {
    expect(q.code()).toBeInTheDocument();
    expect(q.blockquote()).toBeInTheDocument();
    expect(q.paragraph()).toBeInTheDocument();
    expect(q.time()).toBeInTheDocument();
    expect(q.strong()).toBeInTheDocument();
    expect(q.deletion()).toBeInTheDocument();
    expect(q.insertion()).toBeInTheDocument();
    expect(q.meter()).toBeInTheDocument();
  } finally {
    unmount();
  }
});

test("a <summary> is not matched as a button", async () => {
  const { unmount } = await render(
    <details>
      <summary>Toggle</summary>
      content
    </details>,
  );
  try {
    // `<summary>` resolves to `button` only for the accessible name algorithm;
    // role-based button queries must not pick it up (matching Testing Library).
    expect(q.button()).toBe(null);
    expect(q.group()).toBeInTheDocument();
  } finally {
    unmount();
  }
});

test("<th scope> resolves to columnheader or rowheader", async () => {
  const { unmount } = await render(
    <table>
      <tbody>
        <tr>
          <th>Column</th>
          <th scope="row">Row</th>
        </tr>
      </tbody>
    </table>,
  );
  try {
    expect(q.columnheader()).toHaveTextContent("Column");
    expect(q.rowheader()).toHaveTextContent("Row");
  } finally {
    unmount();
  }
});

test("native role mappings stay decoupled from the accessible name", async () => {
  const { unmount } = await render(
    <div>
      <code aria-label="labelled code">x</code>
      <strong aria-label="labelled strong">x</strong>
      <p aria-label="labelled paragraph">x</p>
      <button>
        <meter value={5}>five</meter>
      </button>
    </div>,
  );
  try {
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
  } finally {
    unmount();
  }
});

test("form and region landmarks require an accessible name", async () => {
  const { unmount } = await render(
    <div>
      <form aria-label="named form">a</form>
      <form>unnamed form</form>
      <section aria-label="named region">b</section>
      <section>unnamed section</section>
    </div>,
  );
  try {
    // Only the named landmarks match — an unnamed <form>/<section> is not a
    // landmark (Testing Library treats it as generic; this package matches no
    // role for it, since `generic` isn't queryable here).
    expect(q.form.all()).toHaveLength(1);
    expect(q.form()).toHaveAccessibleName("named form");
    expect(q.region.all()).toHaveLength(1);
    expect(q.region()).toHaveAccessibleName("named region");
  } finally {
    unmount();
  }
});
