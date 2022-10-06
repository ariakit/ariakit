import Link from "next/link";
import index from "../../pages.index";
import Stack from "../icons/stack";

export default function Showcase() {
  return (
    <div className="flex items-center justify-center py-20">
      <Link href="/examples">
        <a className="group flex flex-col items-center gap-2 rounded-lg bg-black/5 p-6 px-8 text-lg hover:bg-black/10 focus-visible:ariakit-outline-input dark:bg-white/5 dark:hover:bg-white/10">
          <Stack className="h-8 w-8 transition-transform group-hover:scale-110" />
          <span>View {index.examples?.length} examples</span>
        </a>
      </Link>
    </div>
  );
}
