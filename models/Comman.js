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


    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2,callBack) {
        console.log(lat1+"-------"+lon1+" ------"+lat2);
        // var R = 6371; // Radius of the earth in km
        var R = 3958.8; // Radius of the earth in km
        var dLat = ((lat2 - lat1)* (Math.PI / 180));  // deg2rad below
        var dLon = ((lon2 - lon1)* (Math.PI / 180));

        console.log(dLat+"-------"+dLon+" ------");
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1* (Math.PI / 180)) * Math.cos(lat2* (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return callBack(d);
    },

    // deg2rad(deg) {
    //     return deg * (Math.PI / 180);
    // }
}

module.exports = Comman;