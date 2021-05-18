const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authController = require("../controllers/auth");

//Describe allow us to maintain order in our test cases letting us group our
//unitary tests under a common description. In this case "Auth middleware".
describe("auth Controller - Login", () => {
  const fakeUser = {
    email: "testing@Email.com",
    password: "testingPassword",
    name: "testingName",
    _id: "5c0f66b979af55031b34728a",
  };
  //Simulating a request object.
  const req = {
    body: {
      email: fakeUser.email,
      password: fakeUser.password,
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
  it("should throw an error with code 500 if accessing the database fails", done => {
    //Mocking/Stubbing the User.findOne function
    sinon.stub(User, "findOne");
    //Our mock will throw an error after executing.
    User.findOne.throws();

    //Given that the login function returns a Promise because of
    //its async declaration, the error throwed by the mocked/stubbed
    //findOne function must be waited by the chai test. This behaviour
    //can be achieved sending a parameter done to the unit-test
    //this parameter will act as a callback function that will tell
    //chai to continue with the rest of the tests. If this parameter
    //is not sent and invoked after resolving a promise, the test will
    //lead to false positives.
    authController
      .login(req, {}, () => {})
      .then(result => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 500);
        done();
      });

    //restore the findOne function to its original setup.
    User.findOne.restore();
  });

  it("should send a response with a valid User status for an existing user", done => {
    //Mocking/Stubbing the bcrypt.compare function
    sinon.stub(bcrypt, "compare");
    //Our mock will return true simulating password comparison is ok.
    bcrypt.compare.resolves(true);

    //Simulating a response object.
    let res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(authData) {
        this.token = authData.token;
        this.userId = authData.userId;
        return this;
      },
    };

    authController
      .login(req, res, () => {})
      .then(() => {
        expect(res).to.have.property("statusCode", 200);
        expect(res).to.have.property("userId", fakeUser._id);
        expect(res).to.have.property("token");

        //restore the findOne function to its original setup.
        bcrypt.compare.restore();
        done();
      });
  });
});
