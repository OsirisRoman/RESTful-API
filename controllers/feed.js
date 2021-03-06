const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

const fileHelper = require("../utils/deleteFile");

const getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Fetched posts successfully!",
      posts: posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const createPost = async (req, res, next) => {
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
    creator: req.userId,
  });
  try {
    await post.save();

    let creator = await User.findById(req.userId);
    creator.posts.push(post);
    const savedUser = await creator.save();
    res.status(201).json({
      message: "Post Created Successfully!",
      post,
      creator: { _id: creator._id, name: creator.name },
    });
    return savedUser;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

const getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post was not found!");
      error.statusCode = 500;
      throw error;
    }
    res.status(200).json({ message: "Post Fetched!", post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const updatePost = async (req, res, next) => {
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
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("You are not authorized to edit this post");
      error.statusCode = 403;
      throw error;
    }
    if (updatedPost.imageUrl !== post.imageUrl) {
      fileHelper.deleteFile(post.imageUrl);
    }
    post.title = updatedPost.title;
    post.imageUrl = updatedPost.imageUrl;
    post.content = updatedPost.content;
    const result = await post.save();
    res.status(201).json({
      message: "Post Updated Successfully!",
      post: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("You are not authorized to delete this post");
      error.statusCode = 403;
      throw error;
    }
    //Check logged in user
    fileHelper.deleteFile(post.imageUrl);
    const result = await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: "Post Deleted!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
