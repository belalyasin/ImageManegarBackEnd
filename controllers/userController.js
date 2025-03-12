const userModel = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
// const upload = multer({ dest: "uploads/",}).single('avatar');
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
}).single("avatar");
// Get all users
exports.getUsers = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;
    const users = await userModel.find({}).select("name").skip(skip).limit(limit);
    const response = {
        count: users.length,
        users: users.map((res) => {
            return {
                name: res.name,
                _id: res._id,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/api/v1/user/" + res._id,
                },
            };
        }),
    };
    res.status(200).json({result: users.length, page, data: response});
});

// create user
exports.createUser = (req, res) => {
    upload(req, res, (next) => {
        try {
            const path = req.file.path;
            // const filename = new Date().toISOString() + req.file.originalname;
            const file = req.file;
            // console.log("path : " + req.file.filename);
            // console.log("file : " + JSON.stringify(file));
            const user = new userModel({
                name: req.body.name,
                email: req.body.email,
                avatar: path,
            });
            user
                .save()
                .then((result) => {
                    // console.log(result);
                    res.status(201).json({
                        message: "Created User successfully",
                        data: {
                            name: result.name,
                            email: result.email,
                            _id: result._id,
                            avatar: result.avatar,
                        },
                    });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({
                        error: err,
                    });
                });
            // res
            //   .status(200)
            //   .json({ message: "file is uploaded successfully", data: user });
        } catch (error) {
            console.error(error.message, error.stack);
        }
    });
};
exports.signUp = (req, res) => {
    // upload(req, res, (next) => {
    //   try {
    //     const path = req.file.path;
    //     // const filename = new Date().toISOString() + req.file.originalname;
    //     const file = req.file;
    //     // console.log("path : " + req.file.filename);
    //     // console.log("file : " + JSON.stringify(file));
    //     // res
    //     //   .status(200)
    //     //   .json({ message: "file is uploaded successfully", data: user });
    //   } catch (error) {
    //     console.error(error.message, error.stack);
    //   }
    // });
    userModel
        .find({email: req.body.email})
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exists",
                });
            } else {
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
            }
        });
};

// Get specific user
exports.getUser = asyncHandler(async (req, res) => {
    // const { id } = req.params;
    const id = req.params.id;
    if (req.user.id !== id) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const user = await userModel.findById(id);
    if (!user) {
        // return next(new ApiError("category is not found", 404));
        res.status(404).json({msg: `No User for this id`});
    }
    res.status(200).json({
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    });
});
exports.currantUser = asyncHandler(async (req, res) => {
    // const { id } = req.params;
    const id = req.user._id;
    // if (req.user.id) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // console.log(req.user);
    console.log(req.user._id);
    const user = await userModel.findById(id);
    if (!user) {
        // return next(new ApiError("category is not found", 404));
        res.status(404).json({msg: `No User for this id`});
    }
    res.status(200).json({
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    });
});
//  update user
exports.updateUserTest = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // const { name, email, password } = req.body;
    // console.log('->'+JSON.stringify(req.files));
    // const path = req.file.path;
    // const ext = req.file.mimetype.split("/")[1];
    // const avatar = `${id}.${ext}`;
    // console.log(path);
    // console.log(ext);
    console.log(req.body);
    if (req.user.id !== id) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const user = await userModel.findByIdAndUpdate(
        {_id: id},
        {
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.avatar,
        },
        {new: true}
    );
    if (!user) {
        res.status(404).json({message: `User Update failed`});
    }
    res.status(200).json({
        message: "User Updated successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
    });
});
exports.updateUser = async (req, res) => {
    try {
        console.log(req.params.id);
        const {id} = req.params;
        const {name, email, password} = req.body;
        console.log('->' + JSON.stringify(req.body));
        // const path = req.file.path;
        // const ext = req.file.mimetype.split("/")[1];
        // const avatar = `${id}.${ext}`;
        // console.log(path);
        // console.log(ext);
        // console.log(avatar);
        if (req.user.id !== id) {
            return res.status(401).json({message: "Unauthorized"});
        }
        res.json({
            req,
        })
        // const user = await userModel.findByIdAndUpdate(
        //   { _id: id },
        //   {
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password,
        //     avatar: path,
        //   },
        //   { new: true }
        // );
        // if (!user) {
        //   res.status(404).json({ message: `User Update failed` });
        // }
        // res.status(200).json({
        //   message: "User Updated successfully",
        //   data: {
        //     id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     avatar: user.avatar,
        //   },
        // });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        })
    }
};
//  delete user
exports.deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
        res.status(404).json({message: `User Delete failed`});
    }
    res.status(204).json({message: "USer Deleted successfully"});
});
