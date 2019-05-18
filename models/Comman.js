var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


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

    // deg2rad(deg) {
    //     return deg * (Math.PI / 180);
    // }


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

    getSPUserCCRatData(spList, sr_id,cc_id, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var autoIdCollection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            var cursorSearch = autoIdCollection.aggregate([
                {
                    $match: {
                        $and: [{sp_id: {$in: spList}}],
                        sr_id: sr_id,
                        "cost_components_on.cc_id": cc_id
                    }
                },{
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
               // console.log("----" + mainDocs.length);
                return callBack(mainDocs);
            });
        });
    },


    getSPUserServiceData(spid, callBack) {
        // var query = {sp_id: spid};
        // console.log("----" + query);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            var cursorSearch = collection.find({sp_id: spid,"sp_sr_status": "ON"}
            );//,{sr_id:1}
            cursorSearch.toArray(function (err, mainDocs) {
                return callBack(mainDocs);
            });
        });
    },

    getSPUserInformationData(sp_id,sr_id, callBack) {
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

}

module.exports = Comman;