const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.resolve(srcDir, "popup.ts"),
    provider_service: path.resolve(srcDir, "provider-service.ts"),
    real_debrid_types: path.resolve(srcDir, "types", "real-debrid-types.ts"),
    real_debrid_service: path.resolve(srcDir, "real-debrid-service.ts"),
    background: path.resolve(srcDir, "background.ts"),
    content: path.resolve(srcDir, "content.ts"),
  },
  output: {
    path: path.join(__dirname, "..", "dist", "js"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: "../", context: "public" },
        { from: ".", to: "../icons", context: "icons"}
      ],
      options: {},
    }),
  ],
};
