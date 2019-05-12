# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.3.0...reakit-playground@0.4.0) (2019-05-12)


### chore

* Update ComponentProps type name ([87b0811](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/87b0811))


### Features

* Add experimental `unstable_use` static method to `Provider` ([4af7a4a](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/4af7a4a))
* Remove experimental `KeyBinder` in favor of internal `createOnKeyDown` util ([b0adfa8](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/b0adfa8))
* **reakit-playground:** Provide fallback for SSR ([4b0fd5e](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/4b0fd5e))


### Performance Improvements

* Improve general performance by using `React.memo` on components ([91f0d54](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/91f0d54))


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





# [0.3.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.2.0...reakit-playground@0.3.0) (2019-04-25)


### Bug Fixes

* **reakit-playground:** Consider `modules` when updating. ([5c464f8](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/5c464f8))


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7b1d826))
* Add experimental `KeyBinder` component ([7eb739a](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7eb739a))





# [0.2.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.1.1...reakit-playground@0.2.0) (2019-04-17)


### Features

* **reakit-playground:** `PlaygroundEditor`, `PlaygroundPreview` and system ([c7a8c9f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/c7a8c9f))
* Add `use` prefix automatically in `useProps`/`useOptions` ([167fda1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/167fda1))
* Expose `unstable_useSealedState` util ([1540eab](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/1540eab))





## [0.1.1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.1.0...reakit-playground@0.1.1) (2019-04-09)


### Features

* Improve Dialog/Menu API ([cf7426f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/cf7426f))





# 0.1.0 (2019-04-02)

**Note:** Version bump only for package reakit-playground
