import passport from "passport";
import { Strategy } from "passport-local";
import UserService from "../services/UserService";

function serializeUser(user, done) {
  done(null, user.id);
}

function deserializeUser(serializedId, done) {
  UserService.findById(serializedId)
    .then(user => done(null, user))
    .catch(err => done(err));
}

function authenticateUser(username, password, done) {
  UserService.authentication(username, password)
    .then(isAuthenticated => done(null, isAuthenticated))
    .catch(err => done(err));
}

passport.use(new Strategy(authenticateUser));
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

export default passport;
