const Image = require("../models/ImageModel");
const Tag = require("../models/TagModel");

exports.createTags = async (req, res) => {
  try {
    const imageId = req.body.imageId;
    const image = await Image.findById({ _id: imageId });
    const tags = req.body.tags.split(",").map((tag) => tag.trim());
    for (let tagName of tags) {
      const tag = new Tag({
        name: tagName,
        image: image._id,
      });
      await tag.save();
      image.tags.push(tag._id);
    }
    await image.save();
    res.status(200).json({ message: "Tags created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "server error in create tags" + error.message,
        error: error,
        stack: error.stack,
      });
  }
};
exports.getTags = async (req, res) => {
  try {
    const tags = Tag.find({ user: req.user._id });
    const response = {
      count: tags.length,
      tags: tags.map((res) => {
        return {
          name: res.name,
          _id: res._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/api/v1/image/" + res._id,
          },
        };
      }),
    };
    res.status(200).json({ result: tags.length, data: response });
  } catch (error) {
    res.status(500).json({ error: error, stack: error.stack });
  }
};
exports.getTag = async (req, res) => {
  try {
    const tag = req.body.tag;
    const tags = await Tag.findOne({ _id: tag });
    // console.log(tags);
    // console.log(tags._id);
    // const tagIds = tags[0].map((tag) => tag._id);
    // const images = await Image.find({ tags: tags._id });
    res.json({ tag: tags });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", error: error, stack: error.stack });
  }
};
exports.editTag = async (req, res) => {};
exports.deleteTag = async (req, res) => {};
