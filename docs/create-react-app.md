[create-react-app](https://github.com/facebookincubator/create-react-app) is one of the best React application development tools. We are going to use ReaKit within it. Just coding, no more configuration.

## Install and Initialization

We need to install `create-react-app` first, you may need install [yarn](https://github.com/yarnpkg/yarn/) too.

```sh
npm install -g create-react-app yarn
```

Create a new project named `reakit-demo`.

```sh
create-react-app reakit-demo
```

The tool will create and initialize environment and dependencies automatically.

Then we go inside `reakit-demo` and start it.

```sh
cd reakit-demo
yarn start
```

## Import ReaKit

Now we install `reakit` from yarn or npm.

```sh
yarn add reakit
```

Modify `src/App.js`, import components from `reakit`.

```jsx static
import React from 'react';
import { InlineBlock, Button, Popover } from 'reakit';

const App = () => (
  <Popover.Container>
    {popover => (
      <InlineBlock relative>
        <Button as={Popover.Toggle} {...popover}>Toggle</Button>
        <Popover {...popover}>
          <Popover.Arrow />
          Popover
        </Popover>
      </InlineBlock>
    )}
  </Popover.Container>
);

export default App;
```

Open the browser at http://localhost:3000/. It renders a button toggling `Popover` on the page.
