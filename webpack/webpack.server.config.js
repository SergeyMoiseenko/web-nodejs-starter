const path = require("path");
const webpack = require("webpack");
const serverExternalDeps = require("webpack-node-externals");
const CleanPlugin = require("clean-webpack-plugin");
const eslintFormatter = require("eslint-friendly-formatter");
const Dotenv = require("dotenv-webpack");

// FIXME: Must be defined in accordance with NODE_ENV
const sourceMapBanner = {
  raw: true,
  banner: 'require("source-map-support").install();',
  entryOnly: false
};

const babelOptions = {
  presets: [
    [
      "env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ],
  plugins: ["transform-react-jsx"]
};

module.exports = {
  target: "node",
  entry: {
    server: path.resolve(__dirname, "../src/server/index.js")
  },
  output: {
    path: path.resolve(__dirname, "../dist/server"),
    filename: "server.bundle.js"
  },
  externals: [serverExternalDeps()],

  // FIXME: Must be defined in accordance with NODE_ENV
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "../src/server")],
        use: [
          {
            loader: "babel-loader",
            options: babelOptions
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        include: [path.resolve(__dirname, "../src")],
        loader: "eslint-loader",
        options: {
          fix: true,
          formatter: eslintFormatter,
          failOnError: false
        }
      }
    ]
  },
  context: __dirname,
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, "../.env"),
      safe: path.resolve(__dirname, "../.env.example")
    }),
    new webpack.BannerPlugin(sourceMapBanner),
    new CleanPlugin(["server"], {
      root: path.resolve(__dirname, "../dist")
    })
  ]
};
