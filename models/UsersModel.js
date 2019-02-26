var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');


var Users = {

    addNewUser: function (req, callback) {
        comman.getNextSequenceUserID("sp_user", function (result) {
            //  console.log(result);
            var newUser = {
                sp_id: "SP0" + result,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
                gender: req.body.gender,
                mobile_no: req.body.mobile_no,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
                collectionSP.insert(newUser, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        callback(status);
                    } else {
                        var status = {
                            status: 1,
                            message: "Success create new user",
                            data: records['ops'][0]
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });

        });
    },

    addNewWorkProfile: function (req, callback) {
        var sp_id = req.body.sp_id;
        var addWorkInfo = req.body;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            collectionSP.find({sp_id: sp_id}).toArray( function (err, docs) {
                 if(docs.length == 0){
                     console.log("created new object");

                     mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                         var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                         collectionSP.insert(addWorkInfo, function (err, records) {
                             if (err) {
                                 console.log(err);
                                 var status = {
                                     status: 0,
                                     message: "Failed"
                                 };
                                 console.log(status);
                                 callback(status);
                             } else {
                                 var status = {
                                     status: 1,
                                     message: "Successfully added work profile",
                                     data: records['ops'][0]
                                 };
                                 console.log(status);
                                 callback(status);
                             }
                         });
                     });
                 }else {
                     console.log("update new object");
                     mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                         var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                         collectionSP.updateOne({sp_id: sp_id},{$set : addWorkInfo}, function (err, records) {
                             if (err) {
                                 console.log(err);
                                 var status = {
                                     status: 0,
                                     message: "Failed"
                                 };
                                 console.log(status);
                                 callback(status);
                             } else {
                                 var status = {
                                     status: 1,
                                     message: "Successfully updated work profile",
                                 };
                                 console.log(status);
                                 callback(status);
                             }
                         });
                     });
                 }

            });
        });





    },


    // uploadImageQuantity: function (req, callback) {
    //     // var path = req.body.taleImagePath;
    //     var imageIndex = req.body.taleFileIndex;
    //     var taleId = req.params._id;
    //     var aws_url = "https://s3-us-west-2.amazonaws.com/droptale1/uploads/tales/" + taleId + "/images/" + imageIndex + ".jpg";
    //     console.log("imageIndex: " + imageIndex);
    //     console.log("taleId: " + taleId);
    //     // var path = 'uploads/tales/' + taleId + '/records';
    //
    //     mongo.connect(config.dbUrl, function (err, db) {
    //         var collection = db.collection(config.collections.tales);
    //         var myquery = { _id: new ObjectID(taleId) };
    //         var newvalues = { $set: { imagesAmount: imageIndex } };
    //
    //         collection.updateOne(myquery, newvalues, function (err) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log("Success update Image index to mongodb");
    //                 var status = {
    //                     code: 0,
    //                     description: "Success"
    //                 };
    //                 callback(status);
    //             }
    //         });
    //     });
    //
    //
    // },

};


module.exports = Users;