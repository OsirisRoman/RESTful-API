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
