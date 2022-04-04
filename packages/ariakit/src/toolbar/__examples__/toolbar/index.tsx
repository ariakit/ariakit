import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState,
} from "ariakit/toolbar";
import { ImBold, ImItalic, ImRedo, ImUnderline, ImUndo } from "react-icons/im";
import "./style.css";

export default function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar state={toolbar} className="toolbar">
      <ToolbarItem className="button">
        <ImUndo />
        Undo
      </ToolbarItem>
      <ToolbarItem className="button" disabled>
        <ImRedo />
        Redo
      </ToolbarItem>
      <ToolbarSeparator className="separator" />
      <ToolbarItem className="button">
        <ImBold />
        Bold
      </ToolbarItem>
      <ToolbarItem className="button">
        <ImItalic />
        Italic
      </ToolbarItem>
      <ToolbarItem className="button">
        <ImUnderline />
        Underline
      </ToolbarItem>
    </Toolbar>
  );
}
