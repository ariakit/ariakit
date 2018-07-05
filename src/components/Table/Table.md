`Table` is composed from [Base](/components/primitives/base) with minimal styles including collapsed borders. Table renders by default as a `<table>`.
It comes with several sub components, one for each logical part of a table:

- `Table.Body`
- `Table.Caption`
- `Table.Cell`
- `Table.Column`
- `Table.ColumnGroup`
- `Table.Foot`
- `Table.Head`
- `Table.Row`

```jsx
import { Block } from "reakit";

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

A more throughout example:

```jsx
import { Block } from "reakit";

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
