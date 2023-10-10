const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

const checkDuplicateusernameOrEmail = (req, res, next) => {
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    if (user) {
      res.status(200).send({ message: "Failed! username is already in use!", status: "errors" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(200).send({ message: err, status: "errors" });
        return;
      }

      if (user) {
        res.status(200).send({ message: "Failed! Email is already in use!", status: "errors" });
        return;
      }

      next();
    });
  });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(200).send({message: `Failed! Role ${req.body.roles[i]} does not exist!`, status: "errors"});
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateusernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
