const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
// const createError = require("http-error");

const auth = async (req, res, next) => {
  // Express Middleware
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // const token = req.header('Authorization').replace('Bearer ','');
      // console.log("10--her"+ JSON.stringify(req));
      const token = req.header("Authorization").split(" ")[1];
      if (!token) {
        return new Error("Authentication failed");
      }
      // console.log(token);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      // console.log('decoded -> '+decoded);
      req.userId = decoded.userId;
      // req.user = await User.findById(decoded.userId);
      const user = await User.findOne({
        _id: decoded.userId,
        "tokens.token": token,
      });
      // console.log(user);
      if (!user) {
        return new Error("Authentication failed");
      }
      req.userId = decoded.userId;
      req.token = token;
      req.userData = decoded;
      req.user = user;
      next();
      //   console.log(req.user = await User.findById(decoded.userId));
      //   const jsReq = JSON.stringify(req.body);
      //   req.jsReq = decoded;
      //   console.log("-Req" + jsReq);
      // const user = await User.findOne({ _id : decoded.userId, 'tokens.token' : token });
      // console.log('user=>'+user);
    } catch (err) {
      res
        .status(401)
        .send({
          message: "Authentication Unsuccessful",
          error: err,
          stack: err.stack,
        });
    }
  }
};

module.exports = auth;
