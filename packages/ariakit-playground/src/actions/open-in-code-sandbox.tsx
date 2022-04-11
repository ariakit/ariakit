import { useWrapElement } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "ariakit/button";
import { getParameters } from "codesandbox-import-utils/lib/api/define";
import {
  getCodeSandboxDependencies,
  getCodeSandboxEntryContent,
  getCodeSandboxFiles,
} from "../__utils/code-sandbox";
import { getFile } from "../__utils/get-file";
import { PlaygroundContext } from "../__utils/playground-context";
import { PlaygroundState } from "../playground-state";

function getCodeSandboxParameters(values: PlaygroundState["values"]) {
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
  ({ state, ...props }) => {
    state = useStore(state || PlaygroundContext, ["values"]);
    const file = getFile(state?.values);
    const values = state?.values || {};

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

export type OpenInCodeSandboxOptions<T extends As = "button"> =
  ButtonOptions<T> & {
    state?: PlaygroundState;
  };

export type OpenInCodeSandboxProps<T extends As = "button"> = Props<
  OpenInCodeSandboxOptions<T>
>;
