import path from "path";
import webpack from "webpack";
import serverExternalDeps from "webpack-node-externals";
import CleanPlugin from "clean-webpack-plugin";
import eslintFormatter from "eslint-friendly-formatter";
import Dotenv from "dotenv-webpack";
import { getIfUtils, removeEmpty } from "webpack-config-utils"
import postcssImport from "postcss-import";
import postcssCssNext from "postcss-cssnext";
import postcssReporter from "postcss-reporter";

export default env => {
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
    include: [path.resolve(__dirname, "../src")],
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
      server: path.resolve( __dirname, "../src/server/index.js" )
    },

    output: {
      path: ifProd( path.resolve(__dirname, "../dist"), path.resolve(__dirname, "../build") ),
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
      ifProd(
        new CleanPlugin(["server.js"], {
          root: path.resolve(__dirname, "../dist")
        }),
        new CleanPlugin(["server.dev.js"], {
          root: path.resolve(__dirname, "../build")
        })
      )
    ])
  }
};
