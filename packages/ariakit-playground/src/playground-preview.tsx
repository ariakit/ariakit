import { useCallback, useDeferredValue, useState } from "react";
import { useUpdateEffect, useWrapElement } from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { compileComponent, compileModule } from "./__compile";
import { ErrorBoundary } from "./__error-boundary";
import { ErrorMessage } from "./__error-message";
import { PlaygroundContext, getModuleCSS, resolveModule } from "./__utils";
import { PlaygroundState } from "./playground-state";

export const usePlaygroundPreview = createHook<PlaygroundPreviewOptions>(
  ({ state, file, requireModule: requireModuleProp, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const [error, setError] = useState<Error | null>(null);
    const [className, setClassName] = useState("");
    const values = state?.values || {};
    const filename = file || Object.keys(values)[0] || "";
    // TODO: Add delay 500, but update immediately if cmd+S is pressed
    const value = useDeferredValue(values[filename] || "");

    const handleError = useCallback((e) => {
      console.error(e);
      setError(e);
    }, []);

    const requireModule = useCallback(
      (path: string) => {
        const externalModule = requireModuleProp?.(path);
        if (externalModule != null) return externalModule;
        const availableNames = Object.keys(values);
        const moduleName = resolveModule(path, availableNames);
        if (!moduleName) return;
        const code = values[moduleName] || "";
        try {
          const internalModule = compileModule(code, moduleName, requireModule);
          setClassName(getModuleCSS(internalModule));
          return internalModule;
        } catch (e) {
          handleError(e);
        }
      },
      [requireModuleProp, values, filename, handleError]
    );

    const [Component, setComponent] = useState(() => {
      try {
        return compileComponent(value, filename, requireModule);
      } catch (e) {
        handleError(e);
      }
      return null;
    });

    useUpdateEffect(() => {
      setError(null);
      try {
        const component = compileComponent(value, filename, requireModule);
        setComponent(() => component);
      } catch (e) {
        handleError(e);
      }
    }, [value, filename, requireModule]);

    props = useWrapElement(
      props,
      (element) => (
        <ErrorBoundary key={Math.random()}>
          {element}
          <ErrorMessage>{error?.message}</ErrorMessage>
        </ErrorBoundary>
      ),
      [error]
    );

    const children = Component ? <Component /> : null;

    props = {
      children,
      ...props,
      className: cx(className, props.className),
    };

    return props;
  }
);

export const PlaygroundPreview = createMemoComponent<PlaygroundPreviewOptions>(
  (props) => {
    const htmlProps = usePlaygroundPreview(props);
    return createElement("div", htmlProps);
  }
);

export type PlaygroundPreviewOptions<T extends As = "div"> = Options<T> & {
  state?: PlaygroundState;
  file?: string;
  requireModule?: (path: string) => any;
};

export type PlaygroundPreviewProps<T extends As = "div"> = Props<
  PlaygroundPreviewOptions<T>
>;
