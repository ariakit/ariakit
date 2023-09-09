import * as Ariakit from "@ariakit/react";

export default function Example() {
  const form = Ariakit.useFormStore({
    defaultValues: {
      "123": true, // integer-like property name
      safe: true, // non integer-like property name
    },
  });

  return (
    <Ariakit.Form store={form}>
      <Ariakit.FormLabel name={form.names["123"]}>
        {String(form.names["123"])}
        <Ariakit.FormCheckbox name={form.names["123"]} />
      </Ariakit.FormLabel>
      <Ariakit.FormLabel name={form.names["safe"]}>
        {String(form.names["safe"])}
        <Ariakit.FormCheckbox name={form.names["safe"]} />
      </Ariakit.FormLabel>
    </Ariakit.Form>
  );
}
