const path = require("path");
const { spawn } = require("child_process");
const gulp = require("gulp");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const gutil = require("gulp-util");
const nodemon = require("nodemon");
const serverConfig = require("./webpack/server.babel");
const clientConfig = require("./webpack/client.babel");

function onDone(done, pluginName) {
  return function(err, stats) {
    if (err) {
      throw new gutil.PluginError(pluginName, err);
    } else {
      gutil.log(`[${pluginName}]`, stats.toString());
    }

    if (done) done();
  };
}

gulp.task("server:build:dev", done => {
  webpack(serverConfig({ dev: true })).run(onDone(done, "server:build:dev"));
});

gulp.task("server:build:prod", done => {
  webpack(serverConfig({ prod: true })).run(onDone(done, "server:build:prod"));
});

gulp.task("server:watch", done => {
  let firstCompileCompleted = false;
  webpack(serverConfig({ dev: true })).watch(100, (err, stats) => {
    if (!firstCompileCompleted) {
      firstCompileCompleted = true;
      onDone(done, "server:watch")(err, stats);
    } else {
      onDone(undefined, "server:watch")(err, stats);
    }

    nodemon.restart();
  });
});

gulp.task("client:build:dev", done => {
  webpack(clientConfig({ dev: true })).run(onDone(done, "client:build:dev"));
});

gulp.task("client:build:prod", done => {
  webpack(clientConfig({ prod: true })).run(onDone(done, "client:build:prod"));
});

gulp.task("client:watch", () => {
  webpack(clientConfig({ dev: true })).watch(
    100,
    onDone(undefined, "client:watch")
  );
});

gulp.task("build", ["client:build:dev", "server:build:dev"]);
gulp.task("build:prod", ["client:build:prod", "server:build:prod"]);

gulp.task("dev", ["client:dev-server", "server:watch"], () => {
  nodemon({
    execMap: {
      js: "node"
    },
    script: path.resolve(process.cwd(), "build/server.dev.js"),
    ignore: ["*"],
    watch: ["non-existing-folder/"],
    ext: "nonExistingExt"
  }).on("restart", () => {
    gutil.log("Server restarted!");
  });
});

gulp.task("client:dev-server", () => {
  spawn(
    "webpack-dev-server",
    ["--config", "webpack/client.babel.js", "--env.dev"],
    {
      cwd: process.cwd(),
      stdio: "inherit"
    }
  ).on("exit", code => {
    if (code === 0) {
      gutil.log("[client:dev-server] end successful");
    } else {
      gutil.log(
        `[client:dev-server] command 'webpack-dev-server --config webpack/client.babel.js --env.dev'  end with code ${code}`
      );
    }
  });
});
