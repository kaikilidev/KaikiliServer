var express = require('express');
var router = express.Router();
var customerModel = require('../models/CustomerModel.js');
var configDB = require('../db_config.json');

const multerSettings = require("../models/Multer-settings");
const Bluebird = require("bluebird");
let uploadSPWork = multerSettings.uploadSPWork;
let uploadSPUserProfileIM = multerSettings.uploadSPUserProfileIM;


// //G E T   M E T H O D S


//P O S T   M E T H O D S

router.post('/AddNewUser', function (req, res, next) {
    customerModel.addNewUser(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0

        }
    });
});




router.post('/checkCUUserCreated', function (req, res, next) {
    console.log("call checkCUUserCreated-----1");
    customerModel.checkCUUserCreated(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

router.post('/CPUserRegistrationCheck', function (req, res, next) {
    console.log("call CUUserRegistrationCheck -----1");
    customerModel.CURegiCheck(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});




router.post('/CUUserLogin', function (req, res, next) {
    console.log("call CUUserLogin-----1");
    customerModel.CUUserLogin(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

router.post('/addCUAddress', function (req, res, next) {
    console.log("call addCUAddress-----1");
    customerModel.addUserAddress(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/GetCUAddress', function (req, res, next) {
    console.log("call addCUAddress-----1");
    customerModel.userGetAddress(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});






module.exports = router;