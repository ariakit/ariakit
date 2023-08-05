---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The `Menu`'s `disclosureElement` state is now guaranteed to be defined as the `MenuButton` element. Before, it could be overridden by a different element that received focus right before the menu opened, which could cause some weird issues. ([#2695](https://github.com/ariakit/ariakit/pull/2695))
