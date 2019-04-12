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
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>validateOnBlur</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
| <strong><code>validateOnChange</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
| <strong><code>resetOnSubmitSucceed</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
| <strong><code>resetOnUnmount</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | TODO: Description |
| <strong><code>onValidate</code>&nbsp;</strong> | <code title="((values: V) =&#62; ValidateReturn&#60;V&#62;) &#124; undefined">((values:&nbsp;V)&nbsp;=&#62;&nbsp;ValidateRet...</code> | TODO: Description |
| <strong><code>onSubmit</code>&nbsp;</strong> | <code title="((values: V) =&#62; ValidateReturn&#60;V&#62;) &#124; undefined">((values:&nbsp;V)&nbsp;=&#62;&nbsp;ValidateRet...</code> | TODO: Description |

### `Form`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>submit</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | TODO: Description |

### `FormCheckbox`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>currentValue</code>&nbsp;</strong> | <code title="boolean &#124; any[] &#124; &#34;indeterminate&#34;">boolean&nbsp;&#124;&nbsp;any[]&nbsp;&#124;&nbsp;&#34;indeterm...</code> | Stores the state of the checkbox. If checkboxes that share this state have defined a `value` prop, it's going to be an array. |
| <strong><code>setValue</code>&nbsp;</strong> | <code title="(value: SetStateAction&#60;boolean &#124; any[] &#124; &#34;indeterminate&#34;&#62;) =&#62; void">(value:&nbsp;SetStateAction&#60;bool...</code> | Sets `currentValue`. |
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Checkbox's checked state. If present, it's used instead of currentValue. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | TODO: Description |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | TODO: Description |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | TODO: Description |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |
| <strong><code>value</code>&nbsp;</strong> | <code title="ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; &#124; undefined">ArrayValue&#60;DeepPathValue&#60;V,...</code> | TODO: Description |

### `FormGroup`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | TODO: Description |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |

### `FormInput`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | TODO: Description |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | TODO: Description |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | TODO: Description |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |

### `FormLabel`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |
| <strong><code>label</code>&nbsp;</strong> | <code>any</code> | TODO: Description |

### `FormMessage`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | TODO: Description |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>messages</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |

### `FormPushButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>push</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, value?: ArrayValue&#60;DeepPathValue&#60;V, P&#62;&#62; &#124; undefined) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |
| <strong><code>value</code>&nbsp;</strong> | <code title="DeepPathValue&#60;V, P&#62; extends (infer U)[] ? U : never">DeepPathValue&#60;V,&nbsp;P&#62;&nbsp;extends...</code> | TODO: Description |

### `FormRadio`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>update</code>&nbsp;</strong> | <code>Update&#60;V&#62;</code> | TODO: Description |
| <strong><code>blur</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |
| <strong><code>value</code>&nbsp;</strong> | <code title="P extends DeepPathArray&#60;V, P&#62; ? DeepPathArrayValue&#60;V, P&#62; : P extends keyof V ? V[P] : any">P&nbsp;extends&nbsp;DeepPathArray&#60;V,&nbsp;...</code> | TODO: Description |

### `FormRadioGroup`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>touched</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, boolean&#62;]?: (DeepMap&#60;V, boolean&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, boolean&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, boolean&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;bo...</code> | TODO: Description |
| <strong><code>errors</code>&nbsp;</strong> | <code title="{ [P in keyof DeepMap&#60;V, string &#124; void &#124; null&#62;]?: (DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends (infer U)[] ? DeepPartial&#60;U&#62;[] : DeepMap&#60;V, string &#124; void &#124; null&#62;[P] extends readonly (infer U)[] ? readonly DeepPartial&#60;U&#62;[] : DeepPartial&#60;DeepMap&#60;V, string &#124; ... 1 more ... &#124; null&#62;[P]&#62;) &#124; undefined; }">{&nbsp;[P&nbsp;in&nbsp;keyof&nbsp;DeepMap&#60;V,&nbsp;st...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |

### `FormRemoveButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>values</code>&nbsp;</strong> | <code>V</code> | TODO: Description |
| <strong><code>remove</code>&nbsp;</strong> | <code title="&#60;P extends DeepPath&#60;V, P&#62;&#62;(name: P, index: number) =&#62; void">&#60;P&nbsp;extends&nbsp;DeepPath&#60;V,&nbsp;P&#62;&#62;(...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>P</code> | TODO: Description |
| <strong><code>index</code>&nbsp;</strong> | <code>number</code> | TODO: Description |

### `FormSubmitButton`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>submitting</code>&nbsp;</strong> | <code>boolean</code> | TODO: Description |
| <strong><code>baseId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
| <strong><code>submit</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | TODO: Description |
