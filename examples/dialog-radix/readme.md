---
unlisted: true
---

# Radix UI Dialog

<p data-description>
  Creating a modal dialog primitive offering the same API as <a href="https://www.radix-ui.com">Radix UI</a> but using the Ariakit <a href="/components/dialog">Dialog</a> component instead.
</p>

<aside data-type="note" title="Note">

The purpose of this example is to demonstrate the extensibility of Ariakit components. Use this as a reference if you're looking to implement specific props like `asChild`, `onOpenChange`, `forceMount`, `onOpenAutoFocus`, `onInteractOutside`, and more.

In a real application, you may want to provide a simpler API to streamline usage. Check out the [Dialog with Menu](/examples/dialog-menu) example for an alternative approach.

</aside>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/disclosure)
- [](/components/portal)
- [](/components/role)

</div>

## Browser extensions and third-party dialogs

<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 !max-w-5xl overflow-hidden rounded-lg md:rounded-2xl">

<img src="/images/dialog-radix-1password.png" width="640" height="480" alt="Ariakit Dialog inspired by Radix UI with keyboard focus on the username input showing the 1Password popup" />
<img src="/images/dialog-radix-google-translate.png" width="640" height="480" alt="Ariakit Dialog inspired by Radix UI with part of the text selected showing the Google Translate popup" />

</div>

The Ariakit [Dialog](/components/dialog) component seamlessly integrates with browser extensions that open popups, such as 1Password, Grammarly, Google Translate, and many others. This ensures that users can interact with the extension while keeping the modal dialog open, using both keyboard and mouse inputs. The same is true for third-party libraries that open dialogs.

For elements that are already in the DOM, the [`getPersisentElements`](/apis/dialog#getpersistentelements) prop can be used to specify which elements should remain accessible when the modal dialog is open. This is useful to integrate with chat widgets like Intercom, toast libraries like `react-toastify` and `react-hot-toast`, and more. See the [Dialog with React-Toastify](/examples/dialog-react-toastify) example for a practical use case.

## Focus trap elements

Most component libraries render visually hidden elements around the modal dialog to prevent users from tabbing to elements outside. The Ariakit [Dialog](/components/dialog) component follows a different approach: **there are no focus trap elements**. Instead, the elements that are not part of the **modal context** are given the [`inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) attribute on browsers that support it. An alternative method is used on older browsers, but the result is the same.

<aside data-type="note" title="What's the modal context?">

The modal context refers to the state created by Ariakit when a modal `Dialog` is opened. It involves taking a snapshot of the entire document internally to determine which elements should render as `inert`.

In addition to the dialog itself, the modal context may include other elements, such as nested and third-party dialogs, persistent elements specified by the [`getPersistentElements`](/apis/dialog#getpersistentelements) prop, as well as browser extensions.

</aside>

This allows keyboard and screen reader users to <kbd>Tab</kbd> to the browser chrome, where they can interact with the URL address bar, or leave an iframe, which mouse users could do already.

This approach results in a behavior that is more consistent with the native [`dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element. Unfortunately, the native `dialog` element still doesn't work with browser extensions when opened as a modal.
