const presets = [
  [
    "@babel/preset-env",
    {
      useBuiltIns: "usage",
      corejs: { version: 3, proposals: true }
    }
  ],
  "@babel/preset-react",
  "@babel/preset-typescript"
];

const plugins = [];

module.exports = { presets, plugins };
