module.exports = {
  env: { node: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "simple-import-sort",
    "sort-keys-fix",
    "unused-imports",
  ],
  root: true,
  rules: {
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "sort-keys": [
      "error",
      "asc",
      {
        caseSensitive: true,
        minKeys: 2,
        natural: false,
      },
    ],
    "sort-keys-fix/sort-keys-fix": "warn",
    "unused-imports/no-unused-imports": "error",
  },
};
