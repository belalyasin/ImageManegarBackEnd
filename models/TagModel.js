const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
});

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
