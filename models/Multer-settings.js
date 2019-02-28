const multer = require("multer");
const path = require("path");


/** code to configure user upload profile image starts */
const userSPUploadProfile = path.join(__dirname, "..", "public/SPProfile/");
const userSPUploadWork = path.join(__dirname,"..","public/SPWork/");


let userSPImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userSPUploadProfile);
  },
  filename: function (req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    // console.log(req.params.sp_id+"---------");
    // cb(null, req.query.id + "@" + Date.now() + "." + ext);
    cb(null, req.params.sp_id+ "." + ext);
  }
});

let uploadSPUserProfileIM = multer({
  storage: userSPImageStorage,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 1 }
]);


let uploadSPWorkImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userSPUploadWork);
  },
  filename: function (req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.sp_id+"---------");
    cb(null, Date.now() + "." + ext);
  }
});


let uploadSPWork = multer({
  storage: uploadSPWorkImageStorage,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 6 }
]);

module.exports = {
  uploadSPUserProfileIM: uploadSPUserProfileIM,
  uploadSPWork:uploadSPWork
};