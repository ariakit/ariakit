# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.20.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.19.0...website@0.20.0) (2019-05-12)


### chore

* Update ComponentProps type name ([87b0811](https://github.com/reakit/reakit/tree/master/packages/website/commit/87b0811))


### Features

* Add experimental `unstable_use` static method to `Provider` ([4af7a4a](https://github.com/reakit/reakit/tree/master/packages/website/commit/4af7a4a))


### BREAKING CHANGES

* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.
* `unstable_system` prop has been removed from `Provider`. Use `Provider.unstable_use(system)` instead:

  ```diff
    import { Provider, Button } from "reakit";
    import * as system from "reakit-system-boostrap";

  + Provider.unstable_use(system);

    function App() {
      return (
  -     <Provider unstable_system={system}>
  +     <Provider>
          <Button>Button</Button>
        </Provider>
      );
    }
  ```

  The motivation behind this change is to make it clearer that systems are static and are not supposed to change between renders. With prop, this could be misinterpreted.





# [0.19.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.18.0...website@0.19.0) (2019-04-25)


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/tree/master/packages/website/commit/7b1d826))





# [0.18.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.17.1...website@0.18.0) (2019-04-17)


### Features

* **reakit-playground:** `PlaygroundEditor`, `PlaygroundPreview` and system ([c7a8c9f](https://github.com/reakit/reakit/tree/master/packages/website/commit/c7a8c9f))





## [0.17.1](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.17.0...website@0.17.1) (2019-04-09)

**Note:** Version bump only for package website





# [0.17.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.16.0-beta.2...website@0.17.0) (2019-04-02)

**Note:** Version bump only for package website
