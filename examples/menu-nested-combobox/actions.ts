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
];

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
];

const colors = [
  { label: "Default" },
  { label: "Gray" },
  { label: "Brown" },
  { label: "Orange" },
  { label: "Yellow" },
  { label: "Green" },
  { label: "Blue" },
  { label: "Purple" },
  { label: "Pink" },
  { label: "Red" },
];

const backgrounds = [
  { label: "Default background" },
  { label: "Gray background" },
  { label: "Brown background" },
  { label: "Orange background" },
  { label: "Yellow background" },
  { label: "Green background" },
  { label: "Blue background" },
  { label: "Purple background" },
  { label: "Pink background" },
  { label: "Red background" },
];

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
  turnIntoPageIn: { label: "Turn into page in", items: pages },
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
};