import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Nav />
          <main class="text-center mx-auto text-gray-700 p-4">
            <Suspense>{props.children}</Suspense>
          </main>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
