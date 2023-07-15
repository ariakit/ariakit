export interface UpdateItem {
  title: string;
  type: "page" | "release";
  href: string;
  dateTime: string;
}

const updates: UpdateItem[] = [
  {
    title: "New page: API Reference",
    type: "page",
    href: "/reference",
    dateTime: "2023-07-05T11:00Z",
  },
  {
    title: "New example: Dialog with scrollable backdrop",
    type: "page",
    href: "/examples/dialog-backdrop-scrollable",
    dateTime: "2023-06-07T11:00Z",
  },
  {
    title: "New example: Radix UI Dialog",
    type: "page",
    href: "/examples/dialog-radix",
    dateTime: "2023-06-04T11:00Z",
  },
];

export default updates;
