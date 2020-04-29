const multer = require("multer");
const path = require("path");
const aws = require('aws-sdk');
const express = require('express');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: 'fPLPNmRohiAbcfxSIpN7qRjPKoASWbqLAIlXk0nl',
  accessKeyId: 'AKIAJZ3THRP6RVSWJPVQ',
  region: 'us-east-2'
});



/** code to configure user upload profile image starts */
const userSPUploadProfile = "kaikili-dev/SPProfile" ;
const userCUUploadProfile = "kaikili-dev/CUProfile";
const userSPUploadWork = "kaikili-dev/SPWork";
const userCUReviewImage = "kaikili-dev/CUReview";


const s3 = new aws.S3();
const awsStorageUserSPUploadProfile = multerS3({
  s3: s3,
  bucket: userSPUploadProfile,
  acl: 'public-read',
  key: function(req, file, cb) {
    console.log( req +"------11");
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    cb(null, req.params.sp_id+ "." + ext);
  }
});


let uploadSPUserProfileIM = multer({
  storage: awsStorageUserSPUploadProfile,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 1 }
]);





const awsStorageUserCUImageStorage = multerS3({
  s3: s3,
  bucket: userCUUploadProfile,
  acl: 'public-read',
  key: function(req, file, cb) {
    console.log( req +"------11");
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.cu_id+"---------");
    cb(null, req.params.cu_id+ "." + ext);
  }
});

//
// let userCUImageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, userCUUploadProfile);
//   },
//   filename: function (req, file, cb) {
//     let exploded_name = file.originalname.split(".");
//     let ext = exploded_name[exploded_name.length - 1];
//     console.log(req.params.cu_id+"---------");
//     // cb(null, req.query.id + "@" + Date.now() + "." + ext);
//     cb(null, req.params.cu_id+ "." + ext);
//   }
// });


let uploadCUUserProfileIM = multer({
  storage: awsStorageUserCUImageStorage,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 1 }
]);



const awsStorageUploadSPWorkImageStorage = multerS3({
  s3: s3,
  bucket: userSPUploadWork,
  acl: 'public-read',
  key: function(req, file, cb) {
    console.log( req +"------11");
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.sp_id+"---------");
    cb(null, Date.now() + "." + ext);
  }
});

//
// let uploadSPWorkImageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, userSPUploadWork);
//   },
//   filename: function (req, file, cb) {
//     let exploded_name = file.originalname.split(".");
//     let ext = exploded_name[exploded_name.length - 1];
//     console.log(req.params.sp_id+"---------");
//     cb(null, Date.now() + "." + ext);
//   }
// });


let uploadSPWork = multer({
  storage: awsStorageUploadSPWorkImageStorage,
  fileFilter: function (req, file, cb) {
    return cb(null, true);
  }
}).fields([
  { name: "uploads", maxCount: 6 }
]);



const awsStorageUploadCUReviewImageStorage = multerS3({
  s3: s3,
  bucket: userCUReviewImage,
  acl: 'public-read',
  key: function(req, file, cb) {
    let exploded_name = file.originalname.split(".");
    let ext = exploded_name[exploded_name.length - 1];
    console.log(req.params.tran_id+"---------");
    // console.log(Date.now()+"---------"+ext);
    cb(null, req.params.tran_id+"-"+Date.now() + "." + ext);
  }
});


//
// let uploadCUReviewImageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, userCUReviewImage);
//   },
//   filename: function (req, file, cb) {
//     let exploded_name = file.originalname.split(".");
//     let ext = exploded_name[exploded_name.length - 1];
//     console.log(req.params.tran_id+"---------");
//     // console.log(Date.now()+"---------"+ext);
//     cb(null, Date.now() + "." + ext);
//   }
// });


let uploadCUReview = multer({
  storage: awsStorageUploadCUReviewImageStorage,
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