import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputGroup,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { ArrowUp } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useState } from "react";

interface Message {
  id: number;
  mine: boolean;
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, mine: false, text: "Can you send the launch notes before noon?" },
  { id: 2, mine: true, text: "Sure! I'm adding the last screenshots now." },
  { id: 3, mine: false, text: "Great, thanks. Ping me when they're ready." },
];

// Enter sends and Shift+Enter adds a line, except while an input method is
// composing text.
function submitOnEnter(
  event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) {
  if (event.key !== "Enter") return;
  if (event.shiftKey) return;
  if (event.nativeEvent.isComposing) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

export default function Example() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  return (
    <div className="grid w-[26rem] max-w-full gap-4">
      <ul aria-label="Messages" className="grid gap-2">
        {messages.map((message) => (
          <li
            key={message.id}
            className={message.mine ? "justify-self-end" : "justify-self-start"}
          >
            <Frame
              $layer={message.mine ? "brand" : true}
              $lightnessOffset={!message.mine}
              $rounded="xl"
              $p={2}
              className="max-w-72 px-3 whitespace-pre-wrap"
            >
              <p>{message.text}</p>
            </Frame>
          </li>
        ))}
      </ul>
      <form
        aria-label="New message"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          setMessages((previous) => [
            ...previous,
            { id: previous.length + 1, mine: true, text },
          ]);
          setDraft("");
        }}
      >
        {/* The group draws the 3:1 edge around the whole typing area, so the
            textarea inside it needs no edge of its own. */}
        <InputGroup className="items-end">
          <Input
            render={<textarea rows={1} />}
            aria-label="Message"
            placeholder="Write a message…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={submitOnEnter}
            $fitContent
            className="max-h-40 resize-none"
          />
          <InputSlot $size="2xl">
            <Button
              type="submit"
              aria-label="Send message"
              $size="sm"
              $layer="brand"
              $kind="bevel"
            >
              <ButtonSlot>
                <ArrowUp />
              </ButtonSlot>
            </Button>
          </InputSlot>
        </InputGroup>
      </form>
    </div>
  );
}
