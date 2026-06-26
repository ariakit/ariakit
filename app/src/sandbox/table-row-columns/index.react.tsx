import { Table } from "#app/examples/_lib/ariakit/table.react.tsx";
import type { TableRows } from "#app/examples/_lib/ariakit/table.react.tsx";

const rows: TableRows<"name" | "age" | "city"> = [
  {
    group: "head",
    name: "Name",
    age: { numeric: true, children: "Age" },
    city: "City",
  },
  { name: "Ada", age: null, city: "London" },
  { city: "Paris", age: 38, name: "Grace" },
];

export default function Example() {
  return <Table rows={rows} />;
}
