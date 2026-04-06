import * as ak from "@ariakit/react";
import { Fragment } from "react";

interface Item {
  name: string;
}

export default function Example() {
  const form = ak.useFormStore({
    defaultValues: {
      items: [{ name: "" }, { name: "" }] as Item[],
    },
  });

  form.useValidate(() => {
    const items = form.getValue(form.names.items);
    // TODO: Remove workaround once fixed
    // https://github.com/ariakit/ariakit/issues/3607
    // Workaround: use setErrors() with the full nested structure instead of
    // setError() for individual nested fields, because setError() doesn't
    // create intermediate objects/arrays.
    const errors: { items: Array<{ name?: string }> } = {
      items: items.map(() => ({})),
    };
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      const itemError = errors.items[i];
      if (!itemError) continue;
      if (!item.name) {
        itemError.name = "Name is required";
      }
    }
    form.setErrors(errors);
  });

  form.useSubmit(async (state) => {
    alert(JSON.stringify(state.values));
  });

  const items = form.useState("values").items;

  return (
    <ak.Form store={form}>
      {items.map((_, index) => (
        <Fragment key={index}>
          <ak.FormLabel name={form.names.items[index].name}>
            Item {index + 1} name
          </ak.FormLabel>
          <ak.FormInput name={form.names.items[index].name} />
          <ak.FormError name={form.names.items[index].name} />
        </Fragment>
      ))}
      <ak.FormSubmit>Submit</ak.FormSubmit>
    </ak.Form>
  );
}
