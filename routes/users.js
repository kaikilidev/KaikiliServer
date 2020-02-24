var express = require('express');
var router = express.Router();
var userServiceModel = require('../models/UserServiceModel');
var usersModel = require('../models/UsersModel');
var configDB = require('../db_config.json');
var comman = require('../models/Comman');

const multerSettings = require("../models/Multer-settings");
const Bluebird = require("bluebird");
let uploadSPWork = multerSettings.uploadSPWork;
let uploadSPUserProfileIM = multerSettings.uploadSPUserProfileIM;


// //G E T   M E T H O D S


//P O S T   M E T H O D S

//API - 1
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

//API - 2
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

//API - 3
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

//API - 4
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

//API - 5
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

//API - 6
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


//API - 7
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

//API - 8
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

//API - 9
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


//API - 10
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

//API - 11
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

//API - 12
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

//API - 13
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

//API - 14
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


//API - 15
router.post('/getSingleCancellationTransitionInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.getSingleCancellationTransitionInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 16
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

//API - 17
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

//API - 18
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

//API - 19
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

//API - 20
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

//API - 21
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


//API - 22
router.post('/getUserRatingData', function (req, res, next) {
    console.log("Call ling sub -------- ");
    usersModel.getUserRatingDataCU(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 23
router.post('/spWorkImageUpload/:sp_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadSPWork);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(configDB.imagePath + "SPWork/" + documents[index].filename);
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

//API - 24
router.post('/spProfileImageUpload/:sp_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadSPUserProfileIM);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(configDB.imagePath + "SPProfile/" + documents[index].filename);
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

//API - 25
router.post('/checkSPUserCreated', function (req, res, next) {
    usersModel.checkSPUserCreated(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 26
router.post('/SPUserRegistrationCheck', function (req, res, next) {
    console.log("call SPUserRegistrationCheck -----1");
    usersModel.SPRegiCheck(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 27
router.post('/SPAddBackgroundUser', function (req, res, next) {
    usersModel.addBackgroundUser(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 28
router.post('/SPUserLogin', function (req, res, next) {
    usersModel.SPUserLogin(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 29
router.post('/userTransitionCancellation', function (req, res, next) {
    userServiceModel.userTransitionCancellation(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 30
router.post('/getUserServiceDataNew', function (req, res, next) {
    userServiceModel.getUserServiceCatalogueData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 31
router.post('/getUserShoutingData', function (req, res, next) {
    userServiceModel.getUserNearestShoutingData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 32
router.post('/getUserShoutingSendData', function (req, res, next) {
    userServiceModel.SPUserShoutingSendCustomerInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 33
router.post('/getUserPostData', function (req, res, next) {
    userServiceModel.SPUsergetTowDayData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 34
router.post('/SPupaterPPSInfo', function (req, res, next) {
    userServiceModel.postSPupaterPPSInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 35
router.post('/getSpPreferredProviderInfo', function (req, res, next) {
    userServiceModel.getPreferredProviderInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 36
router.post('/getSpPreferredProviderInfoCancel', function (req, res, next) {
    userServiceModel.getPreferredProviderInfoCancel(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 37
router.post('/getSpProfile', function (req, res, next) {
    usersModel.getUserProfileInformation(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 38
router.post('/applyToSticker', function (req, res, next) {
    usersModel.newApplyToSticker(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 39
router.post('/checkToSticker', function (req, res, next) {
    usersModel.checkApplyToSticker(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 40
router.post('/stickerQRScan', function (req, res, next) {
    usersModel.stickerQRScanUpdate(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 41
router.post('/checkServiceOtp', function (req, res, next) {
    userServiceModel.checkServiceOPT(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 42
router.post('/getUserInterestedToHireData', function (req, res, next) {
    userServiceModel.getUserNearestInterestedToHire(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 43
router.post('/getUserInterestedSendData', function (req, res, next) {
    userServiceModel.SPUserInterestedSendCustomerInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 44
// Cost Helper Service 4-10-2019
router.post('/getUserServiceCostHelperData', function (req, res, next) {
    userServiceModel.getUserServiceCostHelperInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 45
router.post('/userSendShoutInterestedList', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    userServiceModel.userSendShoutInterestedPostList(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 46
router.post('/spProfileUpload', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    usersModel.updateSPProfileDataUpload(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 47
router.post('/spCheckOtp', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    usersModel.OtpCheckProfile(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 48
router.post('/contactUs', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    usersModel.contactUsInsert(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 49
// 15-12-2019 add Dispute to SP
router.post('/SPdisputeAdd', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    usersModel.SPdisputeInsert(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 50
// 18-12-2019 Get Data Dispute to SP
router.post('/SPdisputeGet', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    usersModel.SPdisputeRead(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 51
router.post('/SPUserCashOutBank', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.SPcashOutToBanck(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 52
// 21-12-2019 Get Data Dispute to SP
router.get('/GetFAQ', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    comman.FAQDataRead(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 53
// 20-2-2020 Get Data Single Transition Any type
router.post('/getTransitionID', function (req, res, next) {
    console.log("Call ling sub -------- ");
    userServiceModel.getTransitionInfoFull(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 54
router.post('/getCustomerDataInfo', function (req, res, next) {
    console.log("call getCustomerData-----1");
    userServiceModel.getCustomerData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 54
router.get('/checkUserValid/:sp_id/:key', function (req, res, next) {
    console.log("call getCustomerData-----1");
    var sp_id = req.params.sp_id;
    var key = req.params.key;
    console.log("call getCustomerData-----1" + sp_id + "---" + key);
    comman.checkSPValidLogin(sp_id, key, function (validUser) {
        if (validUser) {
            var status = {
                status: 1,
                message: "Successfully update information.",
            };
            res.json(status);

        } else {
            var status = {
                status: -1,
                message: "Login in other mobile",
            };
            res.json(status);
        }
    });
});


//API - 55  SP user Logout
router.get('/userLogOut/:sp_id', function (req, res, next) {
    comman.SPUserLogout(req.params.sp_id);
    res.json();
});


//Delete File not working
// router.post('/spWorkImageDelete/', function (req, res, next) {
//     try {
//         fs.unlinkSync('/tmp/hello');
//         console.log('successfully deleted /tmp/hello');
//     } catch (err) {
//         // handle the error
//     }
// });

module.exports = router;