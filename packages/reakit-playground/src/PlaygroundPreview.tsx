import * as React from "react";
import * as ReactDOM from "react-dom";
import * as system from "reakit-system-bootstrap";
import { unstable_useId } from "reakit/utils/useId";
import { Provider } from "reakit/utils/Provider";
import { unstable_useOptions } from "reakit/system/useOptions";
import { unstable_useProps } from "reakit/system/useProps";
import { compileComponent } from "./__utils/compileComponent";
import { PlaygroundStateReturn } from "./usePlaygroundState";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorMessage } from "./ErrorMessage";

export type PlaygroundPreviewOptions = PlaygroundStateReturn & {
  /** TODO: Description */
  modules?: Record<string, any>;
};

export type PlaygroundPreviewProps = { className?: string };

Provider.unstable_use(system);

export function PlaygroundPreview({
  code,
  modules,
  update,
  ...htmlProps
}: PlaygroundPreviewOptions & PlaygroundPreviewProps) {
  const options = unstable_useOptions(
    "PlaygroundPreview",
    { code, modules },
    htmlProps
  );

  const ref = React.useRef<HTMLDivElement>(null);
  const prefix = unstable_useId("preview-");
  const [initialCode] = React.useState(options.code);
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((e: Error) => {
    setError(e);
    console.error(e); // eslint-disable-line no-console
  }, []);

  const [rendered, setRendered] = React.useState(() => {
    try {
      return compileComponent(options.code, options.modules);
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

  const renderChildren = React.useCallback(
    (children: React.ReactNode) => (
      <Provider unstable_prefix={`${prefix}-`}>{children}</Provider>
    ),
    []
  );

  React.useEffect(() => {
    // Code hasn't change, do nothing
    if (!options.code || options.code === initialCode) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setError(null);
      try {
        const exampleComponent = compileComponent(
          options.code,
          options.modules
        );
        unmount();
        ReactDOM.render(renderChildren(exampleComponent), ref.current);
      } catch (e) {
        unmount();
        handleError(e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [options.code, handleError, unmount]);

  htmlProps = unstable_useProps("PlaygroundPreview", options, htmlProps);

  return (
    <ErrorBoundary>
      <div {...htmlProps}>
        {error && <ErrorMessage error={error} />}
        <div ref={ref}>{renderChildren(rendered)}</div>
      </div>
    </ErrorBoundary>
  );
}
