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

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }).then(() => {
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

initServer(app);

app.listen(parseInt(process.env.PORT, 10));
console.log(`app listen on port ${parseInt(process.env.PORT, 10)}`);
