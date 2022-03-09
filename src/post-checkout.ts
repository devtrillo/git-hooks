#! /usr/bin/env node

import chalk from "chalk";
import { exec } from "child_process";
import { compose, filter, has, head, includes, map, prop, propEq } from "ramda";
import { promisify } from "util";
import inquirer from "inquirer";
const execPromise = promisify(exec);

const logGreen = (message: any) => console.log(chalk.green(message));
const logRed = (message: any) => console.log(chalk.red(message));
const logBlue = (message: any) => console.log(chalk.blue(message));

import { createHash } from "crypto";
import { readFileSync } from "fs";
import renameKeys from "./utils/rename-keys";
import bashCommand from "./utils/command";

const getPackageManager = (
  selected: string,
  hashes: { lockFile: string; hash: string }[]
) => {
  const selectedItem = head(filter(propEq("hash", selected), hashes));
  return prop("lockFile", selectedItem);
};

const getHashBeforeUpdate = (fileName: string, showError: boolean = true) => {
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
  const hashesPackages = ["yarn.lock", "package-lock.json", "pnpm-lock.yaml"]
    .map((lockFile) => ({
      lockFile,
      hash: getHashBeforeUpdate(lockFile, false),
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
  await bashCommand("npm", ["i"]);
};
main();
