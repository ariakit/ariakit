import {
  Component,
  ElementType,
  ReactNode,
  cloneElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { PortalContext } from "@ariakit/react-core/portal/portal-context";
import { Role, RoleProps } from "@ariakit/react-core/role/role";
import {
  useLiveRef,
  useUpdateEffect,
  useWrapElement,
} from "@ariakit/react-core/utils/hooks";
import { createElement, createHook } from "@ariakit/react-core/utils/system";
import { As, Options, Props } from "@ariakit/react-core/utils/types";
import { ClassNames } from "@emotion/react";
import { createMemoComponent, useStore } from "ariakit-react-utils/store";
import { compileComponent } from "./__utils/compile-component";
import { compileModule } from "./__utils/compile-module";
import { getCSSModule } from "./__utils/css-module";
import { getFile } from "./__utils/get-file";
import { PlaygroundContext } from "./__utils/playground-context";
import { resolveModule } from "./__utils/resolve-module";
import { PlaygroundState } from "./playground-state";

function ErrorMessage(props: RoleProps<any>) {
  return <Role role="status" {...props} />;
}

type ErrorBoundaryProps = {
  resetKey?: any;
  error?: Error | null;
  errorProps?: RoleProps<ElementType>;
  children: ReactNode;
};

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: { error: Error | null; children: ReactNode } = {
    error: null,
    children: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      if (!this.state.error) {
        this.setState({ children: this.props.children });
      }
      this.setState({ error: null });
    }
    if (prevProps.error !== this.props.error && !this.state.error) {
      this.setState({ error: this.props.error });
    }
  }

  render() {
    return (
      <>
        {this.state.error ? this.state.children : this.props.children}
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

type PlaygroundPortalProps = {
  children: ReactNode;
  className?: string;
};

function PlaygroundPortal({ children, className }: PlaygroundPortalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement("div");
    if (className) {
      root.className = className;
    }
    document.body.appendChild(root);
    setPortalRoot(root);
    return () => {
      root.remove();
    };
  }, [className]);

  return (
    <PortalContext.Provider value={portalRoot}>
      {children}
    </PortalContext.Provider>
  );
}

export const usePlaygroundPreview = createHook<PlaygroundPreviewOptions>(
  ({ state, file, errorProps, getModule: getModuleProp, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const [error, setError] = useState<Error | null>(null);
    const [cssModule, setCssModule] = useState("");
    const cssModuleRef = useLiveRef(cssModule);
    const values = state?.values || {};
    const filename = getFile(values, file);
    const debouncedValues = useDebouncedValue(values, 750);
    const value = debouncedValues[filename] || "";

    const handleError = useCallback((e: any) => {
      console.error(e);
      setError(e);
    }, []);

    const getModule = useCallback(
      (path: string) => {
        const externalModule = getModuleProp?.(path);
        if (externalModule != null) return externalModule;
        const availableNames = Object.keys(debouncedValues);
        const moduleName = resolveModule(path, availableNames);
        if (!moduleName) return;
        const code = debouncedValues[moduleName] || "";
        try {
          const internalModule = compileModule(code, moduleName, getModule);
          const css = getCSSModule(internalModule);
          if (css) {
            setCssModule(css);
          }
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
      setCssModule("");
      try {
        const component = compileComponent(value, filename, getModule);
        setComponent(() => component);
      } catch (e) {
        handleError(e);
        // Restore previous css module
        setCssModule(cssModuleRef.current);
      }
    }, [value, filename, getModule]);

    props = useWrapElement(
      props,
      (element) => (
        <ErrorBoundary
          resetKey={debouncedValues}
          error={error}
          errorProps={errorProps}
        >
          {element && (
            <ClassNames>
              {({ css, cx }) =>
                cloneElement(element, {
                  className: cx(css(cssModule), element.props.className),
                })
              }
            </ClassNames>
          )}
        </ErrorBoundary>
      ),
      [error, debouncedValues, errorProps, cssModule]
    );

    const children = Component ? (
      <ClassNames>
        {({ css }) => (
          <PlaygroundPortal className={css(cssModule)}>
            <Component />
          </PlaygroundPortal>
        )}
      </ClassNames>
    ) : null;

    props = {
      children,
      ...props,
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
  errorProps?: RoleProps<ElementType>;
};

export type PlaygroundPreviewProps<T extends As = "div"> = Props<
  PlaygroundPreviewOptions<T>
>;
