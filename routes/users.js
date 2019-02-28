var express = require('express');
var router = express.Router();
var userServiceModel = require('../models/UserServiceModel');
var usersModel = require('../models/UsersModel');
var configDB = require('../db_config.json');

const multerSettings = require("../models/Multer-settings");
const Bluebird = require("bluebird");
let uploadSPWork = multerSettings.uploadSPWork;
let uploadSPUserProfileIM = multerSettings.uploadSPUserProfileIM;


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
    // console.log("Call ling sub metherd ");
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


router.post('/userTransitionUpdate', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.userTransitionUpdate(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userNotificationList', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.getUserNotification(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userSingleNotification', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.getUserSingleNotification(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userPostMessages', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.userNotificationPost(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userTransitionCompleted', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.userTransitionCompleted(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/getUserCompletedTransition', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.getUserCompletedTransition(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userAddServiceReview', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.userAddToServiceReview(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/userCompletedService', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.userCompletedService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/getSingleTransitionInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.getSingleTransitionInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/SPAddBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.userAddBankInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/SPUserBankInfoList', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.SPUserBankInfoList(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/SPUserDeleteBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.SPUserDeleteBankInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/SPUserSetDefaultBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.SPUserSetDefaultBankInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/addNewWorkProfile', function (req, res, next) {
    console.log("Call ling sub -------- ");
    usersModel.addNewWorkProfile(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/getUserWorkProfile', function (req, res, next) {
    console.log("Call ling sub -------- ");
    usersModel.getUserWorkProfile(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


router.post('/spWorkImageUpload/:sp_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadSPWork);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(configDB.imagePath+"SPWork/"+documents[index].filename);
                });
                usersModel.updateSPWorkImageUpload(req.params.sp_id, uploads, function (err, result) {
                    if (err) {
                        res.json(err);
                        console.log(err);

                    } else {
                        console.log(result);
                        res.json(result);
                    }
                });
            }
        } else {
            var status = {
                status: 0,
                message: "No files uploaded"
            };
            res.json(status)
        }
    });
});


router.post('/spProfileImageUpload/:sp_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadSPUserProfileIM);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(configDB.imagePath+"SPProfile/"+documents[index].filename);
                });
                usersModel.updateSPProfileImageUpload(req.params.sp_id, uploads, function (err, result) {
                    if (err) {
                        res.json(err);
                        console.log(err);
                    } else {
                        console.log(result);
                        res.json(result);
                    }
                });
            }
        } else {
            var status = {
                status: 0,
                message: "No files uploaded"
            };
            res.json(status)
        }
    });
});



module.exports = router;