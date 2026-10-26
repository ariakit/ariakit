import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useId } from "react";

// A fixed time stands in for the current time, so the server and the browser
// render the same text. An app would use the current time and update it.
const NOW = Date.parse("2026-10-25T15:00:00Z");

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// A fixed time zone keeps the server and the browser in agreement too.
const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

const comments: Comment[] = [
  {
    id: "comment-3",
    author: "Ada Lovelace",
    text: "The new chart reads much better. Ship it.",
    time: "2026-10-25T12:10:00Z",
  },
  {
    id: "comment-2",
    author: "Grace Hopper",
    text: "Can we label the axes?",
    time: "2026-10-24T09:30:00Z",
  },
  {
    id: "comment-1",
    author: "Alan Turing",
    text: "First draft of the chart is up.",
    time: "2026-10-18T17:45:00Z",
  },
];

function formatRelativeTime(time: number) {
  const elapsed = time - NOW;
  if (Math.abs(elapsed) < HOUR) {
    return relativeFormat.format(Math.round(elapsed / MINUTE), "minute");
  }
  if (Math.abs(elapsed) < DAY) {
    return relativeFormat.format(Math.round(elapsed / HOUR), "hour");
  }
  return relativeFormat.format(Math.round(elapsed / DAY), "day");
}

function CommentTime({ id, time }: Pick<Comment, "id" | "time">) {
  const descriptionId = useId();
  const date = Date.parse(time);
  const exactTime = dateFormat.format(date);
  return (
    <>
      {/* The link names its comment with the relative time, and the exact
          time is its description, since the tooltip is only visual. */}
      {/* The tooltip opens to the right, so it doesn't cover the comment
          above. */}
      <Tooltip content={exactTime} placement="right">
        <Link href={`#${id}`} aria-describedby={descriptionId}>
          <time dateTime={time}>{formatRelativeTime(date)}</time>
        </Link>
      </Tooltip>
      <span id={descriptionId} hidden>
        {exactTime}
      </span>
    </>
  );
}

export default function Example() {
  return (
    <ol className="grid w-[24rem] max-w-full gap-5 text-sm">
      {comments.map((comment) => (
        <li key={comment.id} id={comment.id} className="grid gap-1">
          <p className="flex gap-2">
            <span className="font-medium">{comment.author}</span>
            <CommentTime id={comment.id} time={comment.time} />
          </p>
          <p>{comment.text}</p>
        </li>
      ))}
    </ol>
  );
}
