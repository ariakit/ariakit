import * as ak from "@ariakit/react";
import { Component, useState } from "react";
import type { ReactNode } from "react";

// Workaround for https://github.com/ariakit/ariakit/issues/6308
//
// `form.names.*` values are documented string-like field paths, but the proxy
// throws "Cannot convert a Symbol value to a string" when an absent *symbol*
// key is read — which happens when react-dom probes a rendered child for
// `Symbol.iterator`, or when `Object.prototype.toString.call(...)` probes
// `Symbol.toStringTag`. Coercing the name to a string with `String(...)` before
// it reaches either operation avoids the crash until the library fix lands.
//
// The error boundary wraps only the rendered name; with the workaround applied
// it stays inert, but it is what keeps the rest of the paragraph mounted (and
// the crash localized) without the coercion.
class NameBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <span role="alert">Render error: {this.state.error.message}</span>;
    }
    return this.props.children;
  }
}

export default function Example() {
  const form = ak.useFormStore({ defaultValues: { email: "" } });
  const [fieldNameVisible, setFieldNameVisible] = useState(false);
  const [objectTag, setObjectTag] = useState<string>();

  return (
    <ak.Form store={form}>
      <ak.FormLabel name={form.names.email}>Email</ak.FormLabel>
      <ak.FormInput type="email" name={form.names.email} required />

      <button type="button" onClick={() => setFieldNameVisible(true)}>
        Show field name
      </button>
      {fieldNameVisible && (
        <p>
          This value is submitted as{" "}
          <NameBoundary>
            {/* TODO(#6308): remove String() once the names proxy fix lands. */}
            <code>{String(form.names.email)}</code>
          </NameBoundary>
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          // TODO(#6308): remove String() once the names proxy fix lands.
          setObjectTag(Object.prototype.toString.call(String(form.names.email)))
        }
      >
        Inspect field name
      </button>
      {objectTag != null && <output>{objectTag}</output>}
    </ak.Form>
  );
}
