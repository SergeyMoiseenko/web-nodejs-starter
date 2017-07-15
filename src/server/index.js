import path from "path";
import express from "express";
import expressSession from "express-session";
import morgan from "morgan";
import redis from "redis";
import connectRedis from "connect-redis";
import mongoose from "mongoose";
import bluebirdPromise from "bluebird";
import initServer from "./server";
import passport from "./authentication";
import cfg from "./config";

mongoose.Promise = bluebirdPromise;

// mogoose.connect("mongodb://username:password@host:port/database?options");
mongoose
  .connect("mongodb://localhost/appstarter", { useMongoClient: true })
  .then(() => {
    console.log("Connection to mongo created");
  });
const RedisStore = connectRedis(expressSession);
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Define logging configuraion for our server
app.use(morgan("dev"));

// Configuration for user sessions
app.use(
  expressSession({
    cookie: {
      maxAge: 260000
    },
    secret: "shhhhhhh its a secret",
    store: new RedisStore({
      host: cfg.redis.host,
      port: cfg.redis.port,
      client: redis.createClient(),
      ttl: 260
    }),
    saveUninitialized: false,
    resave: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

initServer(app);

app.listen(3000);
console.log("app listen");
