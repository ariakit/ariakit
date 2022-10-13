import {
  Playground,
  PlaygroundEditor,
  PlaygroundPreview,
  usePlaygroundState,
} from "ariakit-playground";
import theme from "ariakit-playground/themes/default";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import "./style.css";

const defaultValues = {
  "index.js": `import "./style.css";

export default function Example() {
  return <div className="red">Hello World</div>;
}
`,
  "style.css": `.red {
  color: red;
}
`,
};

export default function Example() {
  const tab = useTabState({ defaultSelectedId: "tab-index.js" });
  const playground = usePlaygroundState({ defaultValues });
  const files = Object.keys(playground.values);
  return (
    <Playground state={playground} className="playground">
      <div>
        <TabList state={tab} className="tab-list">
          {files.map((file) => (
            <Tab key={file} id={`tab-${file}`} className="tab">
              {file}
            </Tab>
          ))}
        </TabList>
        {files.map((file) => (
          <TabPanel state={tab} key={file} tabId={`tab-${file}`}>
            <PlaygroundEditor theme={theme} file={file} className="editor" />
          </TabPanel>
        ))}
      </div>
      <PlaygroundPreview className="preview" />
    </Playground>
  );
}
