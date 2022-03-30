const chalk = require("chalk");

const { nodeExternalsPlugin } = require("esbuild-node-externals");

const logCompileResult = (result = {}) => {
  const { errors, warnings } = result;
  if (errors.length !== 0) {
    console.log(chalk.red("I found some errors:"));
    console.log(chalk.red(JSON.stringify(errors, null, 2)));
  }
  if (warnings.length !== 0) {
    console.log(chalk.yellow("I found some warnings:"));
    console.log(chalk.yellow(JSON.stringify(warnings, null, 2)));
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green("No errors or warnings found"));
    console.log(chalk.green("＼（＾ ＾）／"));
  }
};

const logCompileError = () => {
  console.log(chalk.red("I wasn't able to compile the code"));
  console.log(chalk.redBright("ლ(ಠ益ಠლ)"));
  console.log(chalk.red("Please fix me"));
  return process.exit(1);
};

const commonConfig = {
  bundle: true,
  color: true,
  entryPoints: [
    "./src/post-checkout.ts",
    "./src/post-merge.ts",
    "./src/pre-push.ts",
    "./src/post-commit.ts",
    "./src/prepare-commit-msg.ts",
  ],
  outdir: "dist",
  platform: "node",
  plugins: [nodeExternalsPlugin()],
};

module.exports = {
  logCompileResult,
  commonConfig,
  logCompileError,
};
