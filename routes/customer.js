var express = require('express');
var router = express.Router();
var customerModel = require('../models/CustomerModel.js');
var configDB = require('../db_config.json');

const multerSettings = require("../models/Multer-settings");
const Bluebird = require("bluebird");
let uploadSPWork = multerSettings.uploadSPWork;
let uploadCUUserProfileIM = multerSettings.uploadCUUserProfileIM;


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


router.post('/cuProfileImageUpload/:cu_id', function (req, res, next) {
    let upload = Bluebird.promisify(uploadCUUserProfileIM);
    return upload(req, res).then((data) => {
        if (req.files && req.files.uploads) {
            // type = req.query.type;
            let documents = req.files.uploads;
            let uploads = [];
            if (documents && (documents.length > 0)) {
                documents.forEach(function (item, index) {
                    uploads.push(configDB.imagePath+"CUProfile/"+documents[index].filename);
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





module.exports = router;