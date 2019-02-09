var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var Service = {

    addNewService: function (req, callback) {
        var service = {
            serviceName: req.body.serviceName,
            serviceInfo: req.body.serviceInfo,
            isActive: req.body.isActive,
            creationDate: new Date().toISOString()
        };
        console.log(service);
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.service);
            // var collection = db.collection(config.collections.service);
            collection.insert(service, function (err, records) {
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
                    service.serviceId = records['ops'][0]._id;
                    console.log(service.serviceId);
                    var status = {
                        status: 1,
                        message: "Success upload new service to server",
                        data: service
                    };
                    callback(status);
                }
            });
        });
    },


    getAllService: function (id, callback) {
        console.log("call get all service");
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.service);
            collection.find({}).toArray(function (err, docs) {

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
                        message: "Success Get all service to Mongodb",
                        data: docs
                    };
                    console.log(status);
                    // db.close();
                    callback(status);
                }
            });

        });
    },


    updateService: function (req, callback) {
        var service = {
            serviceName: req.body.serviceName,
            serviceInfo: req.body.serviceInfo,
            isActive: req.body.isActive,
            creationDate: new Date().toISOString()
        };
        var serviceId = req.body.serviceId;
        console.log(service);
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.service);
            var myquery = { _id: new ObjectID(serviceId) };
            collection.updateOne(myquery, service, function (err) {
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
                        message: "Success update service to server"
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    }






};


module.exports = Service;