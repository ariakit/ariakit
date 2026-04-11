import { render } from "@ariakit/test/react";
import { createElement } from "react";
import { expect, test } from "vitest";
import { RadioProvider } from "../../radio/radio-provider.tsx";
import { FormRadioGroup } from "../form-radio-group.tsx";
import { FormRadio } from "../form-radio.tsx";
import { useFormStore } from "../form-store.ts";
import { Form } from "../form.tsx";

// Regression: when FormRadio is rendered inside a RadioProvider (which supplies
// a RadioStore with an auto-generated id), the store's id must not override the
// form field name on the rendered <input> element or inside useFormControl.
test("FormRadio uses form field name when inside a RadioProvider", async () => {
  function Component() {
    const form = useFormStore({ defaultValues: { color: "" } });
    return createElement(
      Form,
      { store: form },
      createElement(
        RadioProvider,
        null,
        createElement(
          FormRadioGroup,
          null,
          createElement(FormRadio, { name: form.names.color, value: "red" }),
          createElement(FormRadio, { name: form.names.color, value: "green" }),
        ),
      ),
    );
  }

  const { unmount } = await render(createElement(Component), {
    strictMode: true,
  });

  const radios = document.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  expect(radios.length).toBe(2);
  for (const radio of radios) {
    expect(radio.name).toBe("color");
  }

  unmount();
});
