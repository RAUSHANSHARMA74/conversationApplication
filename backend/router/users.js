const express = require("express");
const userDetail = express.Router();
const { authorization } = require("../middleware/authentication");
const multer  = require("multer")


userDetail.use(authorization);
userDetail.get("/userDetail", async (req, res) => {
  try {
    res.send(req.body);
  } catch (error) {
    console.log("something went wrong in get userDetail");
    console.log(error);
  }
});


// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

userDetail.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully' });
});


module.exports = { userDetail };
