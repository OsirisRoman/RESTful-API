const { validationResult } = require("express-validator");

const Post = require("../models/post");

const getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({
        message: "Fetched posts successfully!",
        posts: posts,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Post creation failed, because of invalid entered data"
    );
    error.statusCode = 422;
    throw error;
  }
  //Create post in db
  const post = new Post({
    ...req.body,
    imageUrl: "images/pollo-asado.jpg",
    creator: {
      name: "Osiris",
    },
  });
  post
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Post Created Successfully!",
        post: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post was not found!");
        error.statusCode = 500;
        throw error;
      }
      res.status(200).json({ message: "Post Fetched!", post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports = {
  getPosts,
  createPost,
  getPost,
};
