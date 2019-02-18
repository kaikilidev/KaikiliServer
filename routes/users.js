var express = require('express');
var router = express.Router();
var userServiceModel = require('../models/UserServiceModel');
var usersModel = require('../models/UsersModel');


// //G E T   M E T H O D S




//P O S T   M E T H O D S

router.post('/AddUserServices', function (req, res, next) {
    userServiceModel.addUserService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0

        }
    });
});



router.post('/AddNewUser', function (req, res, next) {
    usersModel.addNewUser(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0

        }
    });
});


router.post('/GetUserServices', function (req, res, next) {
    console.log("Call ling sub metherd ");
    userServiceModel.getUserService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});



router.post('/getUserServiceCatalogue', function (req, res, next) {
    console.log("Call ling sub metherd ");
    userServiceModel.getUserServiceCatalogue(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

router.post('/getUserTransitionSL', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.getUserTransitionSL(req, function (err, result) {
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