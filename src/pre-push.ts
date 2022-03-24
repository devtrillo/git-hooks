#! /usr/bin/env node
import chalk from "chalk";

import { exec } from "child_process";
import { exit } from "process";
import { intersection, prop } from "ramda";
import { promisify } from "util";

const execPromise = promisify(exec);

const protectedBranches = ["main", "master", "develop", "release-", "patch-"];
const forcePush = ["force", "delete", "-f"];

async function main() {
  const currentBranch = await execPromise(
    "git rev-parse --abbrev-ref HEAD"
  ).then(prop("stdout"));

  if (!!intersection(forcePush, process.argv).pop()) return 0;
  if (!!intersection(protectedBranches, [currentBranch]).pop())
    throw Error("The branch is protected");
  return 0;
}

main()
  .then(() => {
    console.log(chalk.green("Perfectly ran"));
    exit(0);
  })
  .catch(() => {
    console.log(chalk.red("The branch is protected"));
    exit(1);
  });
