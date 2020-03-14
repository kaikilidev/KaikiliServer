var mongo = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
const math = require('mathjs')
// const moment = require('moment')
const crypto = require('crypto');
var setting = require('../models/Setting');
// Import Admin SDK
// var admin = require("firebase-admin");


var FCM = require('fcm-node');
var FCMService = require('fcm-node');
var serverKey = 'AAAAIB3B0Us:APA91bH1uxjAY72zwVjvMVpC14aWHnEf6th0IBR4-_vdVqV9DVlgeYovC_bpffeltLa1qUdTPcOykYGJZ95AU63ghQ_R-xP3XCRDmwz2GJ72YHQbrFLnLAkBuMvjLHySCWdxTRQ1gx5l'; //put your server key here
var fcm = new FCM(serverKey);

var serverKeyService = 'AAAAzU2n6L8:APA91bH-WeHoUgdNyR8hlvcpeSerfuG3R39GkiaXFTuhoRLERYy1EaC5YASotfQCFWxiwOPP18NTq0SV3Z6IFPRopyt6a6RsbD6faK9P9cbxGX-JGTiYTv5YsTsfqjAFp_EFDQ191KBe'; //put your server key here
var fcmService = new FCMService(serverKeyService);


var Comman = {

    getNextSequenceUserID(name, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
                }
            ]);


            cursorSearch.toArray(function (err, mainDocs) {
                return callBack(mainDocs);
            });
        });
    },

    getSPUserInformationData(sp_id, sr_id, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            var autoIdCancelList = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
            var query = {
                "creationDate":
                    {
                        $gte: new Date(new Date().setHours(0, 0, 0)).toISOString(),
                        $lt: new Date(new Date().setHours(23, 59, 59)).toISOString()
                    }, "sp_id": sp_id
            };
            autoIdCancelList.find(query).toArray(function (err, doc1) {
                autoIdCollection.find(query).toArray(function (err, doc2) {
                    var doc = doc2.concat(doc1);

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
        });
    },

    getShoutingDataFilter1(longitude, latitude, userSRidList, radius, type_of_service, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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
        console.log("Send notification -------------->>" + cu_id);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);

            var query = {cu_id: cu_id};
            collectionSP.findOne(query, function (err, doc) {
                console.log("----->send notification " + doc);

                if (doc != null) {
                    var token = doc.fcm_token;
                    console.log("----->" + token);
                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        to: token,
                        // priority: "high",
                        collapse_key: 'your_collapse_key',

                        // notification: {
                        //     title: "Kaikili-Customer App",
                        //     body: messages
                        // },

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
                }
            });
        });

    },

    sendServiceNotification(sp_id, tran_id, messages, sr_status, type) {
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);

            var query = {sp_id: sp_id};
            collectionSP.findOne(query, function (err, doc) {
                console.log("-----> send provider notification" + doc);
                if (doc != null) {
                    var token = doc.fcm_token;
                    console.log("----->" + token);
                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        to: token,
                        // priority: "high",
                        collapse_key: 'your_collapse_key',

                        // notification: {
                        //     title: "Kaikili-Service App",
                        //     body: messages
                        // },

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
                }
            });
        });
    },

    getSPUserRadiusLocationToAVG(cc_ids, sr_id, longitude, latitude, cost_item, callBack) {

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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

    getSPUserRadiusLocationToAVGWithoutCostItem(cc_ids, sr_id, longitude, latitude, cost_item, callBack) {


        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
            var cursorIndex = collection.createIndex({location: "2dsphere"});
            // console.log("----------" + cc_ids);
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
                // console.log(" --- " + userSPidList);
                var totalCost = 0;
                if (userSPidList.length > 0) {
                    cost_item.forEach(function (elementCost) {
                        //    console.log(" --- 333" + elementCost);
                        module.exports.getSPUserCCRatData(userSPidList, sr_id, elementCost.cc_id, function (resultCost) {
                            var userSPidSetRate = [];
                            resultCost.forEach(function (element) {
                                userSPidSetRate.push(element.cost_components_on[0].cc_rate_per_item)
                            });

                            var avg = 0;
                            module.exports.getSR_AVGData(sr_id, elementCost.cc_id, function (resultCost) {

                                // console.log("----77" + resultCost[0].cost_components[0].average);
                                avg = parseFloat(resultCost[0].cost_components[0].average);

                                // console.log("----55" + avg);
                                var cost = (parseFloat(avg) * parseFloat(elementCost.cc_per_item_qut));
                                totalCost = (totalCost + cost);

                                // var dataCostItem = {
                                //     cc_id: elementCost.cc_id,
                                //     cc_cu_title: elementCost.cc_cu_title,
                                //     show_order: elementCost.show_order,
                                //     cc_sp_title: elementCost.cc_sp_title,
                                //     hcc_id: elementCost.hcc_id,
                                //     hcc_title: elementCost.hcc_title,
                                //     cc_per_item_qut: elementCost.cc_per_item_qut,
                                //     cc_per_item_rate: avg.toFixed(2),
                                //     cc_per_item_cost: cost.toFixed(2)
                                //
                                // };
                                //
                                // newCost_components.push(dataCostItem);

                                ctr++;
                                if (ctr === cc_ids.length) {
                                    var sendData = {
                                        // itemCost: newCost_components,
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

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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
                bookingDateTime: postData.bookingDateTime,
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
                repeatedDiscountGive: "0",
                kaikili_commission: postData.kaikili_commission,
                sr_type: postData.sr_type,
                sr_total: postData.sr_total,
                sp_net_pay: postData.sp_net_pay,
                coordinatePoint: postData.coordinatePoint,
                cp_review: postData.cp_review,
                sp_review: postData.sp_review,
                distance: postData.distance,
                sp_service_area: postData.sp_service_area,
                creationDate: new Date().toUTCString(),
                service_book_type: "preferred_provider",
                sp_view: false,
                otp: module.exports.getRandomInt(9999),
                coupon_code: postData.coupon_code,
                coupon_apply: postData.coupon_apply,
                coupon_code_discount_amount: postData.coupon_code_discount_amount,

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


            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                collectionCU.insertOne(newBookServiceUser, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed !. Server Error....."
                        };
                        console.log(status);
                        // callback(status);
                        return callBack(status);
                    } else {

                        if (postData.sr_status == "Scheduled") {
                            module.exports.kaikiliWalletCreditCustomerAmount("TR0" + result);
                        }

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
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
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


    updateServiceCompleted(cu_id, sp_id) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var cuProfile = db.db(config.dbName).collection(config.collections.cu_profile);
            var spProfile = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            var newId = null;
            var queryCu = {cu_id: cu_id};
            var querySp = {sp_id: sp_id};
            var update = {$inc: {service_count: 1}};
            var options = {upsert: true, 'new': true, setDefaultsOnInsert: true};
            cuProfile.findOneAndUpdate(queryCu, update, options, function (err, doc) {
                console.log("444444---------->" + doc.value.service_count);
            });
            spProfile.findOneAndUpdate(querySp, update, options, function (err, doc) {
                console.log("55555---------->" + doc.value.service_count);
                newId = doc.value.service_count;
            });
        });
    },

    getTransitionInfo(tran_id, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var transitionCollection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var query = {tran_id: tran_id};
            transitionCollection.findOne(query, function (err, doc) {
                // console.log(doc);
                return callBack(doc);
            });
        });
    },


    spCurrentBalance(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_earn_wallet);
            var query = {sp_id: sp_id};
            var mysort = {_id: -1};
            spEarnWallet.find(query).sort(mysort).toArray(function (err, doc) {

                console.log("---->" + doc.length);
                if (doc.length > 0) {
                    return callBack(doc[0].close);
                } else {
                    return callBack(0);
                }
            });
        });
    },


    spEranInfoUpdate(sp_id, tran_id, comment, credit, debit, type) {

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_earn_wallet);
            var query = {sp_id: sp_id};
            // var mysort = {updateDate: -1};
            var mysort = {_id: -1};
            spEarnWallet.find(query).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {

                    var current;
                    if (credit > 0) {
                        current = parseFloat(doc[0].close) + parseFloat(credit);
                    } else {
                        current = parseFloat(doc[0].close) - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        type: type,
                        tran_id: tran_id,
                        comment: comment,
                        opening: doc[0].close,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }

                    spEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });

                } else {

                    var current;
                    if (credit > 0) {
                        current = 0 + parseFloat(credit);
                    } else {
                        current = 0 - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        type: type,
                        tran_id: tran_id,
                        comment: comment,
                        opening: 0,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }
                    spEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });
                }

            });
        });

    },


    spTripInfoUpdate(sp_id, sp_name, cu_id, cu_name, tran_id, comment, amount) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_tip_info);
            var reviewTipAdd = {
                cust_id: cu_id,
                cu_name: cu_name,
                sp_id: sp_id,
                sp_name: sp_name,
                tran_id: tran_id,
                comment: comment,
                amount: amount,
                creationDate: new Date().toUTCString()
            };
            spEarnWallet.insertOne(reviewTipAdd, function (err, doc) {
            });

        });

    },


    kaiKiliEranInfoUpdate(sp_id, tran_id, comment, credit, debit, type) {

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.kk_earn_wallet);
            // var query = {sp_id: sp_id};
            // var mysort = {updateDate: -1};
            var mysort = {_id: -1};
            spEarnWallet.find({}).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {

                    var current;
                    if (credit > 0) {
                        current = parseFloat(doc[0].close) + parseFloat(credit);
                    } else {
                        current = parseFloat(doc[0].close) - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        type: type,
                        tran_id: tran_id,
                        comment: comment,
                        opening: doc[0].close,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }

                    spEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });

                } else {

                    var current;
                    if (credit > 0) {
                        current = 0 + parseFloat(credit);
                    } else {
                        current = 0 - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        type: type,
                        tran_id: tran_id,
                        comment: comment,
                        opening: 0,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }
                    spEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });
                }

            });
        });

    },


    getRandomInt(max) {
        var num1 = math.floor(math.random() * math.floor(max))
        if (num1 < 1000) {
            return num1 + 1000;
        } else {
            return num1;
        }


    },

    getSPUserRepeatedService(sp_id, cc_ids, sr_id, cost_item, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
            var cursorIndex = collection.createIndex({location: "2dsphere"});
            console.log("----------" + cc_ids);
            var cursorSearch = collection.aggregate([
                {
                    $match: {
                        sp_id: sp_id, services: sr_id, cost_comps: {$all: cc_ids}
                    }
                }]);

            cursorSearch.toArray(function (err, mainDocs) {
                console.log(mainDocs.length + "----------size");
                if (err) {
                    console.log(err + "----err");
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....."
                    };
                    // console.log(status);
                    callback(status);

                } else {

                    // var newArrData = new Array();
                    var ctr = 0;
                    var newArrServic = new Array();

                    if (mainDocs.length > 0) {
                        mainDocs.forEach(function (element) {

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
                                    var discountRepeatedGive = 0;
                                    if (docs[0].repeated_service_book_offer == "ON") {
                                        discountRepeatedGive = docs[0].repeated_service_book_offer_rat;
                                    }


                                    var discountAmount = (totalCost * parseFloat(discountGive)) / 100;
                                    var discountAfterPrice = totalCost - discountAmount;
                                    var scheduleDiscountAfterPrice = totalCost - discountAmount;

                                    if (docs[0].repeated_service_book_offer == "ON") {
                                        discountRepeatedGive = docs[0].repeated_service_book_offer_rat;
                                        var discountRepeatedAmount = (discountAfterPrice * parseFloat(discountRepeatedGive)) / 100;
                                        var discountAfterPrice = discountAfterPrice - discountRepeatedAmount;
                                    }

                                    var dataShow = {
                                        sp_id: docs[0].sp_id,
                                        minimum_charge: docs[0].minimum_charge,
                                        totalCost: totalCost,
                                        kaikili_commission: parseFloat(docs[0].services.sr_commission) / 4,
                                        itemCost: newItemCost,
                                        discountGive: discountGive,
                                        repeatedDiscountGive: discountRepeatedGive,
                                        discountAfterPrice: discountAfterPrice,
                                        scheduleDiscountAfterPrice: scheduleDiscountAfterPrice,

                                        dist: element.dist,
                                        sp_about: docs[0].userprofile.about_sp_profile,
                                        sp_workImage: docs[0].userprofile.workImages,
                                        avg_response: docs[0].userprofile.avg_response,
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

                                        // console.log("------length >" + result.length);
                                        var status = {
                                            status: 1,
                                            message: "Success Get all Transition service list",
                                            data: newArrServic,
                                        };
                                        return callBack(status);
                                    }
                                }
                            });

                        });
                    } else {
                        var status = {
                            status: 1,
                            message: "Success Get all service list",
                            data: newArrServic
                        };
                        return callBack(status);
                    }
                }
            });
        });
    },

    cuInterestedServicesAdd(body) {
        module.exports.getNextSequenceUserID("cu_search_id", function (result) {
            //  console.log(result);
            var tran_id = "cu_search_" + result;
            var post = {
                "cu_search_id": tran_id,
                location: {
                    coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)],
                    type: "Point"
                },
                "address": body.address,
                "comment": body.comment,
                "sr_id": body.sr_id,
                "sr_title": body.sr_name,
                "type_of_service": body.type_of_service,
                "cost_item": body.cost_item,
                "time": body.time,
                "date": body.date,
                "cc_ids": body.cc_ids,
                "cu_id": body.cu_id,
                "book_service": "false",
                "cu_first_name": body.cu_first_name,
                "cu_last_name": body.cu_last_name,
                "mobile_no": body.mobile_no,
                "cu_images": body.cu_images,
                "creationDate": new Date().toISOString()
            };

            module.exports.cuInterestedRemoveBookServicesData(body.sr_id, body.cost_item, body.cu_id, body.longitude, body.latitude);


            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                var spEarnWallet = db.db(config.dbName).collection(config.collections.cu_interested_services);
                spEarnWallet.insertOne(post, function (err, doc) {
                });
            });
        });
    },


    getAlreadySendInterestedRequestId(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
            var query = {
                "creationDate":
                    {
                        $gte: new Date(new Date().setHours(0, 0, 0)).toISOString(),
                        $lt: new Date(new Date().setHours(47, 59, 59)).toISOString()
                    }, "sp_id": sp_id
            };
            autoIdCollection.find(query).toArray(function (err, doc) {
                var userSRidList = [];
                console.log(doc.length);
                if (doc.length > 0) {
                    var count = 0
                    doc.forEach(function (element) {
                        userSRidList.push(element.cu_search_id);
                        console.log(element.cu_search_id);
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


    getInterestedRequestDataFilter1(longitude, latitude, userSRidList, radius, type_of_service, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.cu_interested_services);
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
                            "creationDate": {
                                $gte: new Date(new Date().setHours(0, 0, 0)).toISOString(),
                                $lt: new Date(new Date().setHours(47, 59, 59)).toISOString()
                            },
                            book_service: "false",
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
                console.log("----555" + mainDocs.length);
                console.log("----555" + new Date(new Date().setHours(0, 0, 0)).toUTCString(),);
                console.log("----555" + new Date(new Date().setHours(47, 59, 59)).toUTCString());
                return callBack(mainDocs);
            });
        });
    },


    cuInterestedRemoveBookServicesData(sr_id, itemCost, cu_id, latitude, longitude) {
        // var cc_ids = new Array();
        // itemCost.forEach(function (ccid_item) {
        //     cc_ids.push(ccid_item.cc_id)
        // });

        var post = {
            // location: {
            //     coordinates: [parseFloat(longitude), parseFloat(latitude)],
            //     type: "Point"
            // },
            sr_id: sr_id,
            // cc_ids: cc_ids,
            cu_id: cu_id,
            book_service: "false"
        };

        // console.log(JSON.stringify(post, null, 2));
        // console.log("----111" + post);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.cu_interested_services);
            spEarnWallet.update(post, {$set: {book_service: "true"}}, function (err, doc) {
                // console.log("----222" + doc);
            });
        });

    },


    getSPUserRadiusLocationToAVGShout(sr_id, longitude, latitude, cost_item, callBack) {
        var cc_ids = new Array();
        cost_item.forEach(function (data) {
            cc_ids.push(data.cc_id);
        });

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
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


    getCostHelperNearestServiceProvider(spid, sr_id, cc_ids, cost_item, callBack) {

        module.exports.getSPUserLocation(spid, function (result) {

            // console.log(longitude + " --- " + req.body.cc_ids);
            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                var cursorIndex = collection.createIndex({location: "2dsphere"});
                var radius = (parseFloat(result.radius) * parseFloat("1609.34"));
                //          console.log("----------" + cc_ids);
                var cursorSearch = collection.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [parseFloat(result.longitude), parseFloat(result.latitude)]
                            },
                            // [parseFloat(longitude), parseFloat(latitude)]},
                            key: "location",
                            // maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                            maxDistance: radius,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                            distanceField: "dist", //give values in metre
                            query: {services: sr_id, cost_comps: {$all: cc_ids}}//{services: sr_id}// cost_comps: cc_ids
                        }
                    }]);

                cursorSearch.toArray(function (err, mainDocs) {
                    // console.log(mainDocs.length + "----------size");
                    if (err) {
                        //  console.log(err + "----err");
                        var status = {
                            status: 0,
                            message: "Failed !. Server Error....."
                        };
                        // console.log(status);
                        // callback(status);
                        return callBack(status);

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
                                //   console.log(parseFloat(element.dist) + " <= " + parseFloat(newRadius));
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
                                            var status = {
                                                status: 0,
                                                message: "Failed"
                                            };
                                            // console.log(status);
                                            // callback(status);
                                            return callBack(status);

                                            // console.log(err);
                                        } else {
                                            // console.log(docs);
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
                                                    cc_per_item_cost: cost.toFixed(2),
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
                                                totalCost: totalCost.toFixed(2),
                                                kaikili_commission: docs[0].services.sr_commission,
                                                // itemCost: newItemCost,
                                                discountGive: discountGive.toFixed(2),
                                                discountAfterPrice: discountAfterPrice.toFixed(2),
                                                dist: element.dist,
                                                // sp_about: docs[0].userprofile.about_sp_profile,
                                                // sp_workImage: docs[0].userprofile.workImages,
                                                // avg_response: docs[0].userprofile.avg_response,
                                                // service_count: docs[0].userprofile.service_count,
                                                // avg_rating: docs[0].userprofile.avg_rating,
                                                // sp_image: docs[0].userprofile.profile_image,
                                                // sp_service_area: docs[0].userprofile.service_area,
                                                // sp_coordinatePoint: docs[0].userprofile.coordinatePoint,
                                                // sp_first_name: docs[0].profile.first_name,
                                                // sp_last_name: docs[0].profile.last_name,
                                                // sp_mobile_no: docs[0].profile.mobile_no

                                            };
                                            newArrServic.push(dataShow);
                                            ctr++;
                                            if (ctr === mainDocs.length) {
                                                module.exports.getSPUserRadiusLocationToAVGWithoutCostItem(cc_ids, sr_id, result.longitude, result.latitude, cost_item, function (result) {
                                                    // console.log("------length >" + result.length);
                                                    var status = {
                                                        status: 1,
                                                        message: "Success Get all Transition service list",
                                                        data: newArrServic,
                                                        preferred_provider: newPreferredArrServic,
                                                        //  pps_data: newPreferredArrData,
                                                        preferred_data: result
                                                    };

                                                    return callBack(status);
                                                    // callback(status);
                                                });
                                            }
                                        }
                                    });
                                } else {

                                    ctr++;
                                    if (ctr === mainDocs.length) {
                                        module.exports.getSPUserRadiusLocationToAVGWithoutCostItem(cc_ids, sr_id, result.longitude, result.latitude, cost_item, function (result) {
                                            // console.log("------length >" + result.length);

                                            var status = {
                                                status: 1,
                                                message: "Success Get all Transition service list",
                                                data: newArrServic,
                                                preferred_provider: newPreferredArrServic,
                                                pps_data: newPreferredArrData,
                                                preferred_data: result
                                            };
                                            return callBack(status);
                                            // callback(status);
                                        });
                                    }

                                }
                            });
                        } else {
                            module.exports.getSPUserRadiusLocationToAVGWithoutCostItem(cc_ids, sr_id, result.longitude, result.latitude, cost_item, function (result) {
                                //   console.log("------length >" + result.length);

                                var status = {
                                    status: 1,
                                    message: "Success Get all service list",
                                    data: newArrServic,
                                    preferred_provider: newPreferredArrServic,
                                    pps_data: newPreferredArrData,
                                    preferred_data: result
                                };
                                // callback(status);
                                return callBack(status);
                            });
                        }
                    }
                });

            });

        });
    },


    checkServiceProviderAvailability(date, time, dayList, callBack) {

        var weekday = new Array(7);
        weekday[0] = "sun";
        weekday[1] = "mon";
        weekday[2] = "tue";
        weekday[3] = "wed";
        weekday[4] = "thu";
        weekday[5] = "fri";
        weekday[6] = "sat";

        var bookDate = new Date(date);

        console.log("=====" + bookDate.getDay())
        var day1 = weekday[bookDate.getDay()];
        var count = 0;
        var sendData = false;
        dayList.forEach(function (element) {
            if (element.dayName == day1) {
                //  console.log("-----start time --"+date+" "+element.start_time.substr(0,5)+" UTC");
                //  console.log("-----start time --"+date+" "+element.end_time.substr(0,5)+" UTC");
                //  console.log("-----start time --"+(new Date (date+" "+element.end_time.substr(0,5)+" UTC")));
                var startTime = new Date(date + " " + element.start_time.substr(0, 5) + " UTC");
                // console.log("-----startTime "+startTime);
                var bookTime = new Date(date + " " + time.substr(0, 5) + " UTC");
                // console.log("-----bookTime "+bookTime);
                // console.log("-----end time --"+date +" "+element.end_time.substr(0,5));
                // console.log("-----end time --"+(new Date (date+" "+element.end_time.substr(0,5)+" UTC")));
                var endTime = new Date(date + " " + element.end_time.substr(0, 5) + " UTC");
                console.log("------endTime " + endTime);
                console.log("------>>>>>" + (startTime < bookTime));
                console.log("------>>>>>" + (bookTime < endTime));
                if ((startTime < bookTime) && (bookTime < endTime)) {
                    sendData = true;
                    return callBack(sendData);
                }
            }
            count++;
            if (count == dayList.length) {
                return callBack(sendData);
            }
        });
    },


    getSPProfileServiceData(spid, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            spEarnWallet.findOne({sp_id: spid}, function (err, doc) {
                console.log("------>>>>>" + doc);
                return callBack(doc);
            });
        });
    },


    cuServiceCancellationCharges(docs) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var service_cancellation = db.db(config.dbName).collection(config.collections.cu_service_cancellation_charges);

            var canCharges;
            if (parseFloat(docs.minimum_charge) > parseFloat(docs.sp_net_pay)) {
                // canCharges = (parseFloat(docs.minimum_charge) * 5) / 100;
                canCharges = (parseFloat(docs.minimum_charge) * setting.getCustomer_Cancel_Book_Service()) / 100;
            } else {
                canCharges = (parseFloat(docs.sp_net_pay) * setting.getCustomer_Cancel_Book_Service()) / 100;
                // canCharges = (parseFloat(docs.sp_net_pay) * 5) / 100;
            }

            var messagesBody = {
                tran_id: docs.tran_id,
                sr_id: docs.sr_id,
                type_of_service: docs.type_of_service,
                sr_title: docs.sr_title,
                time: docs.time,
                date: docs.date,
                cust_id: docs.cust_id,
                cust_first_name: docs.cust_first_name,
                cust_last_name: docs.cust_last_name,
                sp_first_name: docs.sp_first_name,
                sp_Last_name: docs.sp_Last_name,
                sp_id: docs.sp_id,
                sr_status: docs.sr_status,
                txn_status: docs.txn_status,
                totalCost: docs.totalCost,
                minimum_charge: docs.minimum_charge,
                sr_type: docs.sr_type,
                sr_total: docs.sr_total,
                sp_net_pay: docs.sp_net_pay,
                cancellation_charges: canCharges.toFixed(2)

            };
            service_cancellation.insertOne(messagesBody);
        });
    },


    cuServiceCancellationChargesSP(docs) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var service_cancellation = db.db(config.dbName).collection(config.collections.sp_service_cancellation_charges);

            var canCharges;
            if (parseFloat(docs.minimum_charge) > parseFloat(docs.sp_net_pay)) {
                canCharges = (parseFloat(docs.minimum_charge) * setting.getProvider_Cancel_Book_Service()) / 100;
                // canCharges = (parseFloat(docs.minimum_charge) * 5) / 100;
            } else {
                canCharges = (parseFloat(docs.sp_net_pay) * setting.getProvider_Cancel_Book_Service()) / 100;
                // canCharges = (parseFloat(docs.sp_net_pay) * 5) / 100;
            }

            var messagesBody = {
                tran_id: docs.tran_id,
                sr_id: docs.sr_id,
                type_of_service: docs.type_of_service,
                sr_title: docs.sr_title,
                time: docs.time,
                date: docs.date,
                cust_id: docs.cust_id,
                cust_first_name: docs.cust_first_name,
                cust_last_name: docs.cust_last_name,
                sp_first_name: docs.sp_first_name,
                sp_Last_name: docs.sp_Last_name,
                sp_id: docs.sp_id,
                sr_status: docs.sr_status,
                txn_status: docs.txn_status,
                totalCost: docs.totalCost,
                minimum_charge: docs.minimum_charge,
                sr_type: docs.sr_type,
                sr_total: docs.sr_total,
                sp_net_pay: docs.sp_net_pay,
                cancellation_charges: canCharges.toFixed(2)

            };
            service_cancellation.insertOne(messagesBody);
            module.exports.spEranInfoUpdate(docs.sp_id, docs.tran_id, "Service provider cancel service.", 0, canCharges, "Debit")
        });
    },


    cuServiceCancellationChargesSPProgress(docs) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var service_cancellation = db.db(config.dbName).collection(config.collections.sp_service_cancellation_charges);

            var canCharges;
            if (parseFloat(docs.minimum_charge) > parseFloat(docs.sp_net_pay)) {
                // canCharges = (parseFloat(docs.minimum_charge) * 10) / 100;
                canCharges = (parseFloat(docs.minimum_charge) * setting.getProvider_Cancel_Book_Service_Progress()) / 100;
            } else {
                canCharges = (parseFloat(docs.sp_net_pay) * setting.getProvider_Cancel_Book_Service_Progress()) / 100;
                // canCharges = (parseFloat(docs.sp_net_pay) * 10) / 100;
            }

            var messagesBody = {
                tran_id: docs.tran_id,
                sr_id: docs.sr_id,
                type_of_service: docs.type_of_service,
                sr_title: docs.sr_title,
                time: docs.time,
                date: docs.date,
                cust_id: docs.cust_id,
                cust_first_name: docs.cust_first_name,
                cust_last_name: docs.cust_last_name,
                sp_first_name: docs.sp_first_name,
                sp_Last_name: docs.sp_Last_name,
                sp_id: docs.sp_id,
                sr_status: docs.sr_status,
                txn_status: docs.txn_status,
                totalCost: docs.totalCost,
                minimum_charge: docs.minimum_charge,
                sr_type: docs.sr_type,
                sr_total: docs.sr_total,
                sp_net_pay: docs.sp_net_pay,
                cancellation_charges: canCharges.toFixed(2)

            };
            service_cancellation.insertOne(messagesBody);
            module.exports.spEranInfoUpdate(docs.sp_id, docs.tran_id, "Service provider cancel service : Cancel-Progress-Auto", 0, canCharges, "Debit")

        });
    },


    autoTimerService() {
        console.log("=====" + " auto timer calll");

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, dbas) {
            var collection = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var collectionPP = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
            var collectionShout = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            var collectionInterested = dbas.db(config.dbName).collection(config.collections.sp_cu_send_interested);

            collection.find({sr_status: {$in: ["Open", "Rescheduled", "Scheduled", "Progress"]}}).toArray(function (err, mainDocs) {
                if (err) {
                } else {
                    console.log("=====" + mainDocs.length);

                    mainDocs.forEach(function (element) {

                        console.log("=====" + element.tran_id + " --- " + element.sr_status);

                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);

                            // var duration = moment.duration(end_date.diff(start_date));
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());
                            timeMin = duration / 60000;

                            if (timeMin >= 4 && timeMin < 5) {
                                var message = "Customer Create New Service Remainder"
                                console.log("------->>> " + "Send Notification ......");
                                module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
                                //Send Notification
                            } else if (timeMin >= 5) {
                                //Auto remove
                                var serviceUpdate = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };

                                console.log("------->>> " + "Send Notification ......");
                                collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                var message = "Auto Cancel Service Remainder"
                                module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");

                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                bulkRemove.find({tran_id: element.tran_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        bulkRemove.removeOne({tran_id: element.tran_id});
                                    }
                                )

                            } else {
                                console.log("=====" + element.tran_id + "  open");
                            }
                        } else if (element.sr_status == "Rescheduled") {

                            var timeMin;


                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.updateDate);
                            var end_date = new Date(res_time);
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());

                            // var res_time = new Date().toUTCString();
                            // var start_date = moment(element.updateDate,"MMM dd, yyyy HH:mm:ss z");
                            //
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;

                            if (timeMin >= 9 && timeMin < 10) {
                                var message = "Service provider rescheduled your job Remainder"
                                module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
                                //Send Notification
                            } else if (timeMin >= 10) {
                                //Auto remove
                                var serviceUpdate = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };
                                collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                var message = "Auto Cancel Service Remainder"
                                module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");


                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                bulkRemove.find({tran_id: element.tran_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        bulkRemove.removeOne({tran_id: element.tran_id});
                                    }
                                )
                            } else {
                                console.log("=====" + element.tran_id + "  Rescheduled");
                            }

                        } else if (element.sr_status == "Scheduled") {

                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.bookingDateTime);
                            var end_date = new Date(res_time);
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());


                            // var res_time = new Date().toUTCString();
                            // console.log("=====" + res_time);
                            // var start_date = moment(element.bookingDateTime,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // // var duration1 = moment.duration(start_date.diff(end_date));
                            // var duration = moment.duration(end_date.diff(start_date));

                            timeMin = duration / 60000;
                            console.log("=====" + timeMin);
                            // console.log("1=====" + timeMin >= -24);
                            // console.log("2=====" + timeMin < -25 );I am doing my 5 minutes check
                            // if (timeMin >= -5 && timeMin < -4) {

                            if (timeMin <= -29 && timeMin > -30) {
                                console.log("2=====" + "Send Notification");
                                if (element.type_of_service == "customer_location") {
                                    var message = "Scheduled are next 30 min after start";
                                    module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
                                } else {
                                    var message = "Scheduled are next 30 min after start"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
                                }

                                // }else if(timeMin >= 5){
                            } else if (timeMin >= 30 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {
                                if (element.type_of_service == "customer_location") {
                                    module.exports.cuServiceCancellationChargesSP(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {
                                    module.exports.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");

                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id, true);
                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            } else if (timeMin >= 360 && (element.service_book_type == "shouting" || element.service_book_type == "interested")) {
                                if (element.type_of_service == "customer_location") {
                                    module.exports.cuServiceCancellationChargesSP(element);
                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");

                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id, false);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {
                                    module.exports.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id, true);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            }

                            console.log("===== id" + element.tran_id);
                            console.log("===== time" + timeMin);

                            // "type_of_service": "customer_location",
                            // "type_of_service": "provider_location",
                        } else if (element.sr_status == "Progress") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.bookingDateTime);
                            var end_date = new Date(res_time);
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());

                            // var res_time = new Date().toUTCString();
                            console.log("===== res_time " + res_time);
                            // console.log("=====element.bookingDateTime" + element.bookingDateTime);
                            // var start_date = moment(element.bookingDateTime,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // // var duration1 = moment.duration(start_date.diff(end_date));
                            // var duration = moment.duration(end_date.diff(start_date));

                            timeMin = duration / 60000;
                            console.log("=====" + timeMin + " ----14");

                            // wait for 24 hour
                            if (timeMin >= 14 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {

                                if (element.type_of_service == "customer_location") {
                                    module.exports.cuServiceCancellationChargesSPProgress(element);
                                    var serviceUpdate = {
                                        sr_status: "Cancel-Progress-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");

                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id, false);


                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {
                                    module.exports.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Progress-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");

                                    module.exports.kaikiliWalletDebitCustomerAmount(element.tran_id, true);


                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            }

                        } else {
                            console.log("===== id" + element.sr_status);
                        }

                    });
                }
            });

            collectionPP.find({sr_status: {$in: ["Open"]}}).toArray(function (err, mainDocs) {
                if (err) {
                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {

                        var timeMin;
                        var res_time = new Date().toUTCString();
                        var start_date = new Date(element.creationDate);
                        var end_date = new Date(res_time);
                        var duration = Math.abs(end_date.getTime() - start_date.getTime());

                        // var res_time = new Date().toUTCString();
                        // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                        // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                        // var duration = moment.duration(end_date.diff(start_date));
                        timeMin = duration / 60000;
                        console.log("pps id ---->>>" + element.pps_id);
                        if (timeMin >= 4 && timeMin < 5) {

                            var message = "New kaikili preferred provider Job."
                            element.preferredProvider.forEach(function (element11) {
                                module.exports.sendServiceNotification(element11, element.pps_id, message, "New", "pps");
                            });

                        } else if (timeMin >= 5) {
                            //Auto remove
                            var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                            var bulkRemove = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                            var cu_sp_pps_send = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_send);

                            var serviceUpdate = {
                                sr_status: "Cancel-New-Auto",
                                updateDate: new Date().toUTCString()
                            };

                            bulkRemove.update({pps_id: element.pps_id}, {$set: serviceUpdate});

                            element.preferredProvider.forEach(function (element11) {
                                console.log("1=====" + element.pps_id);
                                console.log("2=====" + element11);
                                cu_sp_pps_send.update({
                                    pps_id: element.pps_id,
                                    sp_id: element11
                                }, {$set: serviceUpdate});
                            });

                            var message = "Auto Cancel Service Remainder"
                            module.exports.sendCustomerNotification(element.cust_id, element.pps_id, message, "Cancel-New-Auto", "pps");


                            bulkRemove.find({pps_id: element.pps_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    bulkRemove.removeOne({pps_id: element.pps_id});
                                }
                            )
                        }
                    });
                }
            });

            collectionShout.find({}).toArray(function (err, mainDocs) {
                if (err) {

                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {
                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());


                            // var res_time = new Date().toISOString();
                            // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;

                            if (timeMin >= 4 && timeMin < 5) {
                                module.exports.sendCustomerNotification(element.cu_id, element.sp_cp_alert_send_id, "Service Provider Send Neighborhood Shout Request", "Neighborhood Shout", "shout");

                            } else if (timeMin >= 5) {

                                var updateTran = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };

                                collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                                collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                                    }
                                );

                            }
                        } else {
                            collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                            var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                            collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                                }
                            );
                        }
                    });
                }
            });

            collectionInterested.find({}).toArray(function (err, mainDocs) {
                if (err) {

                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {
                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);
                            var duration = Math.abs(end_date.getTime() - start_date.getTime());


                            // var res_time = new Date().toISOString();
                            // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;
                            // "cu_interested_rq_id": "cu_interested_rq_4",
                            if (timeMin >= 4 && timeMin < 5) {
                                module.exports.sendCustomerNotification(element.cu_id, element.cu_interested_rq_id, "Service Provider Send Interested Service Request", "Interested to Service", "cu_interested");

                            } else if (timeMin >= 5) {

                                var updateTran = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };
                                collectionInterested.updateOne({cu_interested_rq_id: element.cu_interested_rq_id}, {$set: updateTran});
                            }
                        } else {
                            // collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                            // var bulkInsert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                            // collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                            //     function (doc) {
                            //         bulkInsert.insertOne(doc);
                            //         collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                            //     }
                            // );
                        }
                    });
                }
            });


        });
    },


    getSPtoCustomerRating(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
            var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_review);
            var cursorSearch = collection.aggregate([
                {
                    $match: {
                        sp_id: sp_id
                    }
                }, {
                    $lookup: {
                        from: config.collections.cu_profile,
                        localField: "cust_id",
                        foreignField: "cu_id",
                        as: "services"
                    }
                }, {
                    $unwind: "$services"
                },
                {
                    $project: {
                        _id: 1,
                        cust_id: 1,
                        sp_id: 1,
                        tran_id: 1,
                        sr_id: 1,
                        rating: 1,
                        comment: 1,
                        creationDate: 1,
                        first_name: "$services.first_name",
                        last_name: "$services.last_name",
                        cu_image: "$services.cu_image",
                        review_image: 1
                    }
                }
            ]);

            cursorSearch.toArray(function (err, mainDocs) {
                return callBack(mainDocs);
            });
        });
    },


    // Get Data Dispute 18 -12-2019
    FAQDataRead: function (req, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.faqs);
            collection.find({status: "1"}).toArray(function (err, dataSet) {
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
    },


    //Delete Alert data 5-2-2020
    deletedAlertService(cp_alert_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_deleted_alert_data);
            var bulkRemove = db.db(config.dbName).collection(config.collections.cu_service_alert);
            bulkRemove.findOne({cp_alert_id: cp_alert_id}, function (err, doc) {

                    if (err) {

                        var status = {
                            status: 0,
                            message: "Failed !. Server Error....."
                        };
                        return callBack(status);
                    } else {
                        if (doc != null) {
                            bulkInsert.insertOne(doc);
                            bulkRemove.removeOne({cp_alert_id: cp_alert_id});
                            console.log("---- Deleted data");
                        }
                        var status = {
                            status: 1,
                            message: "Successfully remove shouting data."
                        };
                        return callback(status);
                    }
                }
            )
        });
    },

    //customer service book conform to credit amount in kaikili wallet
    kaikiliWalletCreditCustomerAmount(tran_id) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            collection.find({tran_id: tran_id}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    var getAmount
                    console.log("add kaikili wallet balenc");

                    if (parseFloat(docs[0].minimum_charge) > parseFloat(docs[0].sp_net_pay)) {

                        if (docs[0].coupon_apply == true) {

                            getAmount = parseFloat(docs[0].minimum_charge) - parseFloat(docs[0].coupon_code_discount_amount);
                            module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount.", getAmount.toFixed(2), 0, "Credit")
                        } else {

                            getAmount = parseFloat(docs[0].minimum_charge);
                            module.exports.getCUCurrentOfferCredit(docs[0].cust_id, function (spCredit) {
                                if (spCredit > 0) {
                                    // var creditDis = (parseFloat(docs[0].kaikili_commission.kk_sr_commission) * 10) / 100;
                                    var creditDis = (getAmount * setting.getKaikili_Credit_Used_To_Customer()) / 100;
                                    // var creditDis = (getAmount * 5) / 100;

                                    if (parseFloat(spCredit) >= creditDis) {
                                        getAmount = getAmount - creditDis;
                                        module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Customer Book service ", "Customer Book service in used Kaikili Credit $" + creditDis, 0, creditDis, "Debit");
                                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount. +(Kaikili Credit " + creditDis + ")", getAmount.toFixed(2), 0, "Credit")

                                    } else {
                                        getAmount = getAmount - spCredit;
                                        module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Customer Book service ", "Customer Book service in used Kaikili Credit $" + spCredit, 0, spCredit, "Debit");
                                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount. +(Kaikili Credit " + spCredit + ")", getAmount.toFixed(2), 0, "Credit")
                                    }
                                } else {
                                    module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount.", getAmount.toFixed(2), 0, "Credit")
                                }

                            });
                        }

                    } else {
                        if (docs[0].coupon_apply == true) {
                            getAmount = parseFloat(docs[0].sp_net_pay) - parseFloat(docs[0].coupon_code_discount_amount);
                            module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount.", getAmount.toFixed(2), 0, "Credit")
                        } else {
                            getAmount = parseFloat(docs[0].sp_net_pay);

                            module.exports.getCUCurrentOfferCredit(docs[0].cust_id, function (spCredit) {
                                if (spCredit > 0) {
                                    // var creditDis = (parseFloat(docs[0].kaikili_commission.kk_sr_commission) * 10) / 100;
                                    // var creditDis = (getAmount * 5) / 100;
                                    var creditDis = (getAmount * setting.getKaikili_Credit_Used_To_Customer()) / 100;

                                    if (parseFloat(spCredit) >= creditDis) {
                                        getAmount = getAmount - creditDis;
                                        module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Customer Book service ", "Customer Book service in used Kaikili Credit $" + creditDis, 0, creditDis, "Debit");
                                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount. +(Kaikili Credit " + creditDis + ")", getAmount.toFixed(2), 0, "Credit")

                                    } else {
                                        getAmount = getAmount - spCredit;
                                        module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Customer Book service ", "Customer Book service in used Kaikili Credit $" + spCredit, 0, spCredit, "Debit");
                                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount. +(Kaikili Credit " + spCredit + ")", getAmount.toFixed(2), 0, "Credit")
                                    }
                                } else {
                                    module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, "New book service, Customer debit amount.", getAmount.toFixed(2), 0, "Credit")
                                }
                            });

                        }
                    }

                }
            });
        });
    },

    //customer service book conform to credit amount in kaikili wallet
    kaikiliWalletDebitCustomerAmount(tran_id, cancelCR) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            module.exports.getTransitionInfoSingID(tran_id, function (doc) {

                // // collection.find({tran_id: tran_id}).toArray(function (err, docs) {
                //     if (err) {
                //     } else {
                var docs = doc;
                var canCharges;
                var getAmount;
                var comment;
                if (parseFloat(docs[0].minimum_charge) > parseFloat(docs[0].sp_net_pay)) {
                    if (cancelCR == true) {
                        // canCharges = (parseFloat(docs[0].minimum_charge) * 5) / 100;
                        canCharges = (parseFloat(docs[0].minimum_charge) * setting.getCustomer_Cancel_Book_Service()) / 100;
                        if (docs[0].sr_status == "Cancel-Scheduled-Auto") {
                            comment = "Customer Auto cancel service give back amount to customer account.";
                        } else {
                            comment = "Customer cancel service give back amount to customer account.";
                        }

                    } else {
                        canCharges = 0;
                        if (docs[0].sr_status == "Cancel-Scheduled-Auto") {
                            comment = "Service provider Auto cancel service give back amount to customer account.";
                        } else {
                            comment = "Service provider cancel service give back amount to customer account.";
                        }

                    }

                    if (docs[0].coupon_apply == true) {
                        getAmount = parseFloat(docs[0].minimum_charge) - parseFloat(docs[0].coupon_code_discount_amount);
                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")

                    } else {
                        getAmount = parseFloat(docs[0].minimum_charge);
                        module.exports.getCUCurrentOfferDebitAmount(docs[0].cust_id, docs[0].tran_id, function (spCredit) {
                            if (spCredit > 0) {
                                getAmount = getAmount - spCredit;
                                module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Cancel Service", "Customer Book service are cancel Kaikili Credit back $" + spCredit, spCredit, 0, "Credit");
                                module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")
                            } else {
                                module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")
                            }
                        });
                    }
                } else {
                    if (cancelCR == true) {
                        canCharges = (parseFloat(docs[0].sp_net_pay) * setting.getCustomer_Cancel_Book_Service()) / 100;
                        // canCharges = (parseFloat(docs[0].sp_net_pay) * 5) / 100;
                        if (docs[0].sr_status == "Cancel-Scheduled-Auto") {
                            comment = "Customer Auto cancel service give back amount to customer account.";
                        } else {
                            comment = "Customer cancel service give back amount to customer account.";
                        }

                    } else {
                        canCharges = 0;
                        if (docs[0].sr_status == "Cancel-Scheduled-Auto") {
                            comment = "Service provider Auto cancel service give back amount to customer account.";
                        } else {
                            comment = "Service provider cancel service give back amount to customer account.";
                        }
                    }

                    if (docs[0].coupon_apply == true) {
                        getAmount = parseFloat(docs[0].sp_net_pay) - parseFloat(docs[0].coupon_code_discount_amount);
                        module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")
                        // }
                    } else {
                        getAmount = parseFloat(docs[0].sp_net_pay);

                        module.exports.getCUCurrentOfferDebitAmount(docs[0].cust_id, docs[0].tran_id, function (spCredit) {
                            if (spCredit > 0) {
                                getAmount = getAmount - spCredit;
                                module.exports.cp_offer_kaiKiliWalletUpdate(docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, "Cancel Service", "Customer Book service are cancel Kaikili Credit back $" + spCredit, spCredit, 0, "Credit");
                                module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")
                            } else {
                                module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, docs[0].tran_id, docs[0].sr_title, comment, 0, (getAmount - canCharges), "Debit")

                            }
                        });

                    }
                }

                // }
            });
        });
    },

    // comman.kaiKiliEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, docs[0].kaikili_commission.kk_sr_commission, 0, "Credit")
    kaiKiliWalletUpdate(sp_id, sp_name, cu_id, cu_name, tran_id, sr_title, comment, credit, debit, type) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.kaikili_wallet);
            // var query = {sp_id: sp_id};
            var mysort = {_id: -1};
            kkEarnWallet.find({}).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {

                    var current;
                    if (credit > 0) {
                        current = parseFloat(doc[0].close) + parseFloat(credit);
                    } else {
                        current = parseFloat(doc[0].close) - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        sp_name: sp_name,
                        cu_name: cu_name,
                        cu_id: cu_id,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: doc[0].close,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }

                    kkEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });

                } else {

                    var current;
                    if (credit > 0) {
                        current = 0 + parseFloat(credit);
                    } else {
                        current = 0 - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        cu_id: cu_id,
                        sp_name: sp_name,
                        cu_name: cu_name,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: 0,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }
                    kkEarnWallet.insertOne(paymentBody, function (err, doc) {
                    });
                }

            });
        });
    },


    //customer service book conform to credit amount in kaikili wallet
    CreditCustomerTipAmount(tran_id, tip_amount) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            collection.find({tran_id: tran_id}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    var getAmount
                    console.log("add kaikili wallet balenc");

                    module.exports.spEranInfoUpdate(docs[0].sp_id, tran_id, "Customer give tip $" + tip_amount, tip_amount, 0, "Credit");

                    module.exports.spTripInfoUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, tran_id, "Customer give tip $" + tip_amount, tip_amount);
                    module.exports.kaiKiliWalletUpdate(docs[0].sp_id, docs[0].sp_first_name + " " + docs[0].sp_Last_name, docs[0].cust_id, docs[0].cust_first_name + " " + docs[0].cust_last_name, tran_id, "Give tip", "Customer give tip to service provider", tip_amount, 0, "Credit")


                }
            });
        });
    },

    // Creating Login key 21-2-2020
    checkSPValidLogin(sp_id, key, callBack) {
        console.log("------------>>" + sp_id);
        console.log("------------>>" + key);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collection.findOne({sp_id: sp_id, login_key: key}, function (err, dataSet) {
                if (err) {
                    console.log("------------>>" + err);
                    return callBack(false);
                } else {
                    // return dataSet.length;
                    console.log("data------------>>" + dataSet);
                    if (dataSet != null) {
                        return callBack(true);
                    } else {
                        return callBack(false);
                    }
                }
            });
        });
    },

    // Creating Logout key 24-2-2020
    SPUserLogout(sp_id) {
        var upload = {
            fcm_token: "",
            login_key: "",
            onlineStatus: false,
        };
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.updateOne({sp_id: sp_id}, {$set: upload}, function (err, records) {
                console.log("---------" + err);
                console.log("---------" + records);
            });
        });
    },

    // Creating Logout key 27-2-2020
    CPUserLogout(cu_id) {
        var upload = {
            fcm_token: "",
            login_key: "",
        };
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.updateOne({cu_id: cu_id}, {$set: upload}, function (err, records) {
                console.log("---------" + err);
                console.log("---------" + records);
            });
        });
    },


    // Creating Login key 21-2-2020
    checkCUValidLogin(cu_id, key, callBack) {
        console.log("------------>>" + cu_id);
        console.log("------------>>" + key);
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_profile);
            collection.findOne({cu_id: cu_id, login_key: key}, function (err, dataSet) {
                if (err) {
                    console.log("------------>>" + err);
                    return callBack(false);
                } else {
                    // return dataSet.length;
                    console.log("data------------>>" + dataSet);
                    if (dataSet != null) {
                        return callBack(true);
                    } else {
                        return callBack(false);
                    }
                }
            });
        });
    },

    // 25-2-2020
    getTransitionInfoFull(tran_id, sp_view, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection_transaction = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var collection_transaction_completed = db.db(config.dbName).collection(config.collections.cu_sp_transaction_completed);
            var collection_transaction_cancellation = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
            if (sp_view == true) {
                collection_transaction.update({tran_id: tran_id}, {$set: {sp_view: true}});
            }

            collection_transaction.find({tran_id: tran_id}).toArray(function (err1, docsOnTr) {
                collection_transaction_completed.find({tran_id: tran_id}).toArray(function (err2, docsOnTrCom) {
                    collection_transaction_cancellation.find({tran_id: tran_id}).toArray(function (err3, docsOnTrCan) {

                        if (err1 || err2 || err3) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {

                            var doc = docsOnTr.concat(docsOnTrCom);
                            var doc = doc.concat(docsOnTrCan);

                            if (doc.length > 0) {
                                var status = {
                                    status: 1,
                                    message: "Success upload to service to server",
                                    data: doc[0]
                                };
                                console.log();
                                callback(status);
                            } else {
                                var status = {
                                    status: 0,
                                    message: "No Transaction found.",
                                };
                                console.log();
                                callback(status);
                            }
                        }

                    });
                });
            });

        });
    },

    // Post new Message 25-2-2020
    notificationPost(tran_id, cu_id, sp_id, body, callback) {

        module.exports.getTransitionInfo(tran_id, function (transitionData) {

            var messagesBody;
            if (sp_id == null) {
                messagesBody = {
                    author: cu_id,
                    author_type: "CU",
                    sp_delet: "0",
                    cu_delte: "0",
                    sp_read: "0",
                    cu_read: "0",
                    created_on: new Date().toISOString(),
                    body: body
                };

                try {
                    module.exports.sendServiceNotification(transitionData.sp_id, tran_id, body, "Messages", "chat");
                } catch (error) {
                    console.error(error);
                }


            } else {
                messagesBody = {
                    author: sp_id,
                    author_type: "SP",
                    sp_delet: "0",
                    cu_delte: "0",
                    sp_read: "0",
                    cu_read: "0",
                    created_on: new Date().toISOString(),
                    body: body
                };
                try {
                    module.exports.sendCustomerNotification(transitionData.cust_id, tran_id, body, "Messages", "chat");
                } catch (error) {
                    console.error(error);
                }
            }

            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {

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
                            message: "Success to load bank info",
                            data: docs
                        };
                        callback(status);
                        // console.log("Update in Notification");
                        // console.log(docs);
                    }
                });

            });
        });
    },

    //Get Message List 25-2-2020
    singleNotification(tran_id, callback) {
        // var tran_id = req.body.tran_id;
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var mysort = {updateDate: -1};
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
            console.log(err);
            collection.find({tran_id: tran_id}
            ).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success get all transition service information",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    //Post ContectUS post 25-2-2020
    contactUsInsert(user_id, comment, topic, callback) {
        module.exports.getNextSequenceUserID("contact_req", function (result) {
            //  console.log(result);
            var newPost = {
                con_id: "CONTACT0" + result,
                post_user_id: user_id,
                comment: comment,
                topic: topic,
                admin_view: 0,
                admin_replay: 0,
                admin_favourite: 0,
                is_deleted: 0,
                creationDate: new Date().toUTCString(),
                admin_replay_date: "",
                admin_replay_ms: ""
            };
            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.contact_req);
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
                            data: dataSet
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });
        });
    },

    //Preferred Provider Info 25-2-2020
    preferredProviderInfo(pps_id, read, callback) {

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);

            if (read == true)
                collection.update({pps_id: pps_id}, {$set: {sp_show: true}});

            // Update service record
            collection.find({pps_id: pps_id}).toArray(function (err, docs) {
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
                        ppsdata: docs
                    };
                    console.log();
                    callback(status);

                }
            });
        });
    },

    //Preferred Provider Info Cancel 25-2-2020
    preferredProviderInfoCancel(pps_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);

            // Update service record
            collection.find({pps_id: pps_id}).toArray(function (err, docs) {
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
                        ppsdata: docs
                    };
                    console.log();
                    callback(status);

                }
            });
        });
    },


    spUserUpdateStatus(sp_id, onlineStatus) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_personal_info);
            collectionSP.updateOne({sp_id: sp_id}, {$set: {onlineStatus: onlineStatus}});
        });
    },


    spToCheckBookingDate(sp_id, bookingDateTime, callback) {

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, dbas) {
                var collection = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                collection.find({sp_id: sp_id, sr_status: {$in: ["Scheduled"]}}).toArray(function (err, mainDocs) {
                    if (err) {
                        callback(false);
                    } else {
                        var cout = 0;
                        console.log("=====>>" + mainDocs.length);
                        if (mainDocs.length == 0) {
                            callback(false);
                        } else {
                            mainDocs.forEach(function (element) {
                                var timeMin;
                                var scheduled_date = new Date(element.bookingDateTime);
                                var end_date = new Date(bookingDateTime);
                                var duration = Math.abs(scheduled_date.getTime() - end_date.getTime());


                                // var scheduled_date = moment.utc(element.bookingDateTime);
                                // var end_date = moment.utc(bookingDateTime);
                                console.log("=====>>" + scheduled_date);
                                console.log("=====>>" + end_date);

                                // var duration = moment.duration(scheduled_date.diff(end_date));
                                var book = false;

                                timeMin = duration / 60000;
                                console.log("=====" + timeMin);

                                if (timeMin > -120 && timeMin < 120) {
                                    book = true;
                                }
                                cout++;
                                if (mainDocs.length == cout) {
                                    // return book;
                                    callback(book)
                                }
                            });
                        }
                    }
                });
            }
        )
        ;

    },


    // 29-2-2020
    getTransitionInfoSingID(tran_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collection_transaction = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var collection_transaction_completed = db.db(config.dbName).collection(config.collections.cu_sp_transaction_completed);
            var collection_transaction_cancellation = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);

            collection_transaction.find({tran_id: tran_id}).toArray(function (err1, docsOnTr) {
                collection_transaction_completed.find({tran_id: tran_id}).toArray(function (err2, docsOnTrCom) {
                    collection_transaction_cancellation.find({tran_id: tran_id}).toArray(function (err3, docsOnTrCan) {
                        var doc = docsOnTr.concat(docsOnTrCom);
                        var doc = doc.concat(docsOnTrCan);
                        callback(doc);
                    });
                });
            });

        });
    },


    // 4-3-2020 customers offers credit - debit api
    cp_offer_kaiKiliWalletUpdate(cu_id, cu_name, tran_id, sr_title, comment, credit, debit, type) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.cu_kaikili_wallet);
            var mysort = {_id: -1};
            kkEarnWallet.find({cu_id: cu_id}).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {
                    var current;
                    if (credit > 0) {
                        current = parseFloat(doc[0].close) + parseFloat(credit);
                    } else {
                        current = parseFloat(doc[0].close) - parseFloat(debit);
                    }

                    var paymentBody = {
                        cu_name: cu_name,
                        cu_id: cu_id,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: doc[0].close,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }

                    kkEarnWallet.insertOne(paymentBody);

                } else {

                    var current;
                    if (credit > 0) {
                        current = 0 + parseFloat(credit);
                    } else {
                        current = 0 - parseFloat(debit);
                    }

                    var paymentBody = {
                        cu_id: cu_id,
                        cu_name: cu_name,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: 0,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }
                    kkEarnWallet.insertOne(paymentBody);
                }
            });
        });
    },

    // 4-3-2020 service provider offers credit - debit api
    sp_offer_kaiKiliWalletUpdate(sp_id, sp_name, tran_id, sr_title, comment, credit, debit, type) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.sp_kaikili_wallet);
            var mysort = {_id: -1};
            kkEarnWallet.find({sp_id: sp_id}).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {
                    var current;
                    if (credit > 0) {
                        current = parseFloat(doc[0].close) + parseFloat(credit);
                    } else {
                        current = parseFloat(doc[0].close) - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_name: sp_name,
                        sp_id: sp_id,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: doc[0].close,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }

                    kkEarnWallet.insertOne(paymentBody);

                } else {

                    var current;
                    if (credit > 0) {
                        current = 0 + parseFloat(credit);
                    } else {
                        current = 0 - parseFloat(debit);
                    }

                    var paymentBody = {
                        sp_id: sp_id,
                        sp_name: sp_name,
                        type: type,
                        tran_id: tran_id,
                        sr_title: sr_title,
                        comment: comment,
                        opening: 0,
                        credit: credit,
                        debit: debit,
                        close: current,
                        updateDate: new Date().toUTCString()
                    }
                    kkEarnWallet.insertOne(paymentBody);
                }
            });
        });
    },


    // 4-3-2020 customers offers current credit
    getCUCurrentOfferCredit(cu_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.cu_kaikili_wallet);
            var mysort = {_id: -1};
            kkEarnWallet.find({cu_id: cu_id}).sort(mysort).toArray(function (err, doc) {
                if (doc.length > 0) {
                    callback(parseFloat(doc[0].close));
                } else {
                    callback(0);
                }
            });
        });
    },

    // 4-3-2020 provider offers current credit
    getSPCurrentOfferCredit(sp_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.sp_kaikili_wallet);
            var mysort = {_id: -1};
            kkEarnWallet.find({sp_id: sp_id}).sort(mysort).toArray(function (err, doc) {
                if (doc.length > 0) {
                    callback(parseFloat(doc[0].close));
                } else {
                    callback(0);
                }
            });
        });
    },


    // 5-3-2020 create new SP user credit opning
    createNewSPUserCredit(sp_id, sp_name) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.admin_setting);
            var mysort = {_id: -1};
            // collectionAdmin.find({}).toArray(function (err, dataAdmin) {
            kkEarnWallet.findOne({set_id: "AS001"}, function (err, adminData) {
                if (err) {
                    console.log(err);
                } else {
                    module.exports.sp_offer_kaiKiliWalletUpdate(sp_id, sp_name, "00", adminData.message, adminData.message, adminData.amount, 0, "Credit");
                }
            });
        });
    },


    // Creating Logout key 24-2-2020
    SPUserLocation(sp_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            collectionSP.findOne({sp_id: sp_id}, function (err, records) {
                if (records != null) {
                    callback(records.coordinatePoint);
                } else {
                    callback();
                }
            });
        });
    },


    // 7-3-2020 create new SP user referral credit opning
    createNewSPUserCreditGiveReferral(referral_user_id, referral_amount, referral_user_type, new_user_sp_id, sp_name) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var SPReferral = db.db(config.dbName).collection(config.collections.sp_referral_info);
            var newUser = {
                referral_user_id: referral_user_id,
                referral_amount: referral_amount,
                referral_user_type: referral_user_type,
                new_user_sp_id: new_user_sp_id,
                new_user_name: sp_name,
                creationDate: new Date().toUTCString(),
            };
            SPReferral.insert(newUser);
            module.exports.sp_offer_kaiKiliWalletUpdate(referral_user_id, sp_name, "00", "Kaikili referral bonus", "Kaikili referral " + referral_user_id + "  to  " + sp_name + " " + new_user_sp_id + " bonus " + referral_amount, referral_amount, 0, "Credit");
        });
    },

    // 11-3-2020 create new SP user referral credit opning
    createNewCUUserCreditGiveReferral(referral_user_id, referral_amount, referral_user_type, new_user_cu_id, cu_name) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var SPReferral = db.db(config.dbName).collection(config.collections.cu_referral_info);
            var newUser = {
                referral_user_id: referral_user_id,
                referral_amount: referral_amount,
                referral_user_type: referral_user_type,
                new_user_sp_id: new_user_cu_id,
                new_user_name: cu_name,
                creationDate: new Date().toUTCString(),
            };
            SPReferral.insert(newUser);
            module.exports.cp_offer_kaiKiliWalletUpdate(referral_user_id, cu_name, "00", "Kaikili referral bonus", "Kaikili referral " + referral_user_id + "  to  " + cu_name + " " + new_user_cu_id + " bonus " + referral_amount, referral_amount, 0, "Credit");
        });
    },

    // 12-3-2020 customers offers current debit
    getCUCurrentOfferDebitAmount(cu_id, tran_id, callback) {
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
            var kkEarnWallet = db.db(config.dbName).collection(config.collections.cu_kaikili_wallet);
            var mysort = {_id: -1};
            kkEarnWallet.find({cu_id: cu_id, tran_id: tran_id}).sort(mysort).toArray(function (err, doc) {
                if (doc.length > 0) {
                    callback(parseFloat(doc[0].debit));
                } else {
                    callback(0);
                }
            });
        });
    },

    //Logout Notification
    sendSPLogoutNotification(fcm_token) {

        var token = fcm_token;
        console.log("----->" + token);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token,
            // priority: "high",
            collapse_key: 'your_collapse_key',

            // notification: {
            //     title: "Kaikili-Service App",
            //     body: messages
            // },

            data: {  //you can send only notification or only data(or include both)
                tran_id: "",
                messages: "Logout User this device",
                type: "Logout",
                sr_status: "",
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


    },


}
module.exports = Comman;