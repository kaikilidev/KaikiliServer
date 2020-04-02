var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var setting = require('../models/Setting');
var bcrypt = require('bcrypt');
var uuidAPIKey = require('uuid-apikey');

var Users = {

    addNewUser: function (req, callback) {
        comman.getNextSequenceUserID("sp_user", function (result) {
            //  console.log(result);
            // editor.putString("referral_user_id", null);
            // editor.putString("referral_user_type", null);
            // editor.putString("referral_amount", null);



            var newUser = {
                sp_id: "SP0" + result,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
                gender: req.body.gender,
                mobile_no: req.body.mobile_no,
                password: req.body.password,
                fcm_token: req.body.fcm_token,
                creationDate: new Date().toUTCString(),
                onlineStatus: true,
                login_key: uuidAPIKey.create().apiKey
            };

            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
                                        if(req.body.referral_user_id.length >0 && req.body.referral_amount.length >0 && req.body.referral_user_type.length >0 ){
                                          comman.createNewSPUserCreditGiveReferral(req.body.referral_user_id,req.body.referral_amount,req.body.referral_user_type,newUser.sp_id,newUser.first_name + " " + newUser.last_name)
                                        }

                                        comman.createNewSPUserCredit(newUser.sp_id, newUser.first_name + " " + newUser.last_name)
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

    checkSPUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        var fcm_token = req.body.fcm_token;
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.find({mobile_no: mobile_no}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    console.log(status);
                    callback(status);
                } else {
                    // assert.equal(1, docs.length);
                    if (docs.length > 0) {
                    if(docs[0].fcm_token != fcm_token && docs[0].fcm_token.length > 2){
                        comman.sendSPLogoutNotification(docs[0].fcm_token);
                    }}

                    var upload = {
                        fcm_token: fcm_token,
                        onlineStatus: true,
                        login_key: uuidAPIKey.create().apiKey
                    };
                    console.log(upload);
                    collectionSP.updateOne({mobile_no: mobile_no}, {$set: upload}, function
                        (err, records) {
                        console.log("---------" + records);
                    });


                    if (docs.length == 1) {
                        docs[0].login_key = upload.login_key;
                        var status = {
                            status: 1,
                            message: "Successfully information getting",
                            data: docs[0]
                        };
                    } else {
                        var status = {
                            status: 0,
                            message: "No User"
                        };
                    }

                    //    console.log(status);
                    callback(status);
                }
            });
        });
    },

    SPRegiCheck: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;

        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var checkSP = {
                    status: 1,
                    sp_personal: false,
                    sp_work_profile: false,
                    sp_add_service: false,
                    sp_add_bank: false,
                    sp_background: false
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },


    addNewWorkProfile: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;

        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var addWorkInfo = req.body;
                var geoUpdate = req.body.geoUpdate;
                if (geoUpdate == true) {
                    var geoLocationMatch = {
                        sp_id: req.body.sp_id,
                        radius: req.body.radius,
                        location: {
                            coordinates: [parseFloat(req.body.coordinatePoint.longitude), parseFloat(req.body.coordinatePoint.latitude)],
                            type: "Point"
                        }
                    };
                }
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                    collectionSP.find({sp_id: sp_id}).toArray(function (err, docs) {
                        if (docs.length == 0) {
                            console.log("created new object");

                            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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

                                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
                            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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

                                        if (geoUpdate == true) {
                                            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                                                var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                                collectionSP.updateOne({sp_id: sp_id}, {$set: geoLocationMatch}, function (err, records) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log(records);
                                                    }
                                                });
                                            });
                                        }
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },


    getUserWorkProfile: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                    collectionSP.find({sp_id: sp_id}).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },

    updateSPWorkImageUpload: function (id, data, callback) {
        // var sp_id = req.body.sp_id;
        // var key = req.body.key;
        // comman.checkSPValidLogin(sp_id, key, function (validUser) {
        //     if (validUser) {
                console.log(" data " + data.images);
                console.log(" imageAmount " + data);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);//scores: { $each: [ 90, 92, 85 ] } }
                    collectionSP.updateOne({sp_id: id}, {$push: {workImages: {$each: data}}}, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
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
        //     } else {
        //         var status = {
        //             status: -1,
        //             message: "Login in other mobile",
        //         };
        //         callback(status);
        //     }
        //
        // });
    },


    updateSPProfileImageUpload: function (id, data, callback) {
        // var sp_id = req.body.sp_id;
        // var key = req.body.key;
        // comman.checkSPValidLogin(sp_id, key, function (validUser) {
        //     if (validUser) {
                console.log(" imageAmount " + data);
                var addWorkInfo = {
                    "profile_image": data[0]
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                    collectionSP.update({sp_id: id}, {$set: addWorkInfo}, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
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

            // } else {
            //     var status = {
            //         status: -1,
            //         message: "Login in other mobile",
            //     };
            //     callback(status);
            // }
        // });
    },


    addBackgroundUser: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

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
                    creationDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_background);
                    collectionSP.insert(newUser, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Successfully add information",
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;
        var fcm_token = req.body.fcm_token;
        console.log(email + "  ----1111");

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.find({email: email}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    console.log(status);
                    callback(status);
                } else {
                    console.log(docs.length + "  ----222");
                    if (docs.length == 1) {
                        var upload = {
                            fcm_token: fcm_token,
                            onlineStatus: true,
                            login_key: uuidAPIKey.create().apiKey
                        };

                        bcrypt.compare(password, docs[0].password, function (err, res) {
                            if (res) {
                                collectionSP.updateOne({mobile_no: docs[0].mobile_no}, {$set: upload}, function
                                    (err, records) {
                                    console.log(records);
                                });
                                // Passwords match
                                docs[0].login_key = upload.login_key;
                                var status = {
                                    status: 1,
                                    message: "Successfully information getting",
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


    getUserProfileInformation: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.getSPProfileData(sp_id, function (result) {
                    var status = {
                        status: 1,
                        message: "Successfully data getting",
                        data: result
                    };
                    console.log(status);
                    callback(status);
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    newApplyToSticker: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                    var newUser = {
                        sp_id: req.body.sp_id,
                        stickerApplyDate: new Date().toUTCString(),
                        stickerSendDate: '',
                        barCode: '',
                        scanFirstTime: '',
                        scanEndTime: '',
                        creditAmount: "0",
                        totalTran: 0
                    };
                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collectionSP = db.db(config.dbName).collection(config.collections.sp_marketing_info);
                        collectionSP.insert(newUser, function (err, dataSet) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                console.log(status);
                                callback(status);
                            } else {
                                var status = {
                                    status: 1,
                                    message: "Successfully add information",
                                    data: dataSet
                                };
                                console.log(status);
                                callback(status);
                            }
                        });
                    });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    checkApplyToSticker: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_marketing_info);
                    var collectionAdmin = db.db(config.dbName).collection(config.collections.admin_setting);
                    collectionAdmin.find({}).toArray(function (err, dataAdmin) {
                        comman.getSPCurrentOfferCredit(sp_id, function (spCredit) {
                            collectionSP.find({sp_id: req.body.sp_id}).toArray(function (err, dataSet) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    var status = {
                                        status: 1,
                                        message: "Check Data",
                                        data: dataSet,
                                        admin: dataAdmin,
                                        spCurrnet: spCredit
                                    };
                                    console.log(status);
                                    callback(status);

                                }
                            });
                        });
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    stickerQRScanUpdate: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        var sp_name = req.body.sp_name;
        // const moment = require('moment')
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                var type = req.body.type;
                if (type == "start") {

                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collectionSP = db.db(config.dbName).collection(config.collections.sp_marketing_info);
                        collectionSP.updateOne({sp_id: sp_id}, {$set: {scanFirstTime: new Date().toUTCString()}}, function (err, dataSet) {
                            if (err) {
                                // console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                // console.log(status);
                                callback(status);
                            } else {
                                var status = {
                                    status: 1,
                                    message: "Successfully add information",
                                    data: dataSet
                                };
                                // console.log(status);
                                callback(status);
                            }
                        });
                    });

                } else {
                    var endDate = new Date().toUTCString();
                    var offerAmount = req.body.offerAmount;
                    var startDate = new Date(req.body.startDate);
                    // console.log(new Date(endDate).toUTCString() + "----" + startDate);
                    // var diffDays = parseInt((new Date(endDate) - startDate) / (1000 * 60 * 60 * 24));
                    // var oneDayAmout = parseFloat(offerAmount) / 365;
                    // console.log(oneDayAmout.toFixed(2));
                    // console.log(diffDays);
                    // var creditAmount;
                    // if (diffDays < 366) {
                    //     creditAmount = oneDayAmout.toFixed(2) * diffDays;
                    // } else {
                    //     creditAmount = oneDayAmout.toFixed(2) * 365;
                    // }
                    var query = {
                        "sp_id": sp_id, sr_status: "Completed"
                    };
                    console.log(query);
                     mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                        collectionSP.find(query).toArray(function (err, dataSet) {
                            if (err) {
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                // console.log(status);
                                callback(status);
                            } else {
                                console.log(dataSet.length);
                                var count = 0;
                                var totlaCommission = 0;
                                var newItemCost = new Array();
                                dataSet.forEach(function (element) {
                                    // if (moment.utc(startDate) <= moment.utc(element.updateDate) && moment.utc(endDate) >= moment.utc(element.updateDate)) {
                                    if (new Date(startDate) <= new Date(element.updateDate) && new Date(endDate) >= new Date(element.updateDate)) {
                                        newItemCost.push(element)
                                        totlaCommission = totlaCommission + parseFloat(element.kaikili_commission.kk_sr_commission);
                                    }
                                    count++;
                                    if (dataSet.length == count) {

                                        var getCommission = parseFloat(totlaCommission) * setting.getMarketing_Credit_Give_To_Provider() / 100;
                                        // var getCommission = parseFloat(totlaCommission) * 10 / 100;
                                        var updateData = {
                                            scanEndTime: endDate,
                                            creditAmount: getCommission,
                                            totalTran: newItemCost.length
                                        };
                                        console.log(updateData);

                                      comman.sp_offer_kaiKiliWalletUpdate(sp_id, sp_name, "00", "Kaikili Marketing Credit", "Kaikili Marketing Credit = Total Commission "+parseFloat(totlaCommission)+" 10% Give ("+getCommission+ ") Kaikili Credit to Sp", getCommission, 0, "Credit");
                                        var collectionSPMaer = db.db(config.dbName).collection(config.collections.sp_marketing_info);
                                        collectionSPMaer.updateOne({sp_id: sp_id}, {$set: updateData}, function (err, dataSet) {
                                            if (err) {
                                                var status = {
                                                    status: 0,
                                                    message: "Failed !. Server Error....."
                                                };
                                                // console.log(status);
                                                callback(status);
                                            } else {
                                                var status = {
                                                    status: 1,
                                                    message: "Successfully data",
                                                };
                                                callback(status);
                                            }
                                        });
                                    }
                                });
                            }

                        });
                    })
                        ;
                    }
                }
            else
                {
                    var status = {
                        status: -1,
                        message: "Login in other mobile",
                    };
                    callback(status);
                }
            }
        );
    },


    updateSPProfileDataUpload: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var email = req.body.email;
                console.log(email + "  ----1111");
                var addWorkInfo = {
                    "first_name": req.body.first_name,
                    "last_name": req.body.last_name,
                    "email": req.body.email,
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
                    collectionSP.find({email: email}).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            console.log(docs.length + "  ----222");
                            if (docs.length == 0) {
                                collectionSP.update({sp_id: sp_id}, {$set: addWorkInfo}, function (err, records) {
                                    if (err) {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed !. Server Error....."
                                        };
                                        console.log(status);
                                        callback(status);
                                    } else {
                                        var status = {
                                            status: 1,
                                            message: "Successfully updated",
                                        };
                                        console.log(status);
                                        callback(status);
                                    }
                                });
                            } else if (docs.length == 1) {
                                if (docs[0].sp_id == sp_id) {
                                    collectionSP.update({sp_id: sp_id}, {$set: addWorkInfo}, function (err, records) {
                                        if (err) {
                                            console.log(err);
                                            var status = {
                                                status: 0,
                                                message: "Failed !. Server Error....."
                                            };
                                            console.log(status);
                                            callback(status);
                                        } else {
                                            var status = {
                                                status: 1,
                                                message: "Successfully updated",
                                            };
                                            console.log(status);
                                            callback(status);
                                        }
                                    });

                                } else {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Already this email id register."
                                    };
                                    console.log(status);
                                    callback(status);
                                }
                            }
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

