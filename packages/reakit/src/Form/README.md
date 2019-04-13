---
path: /docs/form
redirect_from:
  - /components/field
  - /components/input
  - /components/label
---

# Form

## Usage

```jsx
import {
  Group,
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
} from "reakit";

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
      <FormLabel name="name" {...form}>
        Name
      </FormLabel>
      <FormInput name="name" placeholder="Name" {...form} />
      <FormMessage name="name" {...form} />
      <FormCheckbox name="accepted" {...form} />
      <FormLabel name="accepted" {...form}>
        Accept
      </FormLabel>
      <FormGroup name="preferences" {...form}>
        <FormLabel as="legend" name="preferences" {...form}>
          Preferences
        </FormLabel>
        <label>
          <FormCheckbox name="preferences" value="html" {...form} /> HTML
        </label>
        <label>
          <FormCheckbox name="preferences" value="css" {...form} /> CSS
        </label>
        <label>
          <FormCheckbox name="preferences" value="JS" {...form} /> JS
        </label>
      </FormGroup>
      <FormRadioGroup name="choice" {...form}>
        <FormLabel as="legend" name="choice" {...form}>
          Choice
        </FormLabel>
        <label>
          <FormRadio name="choice" value="html" {...form} /> HTML
        </label>
        <label>
          <FormRadio name="choice" value="css" {...form} /> CSS
        </label>
        <label>
          <FormRadio name="choice" value="js" {...form} /> JS
        </label>
      </FormRadioGroup>
      {form.values.emails.map((_, i) => (
        <Group key={i}>
          <FormInput name={["emails", i, "name"]} {...form} />
          <FormInput type="email" name={["emails", i, "email"]} {...form} />
          <FormRemoveButton name="emails" index={i} {...form}>
            x
          </FormRemoveButton>
        </Group>
      ))}
      <FormPushButton name="emails" value={{ name: "", email: "" }} {...form}>
        Add email
      </FormPushButton>
      <FormSubmitButton {...form}>Subscribe</FormSubmitButton>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </Form>
  );
}
```

## Props

<!-- Automatically generated -->

### `useFormState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>validateOnBlur</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether the form should trigger `onValidate` on blur. |
| <strong><code>validateOnChange</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether the form should trigger `onValidate` on change. |
| <strong><code>resetOnSubmitSucceed</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether the form should reset when it has been successfully submitted. |
| <strong><code>resetOnUnmount</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether the form should reset when the component (which called `useFormState`) has been unmounted. |
| <strong><code>onValidate</code>&nbsp;</strong> | <code title="((values: V) =&#62; ValidateReturn&#60;V&#62;) &#124; undefined">((values:&nbsp;V)&nbsp;=&#62;&nbsp;ValidateRet...</code> | A function that receives `form.values` and return or throw messages. If it returns, messages will be interpreted as successful messages. If it throws, they will be interpreted as errors. It can also return a promise for asynchronous validation. |
| <strong><code>onSubmit</code>&nbsp;</strong> | <code title="((values: V) =&#62; ValidateReturn&#60;V&#62;) &#124; undefined">((values:&nbsp;V)&nbsp;=&#62;&nbsp;ValidateRet...</code> | A function that receives `form.values` and performs form submission. If it's triggered by `form.submit()`, `onValidate` will be called before. If `onValidate` throws, `onSubmit` will not be called. `onSubmit` can also return promises, messages and throw error messages just like `onValidate`. The only difference is that this validation will only occur on submit. |

### `Form`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>submit</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Triggers form submission (calling `onValidate` and `onSubmit` underneath). |

### `FormCheckbox`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Checkbox's checked state. If present, it's used instead of currentValue. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | Updates a form value. |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | Sets field's touched state to `true`. |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | An object with the same shape as `form.values` with `boolean` values. This keeps the touched state of each field. That is, whether a field has been blurred. |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string error messages. This stores the error messages throwed by `onValidate` and `onSubmit`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | Checkbox's name as in form values. |
| <strong><code>value</code>&nbsp;</strong> | <code title="ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; &#124; undefined">ArrayValue&#60;DeepPathValue&#60;V,...</code> | Checkbox's value is going to be used when multiple checkboxes share the same state. Checking a checkbox with value will add it to the state array. |

### `FormGroup`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | An object with the same shape as `form.values` with `boolean` values. This keeps the touched state of each field. That is, whether a field has been blurred. |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string error messages. This stores the error messages throwed by `onValidate` and `onSubmit`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormGroup's name as in form values. |

### `FormInput`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | Updates a form value. |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | Sets field's touched state to `true`. |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | An object with the same shape as `form.values` with `boolean` values. This keeps the touched state of each field. That is, whether a field has been blurred. |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string error messages. This stores the error messages throwed by `onValidate` and `onSubmit`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormInput's name as in form values. |

### `FormLabel`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormInput's name as in form values. |
| <strong><code>label</code>&nbsp;</strong> | <code>any</code> | Label can be passed as the `label` prop or `children`. |

### `FormMessage`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | An object with the same shape as `form.values` with `boolean` values. This keeps the touched state of each field. That is, whether a field has been blurred. |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string error messages. This stores the error messages throwed by `onValidate` and `onSubmit`. |
| <strong><code>messages</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string messages. This stores the messages returned by `onValidate` and `onSubmit`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormInput's name as in form values. |

### `FormPushButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>push</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, value?: ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; &#124; undefined) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | Pushes a new item into `form.values[name]`, which should be an array. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormInput's name as in form values. This should point to array value. |
| <strong><code>value</code>&nbsp;</strong> | <code title="DeepPathValue&#60;V, P&#62; extends (infer U)[] ? U : never">DeepPathValue&#60;V,&nbsp;P&#62;&nbsp;extends...</code> | The value that is going to be pushed to `form.values[name]`. |

### `FormRadio`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | Updates a form value. |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | Sets field's touched state to `true`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormRadio's name as in form values. |
| <strong><code>value</code>&nbsp;</strong> | <code title="P extends DeepPathArray&#60;V, P&#62; ? DeepPathArrayValue&#60;V, P&#62; : P extends keyof V ? V[P] : any">P&nbsp;extends&nbsp;DeepPathArray&#60;V,&nbsp;...</code> | FormRadio's value. |

### `FormRadioGroup`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | An object with the same shape as `form.values` with `boolean` values. This keeps the touched state of each field. That is, whether a field has been blurred. |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | An object with the same shape as `form.values` with string error messages. This stores the error messages throwed by `onValidate` and `onSubmit`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormGroup's name as in form values. |

### `FormRemoveButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | Form values. |
| <strong><code>remove</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, index: number) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | Removes `form.values[name][index]`. |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | FormInput's name as in form values. This should point to array value. |
| <strong><code>index</code>&nbsp;</strong> | <code>number</code> | The index in `form.values[name]` that will be removed. |

### `FormSubmitButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>submitting</code>&nbsp;</strong> | <code>boolean</code> | Whether form is submitting or not. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | An ID that will serve as a base for the form elements. |
| <strong><code>submit</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Triggers form submission (calling `onValidate` and `onSubmit` underneath). |
