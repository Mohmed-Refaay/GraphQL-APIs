const User = require("../models/user");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator/check");

exports.signup = (req, res, next) => {
  const results = validationResult(req);
  console.log(results.array());
  if (!results.isEmpty()) {
    const err = new Error("Validation failed!");
    err.statusCode = 422;
    throw err;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 15)
    .then((hashedPassword) => {
      const user = new User({ email, name, password: hashedPassword });
      return user.save();
    })
    .then((results) => {
      res
        .status(200)
        .json({ message: "User is created!", userId: results._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const er = new Error("Email is not found!");
        er.statusCode = 404;
        throw er;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isMatch) => {
      if (!isMatch) {
        const er = new Error("Wrong Password is entered!!!");
        er.statusCode = 401;
        throw er;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          name: loadedUser.name,
        },
        "secretisalwaysasecret",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
