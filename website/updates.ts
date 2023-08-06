export interface UpdateItem {
  title: string;
  type: "page" | "release";
  href: string;
  dateTime: string;
}

const updates: UpdateItem[] = [
  {
    title: "New example: Combobox filtering",
    type: "page",
    href: "/examples/combobox-filtering",
    dateTime: "2023-08-06T11:45Z",
  },
  {
    title: "Improved docs: Combobox with links",
    type: "page",
    href: "/examples/combobox-links",
    dateTime: "2023-08-05T10:40Z",
  },
  {
    title: "New example: Menu with Tooltip",
    type: "page",
    href: "/examples/menu-tooltip",
    dateTime: "2023-08-04T12:33Z",
  },
  {
    title: "Improved docs: ComboboxGroup",
    type: "page",
    href: "/examples/combobox-group",
    dateTime: "2023-07-30T02:09Z",
  },
  {
    title: "Improved docs: ComboboxDisclosure",
    type: "page",
    href: "/examples/combobox-disclosure",
    dateTime: "2023-07-28T19:24Z",
  },
  {
    title: "Improved docs: ComboboxCancel",
    type: "page",
    href: "/examples/combobox-cancel",
    dateTime: "2023-07-28T18:57Z",
  },
  {
    title: "Improved docs: Animated Combobox",
    type: "page",
    href: "/examples/combobox-animated",
    dateTime: "2023-07-27T18:40Z",
  },
  {
    title: "Improved docs: Getting started",
    type: "page",
    href: "/guide/getting-started",
    dateTime: "2023-07-25T20:16Z",
  },
  {
    title: "Improved docs: Checkbox",
    type: "page",
    href: "/components/checkbox",
    dateTime: "2023-07-20T12:00Z",
  },
  {
    title: "Improved docs: Button",
    type: "page",
    href: "/components/button",
    dateTime: "2023-07-19T13:10Z",
  },
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
