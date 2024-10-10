const express = require("express");
const router = express.Router();
const {
  createFolder,
  getFolders,
  getFolder,
  editFolder,
  deleteFolder,
  moveFolder,
} = require("../controllers/folderController");
const auth = require("../middleware/auth");

router.route("/").get(auth, getFolders).post(auth, createFolder);

router
  .route("/:id")
  .get(auth, getFolder)
  .post(auth, createFolder)
  .put(auth, editFolder)
  .delete(auth, deleteFolder);

router.route("/:id/move").put(auth, moveFolder);

module.exports = router;
