const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../utils/upload");
const {
  uploadImage,
  getImage,
  moveImage,
  searchByTag,
  getImages,
  editImage,
  deleteImage,
  downloadImage,
  getImageByFolder,
} = require("../controllers/imageController");

router.route("/tag").get(auth, searchByTag);
router
  .route("/")
  .get(auth, getImages)
  .post(auth, upload.array("images[]"), uploadImage)
  .delete(auth, deleteImage);

//  some changes in route editImage
router
  .route("/:id")
  .get(auth, getImage)
  .put(auth, upload.array("images[]"), editImage)
  .post(auth, upload.array("images[]"), uploadImage);

router.get("/folder/:id", auth, getImageByFolder);
router.route("/:id/move").put(auth, moveImage);
router.route("/:id/download").get(auth, downloadImage);
module.exports = router;
