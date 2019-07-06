var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
const math = require('mathjs')
//
// var fcm = require('fcm-notification');
// var path = require('../privatekey.json');
// var fcmCustomer = new fcm(path);


var FCM = require('fcm-node');
var FCMService = require('fcm-node');
var serverKey = 'AAAAIB3B0Us:APA91bH1uxjAY72zwVjvMVpC14aWHnEf6th0IBR4-_vdVqV9DVlgeYovC_bpffeltLa1qUdTPcOykYGJZ95AU63ghQ_R-xP3XCRDmwz2GJ72YHQbrFLnLAkBuMvjLHySCWdxTRQ1gx5l'; //put your server key here
var fcm = new FCM(serverKey);

var serverKeyService = 'AAAAzU2n6L8:APA91bH-WeHoUgdNyR8hlvcpeSerfuG3R39GkiaXFTuhoRLERYy1EaC5YASotfQCFWxiwOPP18NTq0SV3Z6IFPRopyt6a6RsbD6faK9P9cbxGX-JGTiYTv5YsTsfqjAFp_EFDQ191KBe'; //put your server key here
var fcmService = new FCMService(serverKeyService);


var Comman = {

    getNextSequenceUserID(name, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.auto_id);
            var newId = null;
            var query = {_id: name};
            var update = {$inc: {seq: 1}};
            var options = {upsert: true, 'new': true, setDefaultsOnInsert: true};
            autoIdCollection.findOneAndUpdate(query, update, options, function (err, doc) {
                newId = doc.value.seq;
                return callBack(doc.value.seq);
            });
        });
    },

    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2, callBack) {
        console.log(lat1 + "-------" + lon1 + " ------" + lat2);
        // var R = 6371; // Radius of the earth in km
        var R = 3958.8; // Radius of the earth in km
        var dLat = ((lat2 - lat1) * (Math.PI / 180));  // deg2rad below
        var dLon = ((lon2 - lon1) * (Math.PI / 180));

        console.log(dLat + "-------" + dLon + " ------");
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return callBack(d);
    },



    getSPUserLocation(spid, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            var getData = null;
            var query = {sp_id: spid};
            autoIdCollection.findOne(query, function (err, doc) {
                //    console.log(doc);
                getData = {
                    "radius": doc.radius,
                    "latitude": doc.coordinatePoint.latitude,
                    "longitude": doc.coordinatePoint.longitude,
                }
                return callBack(getData);
            });
        });
    },

    getCustomerData(cuid, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.cu_profile);
            var getData = null;
            var query = {cu_id: cuid};
            autoIdCollection.findOne(query, function (err, doc) {
                //    console.log(doc);
                return callBack(doc);
            });
        });
    },


    getSPUserRadiusLocationOtherSP(spid, srid, callBack) {
        module.exports.getSPUserLocation(spid, function (result) {
            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
                var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                var cursorIndex = collection.createIndex({location: "2dsphere"});
                var radius = (parseFloat(result.radius) * parseFloat("1609.34"));
                var cursorSearch = collection.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [parseFloat(result.longitude), parseFloat(result.latitude)]
                            },
                            key: "location",
                            maxDistance: radius,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                            distanceField: "dist", //give values in metre
                            query: {services: srid}//{services: sr_id}// cost_comps: cc_ids
                        }
                    }]);

                cursorSearch.toArray(function (err, mainDocs) {
                    //console.log("----" + mainDocs.length);
                    return callBack(mainDocs);
                });
            });
        });
    },

    getSPUserCCRatData(spList, sr_id, cc_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            var cursorSearch = autoIdCollection.aggregate([
                {
                    $match: {
                        $and: [{sp_id: {$in: spList}}],
                        sr_id: sr_id,
                        "cost_components_on.cc_id": cc_id
                    }
                }, {
                    $project: {
                        cost_components_on: {
                            $filter: {
                                input: "$cost_components_on",
                                as: "cost_components_on",
                                cond: {$eq: ["$$cost_components_on.cc_id", cc_id]}
                            }
                        }
                    }
                }

            ]);

            cursorSearch.toArray(function (err, mainDocs) {
                console.log("----" + mainDocs);
                return callBack(mainDocs);
            });
        });
    },


    getSPUserServiceData(spid, callBack) {
        // var query = {sp_id: spid};
        // console.log("----" + query);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            // var cursorSearch = collection.find({sp_id: spid,"sp_sr_status": "ON"}
            // );//,{sr_id:1}


            var cursorSearch = collection.aggregate([
                {$match: {sp_id: spid, "sp_sr_status": "ON"}},
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
                        from: config.collections.add_services,
                        localField: "sr_id",
                        foreignField: "sr_id",
                        as: "services"
                    }
                }, {
                    $unwind: "$services"

                    // }, {
                    //     $lookup: {
                    //         from: config.collections.sp_personal_info,
                    //         localField: "sp_id",
                    //         foreignField: "sp_id",
                    //         as: "profile"
                    //     }
                    // }, {
                    //     $unwind: "$profile"
                }
            ]);


            cursorSearch.toArray(function (err, mainDocs) {
                return callBack(mainDocs);
            });
        });
    },

    getSPUserInformationData(sp_id, sr_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            var cursorSearch = autoIdCollection.aggregate([
                {$match: {sp_id: sp_id, sr_id: sr_id}},
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
            ]);

            cursorSearch.toArray(function (err, mainDocs) {
                // console.log("----" + mainDocs.length);
                return callBack(mainDocs);
            });
        });
    },


    getServiceKaikiliCommission(srid, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.add_services);
            var sr_commission = null;
            var query = {sr_id: srid};
            autoIdCollection.findOne(query, function (err, doc) {
                sr_commission = doc.sr_commission
                return callBack(sr_commission);
            });
        });
    },


    getAlreadySendShoutingId(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            var query = {
                "creationDate":
                    {
                        $gte: new Date(new Date().setHours(0, 0, 0)).toISOString(),
                        $lt: new Date(new Date().setHours(23, 59, 59)).toISOString()
                    }, "sp_id": sp_id
            };
            autoIdCollection.find(query).toArray(function (err, doc) {
                var userSRidList = [];
                console.log(doc.length);
                if (doc.length > 0) {
                    var count = 0
                    doc.forEach(function (element) {
                        userSRidList.push(element.cp_alert_id);
                        console.log(element.cp_alert_id);
                        // return callBack(doc);
                        count++
                        if (doc.length == count) {
                            console.log(userSRidList);
                            return callBack(userSRidList);
                        }
                    });

                } else {
                    console.log(userSRidList);
                    return callBack(userSRidList);
                }


            });
        });
    },

    getShoutingDataFilter1(longitude, latitude, userSRidList, radius, type_of_service, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.cu_service_alert);
            var cursorIndex = collection.createIndex({location: "2dsphere"});

            var cursorSearch = collection.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [parseFloat(longitude), parseFloat(latitude)]
                        },
                        key: "location",
                        maxDistance: radius,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                        distanceField: "dist", //give values in metre
                        query: {
                            sr_id: {$in: userSRidList},
                            alert_active: "true",
                            type_of_service: type_of_service
                        }//{services: sr_id}// cost_comps: cc_ids
                        // ,cp_alert_id:{$out:resultSendAlert}
                    }
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
            ]);

            cursorSearch.toArray(function (err, mainDocs) {
                console.log("----" + mainDocs.length);
                return callBack(mainDocs);
            });
        });
    },

    sendCustomerNotification(cu_id, tran_id, messages, sr_status, type) {
        console.log(cu_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);

            var query = {cu_id: cu_id};
            collectionSP.findOne(query, function (err, doc) {
                console.log("----->" + doc);
                var token = doc.fcm_token;
                console.log("----->" + token);
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: token,
                    priority: "high",
                    collapse_key: 'your_collapse_key',

                    notification: {
                        title: "Kaikili-Customer App",
                        body: messages
                    },

                    data: {  //you can send only notification or only data(or include both)
                        tran_id: tran_id,
                        type: type,
                        messages: messages,
                        sr_status: sr_status,
                        my_another_key: 'my another value'
                    }
                };

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");

                        var status = {
                            status: 0,
                            message: "Something has gone wrong!",
                        };
                        // return callBack(status);
                    } else {
                        // console.log("Successfully sent with response: ", response);
                        // return callBack(response);
                        var status = {
                            status: 1,
                            message: "Successfully sent with response:!"
                        };
                        // console.log(status);
                        // return callBack(status);
                    }
                });

            });
        });

    },

    sendServiceNotification(sp_id, tran_id, messages, sr_status, type) {
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);

            var query = {sp_id: sp_id};
            collectionSP.findOne(query, function (err, doc) {
                console.log("----->" + doc);
                var token = doc.fcm_token;
                console.log("----->" + token);
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: token,
                    priority: "high",
                    collapse_key: 'your_collapse_key',

                    notification: {
                        title: "Kaikili-Service App",
                        body: messages
                    },

                    data: {  //you can send only notification or only data(or include both)
                        tran_id: tran_id,
                        messages: messages,
                        type: type,
                        sr_status: sr_status,
                        my_another_key: 'my another value'
                    }
                };

                fcmService.send(message, function (err, response) {
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");

                        var status = {
                            status: 0,
                            message: "Something has gone wrong!",
                        };
                        // return callBack(status);
                    } else {
                        // console.log("Successfully sent with response: ", response);
                        // return callBack(response);
                        var status = {
                            status: 1,
                            message: "Successfully sent with response:!"
                        };
                        // console.log(status);
                        // return callBack(status);
                    }
                });

            });
        });
    },

    getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, callBack) {


        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
            var cursorIndex = collection.createIndex({location: "2dsphere"});
            console.log("----------" + cc_ids);
            var cursorSearch = collection.aggregate([
                {
                    $geoNear: {
                        near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                        key: "location",
                        maxDistance: 160934,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                        distanceField: "dist", //give values in metre
                        query: {services: sr_id, cost_comps: {$all: cc_ids}}//{services: sr_id}// cost_comps: cc_ids
                    }
                }]);


            cursorSearch.toArray(function (err, mainDocs) {
                var userSPidList = [];
                mainDocs.forEach(function (element) {
                    userSPidList.push(element.sp_id);
                });
                var newCost_components = new Array();
                var ctr = 0;
                console.log(" --- " + userSPidList);
                var totalCost = 0;
                if (userSPidList.length > 0) {
                    cost_item.forEach(function (elementCost) {
                        console.log(" --- 333" + elementCost);
                        module.exports.getSPUserCCRatData(userSPidList, sr_id, elementCost.cc_id, function (resultCost) {
                            var userSPidSetRate = [];
                            resultCost.forEach(function (element) {
                                userSPidSetRate.push(element.cost_components_on[0].cc_rate_per_item)
                            });

                            var avg = 0;
                            module.exports.getSR_AVGData(sr_id, elementCost.cc_id, function (resultCost) {

                                console.log("----77" + resultCost[0].cost_components[0].average);
                                avg = parseFloat(resultCost[0].cost_components[0].average);
                                // const util = require('util');
                                // console.log(util.inspect(resultCost, {showHidden: false, depth: null}))


                                //Avg Code Nearest Service provider
                                // console.log("------std 11>" + userSPidSetRate);
                                // if (userSPidSetRate.length > 1) {
                                //     var n = userSPidSetRate.length;
                                //     avg = (math.sum(userSPidSetRate) / n)
                                //     var std = math.std(userSPidSetRate);
                                //     console.log("------std 33>" + std);
                                //     avg = std;
                                // }else if(userSPidSetRate.length == 1){
                                //     var n = userSPidSetRate.length;
                                //     avg = (math.sum(userSPidSetRate) / n)
                                // }

                                console.log("----55" + avg);
                                var cost = (parseFloat(avg) * parseFloat(elementCost.cc_per_item_qut));
                                totalCost = (totalCost + cost);

                                var dataCostItem = {
                                    cc_id: elementCost.cc_id,
                                    cc_cu_title: elementCost.cc_cu_title,
                                    show_order: elementCost.show_order,
                                    cc_sp_title: elementCost.cc_sp_title,
                                    hcc_id: elementCost.hcc_id,
                                    hcc_title: elementCost.hcc_title,
                                    cc_per_item_qut: elementCost.cc_per_item_qut,
                                    cc_per_item_rate: avg.toFixed(2),
                                    cc_per_item_cost: cost.toFixed(2)

                                };

                                newCost_components.push(dataCostItem);

                                ctr++;
                                if (ctr === cc_ids.length) {

                                    var sendData = {
                                        itemCost: newCost_components,
                                        totalCost: totalCost.toFixed(2),
                                        sp_ids: userSPidList
                                    };
                                    return callBack(sendData);
                                }
                            });
                        });
                    });
                } else {
                    var sendData = {
                        itemCost: [],
                        totalCost: 0,
                        sp_ids: userSPidList
                    };
                    return callBack(sendData);
                }
            });
        });
    },

