import { useCallback, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import darkTheme from "ariakit-playground/themes/vscode-dark";
import { useEventCallback, useId, useUpdateEffect } from "ariakit-utils/hooks";
import { cx, hasOwnProperty } from "ariakit-utils/misc";
import {
  CompositeOverflow,
  CompositeOverflowDisclosure,
  useCompositeOverflowState,
} from "ariakit/composite";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import dynamic from "next/dynamic";
import useOverflowList from "packages/website/utils/use-overflow-list";
import Popup from "../popup";
import PlaygroundDisclosure from "./playground-disclosure";
import PlaygroundError from "./playground-error";

const theme = css`
  ${darkTheme}
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  max-height: min(max(calc(100vh - 640px), 480px), 800px);

  .cm-scroller {
    padding-top: 0.5rem;
  }
`;

const errorProps = { as: PlaygroundError };

const PlaygroundEditor = dynamic<PlaygroundEditorProps>(
  () =>
    import("ariakit-playground/playground-editor").then(
      (mod) => mod.PlaygroundEditor
    ),
  {
    loading: () => (
      <div className="h-2 bg-canvas-1 dark:bg-canvas-1-dark rounded-b-[inherit]" />
    ),
  }
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

function getTabId(name: string, prefix?: string) {
  return `${prefix ? `${prefix}-` : ""}${name.replace(/[^a-z0-9]/gi, "-")}`;
}

export default function Playground(props: PlaygroundProps) {
  const playground = usePlaygroundState({ defaultValues: props.defaultValues });
  const [firstFile = ""] = Object.keys(playground.values);
  const baseId = useId();
  const firstFileId = getTabId(firstFile, baseId);
  const tab = useTabState({
    orientation: "both",
    defaultSelectedId: firstFileId,
    selectOnMove: false,
  });
  const [expanded, setExpanded] = useState(false);
  const files = useMemo(
    () => Object.keys(playground.values),
    [playground.values]
  );
  const overflow = useCompositeOverflowState({
    placement: "bottom-end",
    flip: false,
    shift: -4,
    gutter: 4,
  });
  const [visibleTabs, hiddenTabs] = useOverflowList({
    list: files,
    getContainer: useEventCallback(() => tab.baseRef.current),
    getElements: useEventCallback(() =>
      tab.items.map((item) => item.ref.current)
    ),
    setList: useCallback(
      ([nextVisible, nextHidden]: [string[], string[]]) => {
        const nextHiddenFile =
          tab.selectedId &&
          nextHidden.find((file) => getTabId(file, baseId) === tab.selectedId);
        if (nextHiddenFile) {
          const lastVisibleFile = nextVisible.pop();
          if (lastVisibleFile) {
            nextHidden = nextHidden.filter(
              (file) => getTabId(file, baseId) !== tab.selectedId
            );
            nextHidden.unshift(lastVisibleFile);
          }
          nextVisible.push(nextHiddenFile);
          tab.move(tab.selectedId);
        }
        return [nextVisible, nextHidden] as [string[], string[]];
      },
      [tab.selectedId, baseId, tab.move]
    ),
  });

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

  const renderTab = (file: string, hidden = false) => (
    <Tab
      className={cx(
        hidden ? "rounded-sm" : "rounded-md sm:rounded",
        "h-10 sm:h-8 px-4 sm:px-3 text-base sm:text-sm whitespace-nowrap bg-alpha-2",
        "text-black-fade hover:bg-alpha-2-hover aria-selected:bg-primary-2",
        "aria-selected:text-primary-2 aria-selected:hover:to-primary-2-hover",
        "dark:hover:bg-alpha-2-dark-hover dark:text-white-fade",
        "dark:aria-selected:bg-primary-2-dark dark:aria-selected:text-primary-2-dark",
        "dark:aria-selected:hover:bg-primary-2-dark-hover",
        "focus-visible:ariakit-outline flex flex-start items-center"
      )}
      key={file}
      id={getTabId(file, baseId)}
      onClick={() => setExpanded(true)}
    >
      {file}
    </Tab>
  );

  return (
    <div className="!max-w-4xl">
      <PlaygroundContainer
        state={playground}
        className="flex flex-col items-center w-full gap-3 sm:gap-4 md:gap-6"
      >
        <div className="relative w-full">
          <PlaygroundPreview
            getModule={getModule}
            errorProps={errorProps}
            className="flex min-h-[300px] items-center
            justify-center bg-canvas-3 dark:bg-canvas-3-dark rounded-lg p-4
            md:p-6 border border-canvas-3 dark:border-0"
          />
        </div>
        <div className="dark relative rounded-lg max-w-3xl w-full">
          <div
            className="flex justify-between p-3 pb-1 bg-canvas-1
            dark:bg-canvas-1-dark rounded-tl-[inherit] rounded-tr-[inherit]
            text-sm"
          >
            <TabList
              state={tab}
              className="flex flex-row gap-2 w-full overflow-x-auto p-1"
            >
              {visibleTabs.map((file) => renderTab(file))}
              {!!hiddenTabs.length && (
                <>
                  <CompositeOverflowDisclosure
                    state={overflow}
                    className="h-10 sm:h-8 px-4 sm:px-3 rounded text-base sm:text-sm
                    bg-alpha-2 text-black-fade hover:bg-alpha-2-hover
                    dark:hover:bg-alpha-2-dark-hover dark:text-white-fade
                    aria-expanded:bg-alpha-1 dark:aria-expanded:bg-alpha-1-dark
                    focus-visible:ariakit-outline"
                  >
                    +{hiddenTabs.length}
                  </CompositeOverflowDisclosure>
                  <CompositeOverflow
                    state={overflow}
                    as={Popup}
                    className="flex flex-col p-2 gap-2"
                    elevation={2}
                  >
                    {hiddenTabs.map((file) => renderTab(file, true))}
                  </CompositeOverflow>
                </>
              )}
            </TabList>
            <div className="flex gap-2 p-1">
              <OpenInCodeSandbox />
            </div>
          </div>
          {files.map((file) => (
            <TabPanel
              key={file}
              state={tab}
              tabId={getTabId(file, baseId)}
              focusable={false}
              className="rounded-[inherit]"
            >
              {(props) =>
                !props.hidden && (
                  <div {...props}>
                    <PlaygroundEditor
                      lineNumbers
                      className="bg-canvas-1 dark:bg-canvas-1-dark focus-visible:ariakit-outline"
                      state={playground}
                      file={file}
                      theme={theme}
                      expanded={expanded}
                      maxHeight={260}
                      setExpanded={setExpanded}
                      disclosureProps={{ as: PlaygroundDisclosure }}
                      keyboardDescriptionProps={{
                        style: { display: "none" },
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
