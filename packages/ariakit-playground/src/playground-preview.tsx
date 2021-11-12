import {
  Component,
  ReactNode,
  useCallback,
  useDeferredValue,
  useState,
} from "react";
import { useUpdateEffect, useWrapElement } from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { compileComponent, compileModule } from "./__compile";
import {
  PlaygroundContext,
  getFile,
  getModuleCSS,
  resolveModule,
} from "./__utils";
import { PlaygroundState } from "./playground-state";

function ErrorMessage(props: { children: ReactNode }) {
  return <div role="alert" {...props} />;
}

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state: { error: Error | null } = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return (
      <>
        {!this.state.error && this.props.children}
        <ErrorMessage>{this.state.error?.message}</ErrorMessage>
      </>
    );
  }
}

export const usePlaygroundPreview = createHook<PlaygroundPreviewOptions>(
  ({ state, file, getModule: getModuleProp, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const [error, setError] = useState<Error | null>(null);
    const [className, setClassName] = useState("");
    const values = state?.values || {};
    const filename = getFile(values, file);
    // TODO: Add delay 500, but update immediately if cmd+S is pressed
    const value = useDeferredValue(values[filename] || "");

    const handleError = useCallback((e) => {
      console.error(e);
      setError(e);
    }, []);

    const getModule = useCallback(
      (path: string) => {
        const externalModule = getModuleProp?.(path);
        if (externalModule != null) return externalModule;
        const availableNames = Object.keys(values);
        const moduleName = resolveModule(path, availableNames);
        if (!moduleName) return;
        const code = values[moduleName] || "";
        try {
          const internalModule = compileModule(code, moduleName, getModule);
          setClassName(getModuleCSS(internalModule));
          return internalModule;
        } catch (e) {
          handleError(e);
        }
      },
      [getModuleProp, values, filename, handleError]
    );

    const [Component, setComponent] = useState(() => {
      try {
        return compileComponent(value, filename, getModule);
      } catch (e) {
        handleError(e);
      }
      return null;
    });

    useUpdateEffect(() => {
      setError(null);
      try {
        const component = compileComponent(value, filename, getModule);
        setComponent(() => component);
      } catch (e) {
        handleError(e);
      }
    }, [value, filename, getModule]);

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
  getModule?: (path: string) => any;
};

export type PlaygroundPreviewProps<T extends As = "div"> = Props<
  PlaygroundPreviewOptions<T>
>;
