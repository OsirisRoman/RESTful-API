const { validationResult } = require("express-validator");

const Post = require("../models/post");

const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/pollo-asado.jpg",
        creator: {
          name: "Osiris",
        },
        createdAt: new Date(),
      },
    ],
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
    imageUrl: "images/pollo-asado",
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

module.exports = {
  getPosts,
  createPost,
};
