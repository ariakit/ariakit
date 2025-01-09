import spawn from "cross-spawn";
import { cleanBuild } from "./utils.js";

cleanBuild(process.cwd());
spawn.sync("tsc", ["-b", "--clean"], { stdio: "inherit" });
