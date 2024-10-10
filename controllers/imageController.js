const { ObjectId } = require("mongodb");
const FolderModel = require("../models/FolderModel");
const Image = require("../models/ImageModel");
const Images = require("../models/ImageModel");
const Tag = require("../models/TagModel");
// const dotenv = require("dotenv");
// dotenv.config();
exports.uploadImage = async (req, res) => {
  try {
    const folderId = req.body.folderId;
    let folder;
    if (folderId) {
      folder = await FolderModel.findById(req.body.folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }
    // If there are multiple files, loop through and save each one
    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const newImage = new Image({
          name: file.originalname,
          user: req.user._id,
          folder: folder ? folder._id : null,
          path: file.path,
          type: file.mimetype,
          size: file.size,
        });
        await newImage.save();
        const tags = req.body.tags.split(",").map((tag) => tag.trim());
        for (let tagName of tags) {
          const tag = new Tag({
            name: tagName,
            image: newImage._id,
          });
          await tag.save();
          newImage.tags.push(tag._id);
        }
        const savedImage = await newImage.save();
        images.push(savedImage);
      }
      res.status(200).json({ message: "Images uploaded successfully", images });
    } else {
      // If there's only one file, save it
      const newImage = new Image({
        name: req.file.originalname,
        user: req.user._id,
        folder: folder ? folder._id : null,
        path: req.file.path,
        type: req.file.mimetype,
        size: req.file.size,
      });
      await newImage.save();
      const tags = req.body.tags.split(",").map((tag) => tag.trim());
      for (let tagName of tags) {
        const tag = new Tag({
          name: tagName,
          image: newImage._id,
        });
        await tag.save();
        newImage.tags.push(tag._id);
      }
      const savedImage = await newImage.save();
      res
        .status(200)
        .json({ message: "Image uploaded successfully", image: savedImage });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

//
//
exports.getImages = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 15;
  const skip = (page - 1) * limit;
  const images = await Image.find({ user: req.user._id })
    .skip(skip)
    .limit(limit);
  const response = {
    count: images.length,
    images: images.map((res) => {
      return {
        name: res.name,
        _id: res._id,
        type: res.type,
        size: res.size,
        path: res.path,
        tags: res.tags,
        downloadCount: res.downloadCount,
        request: {
          type: "GET",
          url: "http://localhost:3000/api/v1/image/" + res._id,
        },
      };
    }),
  };
  res.status(200).json({ result: images.length, page, data: response });
};
exports.getImageByFolder = async (req, res) => {
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 15;
  // const skip = (page - 1) * limit;
  const images = await Image.find({
    user: req.user._id,
    folder: req.params.id,
  });
  const response = {
    count: images.length,
    images: images.map((res) => {
      return {
        _id: res._id,
        name: res.name,
        type: res.type,
        size: res.size,
        path: res.path,
        tags: res.tags,
        downloadCount: res.downloadCount,
      };
    }),
  };
  return res.status(200).json({ result: images.length, data: response });
};

//
//
exports.downloadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById({ _id: id });

    image.downloadCount++;

    await image.save();

    res.download(image.path, image.name);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!image) {
      res.status(404).json({ message: `Image Not Found` });
    }
    return res.status(200).json({ data: image });
  } catch (error) {
    return res.status(500).json({
      message: "server error" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};
exports.editImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(
      { _id: req.params.id },
      { name: req.file.originalname },
      { new: true }
    );
    if (!image) {
      res.status(404).json({ message: `Image Update failed` });
    }
    res
      .status(200)
      .json({ message: "Image Updated successfully", data: image });
  } catch (error) {
    res.status(500).json({
      message: "server error" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

// '/api/v1/image/:id/move',
exports.moveImage = async (req, res) => {
  try {
    // Get image ID from request parameters
    const { id } = req.params;

    // Get new folder ID from request body
    const { folderId } = req.body;

    // Check if image and folder IDs are valid ObjectIds
    if (!ObjectId.isValid(id) || !ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Find image by ID and update folder ID
    const image = await Image.findByIdAndUpdate(
      id,
      { folder: folderId },
      { new: true }
    );

    // Check if image exists
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Send success response
    res.json({ message: "Image moved to new folder", data: image });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        message: "Internal server error" + err.message,
        stack: err.stack,
      });
  }
};

exports.deleteImage = async (req, res) => {
  const imageIds = req.body.imageIds;

  try {
    const result = await Image.deleteMany({ _id: { $in: imageIds } });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "No images found" });
    }

    res.json({ message: `${result.deletedCount} images deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchByTag = async (req, res) => {
  try {
    const tag = req.body.tag;
    // const images = await Image.find({ tags: tag });
    // const images = await Image.find({ tags: { $elemMatch: { name: tag } } });
    const tags = await Tag.findOne({ name: tag });
    if (tags.length === 0) {
      return res.status(404).json({ message: "Tag not found" });
    }
    // const tagIds = tags.map(tag => tag._id);
    // console.log(tagIds);
    const images = await Image.find({ tags: tags._id });
    res.json({ filteredImages: images });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", error: error, stack: error.stack });
  }
};
