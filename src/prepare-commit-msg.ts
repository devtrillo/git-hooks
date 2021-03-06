#! /usr/bin/env node

import { exec as execCB } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import autocompletePrompt from "inquirer-autocomplete-prompt";
import { head, prop } from "ramda";
import { promisify } from "util";

import { logGreen } from "./utils/logs";

inquirer.registerPrompt("autocomplete", autocompletePrompt);

const exec = promisify(execCB);

const commitType = process.argv[3] ?? "No type";
const commitMessageFile = process.argv[2] ?? "No file";

const pivotalTicketRegex = /\d{9}/g;
const jiraTicketRegex = /[a-zA-z]+-\d{1,4}/g;

const extractInfoFromBranch = (currentBranch: string) => {
  const possibleRegex = [
    { pattern: pivotalTicketRegex, type: "pivotal" },
    { pattern: jiraTicketRegex, type: "jira" },
  ];

  return possibleRegex
    .map(({ type, pattern }) => {
      const matches = currentBranch.match(pattern);
      return !!matches
        ? {
            isValid: true,
            ticket: head(matches),
            type,
          }
        : { isValid: false };
    })
    .filter(prop("isValid"));
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
  } = extractInfoFromBranch(currentBranch)?.[0] ?? {};
  if (!isValid) return;

  if (commitMsg.includes(`[#${ticket}]`) || commitMsg.includes(`[${ticket}]`))
    return logGreen("There is a ticket number in the commit");

  switch (type) {
    case "jira":
      writeFileSync(commitMessageFile, `[${ticket}] ${commitMsg}`);
      break;
    case "pivotal":
      if (commitType === "message")
        writeFileSync(commitMessageFile, `${commitMsg}\n [#${ticket}]`);
      break;
  }
};

main().finally(() => logGreen("Added the commit message successfully"));
