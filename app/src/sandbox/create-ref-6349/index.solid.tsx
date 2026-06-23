import { createRef } from "@ariakit/solid-utils";

// Reproduces https://github.com/ariakit/ariakit/issues/6349
export default function Example() {
  let nameInput: HTMLInputElement | undefined;
  let emailInput: HTMLInputElement | undefined;

  const focusNameField = () => {
    nameInput?.focus();
  };

  const focusEmailField = () => {
    emailInput?.focus();
  };

  const focusHandler = createRef(focusNameField);

  return (
    <div class="flex flex-col items-start gap-3">
      <label class="flex flex-col gap-1">
        Name
        <input
          ref={(element) => {
            nameInput = element;
          }}
          class="rounded border border-gray-300 px-3 py-1"
        />
      </label>
      <label class="flex flex-col gap-1">
        Email
        <input
          ref={(element) => {
            emailInput = element;
          }}
          class="rounded border border-gray-300 px-3 py-1"
        />
      </label>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1"
          onClick={() => focusHandler.current()}
        >
          Focus field
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1"
          onClick={() => focusHandler.set(() => focusEmailField)}
        >
          Use email handler
        </button>
        <button
          type="button"
          class="rounded border border-gray-300 px-3 py-1"
          onClick={() => {
            // TODO: Remove after https://github.com/ariakit/ariakit/issues/6349
            focusHandler.set(() => focusNameField);
          }}
        >
          Restore default
        </button>
      </div>
      <output>{"Stored value type: " + typeof focusHandler.get()}</output>
    </div>
  );
}
