const { validationResult } = require("express-validator");

const Post = require("../models/post");

const fileHelper = require("../utils/deleteFile");

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
  if (!req.file) {
    const error = new Error("Attached file is not a valid image.");
    error.statusCode = 422;
    throw error;
  }
  //Create post in db
  const post = new Post({
    ...req.body,
    //The path must replace "\" by "/" because
    //of windows OS was the development environment
    imageUrl: req.file.path.replace("\\", "/"),
    creator: {
      name: "Osiris",
    },
  });
  post
    .save()
    .then(result => {
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

const updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Post creation failed, because of invalid entered data"
    );
    error.statusCode = 422;
    throw error;
  }
  req.body.imageUrl = req.body.image;
  delete req.body.image;
  const updatedPost = req.body;
  const image = req.file;
  if (image) {
    updatedPost.imageUrl = image.path.replace("\\", "/");
  }
  if (!updatedPost.imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  //Create post in db
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (updatedPost.imageUrl !== post.imageUrl) {
        fileHelper.deleteFile(post.imageUrl);
      }
      post.title = updatedPost.title;
      post.imageUrl = updatedPost.imageUrl;
      post.content = updatedPost.content;
      return post.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Post Updated Successfully!",
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

const deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      //Check logged in user
      fileHelper.deleteFile(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      console.log(result);
      res.status(200).json({ message: "Post Deleted!" });
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
  updatePost,
  deletePost,
};
