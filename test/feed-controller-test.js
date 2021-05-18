const expect = require("chai").expect;
const mongoose = require("mongoose");

const User = require("../models/user");
const Post = require("../models/post");
const feedController = require("../controllers/feed");

//Describe allow us to maintain order in our test cases letting us group our
//unitary tests under a common description. In this case "Auth middleware".
describe("feed Controller - createPost", () => {
  const fakeUser = {
    email: "testing@Email.com",
    password: "testingPassword",
    name: "testingName",
    _id: "5c0f66b979af55031b34728a",
  };
  //Simulating a request object.
  const req = {
    errors: {
      errors: [],
    },
    file: {
      path: "fakeFilePath",
    },
    userId: fakeUser._id,
    body: {
      title: "fakeTitle",
      content: "fakeContent",
    },
  };

  before(done => {
    mongoose
      .connect("mongodb://localhost:27017/messages", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => done())
      .catch(err => console.log(err));
  });

  beforeEach(done => {
    const testingUser = new User({ ...fakeUser });
    testingUser
      .save()
      .then(() => done())
      .catch(err => console.log(err));
  });
  afterEach(done => {
    User.findOneAndDelete({ _id: fakeUser._id })
      .then(() => done())
      .catch(err => console.log(err));
  });

  after(done => {
    mongoose
      .disconnect()
      .then(() => done())
      .catch(err => console.log(err));
  });

  it("should add a created post to the post of the fake user", done => {
    //Simulating a response object.
    let res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(authData) {
        this.message = authData.message;
        this.post = authData.post;
        this.creator = authData.creator;
        return this;
      },
    };

    feedController
      .createPost(req, res, () => {})
      .then(savedUser => {
        expect(res).to.have.property("statusCode", 201);
        expect(res).to.have.property("message", "Post Created Successfully!");
        expect(res).to.have.property("post");
        expect(res).to.have.property("creator");

        expect(savedUser).to.have.property("posts");
        expect(savedUser.posts).to.have.length(1);

        Post.findOneAndDelete({ _id: res.post._id.toString() })
          .then(() => done())
          .catch(err => console.log(err));
      });
  });
});
