module.exports = {
    ignorePatterns: ["*.js"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        createDefaultProgram: true,
    },
    // extends: [
    //     // "plugin:@angular-eslint/recommended",
    //     "plugin:import/errors",
    //     "plugin:import/warnings",
    //     "plugin:import/typescript",
    // ],
    // rules: {
    //     "@angular-eslint/directive-selector": [
    //         "error",
    //         { type: "attribute", prefix: "app", style: "camelCase" },
    //     ],
    //     "@angular-eslint/component-selector": [
    //         "error",
    //         { type: "element", prefix: "app", style: "kebab-case" },
    //     ],
    //     // "import/order": [
    //     //     "error",
    //     //     {
    //     //         pathGroups: [
    //     //             {
    //     //                 pattern: "@angular/**",
    //     //                 group: "external",
    //     //             },
    //     //             {
    //     //                 group: "builtin",
    //     //                 pattern: "~/**",
    //     //             },
    //     //             {
    //     //                 group: "external",
    //     //                 pattern: "~/**",
    //     //             },
    //     //         ],
    //     //         "newlines-between": "always",
    //     //         alphabetize: {
    //     //             order: "asc",
    //     //             caseInsensitive: true,
    //     //         },
    //     //     },
    //     // ],
    // },
    // overrides: [
    //     // Добавьте эти настройки, если вы задаёте шаблоны внутри файлов *.component.ts
    //     {
    //         files: ["*.component.ts"],
    //         parser: "@typescript-eslint/parser",
    //         parserOptions: {
    //             ecmaVersion: 2020,
    //             sourceType: "module",
    //         },
    //         plugins: ["@angular-eslint/template"],
    //         processor: "@angular-eslint/template/extract-inline-html",
    //     },
    // ],
};
