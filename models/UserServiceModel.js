var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var UserService = {

    addUserService: function (req, callback) {
        var addService = req.body ;
        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
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
        });
    },


    addNewUser: function (req, callback) {

        var newUser = {
            sp_id: req.body.sp_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            dob: req.body.dob,
            gender: req.body.gender,
            mobile_no: req.body.mobile_no,
            creationDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collection.insert(newUser, function (err, records) {
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
                        // data: records['ops'][0]
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

};


module.exports = UserService;