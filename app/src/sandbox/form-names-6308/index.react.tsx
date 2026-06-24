import * as ak from "@ariakit/react";
import { Component, useState } from "react";
import type { ReactNode } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6308
//
// `form.names.*` values are documented string-like field paths. Accessing an
// absent *symbol* key on one must return `undefined` like a plain object would,
// instead of throwing "Cannot convert a Symbol value to a string" from the
// names proxy. Two ordinary things an app does hit that absent-symbol access:
//
// - Rendering a raw name as a React child ("Show field name"): react-dom probes
//   the child for `Symbol.iterator` to decide whether it is iterable. The proxy
//   used to throw there, tearing down the surrounding tree, instead of letting
//   React raise its own "Objects are not valid as a React child" error.
// - Inspecting a name with `Object.prototype.toString.call(...)` ("Inspect field
//   name"): it probes `Symbol.toStringTag` and should resolve to "[object
//   Object]" rather than throwing.
//
// The error boundary wraps only the rendered name so the rest of the paragraph
// stays mounted: the bug puts the Symbol coercion crash in its place, while both
// the userland workaround (coercing the name) and the library fix keep that
// crash away.
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

  // Rendering a raw name as a React child is intentionally invalid here:
  // `form.names.email` is typed as a string-like object, not a string, so
  // TypeScript already flags it — the documented cue to coerce with
  // `${form.names.email}`. Keeping it un-coerced reproduces the runtime crash
  // from https://github.com/ariakit/ariakit/issues/6308.
  // @ts-expect-error -- StringLike is not assignable to ReactNode.
  const rawFieldName: ReactNode = form.names.email;

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
            <code>{rawFieldName}</code>
          </NameBoundary>
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          setObjectTag(Object.prototype.toString.call(form.names.email))
        }
      >
        Inspect field name
      </button>
      {objectTag != null && <output>{objectTag}</output>}
    </ak.Form>
  );
}
