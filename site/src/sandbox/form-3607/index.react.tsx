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
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      if (!item.name) {
        form.setError(form.names.items[i].name, "Name is required");
      }
    }
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
