var express = require('express');
var router = express.Router();
var subservices = require('../models/SubServiceModel');


// //G E T   M E T H O D S

router.get('/getAllAddService', function (req, res, next) {
    subservices.getAllAddService(req, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});



//P O S T   M E T H O D S

router.post('/AddNewSubServices', function (req, res, next) {
    subservices.addNewSubService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0

        }
    });
});


// router.post('/updateSubServices', function (req, res, next) {
//     subService.updateService(req, function (err, result) {
//         if (err) {
//             res.json(err);
//             console.log(err);
//         } else {
//             console.log(result);
//             res.json(result);//or return count for 1 & 0
//
//         }
//     });
// });


module.exports = router;