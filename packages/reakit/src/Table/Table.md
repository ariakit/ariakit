`Table` is composed from [Base](../Base/Base.md) with minimal styles including collapsed borders.
It applies a basic styling to its children to improve differentiation between headers and cells.
Table renders by default as a `<table>`.

```jsx
import { Block, Provider } from "reakit";
import themeDefault from "reakit-theme-default";

<Provider theme={themeDefault}>
  <Block overflowX="auto">
    <Table>
      <caption>A Basic table</caption>
      <thead>
        <tr>
          <th/>
          <th>Chars</th>
          <th>Popularity</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Foo</th>
          <td>3</td>
          <td>0.7</td>
        </tr>
        <tr>
          <th>Bar</th>
          <td>3</td>
          <td>0.4</td>
        </tr>
      </tbody>
    </Table>
  </Block>
</Provider>
```

A more throughout example:

```jsx
import { Block, Provider } from "reakit";
import themeDefault from "reakit-theme-default";

<Provider theme={themeDefault}>
  <Block overflowX="auto">
    <Table>
      <caption>A test table with merged cells</caption>
      <colgroup>
        <col />
        <col />
        <col />
        <col style={{backgroundColor: "bisque"}} />
      </colgroup>
      <thead>
        <tr>
          <td rowSpan={2} />
          <th colSpan={2}>Average</th>
          <th rowSpan={2}>Red eyes</th>
        </tr>
        <tr>
          <th>Height</th>
          <th>Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Males</th>
          <td>1.9</td>
          <td>0.003</td>
          <td>40%</td>
        </tr>
        <tr>
          <th>Females</th>
          <td>1.7</td>
          <td>0.002</td>
          <td>43%</td>
        </tr>
      </tbody>
    </Table>
  </Block>
</Provider>
```
