---
path: /docs/accessibility/
redirect_from:
  - /guide/accessibility/
---

# Accessibility

Reakit strictly follows [WAI-ARIA 1.1](https://www.w3.org/TR/wai-aria/) standards and provides many of the widgets described in [WAI-ARIA Authoring Practices 1.1](https://www.w3.org/TR/wai-aria-practices/), like [Button](/docs/button/), [Dialog](/docs/dialog/), [Tab](/docs/tab/) and others.

This means that DOM attributes like `role` and `aria-*` are added automatically.

<carbon-ad></carbon-ad>

## Accessibility warnings

When attributes can't be automatically inferred, Reakit will emit a warning to remind you to pass them. Like so:

> ⚠️ [reakit/Menu]
> You should provide either `aria-label` or `aria-labelledby` props.
> See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13

## Focus management and keyboard interactions

Besides attributes, Reakit manages focus and keyboard interactions for components that need them. For example:

- [Button](/docs/button/) should respond to <kbd>Enter</kbd> and <kbd>Space</kbd> keys even when it's not rendered as the native `<button>`.
- Focus should be trapped within the [Modal Dialog](/docs/dialog/) when it's open.
- Pressing <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> <kbd>←</kbd> should move focus between [Tabs](/docs/tab/).

Reakit is built with composition in mind. Those components are built upon a few abstract components also provided by Reakit, for example:

 - [Tabbable](/docs/tabbable/) implements all the interactions a component will need to be fully accessible when they aren't rendered as their respective native elements. This is used by [Button](/docs/button/), [Checkbox](/docs/checkbox/), [FormInput](/docs/form/) and [Rover](/docs/rover/).
 - [Rover](/docs/rover/) implements the [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex/) method. This is used by [Tab](/docs/tab/), [MenuItem](/docs/menu/) and other components that leverage this pattern.

Concrete components can also be composed to create other ones. [Dialog](/docs/dialog/), for example, is used by [Popover](/docs/popover/) underneath, which means it inherits all of Dialog features. Learn more about it in [Composition](/docs/composition/#props-hooks).

Our goal is not only to be a library of accessible components, but also serve as a reference so others can build their own from scratch. So, feel free to dive into the [code](https://github.com/reakit/reakit) and discover more.
