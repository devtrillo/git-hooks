#! /usr/bin/env node
import { exec as execOld } from "child_process";
import { includes } from "ramda";
import { promisify } from "util";

import bashCommand from "./utils/command";
import getPackageManager from "./utils/getPackageManager";
import { logGreen } from "./utils/logs";

const exec = promisify(execOld);

const didLockfileChanged = (files: string): boolean =>
  includes("yarn.lock", files) ||
  includes("pnpm-lock.yaml", files) ||
  includes("package-lock.json", files);

const getChangedFiles = (): Promise<string> =>
  new Promise((resolve, reject) =>
    exec("git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD")
      .then(({ stderr, stdout }) => (stderr ? reject(stderr) : resolve(stdout)))
      .catch(reject)
  );

async function main() {
  const changedFiles = await getChangedFiles();
  if (!didLockfileChanged(changedFiles)) return;
  logGreen("There is an update in the lock file");
  const { packageManager, installCommand } = await getPackageManager();
  await bashCommand(packageManager, [installCommand]);
}

main().then(() => {
  logGreen("Perfectly ran");
});
