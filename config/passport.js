// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt'); 

require('dotenv').config();

const GoogleStrategy = require('passport-google-oauth20').Strategy;

// module.exports = function (passport) {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/user/auth/google/callback",
      // passReqToCallback: true
    },
    async (accessToken, refreshToken, profile, done) => {
      // const newUser = {
      //   googleId: profile.id,
      //   displayName: profile.displayName,
      //   firstName: profile.name.givenName,
      //   lastName: profile.name.familyName,
      //   avatar: profile.photos[0].value,
      // };

      // console.log('profile'+JSON.stringify(profile));
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "2h",
            }
          );
          user.tokens.push({ token });
          // console.log("user is: ", user);
          done(null, user);
        } else {
          user = new User({
            _id: new mongoose.Types.ObjectId(),
            googleId: profile.id,
            name: profile.displayName,
            email: profile._json.email,
            password: generatePassword(), //generate auto password should include one uppercase and number and smbole and length at lest 7
            avatar: profile.photos[0].value,
          });
          await user.save();
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "2h",
            }
          );
          user.tokens.push({ token });
          await user.save();
          // console.log("created new user: ", user);
          done(null, user);
        }
      } catch (err) {
        console.error(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// };

function generatePassword() {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
    bcrypt.hash(password, 10, (error, hash) => {
      if (error) {
        console.log(error);
      }
      return hash;
  });
}
//

// profile{"id":"110199188030624563128",
// "displayName":"بلال أبو حطب",
// "name":{"familyName":"أبو حطب","givenName":"بلال"},
// "emails":[{"value":"belalabwhatb@gmail.com","verified":true}],
// "photos":[{"value":"https://lh3.googleusercontent.com/a/AGNmyxaHV8U0_neEgjeFvungPW9iTOklLY26zg5O_9Gp=s96-c"}],
// "provider":"google",
// "_raw":"{\n
//     \"sub\": \"110199188030624563128\",\n
//     \"name\": \"بلال أبو حطب\",\n
//     \"given_name\": \"بلال\",\n
//     \"family_name\": \"أبو حطب\",\n
//     \"picture\": \"https://lh3.googleusercontent.com/a/AGNmyxaHV8U0_neEgjeFvungPW9iTOklLY26zg5O_9Gp\\u003ds96-c\",\n
//     \"email\": \"belalabwhatb@gmail.com\",\n
//     \"email_verified\": true,\n
//     \"locale\": \"ar\"\n}",
//   "_json":{
//           "sub":"110199188030624563128",
//           "name":"بلال أبو حطب",
//           "given_name":"بلال","family_name":"أبو حطب",
//           "picture":"https://lh3.googleusercontent.com/a/AGNmyxaHV8U0_neEgjeFvungPW9iTOklLY26zg5O_9Gp=s96-c",
//           "email":"belalabwhatb@gmail.com",
//           "email_verified":true,
//           "locale":"ar"
//         }
// }
