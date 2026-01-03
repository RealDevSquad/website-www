"use strict";

const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const {
    includeIgnoreFile,
} = require("@eslint/compat");

const path = require("node:path");
const babelParser = require("@babel/eslint-parser");
const ember = require("eslint-plugin-ember");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const gitignorePath = path.resolve(__dirname, ".gitignore");
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([includeIgnoreFile(gitignorePath), {
    languageOptions: {
        parser: babelParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            requireConfigFile: false,

            babelOptions: {
                plugins: [["@babel/plugin-proposal-decorators", {
                    decoratorsBeforeExport: true,
                }]],
            },
        },

        globals: {
            ...globals.browser,
        },
    },

    plugins: {
        ember,
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:ember/recommended",
        "plugin:prettier/recommended",
    ),

    rules: {
        "qunit/require-expect": [1, "except-simple"],
        "no-self-assign": ["warn"],
    },
}, {
    files: [
        "./.eslintrc.js",
        "./.prettierrc.js",
        "./.stylelintrc.js",
        "./.template-lintrc.js",
        "./ember-cli-build.js",
        "./testem.js",
        "./blueprints/*/index.js",
        "./config/**/*.js",
        "./lib/*/index.js",
        "./server/**/*.js",
    ],

    languageOptions: {
        sourceType: "script",
        parserOptions: {},

        globals: {
            ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
            ...globals.node,
        },
    },

    extends: compat.extends("plugin:n/recommended"),
}, {
    files: ["tests/**/*-test.{js,ts}"],
    extends: compat.extends("plugin:qunit/recommended"),
}, globalIgnores([
    "node_modules/",
    "blueprints/*/files/",
    "declarations/",
    "dist/",
    "coverage/",
    "!**/.*",
    "**/.*/",
    ".node_modules.ember-try/",
])]);
