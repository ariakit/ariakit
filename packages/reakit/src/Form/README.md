---
path: /docs/form
---

# Form

## Usage

```jsx
import { Form, FormInput, useFormState } from "reakit";

function Example() {
  const form = useFormState({
    initialValues: {
      a: "",
      b: ""
    },
    onValidate: values => {
      if (values.a === "b") {
        const result = { a: "No please" };
        throw result;
      }
    }
  });
  return (
    <Form {...form}>
      <FormInput {...form} name="a" />
      <FormInput {...form} name="b" />
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </Form>
  );
}
```
