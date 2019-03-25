<br>

<p align="center">
  <img src="https://raw.githubusercontent.com/reakit/reakit/master/logo/logo.png" alt="reakit" width="320" />
</p>

<p align="center">
  Toolkit for building <a href="https://reakit.io/docs/accessibility">accessible</a> UIs with <a href="https://reactjs.org">React</a>.
  <br>
  <a href="https://reakit.io"><strong>Explore website »</strong></a>
</p>

<hr>

<p align="center">
  <a href="https://npmjs.org/package/reakit"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit.svg?style=flat-square" /></a>
  <a href="https://npmjs.org/package/reakit"><img alt="NPM downloads" src="https://img.shields.io/npm/dm/reakit.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/reakit/reakit"><img alt="Build Status" src="https://img.shields.io/travis/reakit/reakit/master.svg?style=flat-square" /></a>
  <a href="https://codecov.io/gh/reakit/reakit/branch/master"><img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/reakit/reakit/master.svg?style=flat-square" /></a><br>
  <a href="https://opencollective.com/reakit"><img alt="Sponsors" src="https://opencollective.com/reakit/tiers/sponsor/badge.svg?label=sponsors&style=flat-square" /></a>
  <a href="https://opencollective.com/reakit"><img alt="Backers" src="https://opencollective.com/reakit/tiers/backer/badge.svg?label=backers&style=flat-square" /></a>
  <a href="https://spectrum.chat/reakit"><img src="https://img.shields.io/badge/community-spectrum-7A2DFB.svg?style=flat-square" alt="Spectrum" /></a>
  <a href="https://twitter.com/reakitjs">
    <img alt="Follow Reakit on Twitter" src="https://img.shields.io/twitter/follow/reakitjs.svg?label=follow+@reakitjs&style=flat-square"></a>
</p>


## Supporters

By donating $5 or more you help in the development of this project. Thank you to all our supporters! 🙏

<p>
  <a href="https://opencollective.com/reakit/sponsor/0/website"><img src="https://opencollective.com/reakit/sponsor/0/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/1/website"><img src="https://opencollective.com/reakit/sponsor/1/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/2/website"><img src="https://opencollective.com/reakit/sponsor/2/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/3/website"><img src="https://opencollective.com/reakit/sponsor/3/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/4/website"><img src="https://opencollective.com/reakit/sponsor/4/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/5/website"><img src="https://opencollective.com/reakit/sponsor/5/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/6/website"><img src="https://opencollective.com/reakit/sponsor/6/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/7/website"><img src="https://opencollective.com/reakit/sponsor/7/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/8/website"><img src="https://opencollective.com/reakit/sponsor/8/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/sponsor/9/website"><img src="https://opencollective.com/reakit/sponsor/9/avatar.svg"></a>
</p>

<p>
  <a href="https://opencollective.com/reakit/backer/0/website"><img src="https://opencollective.com/reakit/backer/0/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/1/website"><img src="https://opencollective.com/reakit/backer/1/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/2/website"><img src="https://opencollective.com/reakit/backer/2/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/3/website"><img src="https://opencollective.com/reakit/backer/3/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/4/website"><img src="https://opencollective.com/reakit/backer/4/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/5/website"><img src="https://opencollective.com/reakit/backer/5/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/6/website"><img src="https://opencollective.com/reakit/backer/6/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/7/website"><img src="https://opencollective.com/reakit/backer/7/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/8/website"><img src="https://opencollective.com/reakit/backer/8/avatar.svg"></a>
  <a href="https://opencollective.com/reakit/backer/9/website"><img src="https://opencollective.com/reakit/backer/9/avatar.svg"></a>
</p>


## Installation

npm:
```sh
npm i reakit
```

Yarn:
```sh
yarn add reakit
```

> Thanks to [@nosebit](https://github.com/nosebit) for the package name on npm.


## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { useDialogState, Dialog, DialogDisclosure } from "reakit";

function App() {
  const dialog = useDialogState();
  return (
    <div>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog aria-label="Welcome" {...dialog}>
        Welcome to Reakit!
      </Dialog>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

Read the [documentation](https://reakit.io/docs) to learn more.


## Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/reakit/reakit/graphs/contributors"><img src="https://opencollective.com/reakit/contributors.svg?width=1260&button=false" /></a>


## License

MIT © [Diego Haz](https://github.com/diegohaz)
