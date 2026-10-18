import { PostList } from "../post-list.tsx";
import { hotPosts } from "../posts.ts";

export default function Page() {
  return <PostList posts={hotPosts} />;
}
