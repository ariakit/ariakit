import { useEffect, useMemo, useRef } from "react";
import { SandpackClient } from "@codesandbox/sandpack-client";
import {
  useForkRef,
  useInitialValue,
  useUpdateEffect,
} from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import {
  getCodeSandboxEntryContent,
  getSandpackFiles,
  useCodeSandboxDependencies,
} from "./__utils/code-sandbox";
import { getFile } from "./__utils/get-file";
import { PlaygroundContext } from "./__utils/playground-context";
import { PlaygroundState } from "./playground-state";

const ENTRY_FILE = "/index.js";

export const usePlaygroundClient = createHook<PlaygroundClientOptions>(
  ({ state, file, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const values = state?.values || {};
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

export type PlaygroundClientOptions<T extends As = "iframe"> = Options<T> & {
  state?: PlaygroundState;
  file?: string;
};

export type PlaygroundClientProps<T extends As = "iframe"> = Props<
  PlaygroundClientOptions<T>
>;
