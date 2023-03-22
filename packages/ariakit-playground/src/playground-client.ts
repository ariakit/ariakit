import { useContext, useEffect, useMemo, useRef } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import {
  useForkRef,
  useInitialValue,
  useUpdateEffect,
} from "@ariakit/react-core/utils/hooks";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "@ariakit/react-core/utils/system";
import { As, Options, Props } from "@ariakit/react-core/utils/types";
import { SandpackClient } from "@codesandbox/sandpack-client";
import {
  getCodeSandboxEntryContent,
  getSandpackFiles,
  useCodeSandboxDependencies,
} from "./__utils/code-sandbox.js";
import { getFile } from "./__utils/get-file.js";
import { PlaygroundContext } from "./__utils/playground-context.js";
import { PlaygroundStore } from "./playground-store.js";

const ENTRY_FILE = "/index.js";

export const usePlaygroundClient = createHook<PlaygroundClientOptions>(
  ({ store, file, ...props }) => {
    const context = useContext(PlaygroundContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "PlaygroundClient must be wrapped in a Playground component"
    );

    const values = store.useState("values");
    const initialValues = useInitialValue(values);
    const filename = getFile(values, file);
    const ref = useRef<HTMLIFrameElement>(null);
    const clientRef = useRef<SandpackClient | null>(null);
    const dependencies = useCodeSandboxDependencies(values);

    const defaultFiles = useMemo(
      () => ({
        [ENTRY_FILE]: { code: getCodeSandboxEntryContent(filename) },
      }),
      [filename]
    );
    const initialDefaultFiles = useInitialValue(defaultFiles);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const client = new SandpackClient(
        element,
        {
          entry: ENTRY_FILE,
          dependencies,
          files: {
            ...initialDefaultFiles,
            ...getSandpackFiles(initialValues),
          },
        },
        { showOpenInCodeSandbox: false }
      );
      clientRef.current = client;
      return () => {
        clientRef.current = null;
        client.cleanup();
      };
    }, [dependencies, initialDefaultFiles, initialValues]);

    useUpdateEffect(() => {
      const client = clientRef.current;
      if (!client) return;
      const id = setTimeout(() => {
        client.updatePreview({
          entry: ENTRY_FILE,
          dependencies,
          files: {
            ...defaultFiles,
            ...getSandpackFiles(values),
          },
        });
      }, 500);
      return () => clearTimeout(id);
    }, [defaultFiles, values, dependencies]);

    props = {
      ...props,
      ref: useForkRef(props.ref, ref),
    };

    return props;
  }
);

export const PlaygroundClient = createMemoComponent<PlaygroundClientOptions>(
  (props) => {
    const htmlProps = usePlaygroundClient(props);
    return createElement("iframe", htmlProps);
  }
);

export interface PlaygroundClientOptions<T extends As = "iframe">
  extends Options<T> {
  store?: PlaygroundStore;
  file?: string;
}

export type PlaygroundClientProps<T extends As = "iframe"> = Props<
  PlaygroundClientOptions<T>
>;
