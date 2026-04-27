import * as ak from "@ariakit/react";

export default function Example() {
  const form = ak.useFormStore({
    defaultValues: { color: "red" },
  });

  return (
    <ak.TabProvider>
      <ak.TabList aria-label="Settings">
        <ak.Tab>Preferences</ak.Tab>
        <ak.Tab>Account</ak.Tab>
      </ak.TabList>
      <ak.TabPanel>
        <ak.Form store={form}>
          <ak.FormRadioGroup>
            <ak.FormGroupLabel>Favorite color</ak.FormGroupLabel>
            <label>
              <ak.FormRadio name={form.names.color} value="red" />
              Red
            </label>
            <label>
              <ak.FormRadio name={form.names.color} value="green" />
              Green
            </label>
            <label>
              <ak.FormRadio name={form.names.color} value="blue" />
              Blue
            </label>
          </ak.FormRadioGroup>
          <ak.FormSubmit>Submit</ak.FormSubmit>
        </ak.Form>
      </ak.TabPanel>
      <ak.TabPanel>Account settings</ak.TabPanel>
    </ak.TabProvider>
  );
}
