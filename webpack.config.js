const path = require("path");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

const filesToCopy = ["fxmanifest.lua", "wrapper.lua", "README.md", "LICENSE.md"];

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new DefinePlugin({ "global.GENTLY": false }),
    new IgnorePlugin({
      resourceRegExp: /^cardinal$/,
      contextRegExp: /./,
    }),
    new CopyPlugin({
      patterns: filesToCopy,
    }),
  ],
  output: {
    filename: "oxmysql.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
};
