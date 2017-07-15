import { User } from "../models";

function findById(id) {
  return User.find({ _id: id }).limit(1).exec().get(0);
}

function findByUsername(username) {
  return User.find({ username }).limit(1).exec().get(0);
}

function authentication(username, passw) {
  return findByUsername(username).then(user => user.comparePassw(passw));
}

function findOne(user) {
  return User.find(user).limit(1).exec().then(users => users[0]);
}

function createUser(user) {
  return User.create(user);
}

export default {
  findById,
  findByUsername,
  authentication,
  createUser,
  findOne
};
