import { useCallback, useEffect, useState } from "react";
import { OpenInCodeSandboxProps } from "ariakit-playground/actions/open-in-code-sandbox";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import theme from "ariakit-playground/themes/vscode";
import { useUpdateEffect } from "ariakit-utils/hooks";
import { cx, hasOwnProperty } from "ariakit-utils/misc";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import dynamic from "next/dynamic";

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

const OpenInCodeSandbox = dynamic<OpenInCodeSandboxProps>(
  () =>
    import("ariakit-playground/actions/open-in-code-sandbox").then(
      (mod) => mod.OpenInCodeSandbox
    ),
  {
    loading: () => <p>Loading...</p>,
  }
);

type PlaygroundProps = {
  defaultValues: Record<string, string>;
  deps: Record<string, string>;
};

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
    <div className="ak-col ak-center ak-gap-3">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-alpha-1">Button</button>
          <button className="ak-button ak-alpha-1 ak-border">Button</button>
          <button className="ak-button ak-alpha-1" disabled>
            Button
          </button>
          <button className="ak-button ak-alpha-1 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-alpha-2">Button</button>
          <button className="ak-button ak-alpha-2 ak-border">Button</button>
          <button className="ak-button ak-alpha-2" disabled>
            Button
          </button>
          <button className="ak-button ak-alpha-2 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-alpha-3">Button</button>
          <button className="ak-button ak-alpha-3 ak-border">Button</button>
          <button className="ak-button ak-alpha-3" disabled>
            Button
          </button>
          <button className="ak-button ak-alpha-3 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-primary-1">Button</button>
          <button className="ak-button ak-primary-1 ak-border">Button</button>
          <button className="ak-button ak-primary-1" disabled>
            Button
          </button>
          <button className="ak-button ak-primary-1 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-primary-2">Button</button>
          <button className="ak-button ak-primary-2 ak-border">Button</button>
          <button className="ak-button ak-primary-2" disabled>
            Button
          </button>
          <button className="ak-button ak-primary-2 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-danger-1">Button</button>
          <button className="ak-button ak-danger-1 ak-border">Button</button>
          <button className="ak-button ak-danger-1" disabled>
            Button
          </button>
          <button className="ak-button ak-danger-1 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-danger-2">Button</button>
          <button className="ak-button ak-danger-2 ak-border">Button</button>
          <button className="ak-button ak-danger-2" disabled>
            Button
          </button>
          <button className="ak-button ak-danger-2 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-warn-1">Button</button>
          <button className="ak-button ak-warn-1 ak-border">Button</button>
          <button className="ak-button ak-warn-1" disabled>
            Button
          </button>
          <button className="ak-button ak-warn-1 ak-border" disabled>
            Button
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button className="ak-button ak-warn-2">Button</button>
          <button className="ak-button ak-warn-2 ak-border">Button</button>
          <button className="ak-button ak-warn-2" disabled>
            Button
          </button>
          <button className="ak-button ak-warn-2 ak-border" disabled>
            Button
          </button>
        </div>
      </div>
      <p className="ak-background-accent">
        Testing something
        <br />
        <input className="ak-input" />
      </p>
      <PlaygroundContainer
        state={playground}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "16px 0",
          gap: 32,
        }}
      >
        <div style={{ maxWidth: 920, width: "100%" }}>
          <PlaygroundPreview
            getModule={getModule}
            style={{
              padding: "64px 32px",
              background: "var(--background-2)",
              border: "1px solid var(--background-border)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          />
        </div>
        <div style={{ maxWidth: 800, width: "100%" }}>
          <div
            style={{
              backgroundColor: "var(--background-inset)",
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 16px 8px",
              gap: 16,
              borderRadius: "8px 8px 0 0",
              fontSize: 14,
            }}
          >
            <TabList state={tab} style={{ display: "flex", gap: 8 }}>
              {Object.keys(playground.values).map((file) => (
                <Tab
                  key={file}
                  id={`tab-${file}`}
                  className={cx(
                    "ak-button",
                    tab.visibleId === `tab-${file}` ? "ak-primary" : "ak-alpha"
                  )}
                  style={
                    tab.visibleId === `tab-${file}`
                      ? {
                          // background: "var(--background-2)",
                          // color: "var(--background-text)",
                          borderRadius: 6,
                        }
                      : {}
                  }
                >
                  {file}
                </Tab>
              ))}
            </TabList>
            <OpenInCodeSandbox className="ak-button ak-alpha" />
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
                  <div {...props}>
                    <PlaygroundEditor
                      state={playground}
                      file={file}
                      className={`${theme} playground-editor`}
                      style={{
                        background: "var(--background-inset)",
                        borderRadius: "0 0 8px 8px",
                      }}
                      expanded={expanded}
                      maxHeight={300}
                      setExpanded={setExpanded}
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
