const { ObjectId } = require("mongodb");
const FolderModel = require("../models/FolderModel");

exports.createFolder = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    let folder;
    if (folderId) {
      folder = await FolderModel.findById(req.params.folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }
    const user = req.session.userId;
    console.log(req.session);
    const newFolder = new FolderModel({
      name: req.body.name,
      user: req.user._id,
      folder: folder ? folder._id : null,
      // next
    });
    const savedFolder = await newFolder.save();
    res.status(200).json({
      message: "Folder Created successfully",
      folder: {
        _id: savedFolder._id,
        name: savedFolder.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error in Create folders" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

exports.getFolders = async (req, res) => {
  // const user = req.session.userId;
  // console.log(req.user)
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const folders = await FolderModel.find({ user: req.user._id })
      .skip(skip)
      .limit(limit);
    if (!folders) {
      res.status(404).json({ message: "folder dose not exists" });
    }
    const response = {
      count: folders.length,
      folders: folders.map((res) => {
        return {
          name: res.name,
          _id: res._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/api/v1/folder/" + res._id,
          },
        };
      }),
    };
    res.status(200).json({ result: folders.length, page, data: response });
  } catch (error) {
    res.status(500).json({
      message: "Server error in get folders" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

exports.getFolder = async (req, res) => {
  // const user = req.session.userId;
  // console.log(req.user)
  try {
    const folder = await FolderModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!folder) {
      res.status(404).json({ message: "folder dose not exists" });
    }
    res.status(200).json({
      data: {
        name: folder.name,
        _id: folder._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error in get folder" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

exports.editFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const folder = await FolderModel.findById({ _id: id, user: req.user._id });
    if (!folder) {
      res.status(404).json({ message: `Folder not found` });
    }
    if (req.user.id !== folder.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const updatedFolder = await FolderModel.findByIdAndUpdate(
      { _id: id },
      { name: name },
      { new: true }
    );
    res.status(200).json({
      message: "Folder Updated successfully",
      data: {
        name: updatedFolder.name,
        _id: updatedFolder._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error in edit folder" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

// delete folder
//
exports.deleteFolder = async (req, res) => {
  try {
    const id = req.params.id;
    const folder = await FolderModel.findById({ _id: id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: `Folder Not found` });
    }
    // if (req.user.id !== folder.user) {
    //   res.status(401).json({ message: "Unauthorized" });
    //   return;
    // }
    await FolderModel.findByIdAndDelete({ _id: id });
    res.status(204).json({ message: "Folder Deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error in delete folder" + error.message,
      error: error,
      stack: error.stack,
    });
  }
};

//
// exports.moveFolder = async (req, res) => {
//   try {
//     // Get folder ID from request parameters
//     const { id } = req.params;
//
//     // Get new folder ID from request body
//     const  folderId  = req.body.folderId;
//     // const { folderId } = req.params.folderId;
//     let folder;
//     if (folderId) {
//       folder = await FolderModel.findById(folderId);
//       if (!folder) {
//         return res.status(404).json({ message: "Folder not found" });
//       }
//     }
//
//     // Check if folder and folder IDs are valid ObjectIds
//     if (!ObjectId.isValid(id) || !ObjectId.isValid(folderId)) {
//       return res.status(400).json({ message: "Invalid ID" });
//     }
//
//     // Find folder by ID and update folder ID
//     const newFolder = await FolderModel.findByIdAndUpdate(
//       { _id: id },
//       { folder: folder ? folderId : null },
//       { new: true }
//     );
//
//     // Check if folder exists
//     if (!newFolder) {
//       return res.status(404).json({ message: "Folder not found" });
//     }
//
//     // Send success response
//     res.json({ message: "Folder moved to new folder", data: newFolder });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.moveFolder = async (req, res) => {
  try {
    // Get folder ID from request parameters
    const { id } = req.params;

    // Get new parent folder ID from request body
    const { folderId } = req.body;

    // Validate ObjectIds before querying the database
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }
    if (folderId && !ObjectId.isValid(folderId)) {
      return res.status(400).json({ message: "Invalid new parent folder ID" });
    }

    // Check if the folder to be moved exists
    const folderToMove = await FolderModel.findById(id);
    if (!folderToMove) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if the new parent folder exists (if provided)
    if (folderId) {
      const parentFolder = await FolderModel.findById(folderId);
      if (!parentFolder) {
        return res.status(404).json({ message: "New parent folder not found" });
      }
    }

    // Update the folder's parent folder
    const updatedFolder = await FolderModel.findByIdAndUpdate(
        id,
        { folder: folderId || null }, // Set to null if no folderId is provided
        { new: true }
    );

    // Respond with success message
    res.json({ message: "Folder moved successfully", data: updatedFolder });
  } catch (err) {
    console.error("Error moving folder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};