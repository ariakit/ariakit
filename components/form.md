# Form

<p data-description>
  Submit information with accessible interactive controls in React. Take advantage of the browser's built-in validation with screen reader support. This component is based on the <a href="https://w3c.github.io/aria/#form">WAI-ARIA Form Role</a>.
</p>

<a href="../examples/form/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/form-store">useFormStore</a>()

&lt;<a href="/api-reference/form">Form</a>&gt;
  &lt;<a href="/api-reference/form-group">FormGroup</a>&gt;
    &lt;<a href="/api-reference/form-group-label">FormGroupLabel</a> /&gt;
    &lt;<a href="/api-reference/form-label">FormLabel</a> /&gt;
    &lt;<a href="/api-reference/form-field">FormField</a>|<a href="/api-reference/form-input">FormInput</a>|<a href="/api-reference/form-checkbox">FormCheckbox</a> /&gt;
    &lt;<a href="/api-reference/form-description">FormDescription</a> /&gt;
    &lt;<a href="/api-reference/form-error">FormError</a> /&gt;
    &lt;<a href="/api-reference/form-push">FormPush</a> /&gt;
    &lt;<a href="/api-reference/form-remove">FormRemove</a> /&gt;
  &lt;/FormGroup&gt;
  &lt;<a href="/api-reference/form-radio-group">FormRadioGroup</a>&gt;
    &lt;<a href="/api-reference/form-radio">FormRadio</a> /&gt;
  &lt;/FormRadioGroup&gt;
  &lt;<a href="/api-reference/form-reset">FormReset</a> /&gt;
  &lt;<a href="/api-reference/form-submit">FormSubmit</a> /&gt;
&lt;/Form&gt;
</pre>

## Submitting the form

The [`useFormStore`](/api-reference/form-store) function returns a [`useSubmit`](/api-reference/form-store#usesubmit) hook that can be used to register a submit handler on the form store. All registered handlers run when the user submits the form or the program calls the [`submit`](/api-reference/form-store#submit) function.

Submit handlers may return a promise and interact with the form store. This means we can access the form [`values`](/api-reference/form-store#values) and call methods such as [`setErrors`](/api-reference/form-store#seterrors) to display errors when the form is submitted:

```js
const form = useFormStore();

form.useSubmit(async (state) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(state.values),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  if (!response.ok) {
    form.setErrors(await response.json());
  }
});
```

## Validating the form

### Built-in validation

Ariakit supports the [browser's built-in validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation). We can use props like `required`, `minLength`, `maxLength`, `min`, `max`, `type`, and `pattern` to add simple validation to our form fields.

This method has a great advantage: the error messages are automatically localized to the user's language by the browser. However, the default UI doesn't necessarily follow accessibility standards. Also, the style of the error messages is not customizable, and we can't control when they are displayed.

Thankfully, JavaScript allows us to hook into this validation process using the [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation), which [`FormField`](/api-reference/form-field) uses internally. This way, we can display the error messages in a way that is accessible and customizable.

### Custom validation

Similar to [Submitting the form](#submitting-the-form), the [`useFormStore`](/api-reference/form-store) function also returns a [`useValidate`](/api-reference/form-store#usevalidate) hook that can be used to register a validation handler on the form store.

We can pass this hook to other components as a prop to create field-level validations:

```jsx
function MyForm() {
  const form = useFormStore({ defaultValue: { name: "" } });
  return (
    <Form store={form}>
      <NameInput store={form} name={form.names.name} />
    </Form>
  );
}

function NameInput({ store, name, ...props }) {
  store.useValidate(() => {
    const value = store.getValue(name);
    if (value.length < 3) {
      store.setError(name, "Name must be at least 3 characters long");
    }
  });
  return <FormInput name={name} {...props} />;
}
```

## Styling

### Styling the invalid state

The [`FormField`](/api-reference/form-field) component — which is used by [`FormInput`](/api-reference/form-input), [`FormCheckbox`](/api-reference/form-checkbox), [`FormRadio`](/api-reference/form-radio), and other form components — sets the `aria-invalid` attribute to `true` when the field is invalid. You can use this attribute to style the invalid state:

```css
.field[aria-invalid="true"] {
  /* ... */
}
```

Learn more in [Styling](/guide/styling).
