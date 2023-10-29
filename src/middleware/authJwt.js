const jwt = require("jsonwebtoken");
const { securityCode, SUPERADMIN, SUBADMIN, USER } = require("../config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-auth-token"];
  // console.log('token', token);

  if (!token) {
    return res.status(403).send({ message: "No token provided!", status: "errors" });
  }


  jwt.verify(token, securityCode, (err, decoded) => {
    if (err) {
      return res.status(200).send({ message: "Unauthorized!", status: "errors" });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User
  .findById(req.userId)
  .populate('role', "name")
  .exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    if(!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }

    if(user.role?.name == SUPERADMIN || user.role?.name == SUBADMIN) {
      next();
    }else {
      res.status(403).send({ message: "Invalid Role" });
    }
  });
};

const isUser = (req, res, next) => {
  User
  .findById(req.userId)
  .populate("role", "name")
  .exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    if(!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }

    if(user.role?.name) {
      next();
    }else {
      res.status(403).send({ message: "Invalid Role" });
    }

  });
};


const authJwt = {
  verifyToken,
  isAdmin,
  isUser
};
module.exports = authJwt;
