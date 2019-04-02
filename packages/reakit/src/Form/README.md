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
