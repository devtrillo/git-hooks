import inquirer from "inquirer";
import { filter, head, map, prop, propEq } from "ramda";

import getHashFromFile from "./getHashFile";
import { logBlue } from "./logs";
import renameKeys from "./rename-keys";

const getPackageManager = async () => {
  const hashesPackages = [
    {
      installCommand: "install --frozen-lockfile",
      lockFile: "yarn.lock",
      packageManager: "yarn",
    },
    {
      installCommand: "ci",
      lockFile: "package-lock.json",
      packageManager: "npm",
    },
    {
      installCommand: "i --frozen-lockfile",
      lockFile: "pnpm-lock.yaml",
      packageManager: "pnpm",
    },
  ]
    .map(({ lockFile, packageManager, installCommand }) => ({
      hash: getHashFromFile(lockFile, false),
      installCommand,
      lockFile,
      packageManager,
    }))
    .filter(({ hash }) => Boolean(hash));

  let selectedHash = prop("hash", head(hashesPackages));

  if (hashesPackages.length > 1) {
    logBlue("There are multiple package managers in the project");

    const options = await inquirer.prompt({
      choices: map(
        renameKeys({ hash: "value", lockFile: "name" }),
        hashesPackages
      ),
      message: "Please select the package manager to follow",
      name: "selectedHash",
      type: "list",
    });
    selectedHash = options.selectedHash;
  }
  return head(filter(propEq("hash", selectedHash), hashesPackages));
};

export default getPackageManager;
