module.exports = {
  root: true,
  extends: ["airbnb", "airbnb-typescript", "airbnb/hooks", "plugin:prettier/recommended"],
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  rules: {
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "react/function-component-definition": "off",
    "react/button-has-type": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "jsx-a11y/heading-has-content": "off",
    "jsx-a11y/label-has-associated-control": "off",
  },
};
