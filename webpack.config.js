const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (_env, argv) => {
  const isDevelopment = argv.mode !== "production";
  const certPath = path.resolve(__dirname, "certs/localhost.crt");
  const keyPath = path.resolve(__dirname, "certs/localhost.key");

  if (isDevelopment && (!fs.existsSync(certPath) || !fs.existsSync(keyPath))) {
    throw new Error("Certificado local não encontrado. Execute: npm run certs");
  }

  return {
    entry: {
      taskpane: "./src/taskpane/taskpane.ts"
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true
    },
    devtool: isDevelopment ? "source-map" : false,
    resolve: {
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "ts-loader"
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["taskpane"]
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: "assets", to: "assets" }]
      })
    ],
    devServer: {
      port: 3000,
      hot: true,
      headers: { "Access-Control-Allow-Origin": "*" },
      server: isDevelopment
        ? {
            type: "https",
            options: {
              cert: fs.readFileSync(certPath),
              key: fs.readFileSync(keyPath)
            }
          }
        : "https",
      proxy: [
        {
          context: ["/api"],
          target: "http://localhost:3001",
          secure: false,
          changeOrigin: true
        }
      ]
    }
  };
};
