const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const isAuth = require("../middleware/is-auth");

//Describe allow us to maintain order in our test cases letting us group our
//unitary tests under a common description. In this case "Auth middleware".
describe("is-auth middleware", () => {
  it("should throw an error if no Authorization header is present", () => {
    //Simulating a request object that do not has an authorization header.
    const req = {
      get: headerName => {
        return null;
      },
    };
    //Given that we are trying to test that our authorization function
    //throw the approriate error, we must let that mocha and chai handle
    //the returned error. With the use of bind and this we are letting
    //that mocha and chai handle the throwed error to then assert that
    //this error has a message that match the provided value.
    expect(isAuth.bind(this, req, {}, () => {})).to.throw("Not Authenticated");
  });

  it("should throw an error if the authorization header do not have the appropriate format(String: 'Bearer userToken')", () => {
    const req = {
      get: headerName => {
        return "justTheUserToken";
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw();
  });

  it("should throw an error if the authorization token cannot be verified", () => {
    const req = {
      get: headerName => {
        return "Bearer invalidUserToken";
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw();
  });

  it("should yield a userID after decoding the token", () => {
    //In order to test our middleware which makes use of
    //an external library, it is required to use mocks/stubs.
    //Mocks/Stubs are replacement of the external functions
    //by a new one that behave very similar, but keeps under our
    //control.
    //In this case we replace the verify function by a another
    //simpler one that keeps under our control. This way of testing
    //can be applied to functions that belongs to external libraries
    //or parts of our code not implemented yet.
    //**Remember** to be careful that your mocks/stubs do not affect
    //the logic you are trying to test. In this given that we are not
    //validating that verify functions vaidates correctly, we can mock
    //that function. At the very end we are just trying to test if a
    //userId property is added to the request object after the token
    //validation became successfully.
    //**Warning**: Manually mocking/stubing functions might affect the behavior
    //of any subsequent tests. ie. If the previous invalidUserToken test
    //is executed after this validUserToken test, it will fail, because
    //given the mocking, there will no be an error launched at the
    //token verification point, and the invalidUserToken expects an
    //error to be launched. **Solution**: In order to restore the
    //original functionality to the function we might use packages like
    //sinon which have a method that allow you to restore the original
    //setup after completing the given test.

    //Manual mocking/stubbing
    // jwt.verify = () => {
    //   return { userId: "fakeUserID" };
    // };

    //Mocking/Stubing through the sinon package
    //This will replace the original function by
    //an empty one with very special methods like
    //registering calls, etc.
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "fakeUserID" });

    const req = {
      get: headerName => {
        return "Bearer validToken";
      },
    };
    isAuth(req, {}, () => {});
    //checks the request object has a userId property
    expect(req).to.have.property("userId");
    //checks the request object.userId property has the correct value
    expect(req).to.have.property("userId", "fakeUserID");
    //checks that the mocked/stubed function has been called
    expect(jwt.verify.called).to.be.true;

    //restore the verify function to its original setup.
    jwt.verify.restore();
  });
});
