var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var bcrypt = require('bcrypt');


var Customer = {
    addNewUser: function (req, callback) {
        comman.getNextSequenceUserID("cu_user", function (result) {
            //  console.log(result);
            var newUser = {
                cu_id: "CU0" + result,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
                gender: req.body.gender,
                mobile_no: req.body.mobile_no,
                password: req.body.password,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
                collectionCU.find({email: req.body.email}).toArray(function (err, docs) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        callback(status);
                    } else {
                        // assert.equal(1, docs.length);
                        if (docs.length == 1) {
                            var status = {
                                status: 0,
                                message: "This Email id already register",
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            bcrypt.hash(req.body.password, 10, function (err, hash) {
                                newUser.password = hash;
                                var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
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
                        }
                    }
                });
            });
        });


    },


    checkCUUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.find({mobile_no: mobile_no}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    // assert.equal(1, docs.length);
                    if (docs.length == 1) {
                        var status = {
                            status: 1,
                            message: "Successfully data getting",
                            data: docs[0]

                        };
                    } else {
                        var status = {
                            status: 0,
                            message: "No User"
                        };
                    }

                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    CUUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionCU.find({email: email}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    console.log(docs);
                    if (docs.length == 1) {

                        bcrypt.compare(password, docs[0].password, function (err, res) {
                            if (res) {
                                // Passwords match
                                var status = {
                                    status: 1,
                                    message: "Successfully data getting",
                                    data: docs[0]
                                };
                                console.log(status);
                                callback(status);

                            } else {
                                var status = {
                                    status: 0,
                                    message: "User Id and Passwords don't match"
                                };
                                console.log(status);
                                callback(status);
                                // Passwords don't match
                            }
                        });


                    } else {
                        var status = {
                            status: 0,
                            message: "This Email id are not register."
                        };
                        console.log(status);
                        callback(status);
                    }
                }
            });
        });
    },

    CURegiCheck: function (req, callback) {

        var cu_id = req.body.cu_id;
        var checkCU = {
            cu_personal: false,
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.findOne({cu_id: cu_id}, function (err, docs) {
                if (docs != null) {
                    checkCU.cu_personal = true;
                } else {
                    checkCU.cu_personal = false;
                }
                console.log(checkCU.cu_personal);
                console.log(checkCU);
                callback(checkCU);
            });
        });
    },

    addUserAddress: function (req, callback) {
        comman.getNextSequenceUserID("cu_user", function (result) {
            //  console.log(result);
            var newAddress = {
                cu_id: req.body.cu_id,
                title: req.body.title,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
                collectionSP.insert(newAddress, function (err, records) {
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
                            message: "Successfully add user address",
                            data: records
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });

        });
    },


    userGetAddress: function (req, callback) {
        var cu_id = req.body.cu_id;
        console.log(cu_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var mysort = {updateDate: -1};
            var collection = kdb.db(config.dbName).collection(config.collections.cu_address);
            console.log(err);
            collection.find({
                cu_id: cu_id
            }).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success Get all Transition service list",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    searchServiceProvider: function (req, callback) {
        var sr_id = req.body.sr_id;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        console.log(longitude + " --- " + latitude);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location_match);

            var cursor = collection.aggregate([
                {
                    $geoNear: {
                        near: {type: "Point", coordinates: [parseFloat(latitude), parseFloat(longitude)]},
                        key: "location",
                        maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                        distanceField: "dist", //give values in metre
                        query: {services: sr_id}
                    }
                }]);

            cursor.toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    // console.log(status);
                    callback(status);

                } else {

                    var newArrData = new Array();
                    docs.forEach(function (element) {
                        var newRadius = element.radius * 1609.34;
                        if (element.dist <= newRadius) {
                            newArrData.push(element);
                        }
                    });

                    var status = {
                        status: 1,
                        message: "Success Get all Transition service list",
                        data: newArrData
                    };
                    callback(status);
                    // res.json(docs);
                }
            });

        });
    },


    // searchServiceProvider: function (req, callback) {
    //     var sr_id = req.body.sr_id;
    //     var latitude = req.body.latitude;
    //     var longitude = req.body.longitude;
    //     console.log(req.body.sr_id);
    //
    //     mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
    //         var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
    //         collection.find({services: sr_id}).toArray(function (err, docs) {
    //             if (err) {
    //                 console.log(err);
    //                 var status = {
    //                     status: 0,
    //                     message: "Failed"
    //                 };
    //                 // console.log(status);
    //                 callback(status);
    //
    //             } else {
    //
    //                 var newArrData = new Array();
    //                 docs.forEach(function (element) {
    //                     comman.getDistanceFromLatLonInKm(element.location.coordinates[0],element.location.coordinates[1],latitude,longitude,function (result){
    //                         console.log(result+"-------------------"+element.radius);
    //                         if(result<=element.radius){
    //                             newArrData.push(element);
    //                         }
    //                     })
    //                 });
    //
    //                 var status = {
    //                     status: 1,
    //                     message: "Success Get all Transition service list",
    //                     data: newArrData
    //                 };
    //                 callback(status);
    //                 // res.json(docs);
    //
    //
    //             }
    //         });
    //
    //     });
    // },


}
module.exports = Customer;