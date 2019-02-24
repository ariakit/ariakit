# reakit-playground

<a href="https://npmjs.org/package/reakit-playground"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-playground.svg?style=flat-square" /></a>

## Installation

```sh
npm i reakit-playground
```

## Usage

```jsx
import React from "react";
import { Playground } from "reakit-playground";
import { createComponent } from "reakit/utils/_createComponent";
import { getTabId } from "reakit/_popover";

function App() {
  const playground = usePlaygroundState({
    language: "jsx",
    code: "foo",
    html: true,
    readonly: false
  });
  return <Playground {...playground} />;
}

function App() {
  const playground = usePlaygroundState({});
  return (
    <PlaygroundLayout>
      <PlaygroundPreview {...playground} />
      <PlaygroundHeader>
        <PlaygroundTabList>
          <PlaygroundTab tabId="jsx" {...playground}>
            JSX
          </PlaygroundTab>
          <PlaygroundTab tabId="html" {...playground}>
            HTML
          </PlaygroundTab>
        </PlaygroundTabList>
        <PlaygroundToolbar>
          <PlaygroundToolbarItem {...playground}>
            <PlaygroundToolbarTheme {...playground} />
          </PlaygroundToolbarItem>
          <PlaygroundToolbarItem {...playground}>
            <PlaygroundToolbarFullscreen {...playground} />
          </PlaygroundToolbarItem>
        </PlaygroundToolbar>
        <PlaygroundTabPanel tabId="jsx" {...playground}>
          <PlaygroundEditor {...playground} />
        </PlaygroundTabPanel>
        <PlaygroundTabPanel tabId="html" {...playground}>
          <PlaygroundHTML {...playground} />
        </PlaygroundTabPanel>
      </PlaygroundHeader>
    </PlaygroundLayout>
  );
}

function App() {
  const [jsx, setJSX] = React.useState("foo");
  const [html, setHTML] = React.useState("foo");
  return <Playground value={value} onChange={setValue} />;
}
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
