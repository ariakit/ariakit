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

function App() {
  const playground = usePlaygroundState({
    language: "jsx",
    code: "foo",
    html: true,
    readonly: true
  });
  return <Playground {...playground} />;
}

function App() {
  const editor = useEditorState({
    language: "jsx",
    code: "foo",
    html: true,
    readonly: true
  });
  return <PlaygroundEditor readonly code="foo" language="jsx" />;
}

function App() {
  // there will be no tabs
  const playgroundApp = usePlaygroundState({
    title: "App",
    language: "jsx",
    code: "foo",
    html: true,
    readonly: true
  });
  const playgroundHeader = usePlaygroundState({
    title: "Header",
    language: "jsx",
    code: "foo"
  });
  return <Playground readonly html disableToolbar {...playground} />;
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
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
