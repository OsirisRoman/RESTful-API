const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

const titleValidator = body("title").trim().isLength({ min: 5 });
const contentValidator = body("content").trim().isLength({ min: 5 });

router.get("/posts", feedController.getPosts);

router.post(
  "/post",
  [titleValidator, contentValidator],
  feedController.createPost
);

router.get("/post/:postId", feedController.getPost);

router.put(
  "/post/:postId",
  [titleValidator, contentValidator],
  feedController.updatePost
);

router.delete("/post/:postId", feedController.deletePost);

module.exports = router;
