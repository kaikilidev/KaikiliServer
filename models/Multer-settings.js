const multer = require("multer");
const path = require("path");


/** code to configure user upload profile image starts */
const userSPUploadProfile = path.join(__dirname, "..", "public/SPProfile/");
const userCUUploadProfile = path.join(__dirname, "..", "public/CUProfile/");
const userSPUploadWork = path.join(__dirname,"..","public/SPWork/");
const userCUReviewImage = path.join(__dirname,"..","public/CUReview/");


let userSPImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userSPUploadProfile);
  },
  filename: function (req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
     console.log(req.params.sp_id+"---------");
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


let userCUImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userCUUploadProfile);
  },
  filename: function (req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.cu_id+"---------");
    // cb(null, req.query.id + "@" + Date.now() + "." + ext);
    cb(null, req.params.cu_id+ "." + ext);
  }
});


let uploadCUUserProfileIM = multer({
  storage: userCUImageStorage,
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



let uploadCUReviewImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userCUReviewImage);
  },
  filename: function (req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.tran_id+"---------");
    // console.log(Date.now()+"---------"+ext);
    cb(null, Date.now() + "." + ext);
  }
});


let uploadCUReview = multer({
  storage: uploadCUReviewImageStorage,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 2 }
]);

module.exports = {
  uploadSPUserProfileIM: uploadSPUserProfileIM,
  uploadCUUserProfileIM: uploadCUUserProfileIM,
  uploadSPWork:uploadSPWork,
  uploadCUReview:uploadCUReview
};