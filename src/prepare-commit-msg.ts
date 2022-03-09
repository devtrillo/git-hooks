#! /usr/bin/env node

import { exec as execCB } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { filter, includes, pipe, prop, toLower } from "ramda";
import { promisify } from "util";
import { logGreen } from "./utils/logs";
import inquirer from "inquirer";
import autocompletePrompt from "inquirer-autocomplete-prompt";

inquirer.registerPrompt("autocomplete", autocompletePrompt);

const exec = promisify(execCB);

const commitType = process.argv[3] ?? "No type";
const commitMessageFile = process.argv[2] ?? "No file";
console.log({ commitType, commitMessageFile });

const pivotalTicketRegex = /\d{9}/g;
const jiraTicketRegex = /[a-zA-z]+-\d{1,4}/g;

const extractInfoFromBranch = (currentBranch: string) => {
  const possibleRegex = [
    { type: "pivotal", pattern: pivotalTicketRegex },
    { type: "jira", pattern: jiraTicketRegex },
  ];

  return possibleRegex
    .map(({ type, pattern }) => {
      const ticket = pattern.exec(currentBranch)?.at(0);
      return {
        type,
        isValid: !!ticket,
        ticket,
      };
    })
    .filter(prop("isValid"))
    .at(0);
};
const getCurrentBranch = async () =>
  (await exec("git symbolic-ref -q HEAD"))?.stdout.split("/").pop();

const main = async () => {
  const commitMsg = readFileSync(process.argv[2])?.toString();
  console.log(typeof commitMsg);
  const currentBranch = await getCurrentBranch();

  const {
    ticket,
    type,
    isValid = false,
  } = extractInfoFromBranch(currentBranch) ?? {};
  if (!isValid) return;
  if (commitMsg.includes(`[#${ticket}]`))
    return logGreen("There is a ticket number in the commit");

  switch (type) {
    case "jira":
      writeFileSync(process.argv[2], `[#${ticket}] ${commitMsg}`);
      break;
    case "pivotal":
      writeFileSync(
        process.argv[2],
        `${commitMsg}        
[#${ticket}]`
      );
      break;
    default:
      break;
  }
};

inquirer.prompt([
  { type: "list", name: "risk", choices: "Low,Medium,High".split(",") },
]);

main().finally(() => console.log("SUccess"));
