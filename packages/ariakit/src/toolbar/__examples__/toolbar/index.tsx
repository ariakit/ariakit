import { Button } from "ariakit/button";
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState,
} from "ariakit/toolbar";
import {
  ImBold,
  ImItalic,
  ImParagraphCenter,
  ImParagraphLeft,
  ImParagraphRight,
  ImUnderline,
} from "react-icons/im";
import "./style.css";

export default function Example() {
  const toolbar = useToolbarState();

  return (
    <Toolbar state={toolbar} className="toolbar">
      <ToolbarItem as={Button} className="button">
        <ImBold />
        Bold
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImItalic />
        Italic
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImUnderline />
        Underline
      </ToolbarItem>
      <ToolbarSeparator className="toolbar-separator" />
      <ToolbarItem as={Button} className="button">
        <ImParagraphLeft />
        Align Left
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImParagraphCenter />
        Align Center
      </ToolbarItem>
      <ToolbarItem as={Button} className="button">
        <ImParagraphRight />
        Align Right
      </ToolbarItem>
    </Toolbar>
  );
}
