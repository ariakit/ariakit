import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
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
import { isFocusEventOutside } from "ariakit-utils/events";
import {
  MdOutlineAddReaction,
  MdOutlineMoreVert,
  MdReply,
  MdSend,
} from "react-icons/md";
import Menu from "./menu";
import TooltipButton from "./tooltip-button";
import "./style.css";

function MessageToolbar() {
  const toolbar = useToolbarState();
  return (
    <Toolbar state={toolbar} aria-label="Actions" className="message-toolbar">
      <ToolbarItem as={TooltipButton} title="React" className="button">
        <MdOutlineAddReaction size={20} />
      </ToolbarItem>
      <ToolbarItem as={TooltipButton} title="Reply" className="button">
        <MdReply size={20} />
      </ToolbarItem>
      <ToolbarItem>
        {(props) => (
          <Menu
            {...props}
            as={TooltipButton}
            label={<MdOutlineMoreVert size={20} />}
            title="More"
            className="button"
          >
            <MenuItem className="menu-item">Remove</MenuItem>
            <MenuItem className="menu-item">Forward</MenuItem>
          </Menu>
        )}
      </ToolbarItem>
    </Toolbar>
  );
}

type MessagesProps = {
  children?: ReactNode;
  messages: string[];
  setMessages: Dispatch<SetStateAction<string[]>>;
};

function Messages({ children, messages, setMessages }: MessagesProps) {
  const composite = useCompositeState();
  const [message, setMessage] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    composite.setActiveId(composite.last());
  }, [messages, composite.setActiveId, composite.last]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="wrapper">
      <Composite
        ref={listRef}
        state={composite}
        role="grid"
        className="messages"
      >
        {children}
      </Composite>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (message) {
            setMessage("");
            requestAnimationFrame(() => {
              setMessages((prevMessages) => [...prevMessages, message]);
            });
          }
        }}
      >
        <input
          id="loler"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="input"
        />
        <Button className="button">
          <MdSend size={24} />
        </Button>
      </form>
    </div>
  );
}

function Item(props) {
  const [showToolbar, setShowToolbar] = useState(false);
  return (
    <CompositeItem
      as={CompositeContainer}
      role="gridcell"
      className="message-cell"
      onFocusVisible={() => setShowToolbar(true)}
      onBlur={(event) => {
        if (isFocusEventOutside(event)) {
          setShowToolbar(false);
        }
      }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      <div className="message">{props.children}</div>
      {showToolbar && <MessageToolbar />}
    </CompositeItem>
  );
}

export default function Example() {
  const [messages, setMessages] = useState([
    "Hello",
    "dsads",
    "dsadjsak hdash jkdhasjk dhasjkhd ashdjk as",
    "dsakjdhsadskajh hdksah kjdhas dkas hdjkh djkas jk",
    "dsadsa",
    "dsadsa",
    "dsadsa",
    "dsakjdhsadskajh hdksah kjdhas dkas hdjkh djkas jk",
    "dsadsa",
    "dsadsa",
    "dsadsa",
  ]);
  const deferredMessages = useDeferredValue(messages);

  return (
    <Messages messages={deferredMessages} setMessages={setMessages}>
      {deferredMessages.map((message, index) => (
        <CompositeRow key={index} role="row">
          <Item>{message}</Item>
        </CompositeRow>
      ))}
    </Messages>
  );
}
