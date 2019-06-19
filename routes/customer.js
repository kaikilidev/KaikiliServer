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







module.exports = router;