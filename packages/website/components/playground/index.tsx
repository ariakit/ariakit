import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import vscodeTheme from "ariakit-playground/themes/vscode";
import {
  useEvent,
  useId,
  useLazyValue,
  useLiveRef,
  useUpdateEffect,
} from "ariakit-utils/hooks";
import { hasOwnProperty } from "ariakit-utils/misc";
import {
  CompositeOverflow,
  CompositeOverflowDisclosure,
  useCompositeOverflowState,
} from "ariakit/composite";
import { TabList, TabPanel, useTabState } from "ariakit/tab";
import dynamic from "next/dynamic";
import useOverflowList from "packages/website/utils/use-overflow-list";
import Popup from "../popup";
import PlaygroundDisclosure from "./playground-disclosure";
import PlaygroundError from "./playground-error";
import { PlaygroundTab } from "./playground-tab";

const theme = css`
  ${vscodeTheme}
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  max-height: min(max(calc(100vh - 640px), 480px), 800px);
`;

const errorProps = { as: PlaygroundError };

const PlaygroundEditor = dynamic<PlaygroundEditorProps>(
  () =>
    import("ariakit-playground/playground-editor").then(
      (mod) => mod.PlaygroundEditor
    ),
  {
    loading: () => (
      <div className="h-2 rounded-b-[inherit] bg-canvas-1 dark:bg-canvas-1-dark" />
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
  const expandedRef = useLiveRef(expanded);
  const filesString = Object.keys(playground.values).join(", ");
  const files = useMemo(() => Object.keys(playground.values), [filesString]);
  const overflow = useCompositeOverflowState({
    placement: "bottom-end",
    flip: false,
    shift: -4,
    gutter: 4,
  });
  const [visibleTabs, hiddenTabs] = useOverflowList({
    list: files,
    getContainer: useEvent(() => tab.baseRef.current),
    getElements: useEvent(() => tab.items.map((item) => item.ref.current)),
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
        }
        if (expandedRef.current) {
          tab.move(tab.selectedId);
        }
        return [nextVisible, nextHidden] as [string[], string[]];
      },
      [tab.selectedId, baseId, tab.move]
    ),
  });

  const beenSelected = useLazyValue(() => new Set<string>());

  useEffect(() => {
    if (tab.selectedId) {
      beenSelected.add(tab.selectedId);
    }
  }, [tab.activeId]);

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
    <PlaygroundTab
      hidden={hidden}
      key={file}
      id={getTabId(file, baseId)}
      onClick={() => setExpanded(true)}
    >
      {file}
    </PlaygroundTab>
  );

  return (
    <div className="!max-w-4xl">
      <PlaygroundContainer
        state={playground}
        className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-6"
      >
        <div className="relative rounded-lg sm:rounded-xl bg-canvas-1 dark:bg-canvas-1-dark/80 w-full">
          <PlaygroundPreview
            getModule={getModule}
            errorProps={errorProps}
            className="relative flex min-h-[300px] items-center justify-center rounded-lg p-4 md:p-6"
          />
        </div>
        <div className="relative w-full max-w-3xl rounded-lg sm:rounded-xl border border-canvas-5 dark:border-canvas-1-dark drop-shadow-md dark:drop-shadow-md-dark bg-canvas-5 dark:bg-canvas-1-dark">
          <div className="flex justify-between p-2 pb-1">
            <TabList
              state={tab}
              className="flex w-full flex-row gap-2 overflow-x-auto p-2"
            >
              {visibleTabs.map((file) => renderTab(file))}
              {!!hiddenTabs.length && (
                <>
                  <CompositeOverflowDisclosure
                    state={overflow}
                    className="h-10 rounded px-4 text-base text-black/75 focus-visible:ariakit-outline-input hover:bg-black/5 dark:hover:bg-white/5 aria-expanded:bg-black/10 dark:aria-expanded:bg-black dark:text-white/75 sm:h-8 sm:px-3 sm:text-sm"
                  >
                    +{hiddenTabs.length}
                  </CompositeOverflowDisclosure>
                  <CompositeOverflow
                    state={overflow}
                    as={Popup}
                    className="flex flex-col gap-2 p-2"
                    elevation={2}
                  >
                    {hiddenTabs.map((file) => renderTab(file, true))}
                  </CompositeOverflow>
                </>
              )}
            </TabList>
            <div className="flex gap-2 p-2">
              <OpenInCodeSandbox />
            </div>
          </div>
          {files.map((file) => (
            <TabPanel
              key={file}
              state={tab}
              tabId={getTabId(file, baseId)}
              focusable={false}
              className="rounded-[inherit] bg-[color:inherit]"
            >
              {(props) =>
                (!props.hidden || beenSelected.has(getTabId(file, baseId))) && (
                  <div {...props}>
                    <PlaygroundEditor
                      lineNumbers
                      className="focus-visible:ariakit-outline-input bg-[color:inherit]"
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
