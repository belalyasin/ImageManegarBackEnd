const express = require("express");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  currantUser,
} = require("../controllers/userController");
const { signUp, login, logout, changePassword } = require("../controllers/authController");
const auth = require("../middleware/auth");
const upload = require("../utils/upload");
const passport = require("passport");
const router = express.Router();

// router.get("/", getUser);
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["email", "profile"] }));
router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res, next) => {
    user = req.user;
    res.send(user);
    return res.status(200).json({
      message: "Auth successful",
      // token: req.user.token,
      user : req.user,
    });
    // console.log(user.tokens[0].token);
    // res.redirect(`http://localhost:4200/auth/login?token=${user.tokens[0].token}`,)
  }
);
router
  .route("/")
  .get(auth, currantUser)
  .post(auth, upload.single("avatar"), createUser);
router
  .route("/:id")
  .get(auth, getUser)
  .put(auth, upload.single("avatar"), updateUser)
  .delete(auth, deleteUser);
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").post(auth, logout);
router.route("/changePassword").post(auth, changePassword);

module.exports = router;
