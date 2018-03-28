[create-react-app](https://github.com/facebookincubator/create-react-app) is one of the best React application development tools. We are going to use `reas` within it. Just coding, no more configuration.

## Install and Initialization

We need to install `create-react-app` first, you may need install [yarn](https://github.com/yarnpkg/yarn/) too.

```bash
npm install -g create-react-app yarn
```

Create a new project named `reas-demo`.

```bash
create-react-app reas-demo
```

The tool will create and initialize environment and dependencies automatically.

Then we go inside `reas-demo` and start it.

```bash
cd reas-demo
yarn start
```

## Import reas

Now we install `reas` from yarn or npm.

```bash
yarn add reas
```

Modify `src/App.js`, import components from `reas`.

```jsx static
import React from 'react';
import { InlineBlock, Button, Popover } from 'reas';

const App = () => (
  <Popover.State>
    {popover => (
      <InlineBlock relative>
        <Button as={Popover.Toggle} {...popover}>Toggle</Button>
        <Popover {...popover}>
          <Popover.Arrow />
          Popover
        </Popover>
      </InlineBlock>
    )}
  </Popover.State>
);

export default App;
```

Open the browser at http://localhost:3000/. It renders a button toggling "Popover" on the page.
