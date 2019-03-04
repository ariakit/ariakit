import * as React from "react";
import * as ReactDOM from "react-dom";
import { compileComponent } from "./__utils/compileComponent";
import { EditorState } from "./useEditorState";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorMessage } from "./ErrorMessage";

export type PreviewProps = EditorState & {
  /** TODO: Description */
  modules?: Record<string, any>;
};

export function Preview(props: PreviewProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((e: Error) => {
    setError(e);
    console.error(e); // eslint-disable-line no-console
  }, []);

  const [rendered, setRendered] = React.useState(() => {
    try {
      return compileComponent(props.code, props.modules);
    } catch (e) {
      handleError(e);
    }
    return null;
  });

  const unmount = React.useCallback(() => {
    if (ref.current) {
      setRendered(null);
      ReactDOM.unmountComponentAtNode(ref.current);
    }
  }, []);

  React.useEffect(() => {
    if (!props.code) return undefined;
    const timer = setTimeout(() => {
      setError(null);
      try {
        const exampleComponent = compileComponent(props.code);
        unmount();
        ReactDOM.render(exampleComponent, ref.current);
      } catch (e) {
        unmount();
        handleError(e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [props.code, handleError, unmount]);

  return (
    <ErrorBoundary>
      {error && <ErrorMessage error={error} />}
      <div ref={ref}>{rendered}</div>
    </ErrorBoundary>
  );
}
