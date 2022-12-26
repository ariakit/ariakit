import {
  alignCenter,
  alignLeft,
  alignRight,
  bold,
  italic,
  underline,
} from "./icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSelect,
  ToolbarSeparator,
} from "./toolbar";
import "./style.css";

const alignmentOptions = [
  { value: "Align Left", icon: alignLeft },
  { value: "Align Center", icon: alignCenter },
  { value: "Align Right", icon: alignRight },
];

export default function Example() {
  return (
    <Toolbar>
      <ToolbarButton>
        {bold}
        Bold
      </ToolbarButton>
      <ToolbarButton>
        {italic}
        Italic
      </ToolbarButton>
      <ToolbarButton>
        {underline}
        Underline
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarSelect aria-label="Text alignment" options={alignmentOptions} />
    </Toolbar>
  );
}
