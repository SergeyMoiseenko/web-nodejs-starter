const path                        = require("path");
const webpack                     = require("webpack");
const serverExternalDeps          = require("webpack-node-externals");
const CleanPlugin                 = require("clean-webpack-plugin");
const eslintFormatter             = require("eslint-friendly-formatter");
const Dotenv                      = require("dotenv-webpack");
const { getIfUtils, removeEmpty } = require("webpack-config-utils");
const postcssImport               = require("postcss-import");
const postcssCssNext              = require("postcss-cssnext");
const postcssReporter             = require("postcss-reporter");


module.exports = (env) => {
  const { ifProd, ifNotProd, ifDev } = getIfUtils(env);

  // It can be optional, because it hits on performance in production
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
    plugins: removeEmpty([
      "react-hot-loader/babel",
      "transform-react-jsx",
      ifProd("transform-react-constant-elements"),
      ifProd("transform-react-inline-elements"),
      ifProd("transform-react-remove-prop-types"),
      ifDev("transform-react-jsx-self")
    ])
  };

  const jsLinter = {
    enforce: "pre",
    test: /\.js$|\.jsx$/,
    include: [path.resolve(process.cwd(), "src/server")],
    loader: "eslint-loader",
    options: {
      fix: true,
      formatter: eslintFormatter,
      failOnError: false
    }
  };

  const jsLoaders = {
    test: /\.js$|\.jsx$/,
    include: [path.resolve(__dirname, "../src")],
    use: [
      {
        loader: "babel-loader",
        options: babelOptions
      }
    ]
  };

  const cssLoaders = {
    test: /\.css$/,
    include: path.resolve(__dirname, "../src/client"),
    use: [
      {
        loader: "css-loader/locals",
        options: {
          localIdentName: "[name]--[local]--[hash:base64:5]",
          sourceMap: true,
          modules: true,
          importLoaders: 1
        }
      },
      {
        loader: "postcss-loader",
        options: {
          ident: "postcss",
          plugins: [
            postcssImport({ path: path.resolve(__dirname, '../src/client') }),
            postcssCssNext({ browsers: ['> 1%', 'last 2 versions'] }),
            postcssReporter({ clearMessages: true })
          ]
        }
      }
    ]
  };

  return {
    target: "node",

    entry: {
      server: path.resolve( process.cwd(), "src/server/index.js" )
    },

    output: {
      path:  path.resolve(process.cwd(), "build"),
      filename: ifProd("server.js", "server.dev.js"),
      publicPath: "/assets"
    },

    externals: [serverExternalDeps()],

    devtool: "source-map",
    
    module: {
      rules: [
        jsLoaders,
        jsLinter,
        cssLoaders,
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
          loader: 'url-loader',
          options: { name: '[hash].[ext]', limit: 8192 },
          include: path.resolve(__dirname, '../src/client')
        }
      ]
    },

    context: __dirname,

    plugins: removeEmpty([
      ifProd( new webpack.optimize.UglifyJsPlugin({ warnings: false }) ),
      new Dotenv({
        path: path.resolve(__dirname, "../.env"),
        safe: path.resolve(__dirname, "../.env.example")
      }),
      new webpack.BannerPlugin(sourceMapBanner),
        new CleanPlugin(["server.dev.js"], {
          root: path.resolve(process.cwd(), "build")
        }
      )
    ])
  }
};
