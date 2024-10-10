const mongoose = require("mongoose");
const validator = require("validator");

const usersSchema = new mongoose.Schema(
  {
    _id: new mongoose.Schema.Types.ObjectId(),
    name: {
      type: String,
      required: true,
      minlength: [3, "must be at lest 3 character"],
      maxlength: [25, "must be less than 25 character"],
    },
    googleId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password : {
      type : String,
      required : true,
      minlength : 8,
      // validate(value){
      //     if(!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W)/.test(value)){
      //         throw new Error("Password must contain at least one uppercase letter, one number, and one symbol");
      //     }
      // }
  },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: String,
      required: false
    },
  },
  { timestamps: true }
);
const user = new mongoose.model("Users", usersSchema);

module.exports = user;
