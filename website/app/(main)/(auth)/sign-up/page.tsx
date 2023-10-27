import { getCheckout } from "utils/stripe.js";
import SignUpClient from "./sign-up-client.jsx";

interface PageProps {
  searchParams: { "session-id": string | null };
}

export const runtime = "nodejs";

export default async function Page({ searchParams }: PageProps) {
  const sessionId = searchParams["session-id"];
  if (!sessionId) return <SignUpClient />;

  const session = await getCheckout(sessionId);

  return (
    <SignUpClient
      emailAddress={session?.customer_details?.email || undefined}
    />
  );
}
