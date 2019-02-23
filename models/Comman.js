var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var Comman = {

    getNextSequenceUserID(name, callBack) {
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_auto_id);

            var newId = null;
            var query = {_id: name};
            var update = {$inc: {seq: 1}};
            // var options = {upsert: true, 'new': true};
            var options = {upsert: true, 'new': true, setDefaultsOnInsert: true};
            collection.findOneAndUpdate(query, update, options, function (err, doc) {
                newId = doc.value.seq;
                return callBack(newId);
            });
        });
    },

}

module.exports = Comman;