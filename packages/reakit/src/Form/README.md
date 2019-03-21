---
path: /docs/form
---

# Form

## Usage

```jsx
import {
  Form,
  FormLabel,
  FormCheckbox,
  FormGroup,
  FormRadio,
  FormRemoveButton,
  FormPushButton,
  FormSubmitButton,
  FormInput,
  FormMessage,
  useFormState
} from "reakit";

function Example() {
  const form = useFormState({
    initialValues: {
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
      <FormInput name="name" {...form} />
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
      <FormGroup name="choice" radio {...form}>
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
      </FormGroup>
      {form.values.emails.map((_, i) => (
        <div key={i}>
          <FormInput name={["emails", i, "name"]} {...form} />
          <FormInput type="email" name={["emails", i, "email"]} {...form} />
          <FormRemoveButton name="emails" index={i} {...form}>
            x
          </FormRemoveButton>
        </div>
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
