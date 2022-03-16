#! /usr/bin/env node

import { exec } from "child_process";
import { promisify } from "util";
import { filter, head, includes, map, pick, prop, propEq } from "ramda";
import inquirer from "inquirer";
const execPromise = promisify(exec);

import { createHash } from "crypto";
import { readFileSync } from "fs";
import renameKeys from "./utils/rename-keys";
import bashCommand from "./utils/command";
import { logBlue, logGreen, logRed } from "./utils/logs";

let packageManager: string;
let packageInstallCommand: string;
const getPackageManager = (
  selected: string,
  hashes: { lockFile: string; hash: string; packageManager: string,installCommand:string }[]
) => {
  const selectedItem = head(filter(propEq("hash", selected), hashes));

  return pick([ "packageManager","installCommand" ], selectedItem);
};

const getHashBeforeUpdate = (fileName: string, showError = true) => {
  try {
    const fileBuffer = readFileSync(fileName);
    const hashSum = createHash("sha256");
    hashSum.update(fileBuffer);

    return hashSum.digest("hex");
  } catch (e) {
    if (showError) logRed(`File ${fileName} doesn't exist`);
    return null;
  }
};

const getPackageManagerHash = async () => {
  const hashesPackages = [
    { lockFile: "yarn.lock", packageManager: "yarn" ,installCommand:"install --frozen-lockfile"},
    { lockFile: "package-lock.json", packageManager: "npm" ,installCommand:"ci"},
    { lockFile: "pnpm-lock.yaml", packageManager: "pnpm" ,installCommand:"i --frozen-lockfile"},
  ]
    .map(({ lockFile, packageManager,installCommand }) => ({
      lockFile,
      packageManager,
      hash: getHashBeforeUpdate(lockFile, false),installCommand
    }))
    .filter(({ hash }) => Boolean(hash));

  let selectedHash = prop("hash", head(hashesPackages));

  if (hashesPackages.length > 1) {
    logBlue("There are multiple package managers in the project");

    const options = await inquirer.prompt({
      type: "list",
      name: "selectedHash",
      message: "Please select the package manager to follow",
      choices: map(
        renameKeys({ lockFile: "name", hash: "value" }),
        hashesPackages
      ),
    });
    selectedHash = options.selectedHash;
  }
  const result = getPackageManager(selectedHash, hashesPackages);
packageManager=result.packageManager
  packageInstallCommand=result.installCommand
  return selectedHash;
};

const main = async () => {
  const hasToUpdate = await execPromise("git remote update")
    .then(() => execPromise("git status -uno"))
    .then(prop("stdout"))
    .then(includes("behind"));

  if (!hasToUpdate) return logGreen("Your branch is up to date (´・ω・)っ由");
  const hashBeforeUpdate = await getPackageManagerHash();
  await execPromise("git pull");
  const hashAfterUpdate = await getPackageManagerHash();
  if (hashBeforeUpdate === hashAfterUpdate)
    return logGreen(`There are no changes in the dependencies ＼（＾ ＾）／`);
  logBlue(`There are changes in the dependencies`);
  logBlue(`running install method`);

   bashCommand(packageManager, [packageInstallCommand]);
};
main();
