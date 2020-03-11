var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var bcrypt = require('bcrypt');
var uuidAPIKey = require('uuid-apikey');


var Customer = {

    //API - 1
    // Create new Customer Api
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
                cu_image: req.body.cu_image,
                avg_rating: req.body.avg_rating,
                service_count: req.body.service_count,
                search_show: req.body.search_show,
                fcm_token: req.body.fcm_token,
                creationDate: new Date().toUTCString(),
                login_key: uuidAPIKey.create().apiKey
            };

            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
                collectionCU.find({email: req.body.email}).toArray(function (err, docs) {
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
                                            message: "Failed !. Server Error....."
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

    //API - 2
    //Mobiel No to Check User are are there
    checkCUUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        var fcm_token = req.body.fcm_token;

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.findOne({mobile_no: mobile_no}, function (err, docs) {
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
                    // if (docs.length == 1) {
                    var upload = {
                        fcm_token: fcm_token,
                        login_key: uuidAPIKey.create().apiKey
                    };


                    collectionSP.updateOne({mobile_no: mobile_no},
                        {$set: upload}, function
                            (err, records) {
                            console.log(records);
                        });


                    if (docs === undefined || docs === null) {
                        var status = {
                            status: 0,
                            message: "No User"
                        };
                    } else {
                        docs.login_key = upload.login_key;
                        var status = {
                            status: 1,
                            message: "Successfully data getting",
                            data: docs
                        };
                    }

                    // } else {
                    //     var status = {
                    //         status: 0,
                    //         message: "No User"
                    //     };
                    // }

                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    //API - 4
    //Customer Login
    CUUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;
        var fcm_token = req.body.fcm_token;

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionCU.find({email: email}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    console.log(status);
                    callback(status);
                } else {
                    console.log(docs);
                    if (docs.length == 1) {

                        bcrypt.compare(password, docs[0].password, function (err, res) {
                            if (res) {

                                collectionCU.updateOne({mobile_no: docs[0].mobile_no},
                                    {$set: {fcm_token: fcm_token, login_key: uuidAPIKey.create().apiKey}}, function
                                        (err, records) {
                                        console.log(records);
                                    });
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


    //API - 3
    CURegiCheck: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var checkCU = {
                    cu_personal: false,
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });

    },


    //API - 5
    // Add new Address
    addUserAddress: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                //  console.log(result);
                var newAddress = {
                    cu_id: cu_id,
                    title: req.body.title,
                    address: req.body.address,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    creationDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
                    collectionSP.insert(newAddress, function (err, records) {
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
                                message: "Successfully add user address",
                                data: records
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

    //API - 6
    // Get User Address
    userGetAddress: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                console.log(cu_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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
                                message: "Failed !. Server Error....."
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }

        });

    },

    //API - 7
    //Search Service api
    searchServiceProvider: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.cuInterestedServicesAdd(req.body);
                var sr_id = req.body.sr_id;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                var cc_ids = req.body.cc_ids;
                var cost_item = req.body.cost_item;
                console.log(longitude + " --- " + req.body.cc_ids);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                    var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                    var cursorIndex = collection.createIndex({location: "2dsphere"});
                    console.log("----------" + cc_ids);
                    var cursorSearch = collection.aggregate([
                        {
                            $geoNear: {
                                near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                                key: "location",
                                maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                                distanceField: "dist", //give values in metre
                                query: {services: sr_id, cost_comps: {$all: cc_ids}}//{services: sr_id}// cost_comps: cc_ids
                            }
                        }]);


                    cursorSearch.toArray(function (err, mainDocs) {
                        // console.log(mainDocs.length + "----------size");
                        if (err) {
                            console.log(err + "----err");
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {

                            var newArrData = new Array();
                            var ctr = 0;
                            var newArrServic = new Array();
                            var newPreferredArrServic = new Array();
                            var newPreferredArrData = new Array();


                            if (mainDocs.length > 0) {
                                mainDocs.forEach(function (element) {
                                    var newRadius = element.radius * 1609.34;
                                    // var newRadius = 100;
                                    console.log(parseFloat(element.dist) + " <= " + parseFloat(newRadius));
                                    if (parseFloat(element.dist) <= parseFloat(newRadius)) {

                                        newArrData.push(element.sp_id);
                                        var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                                        collection.aggregate([
                                            {$match: {sp_id: element.sp_id, sr_id: sr_id}},//,fcm_token:{$ne :""} ,login_key :{$ne :""}
                                            {
                                                $lookup: {
                                                    from: config.collections.sp_sr_profile,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "userprofile"
                                                }
                                            },
                                            {
                                                $unwind: "$userprofile"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.sp_personal_info,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "profile"
                                                }
                                            }, {
                                                $unwind: "$profile"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.add_services,
                                                    localField: "sr_id",
                                                    foreignField: "sr_id",
                                                    as: "services"
                                                }
                                            }, {
                                                $unwind: "$services"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.cu_sp_review,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "reviewCount"
                                                }
                                                // }, {
                                                //    $unwind: "$reviewCount"
                                            }
                                        ]).toArray(function (err, docs) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(docs);

                                                var isProviderAvailabel = false;
                                                if (docs[0].userprofile.working_hours_24_7 == "ON") {
                                                    isProviderAvailabel = true;
                                                } else {
                                                    comman.checkServiceProviderAvailability(req.body.date, req.body.time, docs[0].userprofile.custom_work_per_day, function (resultTime) {
                                                        isProviderAvailabel = resultTime;
                                                    });
                                                }

                                                // var children = docs[0].cost_comps_per_item_on.concat(docs[0].cost_comps_pro_rate_on);
                                                var children = docs[0].cost_components_on;
                                                var newItemCost = new Array();
                                                var totalCost = 0;
                                                cost_item.forEach(function (element) {
                                                    var picked = children.filter(function (value) {
                                                        return value.cc_id == element.cc_id;
                                                    })
                                                    var cost = (parseFloat(picked[0].cc_rate_per_item) * parseFloat(element.cc_per_item_qut));
                                                    // console.log(cost +"--------"+ picked[0].cc_rate_per_item+" ---  "+ element.cc_per_item_qut);
                                                    totalCost = totalCost + cost;
                                                    var dataCostItem = {
                                                        cc_id: element.cc_id,
                                                        cc_cu_title: element.cc_cu_title,
                                                        show_order: element.show_order,
                                                        cc_sp_title: element.cc_sp_title,
                                                        hcc_id: picked[0].hcc_id,
                                                        hcc_title: picked[0].hcc_title,
                                                        cc_per_item_qut: element.cc_per_item_qut,
                                                        cc_per_item_rate: picked[0].cc_rate_per_item,
                                                        cc_per_item_cost: cost,
                                                    };
                                                    newItemCost.push(dataCostItem);

                                                });
                                                // console.log("******");
                                                var discountGive = 0;
                                                if (docs[0].discount.ds_check_box == "ON") {
                                                    discountGive = docs[0].discount.ds_rate_per_item;
                                                }

                                                if (docs[0].preferred_provider == "1" && docs[0].profile.fcm_token != "" && docs[0].profile.login_key != "" && docs[0].profile.onlineStatus) {
                                                    if (isProviderAvailabel) {
                                                        newPreferredArrServic.push(docs[0].sp_id);
                                                        var ppsData = {
                                                            sp_id: docs[0].sp_id,
                                                            dist: element.dist,
                                                        }
                                                        newPreferredArrData.push(ppsData);
                                                    }
                                                }

                                                var discountAmount = (totalCost * parseFloat(discountGive)) / 100;
                                                var discountAfterPrice = totalCost - discountAmount;
                                                var dataShow = {
                                                    sp_id: docs[0].sp_id,
                                                    minimum_charge: docs[0].minimum_charge,
                                                    totalCost: totalCost,
                                                    kaikili_commission: docs[0].services.sr_commission,
                                                    itemCost: newItemCost,
                                                    discountGive: discountGive,
                                                    discountAfterPrice: discountAfterPrice,
                                                    dist: element.dist,
                                                    sp_about: docs[0].userprofile.about_sp_profile,
                                                    sp_workImage: docs[0].userprofile.workImages,
                                                    avg_response: docs[0].userprofile.avg_response,
                                                    service_count: docs[0].userprofile.service_count,
                                                    avg_rating: docs[0].userprofile.avg_rating,
                                                    sp_image: docs[0].userprofile.profile_image,
                                                    sp_service_area: docs[0].userprofile.service_area,
                                                    sp_coordinatePoint: docs[0].userprofile.coordinatePoint,
                                                    sp_first_name: docs[0].profile.first_name,
                                                    sp_last_name: docs[0].profile.last_name,
                                                    sp_mobile_no: docs[0].profile.mobile_no,
                                                    professional_license: docs[0].userprofile.professional_license,
                                                    professional_insurance: docs[0].userprofile.professional_insurance,
                                                    preferred_provider: docs[0].preferred_provider,
                                                    reviewCount: docs[0].reviewCount.length

                                                };

                                                if (isProviderAvailabel && docs[0].profile.fcm_token != "" && docs[0].profile.login_key != "" && docs[0].profile.onlineStatus) {
                                                    newArrServic.push(dataShow);
                                                }
                                                ctr++;
                                                if (ctr === mainDocs.length) {
                                                    comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                                        console.log("------length >" + result.length);
                                                        var status = {
                                                            status: 1,
                                                            message: "Success Get all Transition service list",
                                                            post_data: req.body,
                                                            data: newArrServic,
                                                            preferred_provider: newPreferredArrServic,
                                                            pps_data: newPreferredArrData,
                                                            preferred_data: result

                                                        };
                                                        callback(status);
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        ctr++;
                                        if (ctr === mainDocs.length) {
                                            comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                                console.log("------length >" + result.length);

                                                var status = {
                                                    status: 1,
                                                    message: "Success Get all Transition service list",
                                                    data: newArrServic,
                                                    preferred_provider: newPreferredArrServic,
                                                    pps_data: newPreferredArrData,
                                                    preferred_data: result
                                                };
                                                callback(status);
                                            });
                                        }
                                    }
                                });
                            } else {
                                comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                    console.log("------length >" + result.length);

                                    var status = {
                                        status: 1,
                                        message: "Success Get all service list",
                                        data: newArrServic,
                                        preferred_provider: newPreferredArrServic,
                                        pps_data: newPreferredArrData,
                                        preferred_data: result
                                    };
                                    callback(status);
                                });
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

    //API - 8
    // Search Provider List
    searchServiceProviderNew: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var sr_id = req.body.sr_id;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                var cc_ids = req.body.cc_ids;
                var cost_item = req.body.cost_item;
                console.log(sr_id + " --- " + req.body.cc_ids);
                comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                    console.log("------length >" + result.length);

                    var status = {
                        status: 1,
                        message: "Success Get all service list",
                        data: result
                    };
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


    //API - 11
    // Creat New Service Alert
    CheckServiceAlertData: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var sr_id = req.body.sr_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
                    var query = {sr_id: sr_id, cu_id: cu_id};
                    collectionSP.find(query).toArray(function (err, doc) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error.....",
                                data: 0
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            console.log("---->" + doc.length);
                            if (doc.length > 0) {
                                var status = {
                                    status: 1,
                                    message: "Success Get all service list",
                                    data: doc.length,
                                    cp_alert_id: doc[0].cp_alert_id
                                };
                                callback(status);
                            } else {
                                var status = {
                                    status: 1,
                                    message: "Success Get all service list",
                                    data: 0,
                                    cp_alert_id: ""
                                };
                                callback(status);
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


    //API - 12
    // Add new Service Alert
    addServiceAlertData: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cp_alert_id_old = req.body.cu_alert_id;
                // console.log(req.body.cu_alert_id);
                comman.getNextSequenceUserID("cu_alert_id", function (result) {
                    //  console.log(result);

                    comman.getCustomerData(req.body.cu_id, function (CU_data) {
                        var newServiceAlert = {
                            cp_alert_id: "CP-ALERT0" + result,
                            comment: req.body.comment,
                            address: req.body.address,
                            sr_id: req.body.sr_id,
                            sr_title: req.body.sr_title,
                            cost_item: req.body.cost_item,
                            cu_id: req.body.cu_id,
                            cu_first_name: CU_data.first_name,
                            cu_last_name: CU_data.last_name,
                            mobile_no: CU_data.mobile_no,
                            cc_ids: req.body.cc_ids,
                            sr_type: req.body.sr_type,
                            type_of_service: req.body.type_of_service,

                            location: {
                                coordinates: [parseFloat(req.body.coordinatePoint.longitude), parseFloat(req.body.coordinatePoint.latitude)],
                                type: "Point"
                            },
                            alert_active: req.body.alert_active,
                            creationDate: new Date().toUTCString()
                        };

                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                            var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);

                            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_deleted_alert_data);
                            var bulkRemove = db.db(config.dbName).collection(config.collections.cu_service_alert);

                            collectionSP.insert(newServiceAlert, function (err, records) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {

                                    if (req.body.cu_alert_id != null) {

                                        bulkRemove.find({cp_alert_id: req.body.cu_alert_id}).forEach(
                                            function (doc) {
                                                bulkInsert.insertOne(doc);
                                                bulkRemove.removeOne({cp_alert_id: req.body.cu_alert_id});
                                            }
                                        )

                                        var status = {
                                            status: 1,
                                            message: "Successfully add your Service alert override information are store.",
                                            // data: records
                                        };
                                        callback(status);

                                    } else {
                                        var status = {
                                            status: 1,
                                            message: "Successfully add your Service alert information are store.",
                                            // data: records
                                        };
                                        console.log(status);
                                        callback(status);
                                    }
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


    // addServiceAlertData: function (req, callback) {
    //     var cp_alert_id_old = req.body.cp_alert_id;
    //     // if (cp_alert_id != null) {
    //     //     comman.DeletedAlertService(req.body.cp_alert_id, function (result) {
    //     //         console.log(result);
    //     //     });
    //     // }
    //
    //
    //     comman.getNextSequenceUserID("cu_alert_id", function (result) {
    //         //  console.log(result);
    //
    //         comman.getCustomerData(req.body.cu_id, function (CU_data) {
    //
    //             var newServiceAlert = {
    //                 cp_alert_id: "CP-ALERT0" + result,
    //                 comment: req.body.comment,
    //                 address: req.body.address,
    //                 sr_id: req.body.sr_id,
    //                 sr_title: req.body.sr_title,
    //                 cost_item: req.body.cost_item,
    //                 cu_id: req.body.cu_id,
    //                 cu_first_name: CU_data.first_name,
    //                 cu_last_name: CU_data.last_name,
    //                 mobile_no: CU_data.mobile_no,
    //                 cc_ids: req.body.cc_ids,
    //                 sr_type: req.body.sr_type,
    //                 type_of_service: req.body.type_of_service,
    //
    //                 location: {
    //                     coordinates: [parseFloat(req.body.coordinatePoint.longitude), parseFloat(req.body.coordinatePoint.latitude)],
    //                     type: "Point"
    //                 },
    //                 alert_active: req.body.alert_active,
    //                 creationDate: new Date().toUTCString()
    //             };
    //             mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
    //                 var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
    //                 // collectionSP.insert(newServiceAlert, function (err, records) {
    //                 //     if (err) {
    //                 //         console.log(err);
    //                 //         var status = {
    //                 //             status: 0,
    //                 //             message: "Failed !. Server Error....."
    //                 //         };
    //                 //         console.log(status);
    //                 //         callback(status);
    //                 //     } else {
    //
    //                         if (cp_alert_id_old != null) {
    //                             comman.deletedAlertService(req.body.cp_alert_id, function (resultDelete) {
    //                                 console.log(resultDelete);
    //
    //                                 // var status = {
    //                                 //     status: 1,
    //                                 //     message: "Successfully add your Service alert information are store.",
    //                                 //     // data: records
    //                                 // };
    //                                 // console.log(status);
    //                                 callback(resultDelete);
    //                             });
    //                         }else {
    //                             var status = {
    //                                 status: 1,
    //                                 message: "Successfully add your Service alert information are store.",
    //                                 // data: records
    //                             };
    //                             console.log(status);
    //                             callback(status);
    //                         }
    //             //         }
    //             //     });
    //             });
    //
    //         });
    //     });
    // },

    //API - 10
    // Search Quote Provider
    searchQuoteProvider: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var sr_id = req.body.sr_id;
                comman.getNextSequenceUserID("qr_service", function (result) {
                    var newQuoteRequirement = {
                        qr_id: "QR0" + result,
                        cu_id: req.body.cu_id,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                        address: req.body.address,
                        quote_requirement: req.body.quote_requirement,
                        sr_id: req.body.sr_id,
                        sr_name: req.body.sr_name,
                        time: req.body.time,
                        date: req.body.date,
                        type_of_service: req.body.type_of_service,
                        creationDate: new Date().toUTCString()
                    };

                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collection = db.db(config.dbName).collection(config.collections.cu_quote_request);
                        collection.insert(newQuoteRequirement, function (err, records) {
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
                                    message: "Successfully add user address",
                                    data: records
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


    //API - 13
    //Service Book
    serviceBookUser: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var otp = "";
                console.log(req.body.service_book_type + "----");
                comman.getNextSequenceUserID("tr_service", function (result) {
                    //  console.log(result);
                    var tran_id = "TR0" + result;
                    var newBookServiceUser = {
                        tran_id: "TR0" + result,
                        address: req.body.address,
                        comment: req.body.comment,
                        sr_id: req.body.sr_id,
                        type_of_service: req.body.type_of_service,
                        sr_title: req.body.sr_title,
                        time: req.body.time,
                        date: req.body.date,
                        bookingDateTime: req.body.bookingDateTime,
                        cust_id: req.body.cust_id,
                        cust_first_name: req.body.cust_first_name,
                        cust_last_name: req.body.cust_last_name,
                        sp_first_name: req.body.sp_first_name,
                        sp_Last_name: req.body.sp_Last_name,
                        sp_id: req.body.sp_id,
                        sp_image: req.body.sp_image,
                        sr_status: req.body.sr_status,
                        txn_status: req.body.txn_status,
                        totalCost: req.body.totalCost,
                        itemCost: req.body.itemCost,
                        last_cancel_tran_id: req.body.last_cancel_tran_id,
                        last_cancel_sp_id: req.body.last_cancel_sp_id,
                        re_book: req.body.re_book,
                        minimum_charge: req.body.minimum_charge,
                        discount: req.body.discount,
                        repeatedDiscountGive: req.body.repeatedDiscountGive,
                        kaikili_commission: req.body.kaikili_commission,
                        sr_type: req.body.sr_type,
                        sr_total: req.body.sr_total,
                        sp_net_pay: req.body.sp_net_pay,
                        coordinatePoint: req.body.coordinatePoint,
                        cp_review: req.body.cp_review,
                        sp_review: req.body.sp_review,
                        distance: req.body.distance,
                        sp_service_area: req.body.sp_service_area,
                        creationDate: new Date().toUTCString(),
                        sp_view: false,
                        coupon_code: req.body.coupon_code,
                        coupon_apply: req.body.coupon_apply,
                        coupon_code_discount_amount: req.body.coupon_code_discount_amount,
                        otp: comman.getRandomInt(9999),
                        service_book_type: req.body.service_book_type
                    };

                    var notificationData = {
                        tran_id: "TR0" + result,
                        sr_id: req.body.sr_id,
                        sr_title: req.body.sr_title,
                        time: req.body.time,
                        date: req.body.date,
                        cust_id: req.body.cust_id,
                        cust_first_name: req.body.cust_first_name,
                        cust_last_name: req.body.cust_last_name,
                        sp_first_name: req.body.sp_first_name,
                        sp_Last_name: req.body.sp_Last_name,
                        sp_id: req.body.sp_id,
                        sp_image: req.body.sp_image,
                        creationDate: new Date().toISOString(),
                        messages: []
                    };

                    var coupon_used = {
                        tran_id: "TR0" + result,
                        pps_id: "",
                        cu_id: req.body.cust_id,
                        cu_pay: req.body.sp_net_pay,
                        coupon_code: req.body.coupon_code,
                        coupon_code_discount_amount: req.body.coupon_code_discount_amount,
                    };

                    comman.cuInterestedRemoveBookServicesData(req.body.sr_id, req.body.itemCost, req.body.cust_id, req.body.coordinatePoint.latitude, req.body.coordinatePoint.longitude);

                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var cu_used_coupon_code = db.db(config.dbName).collection(config.collections.cu_used_coupon_code);
                        var collectionCU = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                        collectionCU.insert(newBookServiceUser, function (err, records) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                console.log(status);
                                callback(status);
                            } else {

                                if (req.body.coupon_apply) {
                                    cu_used_coupon_code.insertOne(coupon_used);
                                }

                                if (req.body.sr_status == "Scheduled") {
                                    comman.kaikiliWalletCreditCustomerAmount("TR0" + result);
                                }


                                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                collectionNotification.insert(notificationData, function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Update in Notification");
                                        // console.log(docs);
                                    }
                                });

                                var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                req.body.last_cancel_tran_id.forEach(function (element) {
                                        collectionSP.update({tran_id: element}, {$set: {re_book: "true"}});
                                    }
                                );

                                var message = "Customer Create New Service"
                                comman.sendServiceNotification(req.body.sp_id, tran_id, message, req.body.sr_status, "tran");

                                var status = {
                                    status: 1,
                                    message: "Successfully add new service",
                                    data: records


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


    //API - 14
    // remove Address
    removeUserAddress: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                //  console.log(result);
                // var cu_id = req.body.cu_id;
                var id = req.body.id;
                console.log("----------" + id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
                    collectionSP.deleteOne({
                        "cu_id": cu_id,
                        "_id": mongoose.Types.ObjectId(id)
                    }, function (err, records) {
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
                                message: "Successfully remove address",
                                data: records
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


    //API - 15
    // Get Transition
    getCustomerTransition: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var cust_id = cu_id
                console.log(cust_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var mysort = {updateDate: -1};
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    var collectionQuote = db.db(config.dbName).collection(config.collections.cu_quote_request);
                    var collectionAlert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                    var collectionInterested = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
                    var collectionPPS = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                    collection.find({cust_id: cust_id, cp_review: "false"}).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            collectionQuote.find({cu_id: cust_id}).sort({creationDate: -1}).toArray(function (err, docsQuote) {

                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    // console.log(status);
                                    callback(status);

                                } else {
                                    collectionAlert.find({
                                        cu_id: cust_id, sr_status: "Open"
                                    }).sort({creationDate: -1}).toArray(function (err, shoutingData) {

                                        collectionInterested.find({
                                            cu_id: cust_id, sr_status: "Open"
                                        }).sort({creationDate: -1}).toArray(function (err, interestedData) {

                                            collectionPPS.find({cust_id: cust_id}).sort(mysort).toArray(function (err, docspps) {

                                                collectionInterested

                                                var status = {
                                                    status: 1,
                                                    message: "Success Get all Transition service to Mongodb",
                                                    data: docs,
                                                    dataQuote: docsQuote,
                                                    shoutingData: shoutingData,
                                                    docspps: docspps,
                                                    interestedData: interestedData,
                                                };
                                                callback(status);
                                            });
                                        });
                                    });
                                }
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


    //API - 16
    // Get Customer Alert list
    getCustomerAlertTransition: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                // var cu_id = req.body.cu_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var mysort = {creationDate: -1};
                    var collection = db.db(config.dbName).collection(config.collections.cu_service_alert);
                    collection.find({cu_id: cu_id}).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            var status = {
                                status: 1,
                                message: "Success get all alert service to Mongodb",
                                data: docs,
                            };
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


    //API - 17
    // 27-5-2019 created Api (Customer Shouting activated/deactivated update)
    customerAlertInfoUpdate: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cp_alert_id = req.body.cp_alert_id;
                var cu_id = req.body.cu_id;
                var alert_active = req.body.alert_active;
                console.log("-----" + alert_active);
                var updateTran = {
                    alert_active: alert_active
                };

                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
                    collectionSP.updateOne({
                        cp_alert_id: cp_alert_id,
                        cu_id: cu_id
                    }, {$set: updateTran}, function (err, records) {
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
                                message: "Successfully update shouting activity.",
                                data: records
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


    //API - 18
    // 27-5-2019 created Api (Customer Shouting delete Api)
    customerAlertInfoDelete: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var cp_alert_id = req.body.cp_alert_id;
                // var alert_active = req.body.alert_active;
                comman.deletedAlertService(cp_alert_id, function (resultTime) {
                    console.log(resultTime);
                    callback(resultTime);
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
        // // DeletedAlertService
        //
        // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
        //     var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
        //     collectionSP.deleteOne({
        //         cp_alert_id: cp_alert_id,
        //         cu_id: cu_id
        //     }, function (err, records) {
        //         if (err) {
        //             console.log(err);
        //             var status = {
        //                 status: 0,
        //                 message: "Failed !. Server Error....."
        //             };
        //             console.log(status);
        //             callback(status);
        //         } else {
        //             var status = {
        //                 status: 1,
        //                 message: "Successfully remove shouting data.",
        //                 data: records
        //             };
        //             console.log(status);
        //             callback(status);
        //         }
        //     });
        // });
    },


    //API - 19
    // 27-5-2019 created Api (Customer Rescheduled job data getting api)
    customerRescheduledTransitionData: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var cust_id = req.body.cust_id;
                var tran_id = req.body.tran_id;

                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_reschedule);
                    collectionSP.findOne({
                        tran_id: tran_id,
                        cust_id: cust_id
                    }, function (err, records) {
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
                                message: "Successfully getting information.",
                                data: records
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


    //API - 20
    // 27-5-2019 created Api (Customer Rescheduled job data updating)
    customerRescheduledTransitionUpdateData: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cust_id = cu_id
                var tran_id = req.body.tran_id;
                var time = req.body.time;
                var date = req.body.date;
                var bookingDateTime = req.body.bookingDateTime;
                var updateTran = {
                    time: time,
                    date: date,
                    bookingDateTime: bookingDateTime,
                    sr_status: "Scheduled"
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    collectionSP.updateOne({
                        tran_id: tran_id,
                        cust_id: cust_id
                    }, {$set: updateTran}, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            collectionSP.find({tran_id: tran_id}).toArray(function (err, docs) {
                                console.log(docs);
                                var message = "Customer accept rescheduled date."
                                comman.kaikiliWalletCreditCustomerAmount(docs[0].tran_id);
                                comman.sendServiceNotification(docs[0].sp_id, tran_id, message, "Scheduled", "tran");
                            });
                            var status = {
                                status: 1,
                                message: "Successfully getting information.",
                                data: records
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


    //API - 21
    // 27-5-2019 created Api (Customer Shouting SR status update)
    customerShoutingUpdateData: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cp_alert_id = req.body.cp_alert_id;
                var sr_status = req.body.sr_status;
                var cu_id = req.body.cu_id;
                var sp_cp_alert_send_id = req.body.sp_cp_alert_send_id;
                var updateTran = {
                    sr_status: sr_status,
                    updateDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                    collectionSP.updateOne({
                        cp_alert_id: cp_alert_id,
                        cu_id: cu_id,
                        sp_cp_alert_send_id: sp_cp_alert_send_id
                    }, {$set: updateTran}, function (err, records) {
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
                                message: "Successfully update information.",
                                data: records
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


    //API - 23
    // 28-5-2019 created Api (Customer to give review )
    customerAddToServiceReview: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var tran_id = req.body.tran_id;
                var reviewAdd = {
                    cust_id: cu_id,
                    sp_id: req.body.sp_id,
                    tran_id: req.body.tran_id,
                    sr_id: req.body.sr_id,
                    rating: req.body.rating,
                    comment: req.body.comment,
                    review_image: [],
                    creationDate: new Date().toUTCString()
                };
                var updateTran = {
                    cp_review: "true",
                };

                if (req.body.tip_amount > 0) {

                    comman.CreditCustomerTipAmount(req.body.tran_id, req.body.tip_amount);
                }
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.cu_sp_review);
                    collectionPaymentSettlement.insertOne(reviewAdd, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            // var status = {
                            //     status: 1,
                            //     message: "Thank you fore review."
                            // };

                            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                            collection.updateOne({tran_id: tran_id}, {$set: updateTran}, function (err, docs) {

                                if (err) {
                                    console.log(err);
                                } else {
                                    var cursorRating = collectionPaymentSettlement.aggregate([
                                        {$match: {sp_id: req.body.sp_id}},
                                        {
                                            $group: {
                                                _id: "_id",
                                                rating: {$avg: "$rating"}
                                            }
                                        }
                                    ]);
                                    cursorRating.toArray(function (err, docs) {
                                        console.log(docs[0]);

                                        console.log("avg  ---" + docs[0].rating);
                                        console.log("avg  ---" + docs[0].rating);
                                        var updateRating = {
                                            avg_rating: docs[0].rating,
                                        };
                                        var spProfileUpdate = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                                        spProfileUpdate.updateOne({sp_id: req.body.sp_id}, {$set: updateRating}, function (err, docs) {
                                            var status = {
                                                status: 1,
                                                message: "Thank you for review."
                                            };

                                            console.log();
                                            callback(status);

                                        });
                                    });
                                    console.log();
                                    // callback(status);
                                }
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


    //API - 24
    // 28-5-2019 created Api (Customer transaction history )
    customerCompletedService: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                // var cu_id = req.body.cu_id;
                console.log(cu_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                    var mysort = {updateDate: 1};
                    var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    var cancellation = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                    var collectionPPS = kdb.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                    console.log(err);
                    collection.find({
                        cust_id: cu_id,
                        sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed", "Cancel-New-Auto", "Cancel-Scheduled-Auto"]}
                    }).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {


                            cancellation.find({
                                cust_id: cu_id,
                                sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed", "Cancel-New-Auto", "Cancel-Scheduled-Auto"]}
                            }).sort(mysort).toArray(function (err, docs1) {
                                if (err) {
                                    if (docs.length > 0) {
                                        var status = {
                                            status: 1,
                                            message: "Success Get all Transition service list",
                                            data: docs
                                        };
                                        callback(status);
                                    } else {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed !. Server Error....."
                                        };
                                        callback(status);
                                        // console.log(status);
                                    }

                                } else {
                                    var listData = docs.concat(docs1);
                                    collectionPPS.find({
                                        cust_id: cu_id,
                                        sr_status: {$in: ["Cancel-New-Cp", "Cancel-New-Auto"]}
                                    }).toArray(function (err, docspps) {

                                        if (err) {
                                            var status = {
                                                status: 1,
                                                message: "Success Get all Transition service list",
                                                data: listData,
                                                ppsData: []
                                            };
                                            callback(status);
                                        } else {
                                            var status = {
                                                status: 1,
                                                message: "Success Get all Transition service list",
                                                data: listData,
                                                ppsData: docspps
                                            };
                                            callback(status);
                                        }
                                    });
                                }
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


    //API - 25
    // 1-6-2019 created Api (Customer Shouting SR status update)
    getCustomerData: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                console.log(req.body.cu_id);
                var cu_id = req.body.cu_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
                    collectionSP.findOne({cu_id: cu_id}, function (err, records) {
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
                                message: "Successfully update information.",
                                data: records
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


    //API - 26
    //Transition Update
    customerTransitionUpdate: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var dateNew1 = req.body.dateNew1;
                var timeNew1 = req.body.timeNew1;
                var timeNew2 = req.body.timeNew2;
                var dateNew2 = req.body.dateNew2;

                var serviceUpdate = {
                    sr_status: req.body.sr_status,
                    updateDate: new Date().toUTCString()
                };

                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

                    // Update service record
                    collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
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
                                message: "Success upload to service to server",
                                data: docs
                            };


                            collection.find({tran_id: tran_id}).toArray(function (err, findRecord) {

                                console.log(err + " ------- findRecord");
                                console.log(findRecord.length + " ------- findRecord");

                                var message = ""
                                if (req.body.sr_status == "Progress") {
                                    message = "Customer provider on way.";
                                } else if (req.body.sr_status == "Cancel-New-Cp") {
                                    message = "Customer provider to cancel job.";
                                } else if (req.body.sr_status == "Scheduled") {
                                    message = "Customer provider accept your job.";
                                } else if (req.body.sr_status == "Cancel-Scheduled-Cp") {
                                    message = "Customer provider Cancelled your job.";
                                    comman.cuServiceCancellationCharges(findRecord[0]);
                                }

                                if (req.body.sr_status == "Progress" || req.body.sr_status == "Scheduled") {
                                    comman.sendServiceNotification(findRecord[0].sp_id, tran_id, message, req.body.sr_status, "tran");
                                }


                                var messagesBody = {
                                    author: findRecord[0].sp_id,
                                    author_type: "SP",
                                    sp_delet: "0",
                                    cu_delte: "0",
                                    sp_read: "0",
                                    cu_read: "0",
                                    created_on: new Date().toISOString(),
                                    body: findRecord[0].sr_status + " - " + findRecord[0].sr_title + " "
                                };

                                var rescheduled = {
                                    sp_id: findRecord[0].sp_id,
                                    sr_id: findRecord[0].sr_id,
                                    cust_id: findRecord[0].cust_id,
                                    tran_id: findRecord[0].tran_id,
                                    date: findRecord[0].date,
                                    time: findRecord[0].time,
                                    dateNew1: dateNew1,
                                    timeNew1: timeNew1,
                                    dateNew2: dateNew2,
                                    timeNew2: timeNew2,
                                    created_on: new Date().toISOString(),
                                };

                                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Update in Notification");
                                        // console.log(docs);
                                    }
                                });

                                if (req.body.sr_status == "Rescheduled") {
                                    var collectionRescheduled = db.db(config.dbName).collection(config.collections.cu_sp_reschedule);
                                    collectionRescheduled.insert(rescheduled, function (err, docs) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Inserted Reschedule data in server");
                                            // console.log(docs);
                                        }
                                    });
                                }


                                //Credit amount in Kaikili Wallet
                                if (req.body.sr_status == "Scheduled") {
                                    comman.kaikiliWalletCreditCustomerAmount(findRecord[0].tran_id);
                                }


                                //Credit amount in Kaikili Wallet
                                if (req.body.sr_status == "Cancel-Scheduled-Cp") {
                                    comman.cuServiceCancellationCharges(findRecord[0]);
                                    comman.kaikiliWalletDebitCustomerAmount(findRecord[0].tran_id, true)
                                }


                                if (req.body.sr_status == "Cancel-New-Cp" || req.body.sr_status == "Cancel-Scheduled-Cp") {
                                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: tran_id});
                                            comman.sendServiceNotification(findRecord[0].sp_id, tran_id, message, req.body.sr_status, "tran");
                                        }
                                    )
                                }

                            });
                            console.log();
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

    //API - 27
    // 11-6-2019 created Api (Customer Shouting single data)
    getCustomerSingleAlertTransition: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var sp_cp_alert_send_id = req.body.sp_cp_alert_send_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                    collectionSP.findOne({
                        sp_cp_alert_send_id: sp_cp_alert_send_id
                    }, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            if (records != null) {
                                var status = {
                                    status: 1,
                                    message: "Successfully update information.",
                                    data: records
                                };
                                console.log(status);
                                callback(status);
                            } else {
                                var status = {
                                    status: 1,
                                    message: "This Service are auto time out. and closed.",
                                    data: []
                                };
                                console.log(status);
                                callback(status);
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

    //API - 9
    //Create new Api ReBook Service 19-6-2019
    reSearchServiceProvider: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var last_cancel_sp_id = req.body.last_cancel_sp_id;
                var sr_id = req.body.sr_id;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                var cc_ids = req.body.cc_ids;
                var cost_item = req.body.cost_item;
                console.log(longitude + " --- " + req.body.cc_ids);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                    var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                    var cursorIndex = collection.createIndex({location: "2dsphere"});
                    console.log("----------" + cc_ids);
                    var cursorSearch = collection.aggregate([
                        {
                            $geoNear: {
                                near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                                key: "location",
                                maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                                distanceField: "dist", //give values in metre
                                query: {services: sr_id, cost_comps: {$all: cc_ids}}//{services: sr_id}// cost_comps: cc_ids
                            }
                        }]);


                    cursorSearch.toArray(function (err, mainDocs) {
                        // console.log(mainDocs.length + "----------size");
                        if (err) {
                            console.log(err + "----err");
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {

                            var newArrData = new Array();
                            var ctr = 0;
                            var newArrServic = new Array();
                            var newPreferredArrServic = new Array();
                            var newPreferredArrData = new Array();

                            if (mainDocs.length > 0) {
                                mainDocs.forEach(function (element) {
                                    var newRadius = element.radius * 1609.34;
                                    // var newRadius = 100;
                                    console.log(parseFloat(element.dist) + " <= " + parseFloat(newRadius));
                                    if (parseFloat(element.dist) <= parseFloat(newRadius)) {

                                        newArrData.push(element.sp_id);
                                        var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                                        collection.aggregate([
                                            {$match: {sp_id: element.sp_id, sr_id: sr_id}},//,fcm_token:{$ne :""} ,login_key :{$ne :""}
                                            {
                                                $lookup: {
                                                    from: config.collections.sp_sr_profile,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "userprofile"
                                                }
                                            },
                                            {
                                                $unwind: "$userprofile"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.sp_personal_info,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "profile"
                                                }
                                            }, {
                                                $unwind: "$profile"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.add_services,
                                                    localField: "sr_id",
                                                    foreignField: "sr_id",
                                                    as: "services"
                                                }
                                            }, {
                                                $unwind: "$services"
                                            }, {
                                                $lookup: {
                                                    from: config.collections.cu_sp_review,
                                                    localField: "sp_id",
                                                    foreignField: "sp_id",
                                                    as: "reviewCount"
                                                }
                                            }

                                        ]).toArray(function (err, docs) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(docs);

                                                var isProviderAvailabel = false;
                                                if (docs[0].userprofile.working_hours_24_7 == "ON") {
                                                    isProviderAvailabel = true;
                                                } else {
                                                    comman.checkServiceProviderAvailability(req.body.date, req.body.time, docs[0].userprofile.custom_work_per_day, function (resultTime) {
                                                        isProviderAvailabel = resultTime;
                                                    });
                                                }

                                                // var children = docs[0].cost_comps_per_item_on.concat(docs[0].cost_comps_pro_rate_on);
                                                var children = docs[0].cost_components_on;
                                                var newItemCost = new Array();
                                                var totalCost = 0;
                                                cost_item.forEach(function (element) {
                                                    var picked = children.filter(function (value) {
                                                        return value.cc_id == element.cc_id;
                                                    })
                                                    var cost = (parseFloat(picked[0].cc_rate_per_item) * parseFloat(element.cc_per_item_qut));
                                                    // console.log(cost +"--------"+ picked[0].cc_rate_per_item+" ---  "+ element.cc_per_item_qut);
                                                    totalCost = totalCost + cost;
                                                    var dataCostItem = {
                                                        cc_id: element.cc_id,
                                                        cc_cu_title: element.cc_cu_title,
                                                        show_order: element.show_order,
                                                        cc_sp_title: element.cc_sp_title,
                                                        hcc_id: picked[0].hcc_id,
                                                        hcc_title: picked[0].hcc_title,
                                                        cc_per_item_qut: element.cc_per_item_qut,
                                                        cc_per_item_rate: picked[0].cc_rate_per_item,
                                                        cc_per_item_cost: cost,
                                                    };
                                                    newItemCost.push(dataCostItem);

                                                });
                                                // console.log("******");
                                                var discountGive = 0;
                                                if (docs[0].discount.ds_check_box == "ON") {
                                                    discountGive = docs[0].discount.ds_rate_per_item;
                                                }

                                                if (docs[0].preferred_provider == "1" && docs[0].profile.fcm_token != "" && docs[0].profile.login_key != "" && docs[0].profile.onlineStatus) {
                                                    if (isProviderAvailabel) {
                                                        newPreferredArrServic.push(docs[0].sp_id);

                                                        var ppsData = {
                                                            sp_id: docs[0].sp_id,
                                                            dist: element.dist,
                                                        }
                                                        newPreferredArrData.push(ppsData);
                                                    }
                                                }

                                                var discountAmount = (totalCost * parseFloat(discountGive)) / 100;
                                                var discountAfterPrice = totalCost - discountAmount;
                                                var dataShow = {
                                                    sp_id: docs[0].sp_id,
                                                    minimum_charge: docs[0].minimum_charge,
                                                    totalCost: totalCost,
                                                    kaikili_commission: docs[0].services.sr_commission,
                                                    itemCost: newItemCost,
                                                    discountGive: discountGive,
                                                    discountAfterPrice: discountAfterPrice,
                                                    dist: element.dist,
                                                    sp_about: docs[0].userprofile.about_sp_profile,
                                                    sp_workImage: docs[0].userprofile.workImages,
                                                    avg_response: docs[0].userprofile.avg_response,
                                                    service_count: docs[0].userprofile.service_count,
                                                    avg_rating: docs[0].userprofile.avg_rating,
                                                    sp_image: docs[0].userprofile.profile_image,
                                                    sp_service_area: docs[0].userprofile.service_area,
                                                    sp_coordinatePoint: docs[0].userprofile.coordinatePoint,
                                                    sp_first_name: docs[0].profile.first_name,
                                                    sp_last_name: docs[0].profile.last_name,
                                                    sp_mobile_no: docs[0].profile.mobile_no,
                                                    professional_license: docs[0].userprofile.professional_license,
                                                    professional_insurance: docs[0].userprofile.professional_insurance,
                                                    preferred_provider: docs[0].preferred_provider,
                                                    reviewCount: docs[0].reviewCount.length

                                                };

                                                if (!last_cancel_sp_id.includes(docs[0].sp_id)) {
                                                    if (isProviderAvailabel && docs[0].profile.fcm_token != "" && docs[0].profile.login_key != "" && docs[0].profile.onlineStatus) {
                                                        newArrServic.push(dataShow);
                                                    }
                                                }


                                                ctr++;
                                                if (ctr === mainDocs.length) {
                                                    comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                                        console.log("------length >" + result.length);
                                                        var status = {
                                                            status: 1,
                                                            message: "Success Get all Transition service list",
                                                            post_data: req.body,
                                                            data: newArrServic,
                                                            preferred_provider: newPreferredArrServic,
                                                            pps_data: newPreferredArrData,
                                                            preferred_data: result

                                                        };
                                                        callback(status);
                                                    });
                                                }
                                            }
                                        });
                                    } else {

                                        ctr++;
                                        if (ctr === mainDocs.length) {
                                            comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                                console.log("------length >" + result.length);

                                                var status = {
                                                    status: 1,
                                                    message: "Success Get all Transition service list",
                                                    data: newArrServic,
                                                    preferred_provider: newPreferredArrServic,
                                                    pps_data: newPreferredArrData,
                                                    preferred_data: result
                                                };
                                                callback(status);
                                            });
                                        }

                                    }
                                });
                            } else {
                                comman.getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, function (result) {
                                    console.log("------length >" + result.length);

                                    var status = {
                                        status: 1,
                                        message: "Success Get all service list",
                                        data: newArrServic,
                                        preferred_provider: newPreferredArrServic,
                                        pps_data: newPreferredArrData,
                                        preferred_data: result
                                    };
                                    callback(status);
                                });
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


    //API - 28
// 21-6-2019 created Api (Customer Book Preferred Provider Service)
    postCustomerBookPreferredProviderService: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                comman.getNextSequenceUserID("pps_id", function (result) {
                    var ppServiceData = {
                        pps_id: "PPS0" + result,
                        address: req.body.address,
                        comment: req.body.comment,
                        sr_id: req.body.sr_id,
                        type_of_service: req.body.type_of_service,
                        sr_title: req.body.sr_title,
                        time: req.body.time,
                        date: req.body.date,
                        bookingDateTime: req.body.bookingDateTime,
                        cust_id: req.body.cust_id,
                        cust_first_name: req.body.cust_first_name,
                        cust_last_name: req.body.cust_last_name,
                        last_cancel_tran_id: req.body.last_cancel_tran_id,
                        last_cancel_sp_id: req.body.last_cancel_sp_id,
                        sr_status: req.body.sr_status,
                        re_book: req.body.re_book,
                        txn_status: req.body.txn_status,
                        minimum_charge: req.body.minimum_charge,
                        totalCost: req.body.totalCost,
                        itemCost: req.body.itemCost,
                        kaikili_commission: req.body.kaikili_commission,
                        sr_type: req.body.sr_type,
                        sr_total: req.body.sr_total,
                        sp_net_pay: req.body.sp_net_pay,
                        coordinatePoint: req.body.coordinatePoint,
                        cp_review: req.body.cp_review,
                        sp_review: req.body.sp_review,
                        sp_show: false,
                        preferredProvider: req.body.preferredProvider,
                        pps_data: req.body.pps_data,
                        coupon_code: req.body.coupon_code,
                        coupon_apply: req.body.coupon_apply,
                        coupon_code_discount_amount: req.body.coupon_code_discount_amount,
                        creationDate: new Date().toUTCString(),

                    };

                    var coupon_used = {
                        tran_id: "",
                        pps_id: "PPS0" + result,
                        cu_id: req.body.cust_id,
                        cu_pay: req.body.sp_net_pay,
                        coupon_code: req.body.coupon_code,
                        coupon_code_discount_amount: req.body.coupon_code_discount_amount,
                    };

                    console.log(req.body.preferredProvider);

                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var cu_used_coupon_code = db.db(config.dbName).collection(config.collections.cu_used_coupon_code);
                        var collectionSP = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                        collectionSP.insertOne(ppServiceData, function (err, records) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                console.log(status);
                                callback(status);
                            } else {

                                var count = 0;
                                req.body.preferredProvider.forEach(function (element) {
                                    var ppr_send_sp = {
                                        pps_id: "PPS0" + result,
                                        sr_id: req.body.sr_id,
                                        sp_id: element,
                                        type_of_service: req.body.type_of_service,
                                        sr_title: req.body.sr_title,
                                        time: req.body.time,
                                        date: req.body.date,
                                        bookingDateTime: req.body.bookingDateTime,
                                        cust_id: req.body.cust_id,
                                        sr_status: req.body.sr_status,
                                        sr_type: req.body.sr_type,
                                        creationDate: new Date().toUTCString()
                                    };
                                    var collectionSPR = db.db(config.dbName).collection(config.collections.cu_sp_pps_send);
                                    collectionSPR.insertOne(ppr_send_sp);
                                    if (req.body.coupon_apply) {
                                        cu_used_coupon_code.insertOne(coupon_used);
                                    }

                                    var message = "New kaikili preferred provider Job."
                                    comman.sendServiceNotification(element, "PPS0" + result, message, "New", "pps");
                                    count++;

                                    if (count == req.body.preferredProvider.length) {
                                        var status = {
                                            status: 1,
                                            message: "Successfully update information.",
                                            data: records
                                        };
                                        console.log(status);
                                        callback(status);
                                    }
                                });
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

    //API - 29
// 22-6-2019 created Api (Customer Book Preferred Provider Service - Customer Cancel)
    postBookPPStoCancel: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    console.log(req.body.pps_id);

                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                    var bulkRemove = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);

                    var serviceUpdate = {
                        sr_status: "Cancel-New-Cp",
                        updateDate: new Date().toUTCString()
                    };


                    var cu_sp_pps_send = db.db(config.dbName).collection(config.collections.cu_sp_pps_send);
                    req.body.preferredProvider.forEach(function (element) {

                    });


                    cu_sp_pps_send.update({pps_id: req.body.pps_id}, {$set: serviceUpdate});


                    // Update service record
                    bulkRemove.update({pps_id: req.body.pps_id}, {$set: serviceUpdate}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            bulkRemove.find({pps_id: req.body.pps_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    bulkRemove.removeOne({pps_id: req.body.pps_id});
                                }
                            )

                            var status = {
                                status: 1,
                                message: "Successfully update information."
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


    //API - 30
    // new Api Check Otp - 24-7-2019
    getServiceOPT: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var tran_id = req.body.tran_id;
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    collection.findOne({tran_id: tran_id}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "No OTP Created, Contact to support team.",
                            };
                            console.log(status);
                            callback(status);
                        } else {

                            var status = {
                                status: 1,
                                message: "Service OTP",
                                otp: docs.otp
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


    //API - 31
    searchRepeatedServiceProvider: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var sr_id = req.body.sr_id;
                var sp_id = req.body.sp_id;
                var cc_ids = req.body.cc_ids;
                var cost_item = req.body.cost_item;
                console.log(sr_id + " --- " + req.body.cc_ids);
                comman.getSPUserRepeatedService(sp_id, cc_ids, sr_id, cost_item, function (result) {
                    callback(result);
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

    updateCUProfileImageUpload: function (id, data, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                console.log(" imageAmount " + data);
                var addWorkInfo = {
                    "cu_image": data[0]
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
                    collectionSP.update({cu_id: id}, {$set: addWorkInfo}, function (err, records) {
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
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },


    //API - 32
    updateCUProfileDataUpload: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cu_id = req.body.cu_id;
                var addWorkInfo = {
                    "first_name": req.body.first_name,
                    "last_name": req.body.last_name,
                    "email": req.body.email,
                    "search_show": req.body.search_show
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
                    collectionSP.find({email: req.body.email}).toArray(function (err, docs) {
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

                                collectionSP.update({cu_id: cu_id}, {$set: addWorkInfo}, function (err, records) {
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
                                if (docs[0].cu_id == cu_id) {
                                    collectionSP.update({cu_id: cu_id}, {$set: addWorkInfo}, function (err, records) {
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


    //API - 34
    // 31-8-2019 Interested Customer to ger request post user (Customer Interested single data)
    getCustomerSingleInterestedTransition: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var cu_interested_rq_id = req.body.cu_interested_rq_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
                    collectionSP.findOne({
                        cu_interested_rq_id: cu_interested_rq_id
                    }, function (err, records) {
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
                                message: "Successfully update information.",
                                data: records
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


    //API - 22
    // 31-8-2019 create new Api (Customer Interested SR status update)
    customerInterestedUpdateData: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cu_interested_rq_id = req.body.cu_interested_rq_id;
                var sr_status = req.body.sr_status;
                var cu_id = req.body.cu_id;
                var updateTran = {
                    sr_status: sr_status,
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
                    collectionSP.updateOne({
                        cu_interested_rq_id: cu_interested_rq_id,
                        cu_id: cu_id
                    }, {$set: updateTran}, function (err, records) {
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
                                message: "Successfully update information.",
                                data: records
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


    //API - 35
// new Api Customer add bank information api
    userAddBankInfo: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var bankInfoAdd = {
                    cu_id: req.body.cu_id,
                    card_no: req.body.card_no,
                    bank_name: req.body.bank_name,
                    card_holder_name: req.body.card_holder_name,
                    month: req.body.month,
                    year: req.body.year,
                    cvc: req.body.cvc,
                    isUsed: "true",
                    creationDate: new Date().toUTCString()
                };

                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_bank_info);
                    collection.updateMany({cu_id: req.body.cu_id}, {$set: {isUsed: "false"}}, function (err, docs) {

                        console.log(docs);
                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                            var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.cu_bank_info);
                            collectionPaymentSettlement.insertOne(bankInfoAdd, function (err, docs) {
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
                                        message: "Thank you for add new card."
                                    };

                                    console.log();
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


    //API - 36
    CUUserBankInfoList: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var cu_id = req.body.cu_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var bankdata = db.db(config.dbName).collection(config.collections.cu_bank_info);
                    var collectionAdmin = db.db(config.dbName).collection(config.collections.admin_setting);

                    var kaikiliWallet = db.db(config.dbName).collection(config.collections.kaikili_wallet);
                    var mysort = {creationDate: -1};
                    var mysort1 = {_id: -1};
                    comman.getCUCurrentOfferCredit(cu_id, function (spCredit) {
                        collectionAdmin.find({}).toArray(function (err, dataAdmin) {
                            bankdata.find({cu_id: cu_id}).sort(mysort).toArray(function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    var cursorSearch = kaikiliWallet.aggregate([
                                        {
                                            $match: {
                                                cu_id: cu_id
                                            }
                                        }, {
                                            $lookup: {
                                                from: config.collections.cu_sp_transaction_cancellation,
                                                localField: "tran_id",
                                                foreignField: "tran_id",
                                                as: "tran11"
                                            }
                                        },

                                        {
                                            $lookup: {
                                                from: config.collections.cu_sp_transaction_completed,
                                                localField: "tran_id",
                                                foreignField: "tran_id",
                                                as: "tran22"
                                            }
                                        },

                                        {
                                            $lookup: {
                                                from: config.collections.cu_sp_transaction,
                                                localField: "tran_id",
                                                foreignField: "tran_id",
                                                as: "tran33"
                                            }
                                        }

                                    ]).sort(mysort1);

                                    cursorSearch.toArray(function (err, payment) {
                                        // kaikiliWallet.find({cu_id: cu_id}).sort(mysort1).toArray(function (err, payment) {
                                        if (err) {
                                            var status = {
                                                status: 1,
                                                message: "Thank you.",
                                                data: docs,
                                                payment: [],
                                                admin: dataAdmin,
                                                spCurrnet: spCredit
                                            };
                                            console.log();
                                            callback(status);

                                        } else {
                                            var status = {
                                                status: 1,
                                                message: "Thank you.",
                                                data: docs,
                                                payment: payment,
                                                admin: dataAdmin,
                                                spCurrnet: spCredit
                                            };
                                            console.log();
                                            callback(status);
                                        }
                                    });
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


    //API - 37
    CUUserDeleteBankInfo: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                // var cu_id = req.body.cu_id;
                var pid = req.body.id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var bankdata = db.db(config.dbName).collection(config.collections.cu_bank_info);
                    var mysort = {creationDate: -1};
                    var myquery = {_id: ObjectID(pid), cu_id: cu_id};
                    bankdata.deleteOne(myquery, function (err, docs) {
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
                                message: "Deleted your bank information",
                                data: docs
                            };
                            console.log();
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


    //API - 38
    CUUserSetDefaultBankInfo: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                // var cu_id = req.body.cu_id;
                var pid = req.body.id;

                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_bank_info);
                    // Update service record
                    collection.updateMany({cu_id: cu_id}, {$set: {isUsed: "false"}}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            // console.log(data);
                            collection.updateOne({
                                _id: ObjectID(pid),
                                cu_id: cu_id
                            }, {$set: {isUsed: "true"}}, function (err, docs) {
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
                                        message: "Successfully set information are default",
                                        data: docs
                                    };
                                    console.log();
                                    callback(status);
                                }
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


    //API - 39
    bookRepeatedServiceUser: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var otp = "";
                var service_book_date = req.body.service_book_date;
                var user_service = req.body.user_service;

                var ctr = 0;
                service_book_date.forEach(function (element) {
                    console.log(element.date);
                    console.log(element.time);

                    comman.getNextSequenceUserID("tr_service", function (result) {
                        //  console.log(result);
                        var tran_id = "TR0" + result;
                        var newBookServiceUser = {
                            tran_id: "TR0" + result,
                            address: user_service.address,
                            comment: user_service.comment,
                            sr_id: user_service.sr_id,
                            type_of_service: user_service.type_of_service,
                            sr_title: user_service.sr_title,
                            time: element.time,
                            date: element.date,
                            bookingDateTime: element.bookingDateTime,
                            cust_id: user_service.cust_id,
                            cust_first_name: user_service.cust_first_name,
                            cust_last_name: user_service.cust_last_name,
                            sp_first_name: user_service.sp_first_name,
                            sp_Last_name: user_service.sp_Last_name,
                            sp_id: user_service.sp_id,
                            sp_image: user_service.sp_image,
                            sr_status: user_service.sr_status,
                            txn_status: user_service.txn_status,
                            totalCost: user_service.totalCost,
                            itemCost: user_service.itemCost,
                            last_cancel_tran_id: user_service.last_cancel_tran_id,
                            last_cancel_sp_id: user_service.last_cancel_sp_id,
                            re_book: user_service.re_book,
                            minimum_charge: user_service.minimum_charge,
                            discount: user_service.discount,
                            repeatedDiscountGive: user_service.repeatedDiscountGive,
                            kaikili_commission: user_service.kaikili_commission,
                            sr_type: user_service.sr_type,
                            sr_total: user_service.sr_total,
                            sp_net_pay: user_service.sp_net_pay,
                            coordinatePoint: user_service.coordinatePoint,
                            cp_review: user_service.cp_review,
                            sp_review: user_service.sp_review,
                            distance: user_service.distance,
                            sp_service_area: user_service.sp_service_area,
                            creationDate: new Date().toUTCString(),
                            sp_view: false,
                            coupon_code: "",
                            coupon_apply: false,
                            coupon_code_discount_amount: "",
                            otp: comman.getRandomInt(9999),
                            service_book_type: user_service.service_book_type,
                        };

                        var notificationData = {
                            tran_id: "TR0" + result,
                            sr_id: user_service.sr_id,
                            sr_title: user_service.sr_title,
                            time: user_service.time,
                            date: user_service.date,
                            cust_id: user_service.cust_id,
                            cust_first_name: user_service.cust_first_name,
                            cust_last_name: user_service.cust_last_name,
                            sp_first_name: user_service.sp_first_name,
                            sp_Last_name: user_service.sp_Last_name,
                            sp_id: user_service.sp_id,
                            sp_image: user_service.sp_image,
                            creationDate: new Date().toISOString(),
                            messages: []
                        };

                        //  comman.cuInterestedRemoveBookServicesData(req.body.sr_id, req.body.itemCost, req.body.cust_id, req.body.coordinatePoint.latitude, req.body.coordinatePoint.longitude);

                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                            var collectionCU = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                            collectionCU.insert(newBookServiceUser, function (err, records) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {

                                    var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                    collectionNotification.insert(notificationData, function (err, docs) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Update in Notification");
                                            // console.log(docs);
                                        }
                                    });

                                    // var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    // req.body.last_cancel_tran_id.forEach(function (element) {
                                    //         collectionSP.update({tran_id: element}, {$set: {re_book: "true"}});
                                    //     }
                                    // );

                                    // var message = "Customer Create New Service"
                                    // comman.sendServiceNotification(req.body.sp_id, tran_id, message, req.body.sr_status, "tran");


                                    ctr++;
                                    if (ctr == service_book_date.length) {
                                        var message = "Customer Create Repeated Service"
                                        comman.sendServiceNotification(user_service.sp_id, tran_id, message, user_service.sr_status, "tran");

                                        var status = {
                                            status: 1,
                                            message: "Successfully add new service",
                                            data: ""
                                        };
                                        console.log(status);
                                        callback(status);
                                    }
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


    //API - 40
// 6-12-2019 Otp Check Api
    OtpCheckProfile: function (req, callback) {

        var mobile_no = req.body.mobile_no;
        var otp = req.body.otp;
        console.log(mobile_no);
        console.log(otp);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_otp);
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
                                message: "Successfully data getting",
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
    }
    ,


    updateCUReviewImageUpload: function (id, data, callback) {
        console.log(" imageAmount " + data);
        var addWorkInfo = {
            "review_image": data
        };
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_review);
            collectionSP.update({tran_id: id}, {$set: addWorkInfo}, function (err, records) {
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


    //API - 42
    // add sp Dispute Data 15-12-2019
    CUdisputeInsert: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;

        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.getNextSequenceUserID("dispute_id", function (result) {
                    //  console.log(result);
                    var newPost = {
                        dispute_id: "DIS0" + result,
                        cu_id: req.body.cu_id,
                        comment: req.body.comment,
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
                        var collectionSP = db.db(config.dbName).collection(config.collections.cu_dispute);
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
                                    // data: dataSet
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


    //API - 43
    // Get Data Dispute 18 -12-2019
    CUdisputeRead: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                console.log(req.body.tran_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_dispute);
                    collectionSP.find({tr_id: req.body.tr_id, cu_id: req.body.cu_id}).toArray(function (err, dataSet) {
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


    //API - 45
    // Coupon Code valid check 6-2-2020
    CUCouponCode: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                // req.body.cu_id
                // req.body.code
                // req.body.amount

                console.log(req.body.cu_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.coupon_code);
                    var cuUsedCode = db.db(config.dbName).collection(config.collections.cu_used_coupon_code);
                    var query = {
                        // "coupon_start_date": {$gte: new Date(new Date().toISOString().replace(/T/, ' '). replace(/\..+/, '')) },
                        // "coupon_end_date": {$lt: new Date().toISOString().replace(/T/, ' '). replace(/\..+/, '')},
                        coupon_code: req.body.code
                    };

                    console.log(query);
                    collectionSP.find(query).toArray(function (err, dataSet) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            console.log("Server ------>" + dataSet.length);
                            if (dataSet != null && dataSet.length > 0) {

                                var momentA = new Date(dataSet[0].coupon_start_date);
                                var momentB = new Date(dataSet[0].coupon_end_date);
                                var carrunt = new Date(new Date)

                                console.log("------ Date " + momentA);
                                console.log("------ Date " + carrunt);
                                console.log("------ Date " + momentB);
                                var min = parseFloat(dataSet[0].coupon_min_amount);
                                var serAmount = parseFloat(req.body.amount);


                                if (momentA <= carrunt && carrunt <= momentB && min <= serAmount) {
                                    cuUsedCode.find({
                                        cu_id: req.body.cu_id,
                                        code: req.body.code
                                    }).toArray(function (err, userData) {
                                        if (err) {
                                            console.log(err);
                                            var status = {
                                                status: 0,
                                                message: "Coupon code are not valid."
                                            };
                                            console.log(status);
                                            callback(status);
                                        } else {
                                            console.log(userData.length);
                                            if (Number(dataSet[0].coupon_used_count) > userData.length) {
                                                var status = {
                                                    status: 1,
                                                    message: "Successfully apply code",
                                                    coupon_max_descount: dataSet[0].coupon_max_descount,
                                                    coupon_percentage: dataSet[0].coupon_percentage,
                                                    coupon_min_amount: dataSet[0].coupon_min_amount
                                                };
                                                console.log(status);
                                                callback(status);

                                            } else {
                                                var status = {
                                                    status: 0,
                                                    message: "Max limit is reached ...."
                                                };
                                                console.log(status);
                                                callback(status);
                                            }
                                        }
                                    });
                                } else {
                                    var status = {
                                        status: 0,
                                        message: "Coupon code are not valid.",
                                    };
                                    console.log(status);
                                    callback(status);
                                }
                            } else {
                                var status = {
                                    status: 0,
                                    message: "Coupon code are not valid.",
                                };
                                console.log(status);
                                callback(status);
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


    //API - 46
    getTransitionInfoFull: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.getTransitionInfoFull(req.body.tran_id, false, function (getData) {
                    callback(getData);
                });

                // var tran_id = req.body.tran_id;
                // var sp_view = req.body.sp_view;
                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var collection_transaction = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                //     var collection_transaction_completed = db.db(config.dbName).collection(config.collections.cu_sp_transaction_completed);
                //     var collection_transaction_cancellation = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                //     if (sp_view == true) {
                //         collection_transaction.update({tran_id: tran_id}, {$set: {sp_view: true}});
                //     }
                //
                //     collection_transaction.find({tran_id: tran_id}).toArray(function (err1, docsOnTr) {
                //         collection_transaction_completed.find({tran_id: tran_id}).toArray(function (err2, docsOnTrCom) {
                //             collection_transaction_cancellation.find({tran_id: tran_id}).toArray(function (err3, docsOnTrCan) {
                //
                //                 if (err1 || err2 || err3) {
                //                     console.log(err);
                //                     var status = {
                //                         status: 0,
                //                         message: "Failed !. Server Error....."
                //                     };
                //                     console.log(status);
                //                     callback(status);
                //                 } else {
                //
                //                     var doc = docsOnTr.concat(docsOnTrCom);
                //                     var doc = doc.concat(docsOnTrCan);
                //
                //                     if (doc.length > 0) {
                //                         var status = {
                //                             status: 1,
                //                             message: "Success upload to service to server",
                //                             data: doc[0]
                //                         };
                //                         console.log();
                //                         callback(status);
                //                     } else {
                //                         var status = {
                //                             status: 0,
                //                             message: "No Transaction found.",
                //                         };
                //                         console.log();
                //                         callback(status);
                //                     }
                //                 }
                //
                //             });
                //         });
                //     });
                //
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


    //API - 47
    userNotificationPost: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                // var cu_id = req.body.cu_id;
                var body = req.body.message;
                comman.notificationPost(tran_id, cu_id, null, body, function (dataApi) {
                    callback(dataApi);
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

    //API - 48  25-2-2020
    getUserSingleNotification: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.singleNotification(req.body.tran_id, function (getData) {
                    callback(getData);
                });
                // var tran_id = req.body.tran_id;
                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var mysort = {updateDate: -1};
                //     var collection = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                //     console.log(err);
                //     collection.find({tran_id: tran_id}
                //     ).sort(mysort).toArray(function (err, docs) {
                //         if (err) {
                //             console.log(err);
                //             var status = {
                //                 status: 0,
                //                 message: "Failed !. Server Error....."
                //             };
                //             // console.log(status);
                //             callback(status);
                //
                //         } else {
                //             var status = {
                //                 status: 1,
                //                 message: "Success get all transition service information",
                //                 data: docs
                //             };
                //             callback(status);
                //         }
                //     });
                //
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


    //API - 49
    // 25-2-2020 Add Contact US
    contactUsInsert: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.contactUsInsert(req.body.post_user_id, req.body.comment, req.body.topic, function (getData) {
                    callback(getData);
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

    //API - 50
    // Api Created 25-2-2020 Preferred Provider Transition Info
    getPreferredProviderInfo: function (req, callback) {

        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                var pps_id = req.body.pps_id;
                comman.preferredProviderInfo(req.body.pps_id, req.body.read, function (getData) {
                    callback(getData);
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


    //API - 51
    // Api Created 25-2-2020 Preferred Provider Transition Info
    getPreferredProviderInfoCancel: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.preferredProviderInfoCancel(req.body.pps_id, function (getData) {
                    callback(getData);
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


    //API - 52
    // Api Created 25-2-2020
    getUserRatingDataCU: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {

                comman.getSPtoCustomerRating(req.body.sp_id, function (result) {
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

    //API - 53
    // Api Created 25-2-2020
    getSPUserWorkProfile: function (req, callback) {
        var cu_id = req.body.cu_id;
        var key = req.body.key;
        comman.checkCUValidLogin(cu_id, key, function (validUser) {
            if (validUser) {
                var sp_id = req.body.sp_id;
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
}
module.exports = Customer;