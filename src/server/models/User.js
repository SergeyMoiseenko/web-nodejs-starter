import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import Promise from "bluebird";

const hashPassword = Promise.promisify(bcrypt.hash);
const comparePasswords = Promise.promisify(bcrypt.compare);

// eslint-disable-next-line no-useless-escape
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      trim: true,
      default: ""
    },
    secondName: {
      type: String,
      trim: true,
      default: ""
    },
    passw: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      match: emailRegExp
    },

    created: {
      type: Date,
      default: Date.now
    }
  },
  { autoIndex: false }
);

UserSchema.pre("save", true, function(next, done) {
  if (!this.isModified("passw")) {
    done();
    return next();
  }

  const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
  hashPassword(this.passw, saltRounds)
    .then(securedPassw => {
      this.passw = securedPassw;
      done();
    })
    .catch(err => done(err));

  return next();
});

UserSchema.methods.comparePassw = function(plainPassw) {
  return comparePasswords(plainPassw, this.passw);
};

const User = mongoose.model("User", UserSchema);

export default User;
