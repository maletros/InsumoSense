// .eslintrc.js
module.exports = {
  env: {
    es2021: true,
    node: true,
    "react-native/react-native": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "react-native"],
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-raw-text": ["warn", { skip: ["TextInput"] }],
    "import/no-cycle": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
