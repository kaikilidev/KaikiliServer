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
                                    },{
                                        $lookup: {
                                            from: config.collections.sp_personal_info,
                                            localField: "sp_id",
                                            foreignField: "sp_id",
                                            as: "profile"
                                        }
                                    },{
                                        $unwind: "$profile"
                                    },{
                                        $lookup: {
                                            from: config.collections.add_services,
                                            localField: "sr_id",
                                            foreignField: "sr_id",
                                            as: "services"
                                        }
                                    },{
                                        $unwind: "$services"
                                    }
                            ]).
                                toArray(function (err, docs) {
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
                                            avg_rating: docs[0].userprofile.avg_rating,
                                            sp_image: docs[0].userprofile.profile_image,
                                            sp_first_name: docs[0].profile.first_name,
                                            sp_last_name: docs[0].profile.last_name,
                                            sp_mobile_no: docs[0].profile.mobile_no

                                        };
                                        newArrServic.push(dataShow);
                                        ctr++;
                                        if (ctr === mainDocs.length) {
                                            var status = {
                                                status: 1,
                                                message: "Success Get all Transition service list",
                                                post_data: req.body,
                                                data: newArrServic
                                            };
                                            callback(status);
                                        }
                                    }
                                });
                            } else {
                                ctr++;
                                if (ctr === mainDocs.length) {
                                    var status = {
                                        status: 1,
                                        message: "Success Get all Transition service list",
                                        data: newArrServic
                                    };
                                    callback(status);

                                }
                            }
                        });
                    } else {
                        var status = {
                            status: 1,
                            message: "Success Get all service list",
                            data: newArrServic
                        };
                        callback(status);
                    }
                }
            });

        });
    },


    addServiceAlertData: function (req, callback) {

        //  console.log(result);
        var newServiceAlert = {
            cu_id: req.body.cu_id,
            cc_ids: req.body.cc_ids,
            cost_item: req.body.cost_item,
            sr_name: req.body.sr_name,
            sr_id: req.body.sr_id,
            comment: req.body.comment,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
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
                        message: "Successfully add your Service alert information.",
                        data: records
                    };
                    console.log(status);
                    callback(status);
                }
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
        comman.getNextSequenceUserID("tr_service", function (result) {
            //  console.log(result);
            var newBookServiceUser = {
                tran_id: "TR0" + result,
                address: req.body.address,
                comment: req.body.comment,
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
                sr_status: req.body.sr_status,
                txn_status: req.body.txn_status,
                totalCost: req.body.totalCost,
                itemCost: req.body.itemCost,
                minimum_charge: req.body.minimum_charge,
                discount: req.body.discount,
                kaikili_commission: req.body.kaikili_commission,
                sr_type: req.body.sr_type,
                sr_total: req.body.sr_total,
                sp_net_pay: req.body.sp_net_pay,
                coordinatePoint: req.body.coordinatePoint,
                cp_review: req.body.cp_review,
                sp_review: req.body.sp_review,
                distance: req.body.distance,
                creationDate: new Date().toISOString()
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
                messages :[]
            };

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
          var cu_id= req.body.cu_id;
          var id= req.body.id;
        console.log("----------"+id);

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
            collectionSP.deleteOne({"cu_id":cu_id,"_id" : mongoose.Types.ObjectId(id)}, function (err, records) {
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

}
module.exports = Customer;