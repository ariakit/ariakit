<!-- Description -->
Table is composed from Base with minimal styles including collapsed borders.
Table renders by default as a `<table>`.
It comes with several sub components, one for each logical part of a table:

- Table.Body
- Table.Caption
- Table.Cell
- Table.Column
- Table.ColumnGroup
- Table.Foot
- Table.Head
- Table.Row

<!-- Minimal JSX to showcase component -->
```jsx
const { Block } = require('reas');

<Block overflowX="auto">
  <Table>
    <Table.Caption>A Basic table</Table.Caption>
    <Table.Head>
      <Table.Row>
        <Table.Cell header/>
        <Table.Cell header>Chars</Table.Cell>
        <Table.Cell header>Popularity</Table.Cell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      <Table.Row>
        <Table.Cell header>Foo</Table.Cell>
        <Table.Cell>3</Table.Cell>
        <Table.Cell>0.7</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell header>Bar</Table.Cell>
        <Table.Cell>3</Table.Cell>
        <Table.Cell>0.4</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</Block>
```


Rendered HTML.
```html
<div class="Block-euiAZJ kNNudN Base-gxTqDr dXMyxz" style="overflow-x: auto;">
  <table class="Table-evpfJW dXMyxz ghjOny Base-gxTqDr" role="table">
    <caption class="TableCaption-hhOOin dXMyxz dgwDTI Base-gxTqDr">A Basic table</caption>
    <thead class="TableHead-kaYfbB dXMyxz dMETxs Base-gxTqDr" role="rowgroup">
      <tr class="TableRow-jqZJUb dXMyxz bYMSnR Base-gxTqDr" role="row">
        <th class="TableCell-jCBThd dXMyxz dKpvRc Base-gxTqDr" role="columnheader"></th>
        <th class="TableCell-jCBThd dXMyxz dKpvRc Base-gxTqDr" role="columnheader">Chars</th>
        <th class="TableCell-jCBThd dXMyxz dKpvRc Base-gxTqDr" role="columnheader">Popularity</th>
      </tr>
    </thead>
    <tbody class="TableBody-eCOqxG dXMyxz jCqBDY Base-gxTqDr" role="rowgroup">
      <tr class="TableRow-jqZJUb dXMyxz bYMSnR Base-gxTqDr" role="row">
        <th class="TableCell-jCBThd dXMyxz dKpvRc Base-gxTqDr" role="columnheader">Foo</th>
        <td class="TableCell-jCBThd dXMyxz gHLgPt Base-gxTqDr" role="cell">3</td>
        <td class="TableCell-jCBThd dXMyxz gHLgPt Base-gxTqDr" role="cell">0.7</td>
      </tr>
      <tr class="TableRow-jqZJUb dXMyxz bYMSnR Base-gxTqDr" role="row">
        <th class="TableCell-jCBThd dXMyxz dKpvRc Base-gxTqDr" role="columnheader">Bar</th>
        <td class="TableCell-jCBThd dXMyxz gHLgPt Base-gxTqDr" role="cell">3</td>
        <td class="TableCell-jCBThd dXMyxz gHLgPt Base-gxTqDr" role="cell">0.4</td>
      </tr>
    </tbody>
  </table>
</div>
```

A more throughout example:
```jsx
const { Block } = require('reas');

<Block overflowX="auto">
  <Table>
    <Table.Caption>A test table with merged cells</Table.Caption>
    <Table.ColumnGroup>
      <Table.Column />
      <Table.Column />
      <Table.Column />
      <Table.Column backgroundColor="bisque" />
    </Table.ColumnGroup>
    <Table.Head>
      <Table.Row>
        <Table.Cell rowSpan={2} />
        <Table.Cell header colSpan={2}>Average</Table.Cell>
        <Table.Cell header rowSpan={2}>Red eyes</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell header>Height</Table.Cell>
        <Table.Cell header>Weight</Table.Cell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      <Table.Row>
        <Table.Cell header>Males</Table.Cell>
        <Table.Cell>1.9</Table.Cell>
        <Table.Cell>0.003</Table.Cell>
        <Table.Cell>40%</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell header>Females</Table.Cell>
        <Table.Cell>1.7</Table.Cell>
        <Table.Cell>0.002</Table.Cell>
        <Table.Cell>43%</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</Block>
```
