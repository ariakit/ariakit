import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6307

test("a successful submit does not steal focus on later items changes", async () => {
  const email = q.textbox.ensure("Email");

  // 1. Submit with the email empty: the submission fails and the invalid email
  //    field is focused (correct autoFocusOnSubmit behavior).
  await click(q.button("Save"));
  expect(email).toHaveFocus();
  expect(email).toHaveAttribute("aria-invalid", "true");

  // 2. Type a valid value, wait for it to be accepted, then submit again. Wait
  //    for the successful submission to fully settle (with resetOnSubmit={false}
  //    the form keeps its values) before touching the form again.
  await type("jane", email);
  expect(email).toHaveAttribute("aria-invalid", "false");
  await click(q.button("Save"));
  expect(q.status()).toHaveTextContent("Successful submissions: 1");

  // 3. Make the email invalid again without submitting.
  await type("\b\b\b\b", email);
  expect(email).toHaveAttribute("aria-invalid", "true");

  // 4. Activate "Add nickname", mounting the optional field and changing the
  //    form items. Focus must stay on the button and must not be stolen by the
  //    invalid email field.
  await click(q.button("Add nickname"));
  expect(q.textbox("Nickname")).toBeInTheDocument();
  expect(q.button("Add nickname")).toHaveFocus();
  expect(email).not.toHaveFocus();
});
