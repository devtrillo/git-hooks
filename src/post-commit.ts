#! /usr/bin/env node
import chalk from "chalk";
import { exec as execCallback } from "child_process";

import { promisify } from "util";

const exec = promisify(execCallback);

// Only commit it I'm the creator of the branch

const getBrackets = (str: string) => str.match(/\[(.*?)\]/gm)?.[0];
const getWord = (str: string) => str.match(/[a-z,A-Z]{1,}/gm)?.[0];

const getParentBranchName = async () => {
  const { stdout } = await exec(
    `git show-branch | grep '*' | grep -v "$(git rev-parse --abbrev-ref HEAD)" | head -n1`
  );
  return getWord(getBrackets(stdout));
};

const getCurrentBranch = async () => {
  return (await exec(`git rev-parse --abbrev-ref HEAD`))?.stdout.trim();
};

const getFirstBranch = (commits: string) => {
  return commits
    .split("\n")
    .filter((str) => !str.includes("-") && !str.includes("+") && str.trim())
    .map((str) => str.trim())[0];
};

const getCurrentHash = async () => {
  const baseBranch = await getParentBranchName();
  const currentBranch = await getCurrentBranch();
  let commit: string;
  try {
    const { stdout } = await exec(
      `diff -u <(git rev-list --first-parent ${currentBranch}) <(git rev-list --first-parent ${baseBranch})`,
      { shell: "/bin/bash" }
    );

    commit = getFirstBranch(stdout);
  } catch (e) {
    commit = getFirstBranch(e.stdout);
  }
  const { stdout } = await exec(`git show -s --format='%ae' ${commit}`);
  return stdout.trim();
};

async function main() {
  const authorizedCreators = ["esteban@devtrillo.com", "devtrillo@gmail.com"];
  const branchCreator = await getCurrentHash();

  if (authorizedCreators.find((creator) => creator === branchCreator)) {
    console.log(chalk.greenBright("Pushing your changes"));
    await exec("git push -u origin master");
    console.log(
      chalk.greenBright("Your changes have been pushed successfully")
    );
  } else {
    console.log(
      chalk.redBright(
        "You are not the creator of this branch, if you want to push your chages, please do it manually"
      )
    );
  }
}

main().then(() => {
  console.log("");
});
