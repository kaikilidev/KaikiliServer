var express = require('express');
var router = express.Router();
var customerModel = require('../models/CustomerModel.js');
var configDB = require('../db_config.json');
var comman = require('../models/Comman');

const multerSettings = require("../models/Multer-settings-aws");
const Bluebird = require("bluebird");
// let uploadSPWork = multerSettings.uploadSPWork;
let uploadCUUserProfileIM = multerSettings.uploadCUUserProfileIM;
let uploadCUReview = multerSettings.uploadCUReview;


// //G E T   M E T H O D S


//P O S T   M E T H O D S
//API - 1
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


//API - 2
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


//API - 3
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

//API - 4
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


//API - 5
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

//API - 6
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

//API - 7
router.post('/searchSProvider', function (req, res, next) {
    console.log("call searchServiceProvider-----1");
    customerModel.searchServiceProvider(req, function (err, result) {
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
router.post('/searchSProviderTest', function (req, res, next) {
    console.log("call searchServiceProvider-----1");
    customerModel.searchServiceProviderNew(req, function (err, result) {
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
router.post('/reSearchSProvider', function (req, res, next) {
    console.log("call searchServiceProvider-----1");
    customerModel.reSearchServiceProvider(req, function (err, result) {
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
router.post('/searchQuoteProvider', function (req, res, next) {
    console.log("call searchQuoteProvider-----1");
    customerModel.searchQuoteProvider(req, function (err, result) {
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
router.post('/checkServiceAlert', function (req, res, next) {
    console.log("call addServiceAlertData-----1");
    customerModel.CheckServiceAlertData(req, function (err, result) {
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
router.post('/addNewServiceAlert', function (req, res, next) {
    console.log("call addServiceAlertData-----1");
    customerModel.addServiceAlertData(req, function (err, result) {
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
router.post('/bookNewService', function (req, res, next) {
    console.log("call serviceBookUser-----1");
    customerModel.serviceBookUser(req, function (err, result) {
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
router.post('/removeAddressData', function (req, res, next) {
    console.log("call serviceBookUser-----1");
    customerModel.removeUserAddress(req, function (err, result) {
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
router.post('/getCustomerTransition', function (req, res, next) {
    console.log("call getCustomerTransition-----1");
    customerModel.getCustomerTransition(req, function (err, result) {
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
router.post('/getCustomerAlertData', function (req, res, next) {
    console.log("call getCustomerTransition-----1");
    customerModel.getCustomerAlertTransition(req, function (err, result) {
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
router.post('/customerAlertUpdate', function (req, res, next) {
    console.log("call customerAlertInfoUpdate-----1");
    customerModel.customerAlertInfoUpdate(req, function (err, result) {
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
router.post('/customerAlertDelete', function (req, res, next) {
    console.log("call customerAlertInfoDelete-----1");
    customerModel.customerAlertInfoDelete(req, function (err, result) {
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
router.post('/customerTransitionRescheduledData', function (req, res, next) {
    console.log("call customerTransitionRescheduledData-----1");
    customerModel.customerRescheduledTransitionData(req, function (err, result) {
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
router.post('/customerTransitionRescheduledDataUpdate', function (req, res, next) {
    console.log("call customerTransitionRescheduledData-----1");
    customerModel.customerRescheduledTransitionUpdateData(req, function (err, result) {
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
router.post('/customerUpdateShoutingData', function (req, res, next) {
    console.log("call customerTransitionRescheduledData-----1");
    customerModel.customerShoutingUpdateData(req, function (err, result) {
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
router.post('/customerUpdateInterestedData', function (req, res, next) {
    console.log("call customerTransitionRescheduledData-----1");
    customerModel.customerInterestedUpdateData(req, function (err, result) {
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
router.post('/customerToServiceReview', function (req, res, next) {
    console.log("call customerTransitionRescheduledData-----1");
    customerModel.customerAddToServiceReview(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 24
router.post('/customerCompletedAllService', function (req, res, next) {
    console.log("call customerCompletedService-----1");
    customerModel.customerCompletedService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});

//API - 25
router.post('/getCustomerDataInfo', function (req, res, next) {
    console.log("call getCustomerData-----1");
    customerModel.getCustomerData(req, function (err, result) {
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
router.post('/userTransitionUpdate', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.customerTransitionUpdate(req, function (err, result) {
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
router.post('/customerSingleAlertTransition', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.getCustomerSingleAlertTransition(req, function (err, result) {
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
router.post('/customerBookPreferredProviderService', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.postCustomerBookPreferredProviderService(req, function (err, result) {
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
router.post('/BookPPStoCancel', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.postBookPPStoCancel(req, function (err, result) {
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
router.post('/GetServiceOTP', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.getServiceOPT(req, function (err, result) {
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
router.post('/searchRepeatedService', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.searchRepeatedServiceProvider(req, function (err, result) {
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
router.post('/cuProfileUpload', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.updateCUProfileDataUpload(req, function (err, result) {
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
router.post('/cuProfileImageUpload/:cu_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadCUUserProfileIM);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(documents[index].location);
                    // uploads.push(configDB.imagePath + "CUProfile/" + documents[index].filename);
                });
                customerModel.updateCUProfileImageUpload(req.params.cu_id, uploads, function (err, result) {
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


//API - 34
router.post('/customerSingleInterestedTransition', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.getCustomerSingleInterestedTransition(req, function (err, result) {
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
router.post('/CUAddBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.userAddBankInfo(req, function (err, result) {
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
router.post('/CUUserBankInfoList', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.CUUserBankInfoList(req, function (err, result) {
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
router.post('/CUUserDeleteBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.CUUserDeleteBankInfo(req, function (err, result) {
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
router.post('/CUUserSetDefaultBankInfo', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.CUUserSetDefaultBankInfo(req, function (err, result) {
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
// new Service repeated service booking
router.post('/bookRepeatedService', function (req, res, next) {
    console.log("call bookRepeatedService-----1");
    customerModel.bookRepeatedServiceUser(req, function (err, result) {
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
// 6-12-2019 Otp Check Api
router.post('/cuCheckOtp', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.OtpCheckProfile(req, function (err, result) {
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
// 6-12-2019 Review add Image Api
router.post('/cuReviewImageUpload/:tran_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadCUReview);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    // uploads.push(configDB.imagePath + "CUReview/" + documents[index].filename);
                    uploads.push(documents[index].location);
                });
                customerModel.updateCUReviewImageUpload(req.params.tran_id, uploads, function (err, result) {
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


//API - 42
// Add Dispute Data in customer 15-12-2019
router.post('/CUdisputeAdd', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.CUdisputeInsert(req, function (err, result) {
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
// Read Dispute Data in customer 18-12-2019
router.post('/CUdisputeRead', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.CUdisputeRead(req, function (err, result) {
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


//API - 45
// Coupon Code in customer book service 6-02-2020
router.post('/CouponCode', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.CUCouponCode(req, function (err, result) {
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
// 20-2-2020 Get Data Single Transition Any type
router.post('/getTransitionID', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.getTransitionInfoFull(req, function (err, result) {
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
router.post('/userPostMessages', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.userNotificationPost(req, function (err, result) {
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
router.post('/userSingleNotification', function (req, res, next) {
    // console.log("Call ling sub metherd ");
    customerModel.getUserSingleNotification(req, function (err, result) {
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
router.post('/contactUs', function (req, res, next) {
    console.log("call searchRepeatedServiceProvider-----1");
    customerModel.contactUsInsert(req, function (err, result) {
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
router.post('/getSpPreferredProviderInfo', function (req, res, next) {
    customerModel.getPreferredProviderInfo(req, function (err, result) {
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
router.post('/getSpPreferredProviderInfoCancel', function (req, res, next) {
    customerModel.getPreferredProviderInfoCancel(req, function (err, result) {
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
router.post('/getUserRatingData', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.getUserRatingDataCU(req, function (err, result) {
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
router.post('/getUserWorkProfile', function (req, res, next) {
    console.log("Call ling sub -------- ");
    customerModel.getSPUserWorkProfile(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 54  CP user Logout 27-2-2020
router.get('/userLogOut/:cu_id', function (req, res, next) {
    comman.CPUserLogout(req.params.cu_id);
    res.json();
});


//API - 57  SP user Logout
router.get('/getLocation/:sp_id', function (req, res, next) {
    comman.SPUserLocation(req.params.sp_id, function (data) {
        res.json(data);
    });
});


//API - 58
router.post('/getKaikiliEarnTan', function (req, res, next) {
    console.log("call getCustomerData-----1");
    customerModel.getKaikiliCreditData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});



//API - 59
router.post('/getKaikiliNotification', function (req, res, next) {
    console.log("call getCustomerData-----1");
    customerModel.getKaikiliNotificationData(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});



//API - 60
router.post('/getAdminNotificationInfo', function (req, res, next) {
    console.log("call getCustomerData-----1");
    customerModel.getAdminNotificationInfo(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0
        }
    });
});


//API - 61
router.post('/getDisputeCategories', function (req, res, next) {
    var cu_id = req.body.cu_id;
    var key = req.body.key;
    comman.checkCUValidLogin(cu_id, key, function (validUser) {
        if (validUser) {
            comman.getDisputeCategories(req.body.type, function (spCredit) {
                if (spCredit.length > 0) {
                    var status = {
                        status: 1,
                        message: "Successfully data getting",
                        data: spCredit
                    }
                    res.json(status);
                } else {
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    res.json(status);
                }
            });
        } else {
            var status = {
                status: -1,
                message: "Login in other mobile",
            };
            res.json(status);
        }

    });
});


// return upload(req, res).then((data) => {
//     console.log("2----"+req.files.uploas);
//     console.log("3----"+req.query.type);
// if(req.files && req.files.uploas){
// console.log("2----"+req.files.uploas);
// console.log("3----"+req.query.type);
// // if (req.files && req.files.uploas) {
//     // typed = req.query.type;
//     let documents = req.files.uploads;
//     let uploads = [];
//     if (documents && (documents.length > 0)) {
//         documents.forEach(function (item, index) {
//             console.log(configDB.imagePath + "CUReview/" + documents[index].filename);
//             uploads.push(configDB.imagePath + "CUReview/" + documents[index].filename);
//         });
//         customerModel.updateCUReviewImageUpload(req.params.tran_id, uploads, function (err, result) {
//             if (err) {
//                 res.json(err);
//                 console.log(err);
//             } else {
//                 console.log(result);
//                 res.json(result);
//             }
//         });
//     }
// } else {
//     var status = {
//         status: 0,
//         message: "No files uploaded"
//     };
//     res.json(status)
// }
// });


module.exports = router;