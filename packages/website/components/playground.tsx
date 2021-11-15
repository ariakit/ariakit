import { useCallback, useState } from "react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import theme from "ariakit-playground/themes/vscode-dark";
import { hasOwnProperty } from "ariakit-utils/misc";
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
    <div>
      <PlaygroundContainer state={playground}>
        <PlaygroundPreview
          getModule={getModule}
          style={{ padding: 16, border: "1px solid #ccc", marginBottom: 16 }}
        />
        <TabList state={tab}>
          {Object.keys(playground.values).map((file) => (
            <Tab key={file} id={`tab-${file}`}>
              {file}
            </Tab>
          ))}
        </TabList>
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
                    expanded={expanded}
                    maxHeight={240}
                    setExpanded={setExpanded}
                  />
                </div>
              )
            }
          </TabPanel>
        ))}
      </PlaygroundContainer>
      <style jsx>{`
        :global(.playground-editor) {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
