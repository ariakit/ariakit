import {
  Component,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getDocument } from "ariakit-utils/dom";
import {
  useForkRef,
  useUpdateEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { cx } from "ariakit-utils/misc";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { PortalContext } from "ariakit/portal";
import { Role, RoleProps } from "ariakit/role";
import { compileComponent } from "./__utils/compile-component";
import { compileModule } from "./__utils/compile-module";
import { getCSSModule } from "./__utils/css-module";
import { getFile } from "./__utils/get-file";
import { PlaygroundContext } from "./__utils/playground-context";
import { resolveModule } from "./__utils/resolve-module";
import { PlaygroundState } from "./playground-state";

function ErrorMessage(props: RoleProps) {
  return <Role role="alert" {...props} />;
}

type ErrorBoundaryProps = {
  resetKey?: any;
  errorProps?: RoleProps;
  children: ReactNode;
};

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: { error: Error | null } = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    return (
      <>
        {!this.state.error && this.props.children}
        <ErrorMessage {...this.props.errorProps}>
          {this.state.error?.message}
        </ErrorMessage>
      </>
    );
  }
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useUpdateEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), ms);
    return () => clearTimeout(timeout);
  }, [value, ms]);
  return debouncedValue;
}

function usePortalRoot(ref: RefObject<HTMLElement>, className?: string) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const document = getDocument(element);
    const root = document.createElement("div");
    if (className) {
      root.className = className;
    }
    document.body.appendChild(root);
    setPortalRoot(root);
    return () => {
      root.remove();
    };
  }, [ref, className]);

  return portalRoot;
}

export const usePlaygroundPreview = createHook<PlaygroundPreviewOptions>(
  ({ state, file, errorProps, getModule: getModuleProp, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<Error | null>(null);
    const [className, setClassName] = useState("");
    const values = state?.values || {};
    const filename = getFile(values, file);
    const debouncedValues = useDebouncedValue(values, 500);
    const value = debouncedValues[filename] || "";

    const handleError = useCallback((e) => {
      console.error(e);
      setError(e);
    }, []);

    const getModule = useCallback(
      (path: string) => {
        setClassName("");
        const externalModule = getModuleProp?.(path);
        if (externalModule != null) return externalModule;
        const availableNames = Object.keys(debouncedValues);
        const moduleName = resolveModule(path, availableNames);
        if (!moduleName) return;
        const code = debouncedValues[moduleName] || "";
        try {
          const internalModule = compileModule(code, moduleName, getModule);
          setClassName(getCSSModule(internalModule));
          return internalModule;
        } catch (e) {
          handleError(e);
        }
      },
      [getModuleProp, debouncedValues, filename, handleError]
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

    const portalRoot = usePortalRoot(ref, className);

    props = useWrapElement(
      props,
      (element) => (
        <ErrorBoundary resetKey={debouncedValues}>
          <PortalContext.Provider value={portalRoot}>
            {element}
          </PortalContext.Provider>
          <ErrorMessage {...errorProps}>{error?.message}</ErrorMessage>
        </ErrorBoundary>
      ),
      [error, debouncedValues, portalRoot, errorProps]
    );

    const children = Component ? <Component /> : null;

    props = {
      children,
      ...props,
      ref: useForkRef(ref, props.ref),
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
  errorProps?: RoleProps;
};

export type PlaygroundPreviewProps<T extends As = "div"> = Props<
  PlaygroundPreviewOptions<T>
>;
