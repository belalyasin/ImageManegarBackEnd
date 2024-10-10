const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const passport = require('passport');
const connectToDatabase = require("./config/dbconection");
const userRoute = require("./routes/userRoute");
const folderRoute = require("./routes/folderRoute");
const imageRoute = require("./routes/imageRoute");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
// connection db
connectToDatabase();

// Passport config
const passport_setup = require('./config/passport')

// express

const app = express();
app.use(cors());
// app.use(cors({
//   origin: "http://localhost:4200"
// }))

// middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'))

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 12 * 1 // 1 day - 12h
    // },
  })
);

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Route
app.use("/api/v1/user", userRoute);
app.use("/api/v1/folder", folderRoute);
app.use("/api/v1/image", imageRoute);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
