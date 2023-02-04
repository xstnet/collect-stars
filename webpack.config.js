const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  // mode: 'production',
  // watch: true, // 监听文件改动并自动打包
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
    new CopyPlugin({ patterns: [{ from: "src/assets", to: "assets", force: true }] }),
  ],
  // 使用无扩展名引入时,先匹配ts, 在匹配js
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devServer: {
    compress: true,
    hot: true,
    port: 3000,
    open: true,
  },
};
