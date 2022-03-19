import { spawn } from "child_process";

import { log, logGreen } from "./logs";

/**
 * This function will execute a bash command to the terminal and show the outputs as it's writing them
 *
 * @param command string
 * @param args string[]
 * @returns ChildProcessWithoutNullStreams
 */
const bashCommand = (command: string, args?: string[]) =>
  new Promise((resolve, reject) => {
    const cmd = spawn(command, args);
    cmd.stdout.on("data", (data) => logGreen(data.toString()));

    cmd.stderr.on("data", (data) => log(data.toString()));

    cmd.on("error", (error) => {
      console.log(`error: ${error.message}`);
      reject(error.message);
    });

    cmd.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(code);
    });
    return cmd;
  });
export default bashCommand;
