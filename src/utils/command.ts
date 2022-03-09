import { spawn } from "child_process";

/**
 * This function will execute a bash command to the terminal and show the outputs as it's writing them
 *
 * @param command string
 * @param args string[]
 * @returns ChildProcessWithoutNullStreams
 */
function bashCommand(command: string, args?: string[]) {
  const cmd = spawn(command, args);
  cmd.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  cmd.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  cmd.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  cmd.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
  return cmd;
}
export default bashCommand;
