import { spawn } from "node:child_process";

const shutdownTimeout = 500;

function sendSignal(pid: number, signal: NodeJS.Signals) {
  try {
    process.kill(pid, signal);
    return true;
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    if (!("code" in error)) {
      throw error;
    }
    if (error.code !== "ESRCH") {
      throw error;
    }
    return false;
  }
}

function sendGroupSignal(pid: number, signal: NodeJS.Signals) {
  if (sendSignal(-pid, signal)) return;
  sendSignal(pid, signal);
}

function getExitCode(code: number | null, signal: NodeJS.Signals | null) {
  if (code != null) return code;
  if (signal === "SIGINT") return 130;
  if (signal === "SIGQUIT") return 131;
  if (signal === "SIGTERM") return 143;
  return 1;
}

function isForwardedSignal(message: unknown): message is NodeJS.Signals {
  if (message === "SIGCONT") return true;
  if (message === "SIGHUP") return true;
  if (message === "SIGINT") return true;
  if (message === "SIGQUIT") return true;
  if (message === "SIGTERM") return true;
  if (message === "SIGTSTP") return true;
  return false;
}

function supervise(command: string, args: string[]) {
  let coordinatorPid: number | undefined;
  let parentDisconnected = !process.connected;
  let shutdownStarted = false;
  const pendingSignals: NodeJS.Signals[] = [];

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (parentDisconnected) return;
    if (!coordinatorPid) {
      pendingSignals.push(signal);
      return;
    }

    if (signal === "SIGCONT") {
      sendGroupSignal(coordinatorPid, signal);
      return;
    }
    if (signal === "SIGQUIT") {
      sendGroupSignal(coordinatorPid, signal);
      return;
    }
    if (signal === "SIGTSTP") {
      sendGroupSignal(coordinatorPid, "SIGSTOP");
      return;
    }
    sendSignal(coordinatorPid, signal);
  };

  const shutdownCoordinator = () => {
    if (shutdownStarted) return;
    const pid = coordinatorPid;
    if (!pid) return;

    shutdownStarted = true;
    pendingSignals.length = 0;
    sendGroupSignal(pid, "SIGCONT");
    sendSignal(pid, "SIGTERM");
    // Keep the supervisor alive through the grace period even if the
    // coordinator exits before one of its descendants.
    setTimeout(() => {
      sendGroupSignal(pid, "SIGKILL");
    }, shutdownTimeout);
  };
  const onDisconnect = () => {
    parentDisconnected = true;
    shutdownCoordinator();
  };
  const onMessage = (message: unknown) => {
    if (!isForwardedSignal(message)) return;
    forwardSignal(message);
  };
  const cleanup = () => {
    process.off("disconnect", onDisconnect);
    process.off("message", onMessage);
  };

  process.on("message", onMessage);
  process.once("disconnect", onDisconnect);

  if (parentDisconnected) {
    cleanup();
    process.exitCode = 1;
    return;
  }

  const coordinator = spawn(command, args, {
    detached: true,
    env: process.env,
    stdio: "inherit",
  });
  coordinatorPid = coordinator.pid;

  let spawnError = false;
  coordinator.once("error", (error) => {
    spawnError = true;
    console.error(error);
  });
  coordinator.once("close", (code, signal) => {
    cleanup();
    process.exitCode = spawnError ? 1 : getExitCode(code, signal);
    if (process.connected) {
      process.disconnect();
    }
  });

  if (parentDisconnected) {
    shutdownCoordinator();
    return;
  }
  for (const signal of pendingSignals) {
    forwardSignal(signal);
  }
}

const command = process.argv[2];
if (!command) {
  throw new Error("Missing supervised command");
}
supervise(command, process.argv.slice(3));
