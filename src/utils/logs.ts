import chalk from "chalk";
type Message = string[] | string;

export const logGreen = (message: Message) =>
  console.log(chalk.green(...message));

export const logRed = (message: Message) => console.log(chalk.red(...message));

export const logBlue = (message: Message) =>
  console.log(chalk.blue(...message));
