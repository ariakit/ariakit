import "./style.css";
import Link from "next/link.js";

export default function Page() {
  return (
    <>
      {/* @ts-expect-error https://github.com/vercel/next.js/issues/46078 */}
      <Link href="/shop">Go to Shop</Link>
    </>
  );
}
