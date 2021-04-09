const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: "First Post", content: "This is the first post!" }],
  });
};

const createPost = (req, res, next) => {
  //Create post in db
  res.status(201).json({
    message: "Post Created Successfully!",
    post: {
      id: new Date().toISOString(),
      ...req.body,
    },
  });
};

module.exports = {
  getPosts,
  createPost,
};
