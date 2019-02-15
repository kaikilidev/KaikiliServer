var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var UserService = {

    addUserService: function (req, callback) {
        var addService = req.body;
        var sp_id = req.body.sp_id;
        var sr_id = req.body.sr_id;
        var recodeId = "";
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            var addServiceArray = collection.find({sp_id: sp_id, sr_id: sr_id}).toArray();


            if (addServiceArray.length > 0) {
                var addServiceArray = collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs) {

                    recodeId = docs[0]._id;
                    console.log(recodeId);
                    collection.update({_id: recodeId}, {$set: addService}, function (err, records) {
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
                                message: "Success upload to sub service to server",
                                // data: records['ops'][0]
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });
            } else {
                collection.insert(addService, function (err, records) {
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
                            message: "Success upload new sub service to server",
                            // data: records['ops'][0]
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            }
        });
    },


    getUserService: function (req, callback) {
        var sp_id = req.body.sp_id;
        var sr_id = req.body.sr_id;
        console.log(sr_id);
        console.log(sp_id);
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);

            // Company.findOne({where:{id:company_id}
            console.log(err);
            collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs) {

                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    // console.log(status);
                    callback(status);

                } else {
                    var status = {
                        status: 1,
                        message: "Success Get all service to Mongodb",
                        data: docs
                    };
                    // console.log(status);
                    // db.close();
                    callback(status);
                }
            });

        });
    },


};


module.exports = UserService;