// var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
const path = require("path");
const userFile = path.join(__dirname, "..", "public/");
const aws = require('aws-sdk');

var express = require('express');
var router = express.Router();

aws.config.update({
    secretAccessKey: 'fPLPNmRohiAbcfxSIpN7qRjPKoASWbqLAIlXk0nl',
    accessKeyId: 'AKIAJZ3THRP6RVSWJPVQ',
    region: 'us-east-2'
});

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

//API - 54
router.get('/delete_file/:folder/:fileName', function (req, res, next) {
    console.log("call getCustomerData-----1");
    console.log(req.params.folder);
    console.log(req.params.fileName);
    // var fs = require('fs');
    try{

        var bucketInstance = new aws.S3();
        var params = {
            Bucket: "kaikili-dev/"+req.params.folder,
            Key: req.params.fileName
        };
        bucketInstance.deleteObject(params, function (err, data) {
            if (data) {
                console.log(data);
                var status = {
                    status: 1,
                    message: "Successfully deleted file.",
                };
                res.json(status);
            }
            else {
                console.log(err);
                var status = {
                    status: 0,
                    message: "Server error......",
                };
                res.json(status);
                console.log("Check if you have sufficient permissions : "+err);
            }
        });

    //
    //     var sourceUrls = userFile+req.params.folder+"/"+req.params.fileName;
    //     fs.unlinkSync(sourceUrls);
    //     var status = {
    //         status: 1,
    //         message: "Successfully deleted file.",
    //     };
    //     res.json(status);
    }catch(err){
        console.log(err);
        var status = {
            status: 0,
            message: "Server error......",
        };
        res.json(status);
    }
});


module.exports = router;

// I want the employees variable to be an array of employees