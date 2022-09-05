import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import darkTheme from "ariakit-playground/themes/vscode-dark";
import {
  useEvent,
  useId,
  useLazyValue,
  useLiveRef,
  useUpdateEffect,
} from "ariakit-react-utils/hooks";
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
    <Tab
      className={cx(
        hidden ? "rounded-sm" : "rounded-md sm:rounded",
        "h-10 whitespace-nowrap bg-alpha-2 px-4 text-base sm:h-8 sm:px-3 sm:text-sm",
        "text-black-fade hover:bg-alpha-2-hover aria-selected:bg-primary-2",
        "aria-selected:text-primary-2 aria-selected:hover:to-primary-2-hover",
        "dark:text-white-fade dark:hover:bg-alpha-2-dark-hover",
        "dark:aria-selected:bg-primary-2-dark dark:aria-selected:text-primary-2-dark",
        "dark:aria-selected:hover:bg-primary-2-dark-hover",
        "flex-start flex items-center focus-visible:ariakit-outline"
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
        className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-6"
      >
        <div className="relative w-full">
          <PlaygroundPreview
            getModule={getModule}
            errorProps={errorProps}
            className="flex min-h-[300px] items-center
            justify-center rounded-lg border border-canvas-3 bg-canvas-3
            p-4 dark:border-0 dark:bg-canvas-3-dark md:p-6"
          />
        </div>
        <div className="dark relative w-full max-w-3xl rounded-lg">
          <div
            className="flex justify-between rounded-tl-[inherit] rounded-tr-[inherit] bg-canvas-1
            p-3 pb-1 text-sm
            dark:bg-canvas-1-dark"
          >
            <TabList
              state={tab}
              className="flex w-full flex-row gap-2 overflow-x-auto p-1"
            >
              {visibleTabs.map((file) => renderTab(file))}
              {!!hiddenTabs.length && (
                <>
                  <CompositeOverflowDisclosure
                    state={overflow}
                    className="h-10 rounded bg-alpha-2 px-4 text-base text-black-fade hover:bg-alpha-2-hover
                    focus-visible:ariakit-outline aria-expanded:bg-alpha-1 dark:text-white-fade
                    dark:hover:bg-alpha-2-dark-hover dark:aria-expanded:bg-alpha-1-dark
                    sm:h-8 sm:px-3
                    sm:text-sm"
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
                (!props.hidden || beenSelected.has(getTabId(file, baseId))) && (
                  <div {...props}>
                    <PlaygroundEditor
                      lineNumbers
                      className="bg-canvas-1 focus-visible:ariakit-outline-input dark:bg-canvas-1-dark"
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
