import * as React from "react";
import * as ReactDOM from "react-dom";
import * as system from "reakit-system-bootstrap";
import { useId } from "reakit-utils";
import { Provider } from "reakit";
import { useOptions, useProps } from "reakit-system";
import { compileComponent } from "./__utils/compileComponent";
import { PlaygroundStateReturn } from "./usePlaygroundState";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorMessage } from "./ErrorMessage";

export type PlaygroundPreviewOptions = Partial<PlaygroundStateReturn> &
  Pick<PlaygroundStateReturn, "code"> & {
    /** TODO: Description */
    modules?: Record<string, any>;
    /** TODO: Description */
    componentName?: string;
  };

export type PlaygroundPreviewHTMLProps = { className?: string };

export type PlaygroundPreviewProps = PlaygroundPreviewOptions &
  PlaygroundPreviewHTMLProps;

export function PlaygroundPreview({
  code,
  modules,
  update,
  componentName,
  ...htmlProps
}: PlaygroundPreviewOptions & PlaygroundPreviewHTMLProps) {
  const options = useOptions(
    "PlaygroundPreview",
    { code, modules, componentName },
    htmlProps
  );

  const ref = React.useRef<HTMLDivElement>(null);
  const prefix = useId("preview-");
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((e: Error) => {
    setError(e);
    console.error(e); // eslint-disable-line no-console
  }, []);

  const [rendered, setRendered] = React.useState(() => {
    try {
      const Example = compileComponent(
        options.code,
        options.modules,
        options.componentName
      );
      return <Example />;
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
      <Provider unstable_prefix={`${prefix}-`} unstable_system={system}>
        {children}
      </Provider>
    ),
    [prefix]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
      try {
        const Example = compileComponent(
          options.code,
          options.modules,
          options.componentName
        );
        unmount();
        ReactDOM.render(renderChildren(<Example />), ref.current);
      } catch (e) {
        unmount();
        handleError(e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    options.code,
    options.modules,
    options.componentName,
    renderChildren,
    handleError,
    unmount
  ]);

  React.useEffect(() => {
    // Ensure that we unmount the React component when the effect is destroyed.
    return () => unmount();
  }, [unmount]);

  htmlProps = useProps("PlaygroundPreview", options, htmlProps);

  return (
    <ErrorBoundary>
      <div {...htmlProps}>
        {error && <ErrorMessage error={error} />}
        <div ref={ref}>{renderChildren(rendered)}</div>
      </div>
    </ErrorBoundary>
  );
}
