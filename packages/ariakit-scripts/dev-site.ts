import { spawn } from "node:child_process";
import { createServer } from "node:net";

/**
 * Finds the first available TCP port starting from the given port number.
 */
function findAvailablePort(start: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(start, () => {
      server.close(() => resolve(start));
    });
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        resolve(findAvailablePort(start + 1));
        return;
      }
      reject(error);
    });
  });
}

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
