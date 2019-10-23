var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
const math = require('mathjs')
const moment = require('moment')

//  "dbUrl": "mongodb://157.230.188.53:27017/",


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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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


    getSPUserRadiusLocationToAVGWithoutCostItem(cc_ids, sr_id, longitude, latitude, cost_item, callBack) {


        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
                creationDate: new Date().toUTCString()

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


    updateServiceCompleted(cu_id, sp_id) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var transitionCollection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var query = {tran_id: tran_id};
            transitionCollection.findOne(query, function (err, doc) {
                // console.log(doc);
                return callBack(doc);
            });
        });
    },


    spCurrentBalance(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_earn_wallet);
            var query = {sp_id: sp_id};
            var mysort = {updateDate: -1};
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

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_earn_wallet);
            var query = {sp_id: sp_id};
            var mysort = {updateDate: -1};
            spEarnWallet.find(query).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {

                    var current;
                    if (credit > 0) {
                        current = doc[0].close + credit;
                    } else {
                        current = doc[0].close - debit
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
                        current = 0 + credit;
                    } else {
                        current = 0 - debit
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


    spTripInfoUpdate(sp_id, cu_id, tran_id, comment, amount) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_tip_info);
            var reviewTipAdd = {
                cust_id: cu_id,
                sp_id: sp_id,
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

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.kk_earn_wallet);
            // var query = {sp_id: sp_id};
            var mysort = {updateDate: -1};
            spEarnWallet.find({}).sort(mysort).toArray(function (err, doc) {

                if (doc.length > 0) {

                    var current;
                    if (credit > 0) {
                        current = doc[0].close + credit;
                    } else {
                        current = doc[0].close - debit
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
                        current = 0 + credit;
                    } else {
                        current = 0 - debit
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
        return math.floor(math.random() * math.floor(max));
    },

    getSPUserRepeatedService(sp_id, cc_ids, sr_id, cost_item, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
                        message: "Failed"
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


            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var spEarnWallet = db.db(config.dbName).collection(config.collections.cu_interested_services);
                spEarnWallet.insertOne(post, function (err, doc) {
                });
            });
        });
    },


    getAlreadySendInterestedRequestId(sp_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
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
                            message: "Failed"
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
                                                // itemCost: newItemCost,
                                                discountGive: discountGive,
                                                discountAfterPrice: discountAfterPrice,
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
                var moment = require('moment');
                // console.log("====="+new Date(new Date().setTime(moment('14:00:00', 'HH:mm aa'))));
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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var spEarnWallet = db.db(config.dbName).collection(config.collections.sp_sr_profile);
            spEarnWallet.findOne({sp_id: spid}, function (err, doc) {
                console.log("------>>>>>" + doc);
                return callBack(doc);
            });
        });
    },


    cuServiceCancellationCharges(docs) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var service_cancellation = db.db(config.dbName).collection(config.collections.cu_service_cancellation_charges);

            var canCharges;
            if (parseFloat(docs.minimum_charge) > parseFloat(docs.sp_net_pay)) {
                canCharges = (parseFloat(docs.minimum_charge) * 5) / 100;
            } else {
                canCharges = (parseFloat(docs.sp_net_pay) * 5) / 100;
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
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var service_cancellation = db.db(config.dbName).collection(config.collections.sp_service_cancellation_charges);

            var canCharges;
            if (parseFloat(docs.minimum_charge) > parseFloat(docs.sp_net_pay)) {
                canCharges = (parseFloat(docs.minimum_charge) * 5) / 100;
            } else {
                canCharges = (parseFloat(docs.sp_net_pay) * 5) / 100;
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

    autoTimerService() {
        console.log("=====" + " auto timer calll");

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var collectionPP = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
            var collectionShout = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            var collectionInterested = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);

            collection.find({sr_status: {$in: ["Open", "Rescheduled", "Scheduled"]}}).toArray(function (err, mainDocs) {
                if (err) {
                } else {
                    console.log("=====" + mainDocs.length);

                    mainDocs.forEach(function (element) {

                        console.log("=====" + element.tran_id);

                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = moment.utc(element.creationDate);

                            var end_date = moment.utc(res_time);
                            var duration = moment.duration(end_date.diff(start_date));
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

                                var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
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
                            var start_date = moment.utc(element.updateDate);

                            var end_date = moment.utc(res_time);
                            var duration = moment.duration(end_date.diff(start_date));
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


                                var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
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
                            var start_date = moment.utc(element.bookingDateTime);
                            var end_date = moment.utc(res_time);
                            // var duration1 = moment.duration(start_date.diff(end_date));
                            var duration = moment.duration(end_date.diff(start_date));

                            timeMin = duration / 60000;
                            console.log("=====" + timeMin);

                            // if (timeMin >= -5 && timeMin < -4) {
                            if (timeMin >= -29 && timeMin < -30) {
                                if (element.type_of_service == "customer_location") {
                                    var message = "Scheduled are next 30 min after start";
                                    module.exports.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
                                } else {
                                    var message = "Scheduled are next 30 min after start"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
                                }

                                // }else if(timeMin >= 5){
                            } else if (timeMin >= 30) {
                                if (element.type_of_service == "customer_location") {
                                    module.exports.cuServiceCancellationChargesSP(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    module.exports.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");


                                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
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


                                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
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
                        var start_date = moment.utc(element.creationDate);

                        var end_date = moment.utc(res_time);
                        var duration = moment.duration(end_date.diff(start_date));
                        timeMin = duration / 60000;

                        if (timeMin >= 4 && timeMin < 5) {

                            var message = "New kaikili preferred provider Job."
                            element.preferredProvider.forEach(function (element11) {
                                comman.sendServiceNotification(element11, element.pps_id, message, "New", "pps");
                            });

                        } else if (timeMin >= 5) {
                            //Auto remove
                            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                            var bulkRemove = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                            var cu_sp_pps_send = db.db(config.dbName).collection(config.collections.cu_sp_pps_send);

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
                            var res_time = new Date().toISOString();
                            var start_date = moment.utc(element.creationDate);

                            var end_date = moment.utc(res_time);
                            var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;

                            if (timeMin >= 4 && timeMin < 5) {
                                module.exports.sendCustomerNotification(element.cu_id, element.sp_cp_alert_send_id, "Service Provider Send Neighborhood Shout Request", "Neighborhood Shout", "shout");

                            } else if (timeMin >= 5) {

                                var updateTran = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };

                                collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                                var bulkInsert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                                collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                                    }
                                );

                            }
                        } else {
                            collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                            var bulkInsert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
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
                            var res_time = new Date().toISOString();
                            var start_date = moment.utc(element.creationDate);

                            var end_date = moment.utc(res_time);
                            var duration = moment.duration(end_date.diff(start_date));
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


}
module.exports = Comman;