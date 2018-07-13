`Table.Wrapper` is composed from [Base](/components/primitives/base) . Table.Wrapper  renders by default as a `<tableWrapper>`.

- `Table.Wrapper`

```jsx
import { Block } from "reakit";

<Block overflowX="auto">
  <Table.Wrapper>
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
  </Table.Wrapper>
</Block>
```

