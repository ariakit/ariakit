// TODO: Refactor
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as system from "reakit-system-classic";
import { Provider } from "reakit/utils/Provider";
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
  const [prefix] = React.useState(
    () =>
      `preview-${Math.random()
        .toString(32)
        .substr(2, 6)}-`
  );
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((e: Error) => {
    setError(e);
    console.error(e); // eslint-disable-line no-console
  }, []);

  const [initialCode] = React.useState(props.code);
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
    if (!props.code || props.code === initialCode) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setError(null);
      try {
        const exampleComponent = compileComponent(props.code);
        unmount();
        ReactDOM.render(
          <Provider system={system} prefix={prefix}>
            {exampleComponent}
          </Provider>,
          ref.current
        );
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
      <div ref={ref} style={{ padding: 50 }}>
        <Provider system={system} prefix={prefix}>
          {rendered}
        </Provider>
      </div>
    </ErrorBoundary>
  );
}
