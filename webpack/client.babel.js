const path                        = require("path");
const webpack                     = require("webpack");
const serverExternalDeps          = require("webpack-node-externals");
const CleanPlugin                 = require("clean-webpack-plugin");
const eslintFormatter             = require("eslint-friendly-formatter");
const ExtractTextPlugin           = require("extract-text-webpack-plugin");
const { getIfUtils, removeEmpty } = require("webpack-config-utils");
const postcssImport               = require("postcss-import");
const postcssCssNext              = require("postcss-cssnext");
const postcssReporter             = require("postcss-reporter");

module.exports = (env) => {
  const { ifProd, ifNotProd, ifDev } = getIfUtils(env);

  const babelOptions = {
    presets: [
      [
        "env",
        {
          targets: {
            browsers: ['> 5%', 'last 2 versions']
          },
          modules: false
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
    include: [path.resolve(process.cwd(), "src/client")],
    loader: "eslint-loader",
    options: {
      fix: true,
      formatter: eslintFormatter,
      failOnError: false
    }
  };

  const jsModules = {
    test: /\.js$|\.jsx$/,
    include: [path.resolve(process.cwd(), "src")],
    use: [
      {
        loader: "babel-loader",
        options: babelOptions
      }
    ]
  };

  const cssLoaders = removeEmpty([
    ifDev({ loader: "style-loader" }),
    {
      loader: "css-loader",
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
          postcssImport({ path: path.resolve(process.cwd(), 'src/client') }),
          postcssCssNext({ browsers: ['> 1%', 'last 2 versions'] }),
          postcssReporter({ clearMessages: true })
        ]
      }
    }
  ]);

  const cssModules = {
    test: /\.css$/,
    include: path.resolve(process.cwd(), "src/client"),
    use: ifProd(
      ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: cssLoaders
      }),
      cssLoaders)
  };

  const output = {
    path: path.resolve(process.cwd(), "build/public/assets"),
    filename: ifProd("[chunkhash].js", "[name].js"),
    publicPath: "/assets/"
  };

  if (env.prod) {
    output.chunkFilename = "[name].[chunkhash:6].js";
  }

  return {
    entry: {
      client: removeEmpty([
        ifDev("react-hot-loader/patch"),
        ifDev("webpack-dev-server/client?http://localhost:3001"),
        ifDev("webpack/hot/only-dev-server"),
        "./client/index.js"
      ])
    },

    output: output,

    devtool: ifProd("cheap-module-source-map", "eval"),
    devServer: {
      host: 'localhost',
      port: 3001,
      historyApiFallback: true,
      hot: true
    },
    module: {
      rules: [
        jsModules,
        jsLinter,
        cssModules,
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
          loader: 'url-loader',
          options: { name: '[hash].[ext]', limit: 8192 },
          include: path.resolve(process.cwd(), 'src/client')
        }
      ]
    },

    context: path.resolve(process.cwd(), "src"),

    plugins: removeEmpty([
      ifProd(new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      })),
      ifDev(new webpack.HotModuleReplacementPlugin()),
      ifDev(new webpack.NamedModulesPlugin()),
      ifProd(new webpack.optimize.UglifyJsPlugin()),
      ifProd(new ExtractTextPlugin({
        filename: '[contenthash].css',
        allChunks: true
      })),
      new CleanPlugin(["public/assets"], {
        root: path.resolve(process.cwd(), "build")
      })
    ])
  }
};
