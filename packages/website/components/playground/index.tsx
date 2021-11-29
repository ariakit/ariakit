import { useCallback, useState } from "react";
import { OpenInCodeSandbox } from "ariakit-playground/actions/open-in-code-sandbox";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import theme from "ariakit-playground/themes/vscode-dark";
import { useUpdateEffect } from "ariakit-utils/hooks";
import { cx, hasOwnProperty } from "ariakit-utils/misc";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import dynamic from "next/dynamic";
import { TooltipControl } from "../tooltip-control";
import styles from "./index.module.scss";

const PlaygroundEditor = dynamic<PlaygroundEditorProps>(() =>
  import("ariakit-playground/playground-editor").then(
    (mod) => mod.PlaygroundEditor
  )
);

const PlaygroundPreview = dynamic<PlaygroundPreviewProps>(() =>
  import("ariakit-playground/playground-preview").then(
    (mod) => mod.PlaygroundPreview
  )
);

type PlaygroundProps = {
  defaultValues: Record<string, string>;
  deps: Record<string, string>;
};

const arrowDown = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <polyline points="4,6 8,10 12,6"></polyline>
  </svg>
);

const arrowUp = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <polyline points="4,10 8,6 12,10"></polyline>
  </svg>
);

const codeSandboxIcon = (
  <svg fill="currentColor" height="1.25em" viewBox="0 0 256 296">
    <path d="M115.498 261.088v-106.61L23.814 101.73v60.773l41.996 24.347v45.7l49.688 28.54zm23.814.627l50.605-29.151V185.78l42.269-24.495v-60.011l-92.874 53.621v106.82zm80.66-180.887l-48.817-28.289l-42.863 24.872l-43.188-24.897l-49.252 28.667l91.914 52.882l92.206-53.235zM0 222.212V74.495L127.987 0L256 74.182v147.797l-128.016 73.744L0 222.212z"></path>
  </svg>
);

export default function Playground(props: PlaygroundProps) {
  const playground = usePlaygroundState({ defaultValues: props.defaultValues });
  const tab = useTabState({
    defaultVisibleId: `tab-${Object.keys(playground.values)[0]}`,
  });
  const [expanded, setExpanded] = useState(false);

  useUpdateEffect(() => {
    playground.setValues(props.defaultValues);
  }, [props.defaultValues]);

  const getModule = useCallback(
    (path: string) => {
      if (hasOwnProperty(props.deps, path)) {
        return props.deps[path];
      }
      return null;
    },
    [props.deps]
  );

  return (
    <div className="!max-w-4xl">
      <PlaygroundContainer
        state={playground}
        className="flex flex-col items-center w-full gap-3 sm:gap-4 md:gap-6"
      >
        <div className="w-full">
          <PlaygroundPreview
            getModule={getModule}
            className="flex min-h-[300px] items-center justify-center bg-canvas-3 rounded-lg p-4 md:p-6 border border-canvas-3 dark:border-0"
          />
        </div>
        <div className="dark relative rounded-lg max-w-3xl w-full">
          <div className="flex justify-between p-4 pb-2 bg-canvas-1 rounded-tl-[inherit] rounded-tr-[inherit] text-sm">
            <TabList state={tab} className="flex flex-row gap-2">
              {Object.keys(playground.values).map((file) => (
                <Tab
                  key={file}
                  id={`tab-${file}`}
                  onClick={() => setExpanded(true)}
                  className="button-sm text-sm bg-alpha-2 hover:bg-alpha-2-hover aria-selected:bg-primary-2 hover:aria-selected:bg-primary-2-hover text-[color:var(--color-text-soft)] aria-selected:text-alpha-2"
                >
                  {file}
                </Tab>
              ))}
            </TabList>
            <TooltipControl
              as={OpenInCodeSandbox}
              title="Open in CodeSandbox"
              className="button-sm text-sm bg-alpha-2 hover:bg-alpha-2-hover text-[color:var(--color-text-soft)]"
            >
              {codeSandboxIcon}
            </TooltipControl>
          </div>
          {Object.keys(playground.values).map((file) => (
            <TabPanel
              key={file}
              state={tab}
              tabId={`tab-${file}`}
              focusable={false}
              className="rounded-[inherit]"
            >
              {(props) =>
                !props.hidden && (
                  <div {...props}>
                    <PlaygroundEditor
                      state={playground}
                      file={file}
                      className={cx(
                        theme,
                        "playground-editor",
                        "bg-canvas-1 rounded-bl-[inherit] rounded-br-[inherit]"
                      )}
                      expanded={expanded}
                      maxHeight={260}
                      setExpanded={setExpanded}
                      disclosureProps={{
                        className: styles["playground-code-disclosure"],
                        children: (props) => (
                          <button {...props}>
                            <div>
                              {props["aria-expanded"]
                                ? "Collapse code"
                                : "Expand code"}
                            </div>
                            {props["aria-expanded"] ? arrowUp : arrowDown}
                          </button>
                        ),
                      }}
                    />
                  </div>
                )
              }
            </TabPanel>
          ))}
        </div>
      </PlaygroundContainer>
    </div>
  );
}
