const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

const titleValidator = body("title").trim().isLength({ min: 5 });
const contentValidator = body("content").trim().isLength({ min: 5 });

router.get("/posts", isAuth, feedController.getPosts);

router.post(
  "/post",
  isAuth,
  [titleValidator, contentValidator],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [titleValidator, contentValidator],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
