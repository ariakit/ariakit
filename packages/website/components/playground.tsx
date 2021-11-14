import { useCallback, useState } from "react";
import { Playground as PlaygroundContainer } from "ariakit-playground/playground";
import { PlaygroundEditorProps } from "ariakit-playground/playground-editor";
import { PlaygroundPreviewProps } from "ariakit-playground/playground-preview";
import { usePlaygroundState } from "ariakit-playground/playground-state";
import { playgroundEditorStyle } from "ariakit-playground/playground-style";
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
  const tab = useTabState();
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
    <PlaygroundContainer state={playground}>
      <PlaygroundPreview
        getModule={getModule}
        style={{ padding: 16, border: "1px solid #ccc", marginBottom: 16 }}
      />
      <TabList state={tab}>
        {Object.keys(playground.values).map((file) => (
          <Tab key={file}>{file}</Tab>
        ))}
      </TabList>
      {Object.keys(playground.values).map((file) => (
        <TabPanel key={file} state={tab} focusable={false}>
          {(props) =>
            !props.hidden && (
              <div {...props}>
                <PlaygroundEditor
                  state={playground}
                  file={file}
                  className={playgroundEditorStyle}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              </div>
            )
          }
        </TabPanel>
      ))}
      <style jsx>{`
        * {
          color: red;
        }
      `}</style>
    </PlaygroundContainer>
  );
}
