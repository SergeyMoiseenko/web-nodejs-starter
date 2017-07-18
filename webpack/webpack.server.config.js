const path = require("path");
const webpack = require("webpack"); // eslint-disable-line
const serverExternalDeps = require("webpack-node-externals");
const CleanPlugin = require("clean-webpack-plugin"); // eslint-disable-line

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
  ]
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
      }
    ]
  },
  context: __dirname,
  plugins: [
    new webpack.BannerPlugin(sourceMapBanner),
    new CleanPlugin(["server"], {
      root: path.resolve(__dirname, "../dist")
    })
  ]
};
