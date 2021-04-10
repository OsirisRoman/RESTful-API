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
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect",
      errors: errors.array(),
    });
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
      console.log(err);
    });
};

module.exports = {
  getPosts,
  createPost,
};
