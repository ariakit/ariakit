import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <form
      className="wrapper"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        window.alert(data.get("select"));
      }}
    >
      <div className="field">
        <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
          <Ariakit.ComboboxSelectLabel>
            Favorite fruit
          </Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect className="button" name="select" required />
          <Ariakit.ComboboxPopover
            gutter={4}
            sameWidth
            unmountOnHide
            className="popover"
          >
            <Ariakit.ComboboxItem className="select-item" value="Apple" />
            <Ariakit.ComboboxItem className="select-item" value="Banana" />
            <Ariakit.ComboboxItem className="select-item" value="Grape" />
            <Ariakit.ComboboxItem className="select-item" value="Orange" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </div>
      <Ariakit.Button type="submit" className="button primary">
        Submit
      </Ariakit.Button>
    </form>
  );
}
