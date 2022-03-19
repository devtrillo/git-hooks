#! /usr/bin/env node

import { exec } from "child_process";
import { includes, prop } from "ramda";
import { promisify } from "util";
const execPromise = promisify(exec);

import bashCommand from "./utils/command";
import getPackageManager from "./utils/getPackageManager";
import { logBlue, logGreen } from "./utils/logs";

const main = async () => {
  const hasToUpdate = await execPromise("git remote update")
    .then(() => execPromise("git status -uno"))
    .then(prop("stdout"))
    .then(includes("behind"));

  if (!hasToUpdate) return logGreen("Your branch is up to date (´・ω・)っ由");
  const { hash: hashBeforeUpdate } = await getPackageManager();
  await execPromise("git pull");
  const {
    hash: hashAfterUpdate,
    installCommand,
    packageManager,
  } = await getPackageManager();
  if (hashBeforeUpdate === hashAfterUpdate)
    return logGreen(`There are no changes in the dependencies ＼（＾ ＾）／`);
  logBlue(`There are changes in the dependencies`);
  logBlue(`running install method`);

  bashCommand(packageManager, [installCommand]);
};
main();
