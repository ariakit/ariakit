import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import { frame } from "@ariakit/ui/styles/frame";
import type { Post } from "./posts.ts";

export interface PostListProps {
  posts: Post[];
}

// A server component. Style functions return plain class names and styles, so
// the list renders without client JavaScript.
export function PostList({ posts }: PostListProps) {
  return (
    <ol className="grid gap-4">
      {posts.map((post) => (
        <li key={post.id} className="flex items-center gap-3">
          <span
            {...frame.jsx({
              $layer: true,
              $rounded: "lg",
              $border: true,
              className:
                "grid w-12 shrink-0 py-1 text-center text-sm font-semibold tabular-nums",
            })}
          >
            {post.votes}
            <span className="sr-only"> votes</span>
          </span>
          <div className="grid min-w-0 gap-0.5">
            <p className="truncate font-medium">{post.title}</p>
            <p className="ak-ink-70 truncate text-sm">
              {post.author} · {post.time} · {post.comments} comments
            </p>
          </div>
          <span {...badge.jsx({ className: "ms-auto shrink-0" })}>
            <span {...badgeLabel.jsx()}>{post.tag}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
