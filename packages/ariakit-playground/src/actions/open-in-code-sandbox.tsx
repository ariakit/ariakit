import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { ButtonOptions } from "@ariakit/react-core/button/button";
import { useButton } from "@ariakit/react-core/button/button";
import { useWrapElement } from "@ariakit/react-core/utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "@ariakit/react-core/utils/system";
import type { As, Props } from "@ariakit/react-core/utils/types";
import { getParameters } from "codesandbox-import-utils/lib/api/define.js";
import {
  getCodeSandboxDependencies,
  getCodeSandboxEntryContent,
  getCodeSandboxFiles,
} from "../__utils/code-sandbox.js";
import { getFile } from "../__utils/get-file.js";
import { PlaygroundContext } from "../__utils/playground-context.js";
import type {
  PlaygroundStore,
  PlaygroundStoreState,
} from "../playground-store.js";

function getCodeSandboxParameters(values: PlaygroundStoreState["values"]) {
  const file = getFile(values);

  return getParameters({
    files: {
      "index.js": {
        content: getCodeSandboxEntryContent(file),
        isBinary: false,
      },
      "package.json": {
        content: {
          main: "index.js",
          dependencies: getCodeSandboxDependencies(values),
        } as any,
        isBinary: false,
      },
      ...getCodeSandboxFiles(values),
    },
  });
}

export const useOpenInCodeSandbox = createHook<OpenInCodeSandboxOptions>(
  ({ store, ...props }) => {
    const context = useContext(PlaygroundContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "OpenInCodeSandbox must be wrapped in a Playground component"
    );

    const values = store.useState("values");
    const file = getFile(values);

    props = useWrapElement(
      props,
      (element) => (
        <form
          action="https://codesandbox.io/api/v1/sandboxes/define"
          method="POST"
          target="_blank"
          onSubmit={(event) => {
            const { elements } = event.currentTarget;
            const input = elements.namedItem("parameters") as HTMLInputElement;
            input.value = getCodeSandboxParameters(values);
          }}
        >
          <input type="hidden" name="query" value={`module=src/${file}`} />
          <input type="hidden" name="parameters" />
          {element}
        </form>
      ),
      [file, values]
    );

    props = {
      type: "submit",
      children: "Open in CodeSandbox",
      ...props,
    };

    props = useButton(props);

    return props;
  }
);

export const OpenInCodeSandbox = createComponent<OpenInCodeSandboxOptions>(
  (props) => {
    const htmlProps = useOpenInCodeSandbox(props);
    return createElement("button", htmlProps);
  }
);

export interface OpenInCodeSandboxOptions<T extends As = "button">
  extends ButtonOptions<T> {
  store?: PlaygroundStore;
}

export type OpenInCodeSandboxProps<T extends As = "button"> = Props<
  OpenInCodeSandboxOptions<T>
>;
