export interface Action {
  label: string;
  value?: string;
  group?: string;
  items?: Action[];
}

const blocks = [
  { label: "Text" },
  { label: "Heading 1" },
  { label: "Heading 2" },
  { label: "Heading 3" },
  { label: "Page" },
  { label: "To-do list" },
  { label: "Bulleted list" },
  { label: "Numbered list" },
  { label: "Toggle list" },
  { label: "Code" },
  { label: "Quote" },
  { label: "Callout" },
  { label: "Block equation" },
  { label: "Synced block" },
  { label: "Toggle heading 1" },
  { label: "Toggle heading 2" },
  { label: "Toggle heading 3" },
  { label: "2 columns" },
  { label: "3 columns" },
  { label: "4 columns" },
  { label: "5 columns" },
] satisfies Action[];

const pages = [
  { label: "Private pages" },
  { label: "Personal Home" },
  { label: "Daily reflection" },
  { label: "Getting Started" },
  { label: "Journal" },
  { label: "Movie List" },
  { label: "Quick Note" },
  { label: "Reading List" },
  { label: "Recipes" },
  { label: "Take Fig on a walk" },
  { label: "Task List" },
  { label: "Travel Plans" },
  { label: "Yearly Goals" },
] satisfies Action[];

const colors = [
  { label: "Default", value: "inherit" },
  { label: "Gray", value: "gray" },
  { label: "Brown", value: "brown" },
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Purple", value: "purple" },
  { label: "Pink", value: "pink" },
  { label: "Red", value: "red" },
] satisfies Action[];

const backgrounds = [
  { label: "Default background", value: "transparent" },
  { label: "Gray background", value: "gray" },
  { label: "Brown background", value: "brown" },
  { label: "Orange background", value: "orange" },
  { label: "Yellow background", value: "yellow" },
  { label: "Green background", value: "green" },
  { label: "Blue background", value: "blue" },
  { label: "Purple background", value: "purple" },
  { label: "Pink background", value: "pink" },
  { label: "Red background", value: "red" },
] satisfies Action[];

export const actions = {
  askAi: { label: "Ask AI" },
  delete: { label: "Delete" },
  duplicate: {
    label: "Duplicate",
    items: [
      { label: "Duplicate with content" },
      { label: "Duplicate without content" },
    ],
  },
  turnInto: { label: "Turn into", items: blocks },
  turnIntoPageIn: {
    label: "Turn into page in",
    items: [{ label: "Suggested", items: pages }],
  },
  copyLinkToBlock: { label: "Copy link to block" },
  moveTo: { label: "Move to", items: pages },
  comment: { label: "Comment" },
  color: {
    label: "Color",
    items: [
      { label: "Color", items: colors },
      { label: "Background", items: backgrounds },
    ],
  },
} satisfies Record<string, Action>;

export const defaultValues = {
  "Turn into": "Text",
  Color: "inherit",
  Background: "transparent",
};
