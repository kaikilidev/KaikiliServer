var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var SubService = {

    addNewSubService: function (req, callback) {
      //  console.log(req);
        var subService = {
            subServiceName: req.body.subServiceName,
            subServiceInfo: req.body.subServiceInfo,
            subServiceType: req.body.subServiceType,
            serviceId: req.body.serviceId,
            isActive: req.body.isActive,
            creationDate: new Date().toISOString()

        };
        console.log(subService);
        mongo.connect(config.dbUrl,  function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.subService);
            collection.insert(subService, function (err, records) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    console.log(status);
                    subService.subServiceId = records['ops'][0]._id;
                    console.log(subService.serviceId);
                    var status = {
                        status: 1,
                        message: "Success upload new sub service to server",
                        data: records['ops'][0]
                    };
                    callback(status);
                }
            });
        });
    },

    getAllAddService: function (id, callback) {
      //  console.log("call get all service");
        mongo.connect(config.dbUrl,  function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.add_services);
            collection.find({}).toArray(function (err, docs) {
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


    getSingleService: function (req, callback) {
        var sr_id = req.body.sr_id;
     //   console.log(sr_id);
        mongo.connect(config.dbUrl,  function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.add_services);
            console.log(err);
            collection.find({sr_id: sr_id}).toArray(function (err, docs) {
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


module.exports = SubService;