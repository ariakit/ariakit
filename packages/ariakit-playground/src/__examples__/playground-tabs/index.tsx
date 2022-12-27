import {
  Playground,
  PlaygroundEditor,
  PlaygroundPreview,
  usePlaygroundStore,
} from "@ariakit/playground";
import theme from "@ariakit/playground/themes/default";
import { Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
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
  const tab = useTabStore({ defaultSelectedId: "tab-index.js" });
  const playground = usePlaygroundStore({ defaultValues });
  const values = playground.useState("values");
  const files = Object.keys(values);
  return (
    <Playground store={playground} className="playground">
      <div>
        <TabList store={tab} className="tab-list">
          {files.map((file) => (
            <Tab key={file} id={`tab-${file}`} className="tab">
              {file}
            </Tab>
          ))}
        </TabList>
        {files.map((file) => (
          <TabPanel store={tab} key={file} tabId={`tab-${file}`}>
            <PlaygroundEditor theme={theme} file={file} className="editor" />
          </TabPanel>
        ))}
      </div>
      <PlaygroundPreview className="preview" />
    </Playground>
  );
}
