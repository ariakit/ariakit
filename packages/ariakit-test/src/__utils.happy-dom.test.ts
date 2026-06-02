// @vitest-environment happy-dom
//
// Covers the happy-dom-only polyfills in applyBrowserPolyfills, which patch gaps
// in happy-dom's DOM implementation during the @ariakit/test interaction window.
import { expect, test } from "vitest";
import { wrapAsync } from "./__utils.ts";

test("polyfills a non-empty validationMessage during interactions", async () => {
  const input = document.createElement("input");
  input.required = true;
  document.body.append(input);
  try {
    expect(input.validity.valid).toBe(false);
    // happy-dom leaves the message empty for built-in constraint violations.
    expect(input.validationMessage).toBe("");
    await wrapAsync(async () => {
      expect(input.validationMessage).toBe("Constraints not satisfied");
    });
    // The prototype patch is restored after the interaction.
    expect(input.validationMessage).toBe("");
  } finally {
    input.remove();
  }
});

test("excludes disabled select/textarea from FormData, keeping enabled fields", async () => {
  const form = document.createElement("form");
  form.innerHTML =
    '<select name="choice" disabled><option selected>a</option></select>' +
    '<input name="choice" value="b" />' +
    '<textarea name="note" disabled>hidden</textarea>';
  document.body.append(form);
  const OriginalFormData = window.FormData;
  try {
    await wrapAsync(async () => {
      expect(window.FormData).not.toBe(OriginalFormData);
      const data = new FormData(form);
      // The disabled select is excluded; the enabled input that shares its name
      // is preserved (a delete-by-name would have dropped it too).
      expect(data.getAll("choice")).toEqual(["b"]);
      // The disabled textarea is excluded too.
      expect(data.has("note")).toBe(false);
    });
    // The patched global constructor is restored after the interaction.
    expect(window.FormData).toBe(OriginalFormData);
  } finally {
    form.remove();
  }
});
