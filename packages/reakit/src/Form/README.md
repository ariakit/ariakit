---
path: /docs/form/
experimental: true
redirect_from:
  - /components/field/
  - /components/input/
  - /components/label/
---

# Form

<blockquote experimental="true">
  <strong>This is experimental</strong> and may have breaking changes in minor or patch version updates. Issues for this module will have lower priority. Even so, if you use it, feel free to <a href="https://github.com/reakit/reakit/issues/new/choose" target="_blank">give us feedback</a>.
</blockquote>

`Form` is an accessible component with a collection of other components, such as `FormLabel` and `FormInput`.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Group } from "reakit/Group";
import {
  unstable_Form as Form,
  unstable_FormLabel as FormLabel,
  unstable_FormCheckbox as FormCheckbox,
  unstable_FormGroup as FormGroup,
  unstable_FormRadioGroup as FormRadioGroup,
  unstable_FormRadio as FormRadio,
  unstable_FormRemoveButton as FormRemoveButton,
  unstable_FormPushButton as FormPushButton,
  unstable_FormSubmitButton as FormSubmitButton,
  unstable_FormInput as FormInput,
  unstable_FormMessage as FormMessage,
  unstable_useFormState as useFormState
} from "reakit/Form";

function Example() {
  const form = useFormState({
    values: {
      name: "",
      emails: [],
      accepted: false,
      preferences: [],
      choice: ""
    },
    onValidate: values => {
      if (values.name !== "a") {
        const result = { name: "no" };
        throw result;
      }
    }
  });
  return (
    <Form {...form}>
      <FormLabel {...form} name="name">
        Name
      </FormLabel>
      <FormInput {...form} name="name" placeholder="Name" />
      <FormMessage {...form} name="name" />
      <FormCheckbox {...form} name="accepted" />
      <FormLabel {...form} name="accepted">
        Accept
      </FormLabel>
      <FormGroup {...form} name="preferences">
        <FormLabel {...form} as="legend" name="preferences">
          Preferences
        </FormLabel>
        <label>
          <FormCheckbox {...form} name="preferences" value="html" /> HTML
        </label>
        <label>
          <FormCheckbox {...form} name="preferences" value="css" /> CSS
        </label>
        <label>
          <FormCheckbox {...form} name="preferences" value="JS" /> JS
        </label>
      </FormGroup>
      <FormRadioGroup {...form} name="choice">
        <FormLabel {...form} as="legend" name="choice">
          Choice
        </FormLabel>
        <label>
          <FormRadio {...form} name="choice" value="html" /> HTML
        </label>
        <label>
          <FormRadio {...form} name="choice" value="css" /> CSS
        </label>
        <label>
          <FormRadio {...form} name="choice" value="js" /> JS
        </label>
      </FormRadioGroup>
      {form.values.emails.map((_, i) => (
        <Group key={i}>
          <FormInput {...form} name={["emails", i, "name"]} />
          <FormInput {...form} type="email" name={["emails", i, "email"]} />
          <FormRemoveButton {...form} name="emails" index={i}>
            x
          </FormRemoveButton>
        </Group>
      ))}
      <FormPushButton {...form} name="emails" value={{ name: "", email: "" }}>
        Add email
      </FormPushButton>
      <FormSubmitButton {...form}>Subscribe</FormSubmitButton>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </Form>
  );
}
```

## Accessibility

- `Form` has role `form`.
- Clicking on `FormSubmitButton` on a form with errors will move focus to the first failed input.
- Clicking on `FormPushButton` will move focus to the first input in the added row.
- Clicking on `FormRemoveButton` will move focus to the first input in the next row. If there's no next row, it will move focus to the first input in the previous row. If there's no previous row, it will move focus to `FormPushButton`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Form` uses [Box](/docs/box/).
- `FormCheckbox` uses [Checkbox](/docs/checkbox/).
- `FormGroup` uses [Group](/docs/group/).
- `FormInput` uses [Tabbable](/docs/tabbable/).
- `FormLabel` uses [Box](/docs/box/).
- `FormMessage` uses [Box](/docs/box/).
- `FormPushButton` uses [Button](/docs/button/).
- `FormRadio` uses [Radio](/docs/radio/).
- `FormRadioGroup` uses `FormGroup`.
- `FormRemoveButton` uses [Button](/docs/button/).
- `FormSubmitButton` uses [Button](/docs/button/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useFormState`

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`validateOnBlur`**
  <code>boolean | undefined</code>

  Whether the form should trigger `onValidate` on blur.

- **`validateOnChange`**
  <code>boolean | undefined</code>

  Whether the form should trigger `onValidate` on change.

- **`resetOnSubmitSucceed`**
  <code>boolean | undefined</code>

  Whether the form should reset when it has been successfully submitted.

- **`resetOnUnmount`**
  <code>boolean | undefined</code>

  Whether the form should reset when the component (which called
`useFormState`) has been unmounted.

- **`onValidate`**
  <code>((values: V) =&#62; ValidateReturn&#60;V&#62;) | undefined</code>

  A function that receives `form.values` and return or throw messages.
If it returns, messages will be interpreted as successful messages.
If it throws, they will be interpreted as errors.
It can also return a promise for asynchronous validation.

- **`onSubmit`**
  <code>((values: V) =&#62; ValidateReturn&#60;V&#62;) | undefined</code>

  A function that receives `form.values` and performs form submission.
If it's triggered by `form.submit()`, `onValidate` will be called before.
If `onValidate` throws, `onSubmit` will not be called.
`onSubmit` can also return promises, messages and throw error messages
just like `onValidate`. The only difference is that this validation will
only occur on submit.

### `Form`

- **`submit`**
  <code>() =&#62; void</code>

  Triggers form submission (calling `onValidate` and `onSubmit` underneath).

### `FormCheckbox`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`checked`**
  <code>boolean | undefined</code>

  Checkbox's checked state. If present, it's used instead of `state`.

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`update`**
  <code>Update&#60;V&#62;</code>

  Updates a form value.

- **`blur`**
  <code>&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void</code>

  Sets field's touched state to `true`.

- **`touched`**
  <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V...</code>

  An object with the same shape as `form.values` with `boolean` values.
This keeps the touched state of each field. That is, whether a field has
been blurred.

- **`errors`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string error messages.
This stores the error messages throwed by `onValidate` and `onSubmit`.

- **`name`**
  <code>P</code>

  Checkbox's name as in form values.

- **`value`**
  <code>ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; | undefined</code>

  Checkbox's value is going to be used when multiple checkboxes share the
same state. Checking a checkbox with value will add it to the state
array.

### `FormGroup`

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`touched`**
  <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V...</code>

  An object with the same shape as `form.values` with `boolean` values.
This keeps the touched state of each field. That is, whether a field has
been blurred.

- **`errors`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string error messages.
This stores the error messages throwed by `onValidate` and `onSubmit`.

- **`name`**
  <code>P</code>

  FormGroup's name as in form values.

### `FormInput`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`update`**
  <code>Update&#60;V&#62;</code>

  Updates a form value.

- **`blur`**
  <code>&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void</code>

  Sets field's touched state to `true`.

- **`touched`**
  <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V...</code>

  An object with the same shape as `form.values` with `boolean` values.
This keeps the touched state of each field. That is, whether a field has
been blurred.

- **`errors`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string error messages.
This stores the error messages throwed by `onValidate` and `onSubmit`.

- **`name`**
  <code>P</code>

  FormInput's name as in form values.

### `FormLabel`

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`name`**
  <code>P</code>

  FormInput's name as in form values.

- **`label`**
  <code>any</code>

  Label can be passed as the `label` prop or `children`.

### `FormMessage`

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`touched`**
  <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V...</code>

  An object with the same shape as `form.values` with `boolean` values.
This keeps the touched state of each field. That is, whether a field has
been blurred.

- **`errors`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string error messages.
This stores the error messages throwed by `onValidate` and `onSubmit`.

- **`messages`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string messages.
This stores the messages returned by `onValidate` and `onSubmit`.

- **`name`**
  <code>P</code>

  FormInput's name as in form values.

### `FormPushButton`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`push`**
  <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, value?: ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; | undefined) =&#62; void">&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, value?: Arr...</code>

  Pushes a new item into `form.values[name]`, which should be an array.

- **`name`**
  <code>P</code>

  FormInput's name as in form values. This should point to array value.

- **`value`**
  <code title="DeepPathValue&#60;V, P&#62; extends (infer U)[] ? U : never">DeepPathValue&#60;V, P&#62; extends (infer U)[] ? U : n...</code>

  The value that is going to be pushed to `form.values[name]`.

### `FormRadio`

- **`values`**
  <code>V</code>

  Form values.

- **`update`**
  <code>Update&#60;V&#62;</code>

  Updates a form value.

- **`blur`**
  <code>&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void</code>

  Sets field's touched state to `true`.

- **`name`**
  <code>P</code>

  FormRadio's name as in form values.

- **`value`**
  <code title="P extends DeepPathArray&#60;V, P&#62; ? DeepPathArrayValue&#60;V, P&#62; : P extends keyof V ? V[P] : any">P extends DeepPathArray&#60;V, P&#62; ? DeepPathArrayVa...</code>

  FormRadio's value.

### `FormRadioGroup`

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`touched`**
  <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V...</code>

  An object with the same shape as `form.values` with `boolean` values.
This keeps the touched state of each field. That is, whether a field has
been blurred.

- **`errors`**
  <code title="{ [P in keyof DeepMap&#60;V, string | void | null&#62;]?: (DeepMap&#60;V, string | void | null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string | void | null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string | ... 1 more ... | null&#62;[P]&#62;) | undefined; }">{ [P in keyof DeepMap&#60;V, string | void | null&#62;]...</code>

  An object with the same shape as `form.values` with string error messages.
This stores the error messages throwed by `onValidate` and `onSubmit`.

- **`name`**
  <code>P</code>

  FormGroup's name as in form values.

### `FormRemoveButton`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`values`**
  <code>V</code>

  Form values.

- **`remove`**
  <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, index: number) =&#62; void">&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, index: numb...</code>

  Removes `form.values[name][index]`.

- **`name`**
  <code>P</code>

  FormInput's name as in form values. This should point to array value.

- **`index`**
  <code>number</code>

  The index in `form.values[name]` that will be removed.

### `FormSubmitButton`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`submitting`**
  <code>boolean</code>

  Whether form is submitting or not.

- **`baseId`**
  <code>string</code>

  An ID that will serve as a base for the form elements.

- **`submit`**
  <code>() =&#62; void</code>

  Triggers form submission (calling `onValidate` and `onSubmit` underneath).
