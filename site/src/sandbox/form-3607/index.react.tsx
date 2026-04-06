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
      const name = form.names.items[i]?.name;
      if (!name) continue;
      if (!item.name) {
        form.setError(name, "Name is required");
      }
    }
  });

  form.useSubmit(async (state) => {
    alert(JSON.stringify(state.values));
  });

  const items = form.useState("values").items;

  return (
    <ak.Form store={form}>
      {items.map((_, index) => {
        const name = form.names.items[index]?.name;
        if (!name) return null;
        return (
          <Fragment key={index}>
            <ak.FormLabel name={name}>Item {index + 1} name</ak.FormLabel>
            <ak.FormInput name={name} />
            <ak.FormError name={name} />
          </Fragment>
        );
      })}
      <ak.FormSubmit>Submit</ak.FormSubmit>
    </ak.Form>
  );
}
