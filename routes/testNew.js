// var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb').MongoClient;
var url = "mongodb://root@198.211.109.120:27017/";
var config = require('../db_config.json');
//
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("KaikiliService");
//     dbo.createCollection("SubService", function(err, res) {
//         if (err) throw err;
//         console.log("Collection created!");
//         db.close();
//     });
// });

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("KaikiliService");
//     var myobj = { serviceName: "TV Mount Installation", serviceId: "1", serviceInfo: "tv service information ", isActive : 1 };
//     dbo.collection("Service").insertOne(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("1 document inserted");
//         db.close();
//     });
// });


// //Add new auto created id code
// mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
//     var collection = db.db(config.dbName).collection(config.collections.auto_id);
//     collection.insertOne({  _id: "tr_service", seq: 0 }, function (err, docs) {
//             if (err) {
//                 console.log(err);
//                 var status = {
//                     status: 0,
//                     message: "Failed"
//                 };
//                 console.log(status);
//             } else {
//                 var status = {
//                     status: 1,
//                     message: "Thank you fore add new card.",
//                     data : docs
//                 };
//                 console.log(status);
//             }
//         });
// });

//
// mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
//     var collection = db.db(config.dbName).collection(config.collections.sp_auto_id);
//
//     var newSPid = getNextSequenceUserID("userid", function (result) {
//         console.log(result);
//     });
//
//     console.log("New id " + employees);
// });
//
//
// function getNextSequenceUserID(name, callBack) {
//     mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
//         var collection = db.db(config.dbName).collection(config.collections.sp_auto_id);
//
//         var newId = null;
//         var query = {_id: name};
//         var update = {$inc: {seq: 1}};
//         // var options = {upsert: true, 'new': true};
//         var options = {upsert: true, 'new': true, setDefaultsOnInsert: true};
//         collection.findOneAndUpdate(query, update, options, function (err, doc) {
//             newId = doc.value.seq;
//             return callBack(newId);
//         });
//     });
// }


// I want the employees variable to be an array of employees