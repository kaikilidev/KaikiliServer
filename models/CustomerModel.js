var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var bcrypt = require('bcrypt');


var Customer = {

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
                fcm_token: req.body.fcm_token,
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

    //Mobiel No to Check User are are there
    checkCUUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        var fcm_token = req.body.fcm_token;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.findOne({mobile_no: mobile_no}, function (err, docs) {
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
                    // if (docs.length == 1) {

                    collectionSP.updateOne({mobile_no: mobile_no}, {$set: {fcm_token: fcm_token}}, function
                        (err, records) {
                        console.log(records);
                    });


                    if (docs === undefined || docs === null) {
                        var status = {
                            status: 0,
                            message: "No User"
                        };
                    } else {
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


    //Customer Login
    CUUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;
        var fcm_token = req.body.fcm_token;

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

                                collectionCU.updateOne({mobile_no: docs[0].mobile_no}, {$set: {fcm_token: fcm_token}}, function
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
        comman.cuInterestedServicesAdd(req.body);
        var sr_id = req.body.sr_id;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var cc_ids = req.body.cc_ids;
        var cost_item = req.body.cost_item;
        console.log(longitude + " --- " + req.body.cc_ids);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
                        message: "Failed"
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
                                    {$match: {sp_id: element.sp_id, sr_id: sr_id}},
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
                                    }
                                ]).toArray(function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(docs);
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

                                        if (docs[0].preferred_provider == "1") {
                                            newPreferredArrServic.push(docs[0].sp_id);

                                            var ppsData = {
                                                sp_id: docs[0].sp_id,
                                                dist: element.dist,
                                            }
                                            newPreferredArrData.push(ppsData);
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
                                            preferred_provider: docs[0].preferred_provider

                                        };
                                        newArrServic.push(dataShow);
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
    },


    searchServiceProviderNew: function (req, callback) {
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

    },


    addServiceAlertData: function (req, callback) {
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
                    creationDate: new Date().toISOString()
                };


                mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
                    collectionSP.insert(newServiceAlert, function (err, records) {
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
                                message: "Successfully add your Service alert information are store.",
                                data: records
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });

            });
        });
    },

    searchQuoteProvider: function (req, callback) {
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
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collection = db.db(config.dbName).collection(config.collections.cu_quote_request);
                collection.insert(newQuoteRequirement, function (err, records) {
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

    serviceBookUser: function (req, callback) {
        var otp = "";


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
                creationDate: new Date().toISOString(),
                sp_view:false,
                otp: comman.getRandomInt(999999)
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

            comman.cuInterestedRemoveBookServicesData(req.body.sr_id, req.body.itemCost, req.body.cust_id, req.body.coordinatePoint.latitude, req.body.coordinatePoint.longitude);

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                collectionCU.insert(newBookServiceUser, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
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
    },

    removeUserAddress: function (req, callback) {

        //  console.log(result);
        var cu_id = req.body.cu_id;
        var id = req.body.id;
        console.log("----------" + id);

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
            collectionSP.deleteOne({"cu_id": cu_id, "_id": mongoose.Types.ObjectId(id)}, function (err, records) {
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
                        message: "Successfully remove address",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    getCustomerTransition: function (req, callback) {
        var cust_id = req.body.cust_id;
        console.log(cust_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
                        message: "Failed"
                    };
                    // console.log(status);
                    callback(status);

                } else {
                    collectionQuote.find({cu_id: cust_id}).sort({creationDate: -1}).toArray(function (err, docsQuote) {

                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed"
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
    },

    getCustomerAlertTransition: function (req, callback) {
        var cu_id = req.body.cu_id;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var mysort = {creationDate: -1};
            var collection = db.db(config.dbName).collection(config.collections.cu_service_alert);
            collection.find({cu_id: cu_id}).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success get all alert service to Mongodb",
                        data: docs,
                    };
                    callback(status);
                }
            });

        });
    },

    // 27-5-2019 created Api (Customer Shouting activated/deactivated update)
    customerAlertInfoUpdate: function (req, callback) {
        var cp_alert_id = req.body.cp_alert_id;
        var cu_id = req.body.cu_id;
        var alert_active = req.body.alert_active;
        console.log("-----" + alert_active);
        var updateTran = {
            alert_active: alert_active
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
            collectionSP.updateOne({
                cp_alert_id: cp_alert_id,
                cu_id: cu_id
            }, {$set: updateTran}, function (err, records) {
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
                        message: "Successfully update shouting activity.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 27-5-2019 created Api (Customer Shouting delete Api)
    customerAlertInfoDelete: function (req, callback) {
        var cp_alert_id = req.body.cp_alert_id;
        var cu_id = req.body.cu_id;
        var alert_active = req.body.alert_active;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_service_alert);
            collectionSP.deleteOne({
                cp_alert_id: cp_alert_id,
                cu_id: cu_id
            }, function (err, records) {
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
                        message: "Successfully remove shouting data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 27-5-2019 created Api (Customer Rescheduled job data getting api)
    customerRescheduledTransitionData: function (req, callback) {
        var cust_id = req.body.cust_id;
        var tran_id = req.body.tran_id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_reschedule);
            collectionSP.findOne({
                tran_id: tran_id,
                cust_id: cust_id
            }, function (err, records) {
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
                        message: "Successfully getting data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 27-5-2019 created Api (Customer Rescheduled job data updating)
    customerRescheduledTransitionUpdateData: function (req, callback) {
        var cust_id = req.body.cust_id;
        var tran_id = req.body.tran_id;
        var time = req.body.time;
        var date = req.body.date;

        var updateTran = {
            time: time,
            date: date,
            sr_status: "Scheduled"
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            collectionSP.updateOne({
                tran_id: tran_id,
                cust_id: cust_id
            }, {$set: updateTran}, function (err, records) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    collectionSP.find({tran_id: tran_id}).toArray(function (err, docs) {
                        console.log(docs);
                        var message = "Customer accept rescheduled date."
                        comman.sendServiceNotification(docs[0].sp_id, tran_id, message, "Scheduled", "tran");
                    });
                    var status = {
                        status: 1,
                        message: "Successfully getting data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 27-5-2019 created Api (Customer Shouting SR status update)
    customerShoutingUpdateData: function (req, callback) {
        var cp_alert_id = req.body.cp_alert_id;
        var sr_status = req.body.sr_status;
        var cu_id = req.body.cu_id;

        var updateTran = {
            sr_status: sr_status,
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            collectionSP.updateOne({
                cp_alert_id: cp_alert_id,
                cu_id: cu_id
            }, {$set: updateTran}, function (err, records) {
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
                        message: "Successfully Update data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 28-5-2019 created Api (Customer to give review )
    customerAddToServiceReview: function (req, callback) {

        var tran_id = req.body.tran_id;
        var reviewAdd = {
            cust_id: req.body.cust_id,
            sp_id: req.body.sp_id,
            tran_id: req.body.tran_id,
            sr_id: req.body.sr_id,
            rating: req.body.rating,
            comment: req.body.comment,
            creationDate: new Date().toISOString()
        };

        var updateTran = {
            cp_review: "true",
        };

        if (req.body.tip_amount > 0) {
            comman.spEranInfoUpdate(req.body.sp_id, req.body.tran_id, "Customer give tip $" + req.body.tip_amount, req.body.tip_amount, 0, "Credit");
            comman.spTripInfoUpdate(req.body.sp_id, req.body.cust_id, req.body.tran_id, "Customer give tip $" + req.body.tip_amount, req.body.tip_amount);
        }
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.sp_cu_review);
            collectionPaymentSettlement.insertOne(reviewAdd, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
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
                                var updateRating = {
                                    avg_rating: docs[0].rating,
                                };
                                var spProfileUpdate = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                                spProfileUpdate.updateOne({cu_id: req.body.sp_id}, {$set: updateRating}, function (err, docs) {
                                    var status = {
                                        status: 1,
                                        message: "Thank you fore review."
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
    },

// 28-5-2019 created Api (Customer transaction history )
    customerCompletedService: function (req, callback) {
        var cu_id = req.body.cu_id;
        console.log(cu_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var mysort = {updateDate: 1};
            var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var cancellation = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
            var collectionPPS = kdb.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
            console.log(err);
            collection.find({
                cust_id: cu_id,
                sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed"]}
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


                    cancellation.find({
                        cust_id: cu_id,
                        sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed"]}
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
                                    message: "Failed"
                                };
                                callback(status);
                                // console.log(status);
                            }

                        } else {
                            var listData = docs.concat(docs1);
                            collectionPPS.find({cust_id: cu_id}).toArray(function (err, docspps) {

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
    }
    ,

// 1-6-2019 created Api (Customer Shouting SR status update)
    getCustomerData: function (req, callback) {

        console.log(req.body.cu_id);
        var cu_id = req.body.cu_id;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.findOne({cu_id: cu_id}, function (err, records) {
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
                        message: "Successfully Update data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    }
    ,


    customerTransitionUpdate: function (req, callback) {
        var tran_id = req.body.tran_id;
        var dateNew1 = req.body.dateNew1;
        var timeNew1 = req.body.timeNew1;
        var timeNew2 = req.body.timeNew2;
        var dateNew2 = req.body.dateNew2;

        var serviceUpdate = {
            sr_status: req.body.sr_status,
            updateDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            // Update service record
            collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
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
                        message: "Success upload to service to server",
                        data: docs
                    };


                    collection.find({tran_id: tran_id}).toArray(function (err, docs) {
                        var message = ""
                        if (req.body.sr_status == "Progress") {
                            message = "Customer provider on way.";
                        } else if (req.body.sr_status == "Cancel-New-Cp") {
                            message = "Customer provider to cancel job.";
                        } else if (req.body.sr_status == "Scheduled") {
                            message = "Customer provider accept your job.";
                        } else if (req.body.sr_status == "Cancel-Scheduled-Cp") {
                            message = "Customer provider Cancelled your job.";
                        }

                        if (req.body.sr_status == "Progress" || req.body.sr_status == "Scheduled") {
                            comman.sendServiceNotification(docs[0].sp_id, tran_id, message, req.body.sr_status, "tran");
                        }


                        var messagesBody = {
                            author: docs[0].sp_id,
                            author_type: "SP",
                            sp_delet: "0",
                            cu_delte: "0",
                            sp_read: "0",
                            cu_read: "0",
                            created_on: new Date().toISOString(),
                            body: docs[0].sr_status + " - " + docs[0].sr_title + " " + docs[0].date + " " + docs[0].time
                        };

                        var rescheduled = {
                            sp_id: docs[0].sp_id,
                            sr_id: docs[0].sr_id,
                            cust_id: docs[0].cust_id,
                            tran_id: docs[0].tran_id,
                            date: docs[0].date,
                            time: docs[0].time,
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

                        if (req.body.sr_status == "Cancel-New-Cp" || req.body.sr_status == "Cancel-Scheduled-Cp") {
                            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                            var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                            bulkRemove.find({tran_id: tran_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    bulkRemove.removeOne({tran_id: tran_id});
                                    comman.sendServiceNotification(docs[0].sp_id, tran_id, message, req.body.sr_status, "tran");
                                }
                            )
                        }

                    });
                    console.log();
                    callback(status);

                }
            });
        });
    }
    ,


// 11-6-2019 created Api (Customer Shouting single data)
    getCustomerSingleAlertTransition: function (req, callback) {
        var sp_cp_alert_send_id = req.body.sp_cp_alert_send_id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            collectionSP.findOne({
                sp_cp_alert_send_id: sp_cp_alert_send_id
            }, function (err, records) {
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
                        message: "Successfully Update data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    }
    ,

//Create new Api ReBook Service 19-6-2019
    reSearchServiceProvider: function (req, callback) {
        var last_cancel_sp_id = req.body.last_cancel_sp_id;
        var sr_id = req.body.sr_id;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var cc_ids = req.body.cc_ids;
        var cost_item = req.body.cost_item;
        console.log(longitude + " --- " + req.body.cc_ids);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
                        message: "Failed"
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
                                    {$match: {sp_id: element.sp_id, sr_id: sr_id}},
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
                                    }
                                ]).toArray(function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(docs);
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

                                        if (docs[0].preferred_provider == "1") {
                                            newPreferredArrServic.push(docs[0].sp_id);

                                            var ppsData = {
                                                sp_id: docs[0].sp_id,
                                                dist: element.dist,
                                            }
                                            newPreferredArrData.push(ppsData);
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
                                            sp_mobile_no: docs[0].profile.mobile_no

                                        };

                                        if (!last_cancel_sp_id.includes(docs[0].sp_id)) {
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
    }
    ,


// 21-6-2019 created Api (Customer Book Preferred Provider Service)
    postCustomerBookPreferredProviderService: function (req, callback) {
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
                preferredProvider: req.body.preferredProvider,
                pps_data: req.body.pps_data
            };
            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                collectionSP.insertOne(ppServiceData, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        callback(status);
                    } else {

                        var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                        req.body.last_cancel_tran_id.forEach(function (element) {
                                collectionSP.update({tran_id: element}, {$set: {re_book: "true"}});
                            }
                        );

                        req.body.preferredProvider.forEach(function (element) {
                            var message = "New kaikili preferred provider Job."
                            comman.sendServiceNotification(element, "PPS0" + result, message, "New", "pps");
                        });

                        var status = {
                            status: 1,
                            message: "Successfully Update data.",
                            data: records
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });


        });
    }
    ,

// 22-6-2019 created Api (Customer Book Preferred Provider Service Cancel)
    postBookPPStoCancel: function (req, callback) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            console.log(req.body.pps_id);

            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
            var bulkRemove = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);

            var serviceUpdate = {
                sr_status: "Cancel-New-Cp",
                updateDate: new Date().toISOString()
            };

            // Update service record
            bulkRemove.update({pps_id: req.body.pps_id}, {$set: serviceUpdate}, function (err, docs) {

                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
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
                        message: "Successfully Update data."
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    // new Api Check Otp - 24-7-2019
    getServiceOPT: function (req, callback) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
    },

    searchRepeatedServiceProvider: function (req, callback) {
        var sr_id = req.body.sr_id;
        var sp_id = req.body.sp_id;
        var cc_ids = req.body.cc_ids;
        var cost_item = req.body.cost_item;
        console.log(sr_id + " --- " + req.body.cc_ids);

        comman.getSPUserRepeatedService(sp_id, cc_ids, sr_id, cost_item, function (result) {
            callback(result);
        });

    },

    updateCUProfileImageUpload: function (id, data, callback) {
        console.log(" imageAmount " + data);
        var addWorkInfo = {
            "cu_image": data[0]
        };
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.update({cu_id: id}, {$set: addWorkInfo}, function (err, records) {
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

    updateCUProfileDataUpload: function (req, callback) {
        var cu_id = req.body.cu_id;
        var addWorkInfo = {
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "email": req.body.email,
        };
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.update({cu_id: cu_id}, {$set: addWorkInfo}, function (err, records) {
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
                        message: "Successfully updated",
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },

    // 31-8-2019 Interested Customer to ger request post user (Customer Interested single data)
    getCustomerSingleInterestedTransition: function (req, callback) {
        var cu_interested_rq_id = req.body.cu_interested_rq_id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
            collectionSP.findOne({
                cu_interested_rq_id: cu_interested_rq_id
            }, function (err, records) {
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
                        message: "Successfully Update data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    // 31-8-2019 create new Api (Customer Interested SR status update)
    customerInterestedUpdateData: function (req, callback) {
        var cu_interested_rq_id = req.body.cu_interested_rq_id;
        var sr_status = req.body.sr_status;
        var cu_id = req.body.cu_id;

        var updateTran = {
            sr_status: sr_status,
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
            collectionSP.updateOne({
                cu_interested_rq_id: cu_interested_rq_id,
                cu_id: cu_id
            }, {$set: updateTran}, function (err, records) {
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
                        message: "Successfully Update data.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
            });
        });
    },


// new Api Customer add bank information api
    userAddBankInfo: function (req, callback) {

        var bankInfoAdd = {
            cu_id: req.body.cu_id,
            card_no: req.body.card_no,
            bank_name: req.body.bank_name,
            card_holder_name: req.body.card_holder_name,
            month: req.body.month,
            year: req.body.year,
            cvc: req.body.cvc,
            isUsed: "true",
            creationDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_bank_info);
            collection.updateMany({cu_id: req.body.cu_id}, {$set: {isUsed: "false"}}, function (err, docs) {

                console.log(docs);
                mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                    var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.cu_bank_info);
                    collectionPaymentSettlement.insertOne(bankInfoAdd, function (err, docs) {
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
                                message: "Thank you fore add new card."
                            };

                            console.log();
                            callback(status);
                        }
                    });
                });
            });
        });
    },

    CUUserBankInfoList: function (req, callback) {

        var cu_id = req.body.cu_id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var bankdata = db.db(config.dbName).collection(config.collections.cu_bank_info);
            var mysort = {creationDate: -1};

            bankdata.find({cu_id: cu_id}).sort(mysort).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "l  "
                    };
                    console.log(status);
                    callback(status);
                } else {
                    var status = {
                        status: 1,
                        message: "Thank you.",
                        data: docs
                    };
                    console.log();
                    callback(status);
                }
            });
        });
    }
    ,

    CUUserDeleteBankInfo: function (req, callback) {

        var cu_id = req.body.cu_id;
        var pid = req.body.id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var bankdata = db.db(config.dbName).collection(config.collections.cu_bank_info);
            var mysort = {creationDate: -1};
            var myquery = {_id: ObjectID(pid), cu_id: cu_id};
            bankdata.deleteOne(myquery, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "l  "
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
    }
    ,

    CUUserSetDefaultBankInfo: function (req, callback) {

        var cu_id = req.body.cu_id;
        var pid = req.body.id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_bank_info);
            // Update service record
            collection.updateMany({cu_id: cu_id}, {$set: {isUsed: "false"}}, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
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
                                message: "Failed"
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
    }
    ,


}
module.exports = Customer;