// old AVG get Cost-item to nearest Service provider
    getSPUserRadiusLocationToAVG_OLD(cc_ids, sr_id, longitude, latitude, cost_item, callBack) {


        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
            var cursorIndex = collection.createIndex({location: "2dsphere"});
            console.log("----------" + cc_ids);
            var cursorSearch = collection.aggregate([
                {
                    $geoNear: {
                        near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                        key: "location",
                        maxDistance: 160934,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                        distanceField: "dist", //give values in metre
                        query: {services: sr_id, cost_comps: {$all: cc_ids}}//{services: sr_id}// cost_comps: cc_ids
                    }
                }]);


            cursorSearch.toArray(function (err, mainDocs) {
                var userSPidList = [];
                mainDocs.forEach(function (element) {
                    userSPidList.push(element.sp_id);
                });
                var newCost_components = new Array();
                var ctr = 0;
                console.log(" --- " + userSPidList);
                var totalCost = 0;
                if (userSPidList.length > 0) {
                    cost_item.forEach(function (elementCost) {
                        console.log(" --- 333" + elementCost);
                        module.exports.getSPUserCCRatData(userSPidList, sr_id, elementCost.cc_id, function (resultCost) {
                            var userSPidSetRate = [];
                            resultCost.forEach(function (element) {
                                userSPidSetRate.push(element.cost_components_on[0].cc_rate_per_item)
                            });

                            var avg = 0;
                            console.log("------std 11>" + userSPidSetRate);
                            if (userSPidSetRate.length > 1) {
                                var n = userSPidSetRate.length;
                                avg = (math.sum(userSPidSetRate) / n)
                                var std = math.std(userSPidSetRate);
                                console.log("------std 33>" + std);
                                avg = std;
                            } else if (userSPidSetRate.length == 1) {
                                var n = userSPidSetRate.length;
                                avg = (math.sum(userSPidSetRate) / n)
                            }


                            var cost = (parseFloat(avg) * parseFloat(elementCost.cc_per_item_qut));
                            totalCost = (totalCost + cost);

                            var dataCostItem = {
                                cc_id: elementCost.cc_id,
                                cc_cu_title: elementCost.cc_cu_title,
                                show_order: elementCost.show_order,
                                cc_sp_title: elementCost.cc_sp_title,
                                hcc_id: elementCost.hcc_id,
                                hcc_title: elementCost.hcc_title,
                                cc_per_item_qut: elementCost.cc_per_item_qut,
                                cc_per_item_rate: avg.toFixed(2),
                                cc_per_item_cost: cost.toFixed(2)

                            };

                            newCost_components.push(dataCostItem);

                            ctr++;
                            if (ctr === cc_ids.length) {

                                var sendData = {
                                    itemCost: newCost_components,
                                    totalCost: totalCost.toFixed(2),
                                    sp_ids: userSPidList
                                };
                                return callBack(sendData);
                            }
                        });
                    });
                } else {
                    var sendData = {
                        itemCost: 0,
                        totalCost: 0,
                        sp_ids: userSPidList
                    };
                    return callBack(sendData);
                }
            });
        });
    },

    getSPProfileData(spid, callBack) {
        // var query = {sp_id: spid};
        console.log("----" + spid);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_personal_info);

            var cursorSearch = collection.aggregate([
                {$match: {sp_id: spid}},
                {
                    $lookup: {
                        from: config.collections.sp_sr_profile,
                        localField: "sp_id",
                        foreignField: "sp_id",
                        as: "userprofile"
                    }
                }, {
                    $unwind: "$userprofile"
                }
            ]);


            cursorSearch.toArray(function (err, mainDocs) {
                return callBack(mainDocs);
            });
        });
    },

    getBookPPService(postData, callBack) {
        module.exports.getNextSequenceUserID("tr_service", function (result) {
            //  console.log(result);
            var tran_id = "TR0" + result;
            var newBookServiceUser = {
                tran_id: "TR0" + result,
                address: postData.address,
                comment: postData.comment,
                sr_id: postData.sr_id,
                type_of_service: postData.type_of_service,
                sr_title: postData.sr_title,
                time: postData.time,
                date: postData.date,
                cust_id: postData.cust_id,
                cust_first_name: postData.cust_first_name,
                cust_last_name: postData.cust_last_name,
                sp_first_name: postData.sp_first_name,
                sp_Last_name: postData.sp_Last_name,
                sp_id: postData.sp_id,
                sp_image: postData.sp_image,
                sr_status: postData.sr_status,
                txn_status: postData.txn_status,
                totalCost: postData.totalCost,
                itemCost: postData.itemCost,
                last_cancel_tran_id: postData.last_cancel_tran_id,
                last_cancel_sp_id: postData.last_cancel_sp_id,
                re_book: postData.re_book,
                minimum_charge: postData.minimum_charge,
                discount: postData.discount,
                kaikili_commission: postData.kaikili_commission,
                sr_type: postData.sr_type,
                sr_total: postData.sr_total,
                sp_net_pay: postData.sp_net_pay,
                coordinatePoint: postData.coordinatePoint,
                cp_review: postData.cp_review,
                sp_review: postData.sp_review,
                distance: postData.distance,
                sp_service_area: postData.sp_service_area,
                creationDate: new Date().toISOString()

            };

            var notificationData = {
                tran_id: "TR0" + result,
                sr_id: postData.sr_id,
                sr_title: postData.sr_title,
                time: postData.time,
                date: postData.date,
                cust_id: postData.cust_id,
                cust_first_name: postData.cust_first_name,
                cust_last_name: postData.cust_last_name,
                sp_first_name: postData.sp_first_name,
                sp_Last_name: postData.sp_Last_name,
                sp_id: postData.sp_id,
                sp_image: postData.sp_image,
                creationDate: new Date().toISOString(),
                messages: []
            };


            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                collectionCU.insertOne(newBookServiceUser, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        // callback(status);
                        return callBack(status);
                    } else {

                        var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                        collectionNotification.insertOne(notificationData, function (err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Update in Notification");
                                // console.log(docs);
                            }
                        });

                        var collectionSP = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                        postData.last_cancel_tran_id.forEach(function (element) {
                                collectionSP.update({tran_id: element}, {$set: {re_book: "true"}});
                            }
                        );

                        var message = "Service provider accept service."
                        module.exports.sendCustomerNotification(postData.cust_id, tran_id, message, postData.sr_status, "tran");

                        var status = {
                            status: 1,
                            message: "Successfully add new service",
                            data: records


                        };
                        console.log(status);
                        return callBack(status);
                    }
                });
            });
        });
    },

    getSR_AVGData(sr_id, cc_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.add_services);
            var cursorSearch = autoIdCollection.aggregate([
                {
                    $match: {
                        sr_id: sr_id
                    }
                }, {
                    $project: {
                        cost_components:
                            {
                                $filter: {
                                    input: "$cost_components",
                                    as: "cost_components",
                                    cond: {$eq: ["$$cost_components.cc_id", cc_id]}
                                }
                            }
                    }
                }
            ]);

            cursorSearch.toArray(function (err, mainDocs) {
                console.log("----55" + mainDocs[0].cost_components);
                return callBack(mainDocs);
            });
        });
    },



    updateServiceCompleted(cu_id,sp_id) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var cuProfile = db.db(config.dbName).collection(config.collections.cu_profile);
            var spProfile = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            var newId = null;
            var queryCu = {cu_id: cu_id};
            var querySp = {sp_id: sp_id};
            var update = {$inc: {service_count: 1}};
            var options = {upsert: true, 'new': true, setDefaultsOnInsert: true};
            cuProfile.findOneAndUpdate(queryCu, update, options, function (err, doc) {
                console.log("444444---------->" +doc.value.service_count);
            });
            spProfile.findOneAndUpdate(querySp, update, options, function (err, doc) {
                console.log("55555---------->" +doc.value.service_count);
                newId = doc.value.service_count;
            });
        });
    },
}

module.exports = Comman;