//5-12-2019 rating List

    getUserRatingDataCU: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.getSPtoCustomerRating(sp_id, function (result) {
                    var status = {
                        status: 1,
                        message: "Successfully data getting",
                        data: result
                    };
                    console.log(status);
                    callback(status);

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


// 6-12-2019 Otp Check Api
    OtpCheckProfile: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        var otp = req.body.otp;
        console.log(mobile_no);
        console.log(otp);

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_otp);
            collectionSP.findOne({mobile_no: mobile_no}, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    // console.log(status);
                    callback(status);
                } else {
                    if (docs == null) {
                        var status = {
                            status: 0,
                            message: "Failed !. Server Error....."
                        };
                        // console.log(status);
                        callback(status);
                    } else {
                        // console.log(docs);
                        if (docs.otp == otp) {
                            var status = {
                                status: 1,
                                message: "Successfully information getting",
                            };
                            // console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);
                        }
                    }
                }
            });
        });
    },


// 10-12-2019 Add Contact US
    contactUsInsert: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                comman.contactUsInsert(req.body.post_user_id, req.body.comment, req.body.topic, function (getData) {
                    callback(getData);
                });

                // comman.getNextSequenceUserID("contact_req", function (result) {
                //     //  console.log(result);
                //     var newPost = {
                //         con_id: "CONTACT0" + result,
                //         post_user_id: req.body.post_user_id,
                //         comment: req.body.comment,
                //         topic: req.body.topic,
                //         admin_view: 0,
                //         admin_replay: 0,
                //         admin_favourite: 0,
                //         is_deleted: 0,
                //         creationDate: new Date().toUTCString(),
                //         admin_replay_date: "",
                //         admin_replay_ms: ""
                //     };
                //     mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //         var collectionSP = db.db(config.dbName).collection(config.collections.contact_req);
                //         collectionSP.insert(newPost, function (err, dataSet) {
                //             if (err) {
                //                 console.log(err);
                //                 var status = {
                //                     status: 0,
                //                     message: "Failed !. Server Error....."
                //                 };
                //                 console.log(status);
                //                 callback(status);
                //             } else {
                //                 var status = {
                //                     status: 1,
                //                     message: "Successfully add information",
                //                     data: dataSet
                //                 };
                //                 console.log(status);
                //                 callback(status);
                //             }
                //         });
                //     });
                // });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    // add sp Du
    SPdisputeInsert: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.getNextSequenceUserID("dispute_id", function (result) {
                    //  console.log(result);
                    var newPost = {
                        dispute_id: "DIS0" + result,
                        sp_id: req.body.sp_id,
                        comment: req.body.comment,
                        dispute_cat : req.body.type,
                        tr_id: req.body.tran_id,
                        admin_view: 0,
                        admin_replay: 0,
                        admin_favourite: 0,
                        is_deleted: 0,
                        admin_replay_date: "",
                        admin_replay_comment: "",
                        creationDate: new Date().toUTCString()
                    };
                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collectionSP = db.db(config.dbName).collection(config.collections.sp_dispute);
                        collectionSP.insert(newPost, function (err, dataSet) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                console.log(status);
                                callback(status);
                            } else {
                                var status = {
                                    status: 1,
                                    message: "Successfully add information",
                                    //data: dataSet
                                };
                                console.log(status);
                                callback(status);
                            }
                        });
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    // Get Data Dispute 18 -12-2019
    SPdisputeRead: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(req.body.tran_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_dispute);
                    collectionSP.find({
                        tr_id: req.body.tran_id,
                        sp_id: req.body.sp_id
                    }).toArray(function (err, dataSet) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Successfully get information",
                                data: dataSet
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    getKaikiliNotificationData: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.admin_notification);
                    var mysort = {_id: -1};
                    collectionSP.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },


    getKaikiliCreditData: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_kaikili_wallet);
                    var mysort = {_id: -1};
                    collectionSP.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },


    getAdminNotificationInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        var no_id = req.body.no_id;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.admin_notification);
                    collectionSP.findOne({no_id: no_id}, function (err, dataSet) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Successfully data getting",
                                data: dataSet
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });
    },

}
module.exports = Users;