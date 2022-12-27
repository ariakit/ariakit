import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { hasOwnProperty } from "@ariakit/core/utils/misc";
import { Playground as PlaygroundContainer } from "@ariakit/playground/playground";
import { usePlaygroundStore } from "@ariakit/playground/playground-store";
import vscodeTheme from "@ariakit/playground/themes/vscode";
import { CompositeOverflow } from "@ariakit/react-core/composite/composite-overflow";
import { CompositeOverflowDisclosure } from "@ariakit/react-core/composite/composite-overflow-disclosure";
import { useCompositeOverflowStore } from "@ariakit/react-core/composite/composite-overflow-store";
import {
  useEvent,
  useId,
  useLazyValue,
  useLiveRef,
  useUpdateEffect,
} from "@ariakit/react-core/utils/hooks";

import { TabList, TabPanel, useTabStore } from "@ariakit/react/tab";
import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import useOverflowList from "../../utils/use-overflow-list";
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

const PlaygroundEditor = dynamic(() => import("./playground-editor"), {
  suspense: true,
});

const PlaygroundPreview = dynamic(() => import("./playground-preview"), {
  suspense: true,
});

const OpenInCodeSandbox = dynamic(() => import("./open-in-code-sandbox"), {
  suspense: true,
});

type PlaygroundProps = {
  defaultValues: Record<string, string>;
  deps: Record<string, string>;
};

function getTabId(name: string, prefix?: string) {
  return `${prefix ? `${prefix}-` : ""}${name.replace(/[^a-z0-9]/gi, "-")}`;
}

export default function Playground(props: PlaygroundProps) {
  const playground = usePlaygroundStore({ defaultValues: props.defaultValues });
  const playgroundValues = playground.useState("values");
  const [firstFile = ""] = Object.keys(playgroundValues);
  const baseId = useId();
  const firstFileId = getTabId(firstFile, baseId);
  const tab = useTabStore({
    orientation: "both",
    defaultSelectedId: firstFileId,
    selectOnMove: false,
  });
  const tabSelectedId = tab.useState("selectedId");
  const [expanded, setExpanded] = useState(false);
  const expandedRef = useLiveRef(expanded);
  const filesString = Object.keys(playgroundValues).join(", ");
  const files = useMemo(() => Object.keys(playgroundValues), [filesString]);
  const overflow = useCompositeOverflowStore({
    placement: "bottom-end",
    flip: false,
    shift: -4,
    gutter: 4,
  });
  const [visibleTabs, hiddenTabs] = useOverflowList({
    list: files,
    getContainer: useEvent(() => tab.getState().baseElement),
    getElements: useEvent(() =>
      tab.getState().items.map((item) => item.element || null)
    ),
    setList: useCallback(
      ([nextVisible, nextHidden]: [string[], string[]]) => {
        const nextHiddenFile =
          tabSelectedId &&
          nextHidden.find((file) => getTabId(file, baseId) === tabSelectedId);
        if (nextHiddenFile) {
          const lastVisibleFile = nextVisible.pop();
          if (lastVisibleFile) {
            nextHidden = nextHidden.filter(
              (file) => getTabId(file, baseId) !== tabSelectedId
            );
            nextHidden.unshift(lastVisibleFile);
          }
          nextVisible.push(nextHiddenFile);
        }
        if (expandedRef.current) {
          tab.move(tabSelectedId);
        }
        return [nextVisible, nextHidden] as [string[], string[]];
      },
      [tab, tabSelectedId, baseId]
    ),
  });

  const tabActiveId = tab.useState("activeId");
  const beenSelected = useLazyValue(() => new Set<string>());

  useEffect(() => {
    if (tabSelectedId) {
      beenSelected.add(tabSelectedId);
    }
  }, [tabActiveId]);

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
        store={playground}
        className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-6"
      >
        <div className="relative w-full rounded-lg bg-gray-150 dark:bg-gray-850 sm:rounded-xl">
          <Suspense>
            <PlaygroundPreview
              getModule={getModule}
              errorProps={errorProps}
              className="relative flex min-h-[300px] items-center justify-center rounded-lg p-4 md:p-6"
            />
          </Suspense>
        </div>
        <div className="relative w-full max-w-3xl rounded-lg border border-gray-250 bg-white shadow-md dark:border-gray-650 dark:bg-gray-850 dark:shadow-md-dark sm:rounded-xl">
          <Suspense>
            <div className="flex justify-between p-2 pb-1">
              <TabList
                store={tab}
                className="flex w-full flex-row gap-2 overflow-x-auto p-2"
              >
                {visibleTabs.map((file) => renderTab(file))}
                {!!hiddenTabs.length && (
                  <>
                    <CompositeOverflowDisclosure
                      store={overflow}
                      className="h-10 rounded px-4 text-base text-black/75 hover:bg-black/5 focus-visible:ariakit-outline-input aria-expanded:bg-black/10 dark:text-white/75 dark:hover:bg-white/5 dark:aria-expanded:bg-black sm:h-8 sm:px-3 sm:text-sm"
                    >
                      +{hiddenTabs.length}
                    </CompositeOverflowDisclosure>
                    <CompositeOverflow
                      store={overflow}
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
                store={tab}
                tabId={getTabId(file, baseId)}
                focusable={false}
                className="rounded-[inherit] bg-[color:inherit]"
              >
                {(props) =>
                  (!props.hidden ||
                    beenSelected.has(getTabId(file, baseId))) && (
                    <div {...props}>
                      <PlaygroundEditor
                        lineNumbers
                        className="bg-[color:inherit] focus-visible:ariakit-outline-input"
                        store={playground}
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
          </Suspense>
        </div>
      </PlaygroundContainer>
    </div>
  );
}
