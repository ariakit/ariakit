import Link from "next/link.js";

export default function Page() {
  return (
    <div>
      {/* @ts-expect-error https://github.com/vercel/next.js/issues/46078 */}
      <Link href="/previews/dialog-next-router/login" className="button">
        Login
      </Link>
    </div>
  );
}
