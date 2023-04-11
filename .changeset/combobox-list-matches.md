---
"@ariakit/react": minor
---

`Combobox` doesn't support filtering via the `list` and `matches` props anymore. Instead, you can use a library such as [match-sorter](https://github.com/kentcdodds/match-sorter) to filter the list.

Before:

```jsx
const combobox = useComboboxState({ list });

combobox.matches.map((value) => <ComboboxItem key={value} value={value} />);
```

After:

```jsx
const combobox = useComboboxStore();
const value = combobox.useState("value");
const matches = useMemo(() => matchSorter(list, value), [value]);

matches.map((value) => <ComboboxItem key={value} value={value} />);
```

This gives you more control over the filtering process, and you can use any library you want. Besides [match-sorter](https://github.com/kentcdodds/match-sorter), we also recommend [fast-fuzzy](https://github.com/EthanRutherford/fast-fuzzy) for fuzzy matching.
