const { validationResult } = require("express-validator");

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
  res.status(201).json({
    message: "Post Created Successfully!",
    post: {
      _id: new Date().toISOString(),
      ...req.body,
      creator: {
        name: "Osiris",
      },
      createdAt: new Date(),
    },
  });
};

module.exports = {
  getPosts,
  createPost,
};
