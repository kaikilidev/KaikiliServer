var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');


var Users = {

    addNewUser: function (req, callback) {
        var newSPid = comman.getNextSequenceUserID("sp_user", function (result) {
            console.log(result);

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
                            data: records['ops'][0]
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });

        });
    },

};


module.exports = Users;