const esbuild = require("esbuild");

const {
  logCompileResult,
  commonConfig,
  logCompileError,
} = require("./common");

esbuild
  .build({
    ...commonConfig,
    minify: true,
    treeShaking: true,
  })
  .then(logCompileResult)
  .catch(logCompileError);
