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
            console.log(sp_id);
            console.log(sr_id);

            collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs){

                if(docs.length >0){
                    recodeId = docs[0]._id;
                    console.log(recodeId);

                    // Update service record
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
                                message: "Success upload to old sub service to server",
                                // data: records['ops'][0]
                            };
                            console.log(status);
                            callback(status);
                        }
                    });

                }else {
                    console.log(recodeId + " New Insert");
                // Insert new service record
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


    getUserServiceCatalogue: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            console.log(err);
            collection.find({sp_id: sp_id},{ _id: 1 ,sp_id: 2,sr_id: 3, sr_title:4,sp_sr_status:5}).toArray(function (err, docs) {
                // db.sp_sr_catalogue.find({sp_id: "SP00001"},{ _id: 1 ,sp_id: 5,sr_id: 2, sr_title:3,sp_sr_status:4}).toArray()
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
                    callback(status);
                }
            });

        });
    },

};


module.exports = UserService;