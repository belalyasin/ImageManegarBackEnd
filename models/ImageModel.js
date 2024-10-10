const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  path: {
    type: String,
    required: true,
  },
  type:{
    type: String,
  },
  size:{
    type: Number,
  },
  downloadCount:{
    type: Number,
    required: true,
    default: 0,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
});
const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
