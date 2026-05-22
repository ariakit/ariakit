import { spawn } from "node:child_process";
import { createServer } from "node:net";

interface DevOptions {
  clean?: boolean;
}

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

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code) {
        reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
        return;
      }
      resolve();
    });
  });
}

export async function dev(options: DevOptions = {}) {
  if (options.clean !== false) {
    await runCommand("pnpm", ["-F", "@ariakit/*", "run", "clean"]);
  }

  const nextjsPort = await findAvailablePort(3000);

  const child = spawn(
    "conc",
    [
      "-r",
      "pnpm:dev-package-json",
      "pnpm -F app run dev",
      `pnpm -F nextjs run dev --port ${nextjsPort}`,
    ],
    {
      stdio: "inherit",
      env: { ...process.env, NEXTJS_PORT: String(nextjsPort) },
    },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}
