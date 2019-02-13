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

};


module.exports = UserService;