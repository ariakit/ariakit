import { PopoverArrow } from "ariakit/popover";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectRow,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import "./style.css";

export default function Example() {
  const select = useSelectState({
    defaultValue: "Center",
    setValueOnMove: true,
    placement: "bottom",
  });
  return (
    <div className="wrapper-wrapper">
      <div className="wrapper">
        <SelectLabel state={select}>Position</SelectLabel>
        <Select state={select} showOnKeyDown={false} className="select">
          <div className="icon">
            <div className="icon-row">
              <div
                className="icon-item"
                data-active={select.value === "Top Left"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Top Center"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Top Right"}
              />
            </div>
            <div className="icon-row">
              <div
                className="icon-item"
                data-active={select.value === "Center Left"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Center"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Center Right"}
              />
            </div>
            <div className="icon-row">
              <div
                className="icon-item"
                data-active={select.value === "Bottom Left"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Bottom Center"}
              />
              <div
                className="icon-item"
                data-active={select.value === "Bottom Right"}
              />
            </div>
          </div>
          {select.value}
          <SelectArrow className="select-arrow" />
        </Select>
        <SelectPopover state={select} role="grid" className="popover">
          <PopoverArrow className="arrow" />
          <SelectRow className="row">
            <SelectItem
              className="select-item"
              value="Top Left"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Top Left</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Top Center"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Top Center</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Top Right"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Top Right</VisuallyHidden>
            </SelectItem>
          </SelectRow>
          <SelectRow className="row">
            <SelectItem
              className="select-item"
              value="Center Left"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Center Left</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Center"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Center</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Center Right"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Center Right</VisuallyHidden>
            </SelectItem>
          </SelectRow>
          <SelectRow className="row">
            <SelectItem
              className="select-item"
              value="Bottom Left"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Bottom Left</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Bottom Center"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Bottom Center</VisuallyHidden>
            </SelectItem>
            <SelectItem
              className="select-item"
              value="Bottom Right"
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              <VisuallyHidden>Bottom Right</VisuallyHidden>
            </SelectItem>
          </SelectRow>
        </SelectPopover>
      </div>
      <div className="canvas">
        <div className="canvas-row">
          <div
            className="canvas-item"
            data-active={select.value === "Top Left"}
          >
            Text
          </div>
          <div
            className="canvas-item"
            data-active={select.value === "Top Center"}
          >
            Text
          </div>
          <div
            className="canvas-item"
            data-active={select.value === "Top Right"}
          >
            Text
          </div>
        </div>
        <div className="canvas-row">
          <div
            className="canvas-item"
            data-active={select.value === "Center Left"}
          >
            Text
          </div>
          <div className="canvas-item" data-active={select.value === "Center"}>
            Text
          </div>
          <div
            className="canvas-item"
            data-active={select.value === "Center Right"}
          >
            Text
          </div>
        </div>
        <div className="canvas-row">
          <div
            className="canvas-item"
            data-active={select.value === "Bottom Left"}
          >
            Text
          </div>
          <div
            className="canvas-item"
            data-active={select.value === "Bottom Center"}
          >
            Text
          </div>
          <div
            className="canvas-item"
            data-active={select.value === "Bottom Right"}
          >
            Text
          </div>
        </div>
      </div>
    </div>
  );
}
