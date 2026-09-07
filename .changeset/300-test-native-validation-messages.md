---
"@ariakit/test": patch
---

Fixed disabled form controls reporting a validation message in happy-dom tests. Removed the validation-message and form/select parent-identity shims now that happy-dom provides the native behavior. Thanks to [@mixelburg](https://github.com/mixelburg) and [@capricorn86](https://github.com/capricorn86).
