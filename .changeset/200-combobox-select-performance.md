---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved filterable select performance

In the filtered-items scenario, migrating a 243-option filterable select from separate Select and Combobox stores to the new Combobox select APIs reduced scripting time from 92.3 ms to 46.4 ms (-50%) and total time from 104.8 ms to 59.7 ms (-43%).

Thanks to [@lessp](https://github.com/lessp) for reporting the performance issue, [@patrikholcak](https://github.com/patrikholcak) for investigating it, and [@georgekaran](https://github.com/georgekaran) for providing the workaround and investigating the shared Combobox and Select behavior.
