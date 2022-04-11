import { ImBold, ImItalic, ImUnderline } from "react-icons/im";
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
} from "react-icons/md";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSelect,
  ToolbarSeparator,
} from "./toolbar";
import "./style.css";

const alignmentOptions = [
  { value: "Align Left", icon: <MdFormatAlignLeft /> },
  { value: "Align Center", icon: <MdFormatAlignCenter /> },
  { value: "Align Right", icon: <MdFormatAlignRight /> },
];

export default function Example() {
  return (
    <Toolbar>
      <ToolbarButton>
        <ImBold />
        Bold
      </ToolbarButton>
      <ToolbarButton>
        <ImItalic />
        Italic
      </ToolbarButton>
      <ToolbarButton>
        <ImUnderline />
        Underline
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarSelect aria-label="Text alignment" options={alignmentOptions} />
    </Toolbar>
  );
}
