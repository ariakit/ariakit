import { PostList } from "../../post-list.tsx";
import { newPosts } from "../../posts.ts";

export default function Page() {
  return <PostList posts={newPosts} />;
}
