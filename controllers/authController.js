const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

exports.signUp = (req, res) => {
  bcrypt.hash(req.body.password, 10, (error, hash) => {
    if (error) {
      return res.status(500).json({
        error: error,
      });
    } else {
      const user = new userModel({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then((result) => {
          res.status(201).json({
            message: "User is created successfully",
            data: {
              name: result.name,
              email: result.email,
              _id: result._id,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            error: err,
            stack: err.stack,
          });
        });
    }
  });
};
//  check the password validation *
exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
    user.tokens.push({ token });
    req.session.userId = user._id;
    // req.user.userId = user._id;
    console.log("sis" + req.session.userId);
    // console.log("user" + req.user);
    await user.save();
    return res.status(200).json({
      message: "Auth successful",
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
      stack: err.stack,
    });
  }
};
exports.changePassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid current password' });
      }
      bcrypt.hash(newPassword, 10, (error, hash) => {
        if (error) {
          return res.status(500).json({
            error: error,
          });
        } else {
          user.password = hash;
        }
      });
      await user.save();
      return res.status(200).json({ message: 'Password changed' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
        
        }
}

exports.logout = async (req, res) => {
  try {
    // console.log(req.user);
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    req.session.destroy();
    await req.user.save();
    // const userId = req.session;
    // console.log(userId);
    // if (!userId) {
    //   return res.status(401).json({
    //     message: "Not logged in",
    //   });
    // }
    // const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(401).json({
    //     message: "User not found",
    //   });
    // }
    // user.tokens = user.tokens.filter((token) => token.token !== req.token);
    // await user.save();
    // req.session.destroy();
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err,
      stack: err.stack,
    });
  }
};
