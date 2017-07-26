import path from "path";
import express from "express";
import bodyParser from "body-parser";
import usersApi from "./routes/users";

export default app => {
  // FIXME: Middlewares must be used in correct places
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    res.set("Content-Type", "text/html");
    res.send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>Web NodeJS Starter</title>
        </head>
        <body>
          <noscript>
            You need to enable JavaScript to run this app.
          </noscript>
          <div id="root"></div>
          <script src="assets/client.js"></script>
        </body>
      </html>
    `);
  });
};
