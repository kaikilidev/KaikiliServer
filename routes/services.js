var express = require('express');
var router = express.Router();
var service = require('../models/ServiceModel');


// //G E T   M E T H O D S

router.get('/getAllServices', function (req, res, next) {
    service.getAllService(req, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});



//P O S T   M E T H O D S

router.post('/AddNewServices', function (req, res, next) {
    service.addNewService(req, function (err, result) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            console.log(result);
            res.json(result);//or return count for 1 & 0

        }
    });
});


router.post('/updateServices', function (req, res, next) {
    service.updateService(req, function (err, result) {
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