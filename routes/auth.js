const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

const authController = require("../controllers/auth");

const router = express.Router();

const emailValidator = body("email")
  .isEmail()
  .withMessage("Please enter a valid email")
  .custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
      if (userDoc) {
        return Promise.reject("Email address is already in use!");
      }
    });
  })
  .normalizeEmail();

const passwordValidator = body("password").trim().isLength({ min: 5 });

const nameValidator = body("name").trim().not().isEmpty();

const userStatusValidator = body("status").trim().not().isEmpty();

router.put(
  "/signup",
  [emailValidator, passwordValidator, nameValidator],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  userStatusValidator,
  authController.updateUserStatus
);

module.exports = router;
