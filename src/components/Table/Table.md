`Table` is composed from [Base](/components/primitives/base) with minimal styles including collapsed borders.
It applies a basic styling to its children to improve differentiation between headers and cells.
Table renders by default as a `<table>`.

```jsx
import { Block } from "reakit";

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
```

A more throughout example:

```jsx
import { Block } from "reakit";

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
```
