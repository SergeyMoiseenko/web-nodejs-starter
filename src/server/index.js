import express from "express";
import expressSession from "express-session";
import morgan from "morgan";
import redis from "redis";
import connectRedis from "connect-redis";

import setupController from "./server";
import passport from "./authentication";

const RedisStore = connectRedis(expressSession);
const app = express();

// Define logging configuraion for our server
app.use(morgan("dev"));

// Configuration for user sessions
app.use(
  expressSession({
    cookie: {
      maxAge: 260000
    },
    secret: process.env.SESSION_SECRET,
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      client: redis.createClient(),
      ttl: 260
    }),
    saveUninitialized: false,
    resave: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* eslint-disable */
if (process.env.NODE_ENV === "development") {
  const proxyForClientAssets = require("http-proxy-middleware");
  app.use("/assets", proxyForClientAssets({ target: "http://localhost:3001"}));
}
/* eslint-enable */

setupController(app);

app.listen(parseInt(process.env.PORT, 10));
console.log(`app listen on port ${parseInt(process.env.PORT, 10)}`);
