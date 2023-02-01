const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  watch: false,
  entry: path.join(__dirname, "src", "index"),
  output: {
    filename: "main.js",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /.(tsx|ts)$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "./tsconfig.json"),
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new CopyPlugin({ patterns: [{ from: "src/assets", to: "assets" }] }),
  ],
  // 使用无扩展名引入时,先匹配ts, 在匹配js
  resolve: { extensions: [".ts", ".js"] },
};
