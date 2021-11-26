import { useCallback, useState } from "react";
import { OpenInCodeSandbox } from "ariakit-playground/actions/open-in-code-sandbox";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import theme from "ariakit-playground/themes/vscode";
import { useUpdateEffect } from "ariakit-utils/hooks";
import { cx, hasOwnProperty } from "ariakit-utils/misc";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import { Tooltip, TooltipAnchor, useTooltipState } from "ariakit/tooltip";
import dynamic from "next/dynamic";
import styles from "./playground.module.scss";

const PlaygroundEditor = dynamic<PlaygroundEditorProps>(
  () =>
    import("ariakit-playground/playground-editor").then(
      (mod) => mod.PlaygroundEditor
    ),
  {
    loading: () => <p>Loading...</p>,
  }
);

const PlaygroundPreview = dynamic<PlaygroundPreviewProps>(
  () =>
    import("ariakit-playground/playground-preview").then(
      (mod) => mod.PlaygroundPreview
    ),
  {
    loading: () => <p>Loading...</p>,
  }
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
  const tooltip = useTooltipState({ timeout: 500 });
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
    <div className="col center gap-3" style={{ maxWidth: 980 }}>
      <PlaygroundContainer
        state={playground}
        className="col center gap-3 sm:gap-1"
        style={{ width: "100%" }}
      >
        <div style={{ width: "100%" }}>
          <PlaygroundPreview
            getModule={getModule}
            className="playground-preview center bg-3 round-3 px-6 py-4 sm:p-1 light:border"
            style={{
              // borderWidth: "var(--light, 1px) var(--dark, 0)",
              // borderStyle: "solid",
              minHeight: 300,
            }}
          />
        </div>
        <div
          className="relative round-3"
          style={{
            maxWidth: 800,
            width: "100%",
          }}
        >
          <div
            className="bg-1 space-between gap-2 p-2 pb-1"
            style={{
              borderTopLeftRadius: "inherit",
              borderTopRightRadius: "inherit",
              fontSize: 14,
            }}
          >
            <TabList state={tab} className="row gap-1">
              {Object.keys(playground.values).map((file) => (
                <Tab
                  key={file}
                  id={`tab-${file}`}
                  onClick={() => setExpanded(true)}
                  className="button alpha-2 selected:primary-2 round-2"
                  style={
                    tab.visibleId === `tab-${file}`
                      ? {}
                      : {
                          color: "var(--color-text-soft)",
                        }
                  }
                >
                  {file}
                </Tab>
              ))}
            </TabList>
            <TooltipAnchor
              as={OpenInCodeSandbox}
              state={tooltip}
              className="button alpha-2"
              style={{
                color: "var(--color-text-soft)",
              }}
            >
              {codeSandboxIcon}
            </TooltipAnchor>
            <Tooltip
              state={tooltip}
              className="dark:bg-4 light:bg-1 border shadow-1 p-1 round-2"
              style={{ fontSize: 14 }}
            >
              Open in CodeSandbox
            </Tooltip>
          </div>
          {Object.keys(playground.values).map((file) => (
            <TabPanel
              key={file}
              state={tab}
              tabId={`tab-${file}`}
              focusable={false}
            >
              {(props) =>
                !props.hidden && (
                  <div {...props} style={{ borderRadius: "inherit" }}>
                    <PlaygroundEditor
                      state={playground}
                      file={file}
                      className={`${theme} playground-editor bg-1`}
                      style={{
                        borderBottomLeftRadius: "inherit",
                        borderBottomRightRadius: "inherit",
                      }}
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
