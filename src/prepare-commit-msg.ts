#! /usr/bin/env node

import { exec as execCB } from "child_process";
import { readFileSync, write, writeFileSync } from "fs";
import { filter, includes, pipe, prop, toLower } from "ramda";
import { promisify } from "util";
import { logGreen } from "./utils/logs";
import inquirer from "inquirer";
import autocompletePrompt from "inquirer-autocomplete-prompt";

inquirer.registerPrompt("autocomplete", autocompletePrompt);

const exec = promisify(execCB);

const commitType = process.argv[3] ?? "No type";
const commitMessageFile = process.argv[2] ?? "No file";

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
  const commitMsg = readFileSync(commitMessageFile)?.toString();

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
      writeFileSync(commitMessageFile, `[#${ticket}] ${commitMsg}`);
      break;
    case "pivotal":
      if (commitType === "message")
        writeFileSync(commitMessageFile, `${commitMsg}\n [#${ticket}]`);
      else writeFileSync(commitMessageFile, `[#${ticket}]\n${commitMsg}`);
      break;
  }
};

main().finally(() => console.log("success"));
