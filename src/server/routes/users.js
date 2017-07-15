import { Router } from "express";

const usersApi = Router();

usersApi.get("/users/new", (req, res) => {
  res.send("GET method path: /users/new");
});

usersApi.post("/users/new", (req, res) => {
  res.send("POST method path: /users/new");
});

export default usersApi;
