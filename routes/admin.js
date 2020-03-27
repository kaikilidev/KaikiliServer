// var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');


var express = require('express');
var router = express.Router();

//API - 1
router.get('/adminNotification/:id', function (req, res, next) {
    var no_id = req.params.id;


    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
        var collection = db.db(config.dbName).collection(config.collections.admin_notification);
        var sp_info = db.db(config.dbName).collection(config.collections.sp_personal_info);
        collection.findOne({no_id: no_id}, function (err, docs) {
            if (err) {
                console.log(err);
                var status = {
                    status: 0,
                    message: "Not Valid id",
                };
                console.log(status);
                res.json(status)
            } else {

                if (docs != null) {

                    if(docs.sp_id.length >0){
                        comman.sendSPAdminNotification(docs.sp_id,docs.title,docs.info,docs.no_id);
                    }
                    if(docs.cu_id.length >0){
                        comman.sendCUAdminNotification(docs.cu_id,docs.title,docs.info,docs.no_id);
                    }

                    var status = {
                        status: 1,
                        message: "send notification",
                    };
                    console.log(status);
                    res.json(status)

                } else {
                    var status = {
                        status: 0,
                        message: "Not Valid id",
                    };
                    console.log(status);
                    res.json(status)
                }
            }
        });
    });


});

// //API - 54
// router.get('/checkUserValid/:sp_id/:key', function (req, res, next) {
//     console.log("call getCustomerData-----1");
//     var sp_id = req.params.sp_id;
//     var key = req.params.key;
//     console.log("call getCustomerData-----1" + sp_id + "---" + key);
//     comman.checkSPValidLogin(sp_id, key, function (validUser) {
//         if (validUser) {
//             var status = {
//                 status: 1,
//                 message: "Successfully update information.",
//             };
//             res.json(status);
//
//         } else {
//             var status = {
//                 status: -1,
//                 message: "Login in other mobile",
//             };
//             res.json(status);
//         }
//     });
// });


module.exports = router;

// I want the employees variable to be an array of employees