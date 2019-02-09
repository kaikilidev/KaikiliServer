

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://root@198.211.109.120:27017/";
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