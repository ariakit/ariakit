---
Use in create-react-app
---

[create-react-app](https://github.com/facebookincubator/create-react-app) is one of the best React application development tools. We are going to use `reas` within it. Just coding, no more configuration.

---

## Install and Initialization

We need to install `create-react-app` first, you may need install [yarn](https://github.com/yarnpkg/yarn/) too.

```bash
$ npm install -g create-react-app yarn
```

Create a new project named `reas-demo`.

```bash
$ create-react-app reas-demo
```

The tool will create and initialize environment and dependencies automatically,
please try config your proxy setting or use another npm registry if any network errors happen during it.

Then we go inside `reas-demo` and start it.

```bash
$ cd reas-demo
$ yarn start
```

Open the browser at http://localhost:3000/. It renders a button toggling "Popover" on the page.

## Import reas

Below is the default directory structure.

```sh
├── README.md
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   └── logo.svg
└── yarn.lock
```

Now we install `reas` from yarn or npm.

```bash
$ yarn add reas
```

Modify `src/App.js`, import Button component from `reas`.

```jsx { "showCode": true }
const { InlineBlock, Button, Popover, withPopoverState } = require('reas');

const App = withPopoverState(({ popover }) => (
  <InlineBlock relative>
    <Button as={Popover.Toggle} {...popover}>Toggle</Button>
    <Popover {...popover}>
      <Popover.Arrow />
      Popover
    </Popover>
  </InlineBlock>
));

<App />
```
