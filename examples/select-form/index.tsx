import "./style.css";
import * as Ariakit from "@ariakit/react";

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
        <Ariakit.SelectProvider defaultValue="Apple">
          <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
          <Ariakit.Select className="button" name="select" required />
          <Ariakit.SelectPopover
            gutter={4}
            sameWidth
            unmountOnHide
            className="popover"
          >
            <Ariakit.SelectItem className="select-item" value="Apple" />
            <Ariakit.SelectItem className="select-item" value="Banana" />
            <Ariakit.SelectItem className="select-item" value="Grape" />
            <Ariakit.SelectItem className="select-item" value="Orange" />
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </div>
      <Ariakit.Button type="submit" className="button primary">
        Submit
      </Ariakit.Button>
    </form>
  );
}
