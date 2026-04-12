import { spawn } from "node:child_process";
import { createServer } from "node:net";

/**
 * Finds the first available TCP port starting from the given port number.
 */
async function findAvailablePort(start: number): Promise<number> {
  let port = start;
  while (true) {
    const available = await new Promise<boolean>((resolve, reject) => {
      const server = createServer();
      server.once("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          resolve(false);
          return;
        }
        reject(error);
      });
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });
    if (available) return port;
    port += 1;
  }
}

export async function dev() {
  const nextjsPort = await findAvailablePort(3000);

  const child = spawn(
    "conc",
    [
      "-r",
      "pnpm -F site run dev",
      `pnpm -F nextjs run dev -- --port ${nextjsPort}`,
    ],
    {
      stdio: "inherit",
      env: { ...process.env, NEXTJS_PORT: String(nextjsPort) },
    },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}
