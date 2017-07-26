import mongoose from "mongoose";
import bluebirdPromise from "bluebird";
import User from "./User";

mongoose.Promise = bluebirdPromise;

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }).then(() => {
  console.log("Connection to mongo created");
});

export { User };
export default mongoose;
