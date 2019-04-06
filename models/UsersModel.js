var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var bcrypt = require('bcrypt');


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
                password: req.body.password,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
                collectionSP.find({email: req.body.email}).toArray(function (err, docs) {
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
                        }
                    }
                });
            });
        });


    },

    addNewWorkProfile: function (req, callback) {
        var sp_id = req.body.sp_id;
        var addWorkInfo = req.body;
        var geoLocationMatch = {
            sp_id: req.body.sp_id,
            radius: req.body.radius,
            location: {
                coordinates: [parseFloat(req.body.coordinatePoint.longitude),parseFloat(req.body.coordinatePoint.latitude)],
                type: "Point"
            }
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            collectionSP.find({sp_id: sp_id}).toArray(function (err, docs) {
                if (docs.length == 0) {
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

                                mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                    collectionSP.insert(geoLocationMatch, function (err, records) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(records);
                                        }
                                    });
                                });

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
                } else {
                    console.log("update new object");
                    mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                        var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                        collectionSP.updateOne({sp_id: sp_id}, {$set: addWorkInfo}, function (err, records) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed"
                                };
                                console.log(status);
                                callback(status);
                            } else {

                                mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                    collectionSP.updateOne({sp_id: sp_id}, {$set: geoLocationMatch}, function (err, records) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(records);
                                        }
                                    });
                                });
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


    getUserWorkProfile: function (req, callback) {
        var sp_id = req.body.sp_id;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            collectionSP.find({sp_id: sp_id}).toArray(function (err, docs) {
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
                        message: "Successfully data getting",
                        data: docs
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    updateSPWorkImageUpload: function (id, data, callback) {
        console.log(" data " + data.images);
        console.log(" imageAmount " + data);

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);//scores: { $each: [ 90, 92, 85 ] } }
            collectionSP.updateOne({sp_id: id}, {$push: {workImages: {$each: data}}}, function (err, records) {
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
                        message: "Successfully updated work images",
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    updateSPProfileImageUpload: function (id, data, callback) {
        console.log(" imageAmount " + data);
        var addWorkInfo = {
            "profile_image": data[0]
        };
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            collectionSP.update({sp_id: id}, {$set: addWorkInfo}, function (err, records) {
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
                        message: "Successfully updated images",
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    checkSPUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
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

    SPRegiCheck: function (req, callback) {

        var sp_id = req.body.sp_id;
        var checkSP = {
            sp_personal: false,
            sp_work_profile: false,
            sp_add_service: false,
            sp_add_bank: false,
            sp_background: false
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.findOne({sp_id: sp_id}, function (err, docs) {
                if (docs != null) {
                    checkSP.sp_personal = true;
                } else {
                    checkSP.sp_personal = false;
                }
                // console.log(checkSP.sp_personal);
                var collectionSPProfile = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                collectionSPProfile.findOne({sp_id: sp_id}, function (err, docs) {
                    if (docs != null) {
                        checkSP.sp_work_profile = true;
                    } else {
                        checkSP.sp_work_profile = false;
                    }
                    // console.log(checkSP.sp_work_profile);
                    var collectionAddService = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                    collectionAddService.findOne({sp_id: sp_id}, function (err, docs) {
                        if (docs != null) {
                            checkSP.sp_add_service = true;
                        } else {
                            checkSP.sp_add_service = false;
                        }
                        // console.log(checkSP.sp_add_service);
                        var collectionSPBank = db.db(config.dbName).collection(config.collections.sp_bank_info);
                        collectionSPBank.findOne({sp_id: sp_id}, function (err, docs) {
                            if (docs != null) {
                                checkSP.sp_add_bank = true;
                            } else {
                                checkSP.sp_add_bank = false;
                            }
                            console.log(checkSP.sp_add_bank);
                            var collectionSPBackground = db.db(config.dbName).collection(config.collections.sp_background);
                            collectionSPBackground.findOne({sp_id: sp_id}, function (err, docs) {
                                if (docs != null) {
                                    checkSP.sp_background = true;
                                } else {
                                    checkSP.sp_background = false;
                                }
                                console.log(checkSP.sp_background);
                                console.log(checkSP);
                                callback(checkSP);
                            });
                        });
                    });
                });
            });
        });
    },

    addBackgroundUser: function (req, callback) {

        var newUser = {
            sp_id: req.body.sp_id,
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            address: req.body.address,
            city: req.body.city,
            st: req.body.st,
            zip: req.body.zip,
            ssn: req.body.ssn,
            creationDate: new Date().toISOString()
        };
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_background);
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
                        message: "Successfully add data",
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    SPUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.find({email: email}).toArray(function (err, docs) {
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

                        bcrypt.compare(password, docs[0].password, function(err, res) {
                            if(res) {
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



}
module.exports = Users;