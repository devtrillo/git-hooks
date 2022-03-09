const watch = require("esbuild");
const chalk = require("chalk");

const {
  logCompileResult,
  commonConfig,
  logCompileError,
} = require("./common");

watch
  .build({
    ...commonConfig,
    minify: false,
    sourcemap: "inline",
    watch: {
      onRebuild(error, result) {
        if (error) return console.log(chalk.red(error));
        if (!result) return;
        logCompileResult(result);
      },
    },
  })
  .then(logCompileResult)
  .catch(logCompileError);
