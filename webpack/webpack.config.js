const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.resolve(srcDir, "popup.tsx"),
    provider_service: path.resolve(srcDir, "providers", "provider-service.ts"),
    real_debrid_types: path.resolve(
      srcDir,
      "providers",
      "real-debrid",
      "real-debrid-provider.ts",
    ),
    real_debrid_service: path.resolve(
      srcDir,
      "providers",
      "real-debrid",
      "real-debrid-provider.ts",
    ),
    background: path.resolve(srcDir, "background.ts"),
    content: path.resolve(srcDir, "content.ts"),
  },
  output: {
    path: path.join(__dirname, "..", "dist", "js"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: "../", context: "public" },
        { from: ".", to: "../icons", context: "icons" },
      ],
      options: {},
    }),
  ],
  devtool: "source-map",
};
