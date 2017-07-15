import bodyParser from "body-parser";
import usersApi from "./routes/users";

export default app => {
  // FIXME: Middlewares must be used in correct places
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
};
