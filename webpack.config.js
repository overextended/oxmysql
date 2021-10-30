const path = require("path");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
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
      patterns: ["./lua", "./lua", "README.md", "LICENSE.md"],
    }),
  ],
  output: {
    filename: "oxmysql.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    minimize: false,
  },
  target: "node",
};
