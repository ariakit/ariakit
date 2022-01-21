import { useEffect, useRef, useState } from "react";
import {
  Composite,
  CompositeContainer,
  CompositeItem,
  CompositeRow,
  MenuItem,
  Toolbar,
  ToolbarItem,
  useCompositeState,
  useToolbarState,
} from "ariakit";
import "./style.css";
import Menu from "./menu";

function MessageToolbar() {
  const toolbar = useToolbarState();
  return (
    <Toolbar state={toolbar} aria-label="Details and actions">
      <ToolbarItem>React</ToolbarItem>
      <ToolbarItem>Reply</ToolbarItem>
      <ToolbarItem as={Menu} label="Actions">
        <MenuItem>Remove</MenuItem>
        <MenuItem>Forward</MenuItem>
      </ToolbarItem>
    </Toolbar>
  );
}

export default function Example() {
  const composite = useCompositeState();
  const [messages, setMessages] = useState(["Hello"]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    composite.setActiveId(composite.last());
  }, [messages, composite.setActiveId, composite.last]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current?.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="wrapper">
      <Composite ref={listRef} state={composite} role="grid">
        {messages.map((message, index) => (
          <CompositeRow key={index} role="row">
            <CompositeItem as={CompositeContainer} role="gridcell">
              <div>{message}</div>
              <MessageToolbar />
            </CompositeItem>
          </CompositeRow>
        ))}
      </Composite>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = event.currentTarget.message.value;
          setMessages((prevMessages) => [...prevMessages, value]);
          event.currentTarget.message.value = "";
        }}
      >
        <input
          type="text"
          name="message"
          style={{ border: "1px solid black" }}
        />
      </form>
    </div>
  );
}
