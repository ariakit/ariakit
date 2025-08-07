---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved Combobox performance

Thanks to [@iamakulov](https://github.com/iamakulov), the [Combobox](https://ariakit.org/components/combobox) component now opens ~30% faster by removing unnecessary calls to an internal function that adds global event listeners. See the [pull request](https://github.com/ariakit/ariakit/pull/4860) for more details.
