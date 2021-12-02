import { useCallback, useState } from "react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import theme from "ariakit-playground/themes/vscode-dark";
import { useId, useUpdateEffect } from "ariakit-utils/hooks";
import { cx, hasOwnProperty } from "ariakit-utils/misc";
import { TabList, TabPanel, useTabState } from "ariakit/tab";
import dynamic from "next/dynamic";
import PlaygroundDisclosure from "./playground-disclosure";
import PlaygroundTab from "./playground-tab";
import style from "./style.module.css";

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

const OpenInCodeSandbox = dynamic(() => import("./open-in-code-sandbox"));

type PlaygroundProps = {
  defaultValues: Record<string, string>;
  deps: Record<string, string>;
};

function getTabId(prefix: string, name: string) {
  return `${prefix}-${name.replace(/[^a-z0-9]/gi, "-")}`;
}

export default function Playground(props: PlaygroundProps) {
  const playground = usePlaygroundState({ defaultValues: props.defaultValues });
  const [firstFile = ""] = Object.keys(playground.values);
  const baseId = useId();
  const firstFileId = getTabId(baseId, firstFile);
  const tab = useTabState({ defaultVisibleId: firstFileId });
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
            className="playground-preview flex min-h-[300px] items-center
            justify-center bg-canvas-3 dark:bg-canvas-3-dark rounded-lg p-4
            md:p-6 border border-canvas-3 dark:border-0"
          />
        </div>
        <div className="dark relative rounded-lg max-w-3xl w-full">
          <div
            className="flex justify-between p-4 pb-2 bg-canvas-1
            dark:bg-canvas-1-dark rounded-tl-[inherit] rounded-tr-[inherit]
            text-sm"
          >
            <TabList state={tab} className="flex flex-row gap-2">
              {Object.keys(playground.values).map((file) => (
                <PlaygroundTab
                  key={file}
                  id={getTabId(baseId, file)}
                  onClick={() => setExpanded(true)}
                >
                  {file}
                </PlaygroundTab>
              ))}
            </TabList>
            <OpenInCodeSandbox />
          </div>
          {Object.keys(playground.values).map((file) => (
            <TabPanel
              key={file}
              state={tab}
              tabId={getTabId(baseId, file)}
              focusable={false}
              className="rounded-[inherit]"
            >
              {(props) =>
                !props.hidden && (
                  <div {...props}>
                    <PlaygroundEditor
                      state={playground}
                      file={file}
                      className={cx(theme, style.playgroundEditor)}
                      expanded={expanded}
                      maxHeight={260}
                      setExpanded={setExpanded}
                      disclosureProps={{ as: PlaygroundDisclosure }}
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
