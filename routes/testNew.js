// var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb').MongoClient;
// var dbUrl = "mongodb://64.225.42.173:27017/";
var dbUrl = "mongodb://kaikiliMobile:MobileKaikili#987654321@157.230.188.53:27013/";
// mongodb://admin:password@localhost:27017/db

var product = "product_info"
var product_id = "product_id"
var product_info = "product_info"
var cetagary_info = "cetagary_info"
var product_info_old = "product_info_old"
var dbName = "mmc"

var express = require('express');
var router = express.Router();



router.get('/getPro', function (req, res, next) {
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {

        // var db = mongoclient.db("exampledatabase");
        //
        // // Then you can authorize your self
        // db.authenticate('username', 'password', function(err, result) {
        var collectionSP = db.db("kaikili_test").collection("test");

        collectionSP.findOne({}, function (err, tesData) {
            if (err) {
                console.log(err);
                var status = {
                    mobile_no: ""
                    // status: 0,
                    // message: "Failed !. Server Error....." + element.id
                };
                console.log(status);
                res.json("");
            } else {
                console.log(tesData.mobile_no);
                res.json(tesData.mobile_no);
            }
        });
    });
});


router.get('/getPro2', function (req, res, next) {
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionSP = db.db(dbName).collection(product_id);

        collectionSP.findOne({stetus: false}, {sort: {_id: 1}}, function (err, tesData) {
            if (err) {
                console.log(err);
                var status = {
                    pro_id: ""
                    // status: 0,
                    // message: "Failed !. Server Error....." + element.id
                };
                console.log(status);
                res.json("");
            } else {
                console.log(tesData.pro_id);
                res.json(tesData.pro_id);
            }
        });
    });
});



router.post('/addProTest', function (req, res, next) {
    var newDataPost = req.body;

    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionSP = db.db(dbName).collection(product_id);
        var collectionPro = db.db(dbName).collection(product_info);
        collectionSP.updateMany({pro_id: req.body.pro_id}, {$set: {stetus: true}}, (err, collection) => {
            if (err) throw err;
            collectionPro.insertOne(newDataPost);
            console.log(collection.result.nModified + " Record(s) updated successfully");	//It will console the number of rows updated
            console.log(collection);
            var status = {
                status: 1,
                message: "Successfully server are stop",
                data: collection,
                proid: tesData.pro_id
            };
            res.json(status);
        });
    });
});


router.get('/testDelete', function (req, res, next) {
    console.log("calll testDelete");
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var product_id = db.db(dbName).collection("product_id");
        var collectionPro = db.db(dbName).collection("product_info_old");
        // Update service record

        collectionPro.find({}).toArray(function (err, docs) {
            if (err) {
                console.log(err);
                var status = {
                    status: 0,
                    message: "Failed !. Server Error....."
                };
                console.log(status);
                callback(status);
            } else {
                console.log(docs.length);
                docs.forEach(function (element) {
                    console.log(element.pro_id);
                    console.log("call ----> delete");
                    // product_id.deleteOne({pro_id: element.pro_id},function (err, deleteData) {
                    //     console.log(cout + " === >  --- 222" + err);
                    //      console.log(cout + " === >  --- 555" + deleteData);
                    //     });
                });

                // var status = {
                //     status: 1,
                //     message: "Thank you.",
                //     data: docs
                // };
                // console.log();
                // callback(status);
            }
        });
    });
});
// mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
//     var collectionSP = db.db(dbName).collection(product_id);
//     var collectionPro = db.db(dbName).collection("product_info_old");
//
//
//     // db.product_info_old.find({})
//     //     .forEach( function(myDoc) {
//     //         print( "id: " + myDoc.pro_id  );
//     //         print( "id: " + "\""+myDoc.pro_id+"\"" );
//     //         var bulk = db.product_id.initializeUnorderedBulkOp();
//     //         print( "id: " +  db.product_id.remove( {"pro_id" :myDoc.pro_id }));
//     //         bulk.execute();
//     //
//     //
//     //     });
//     var cout = 0;
//
//     collectionPro.find({}).forEach(function (myDoc) {
//         console.log(cout + " === > id  " + myDoc.pro_id);
//         collectionSP.removeOne({pro_id: myDoc.pro_id}, function (err, update) {
//             console.log(cout + " === >  --- 222" + err);
//             console.log(cout + " === >  --- 555" + update);
//             if (cout == 1000) {
//                 var status = {
//                     status: 1,
//                     message: "Successfully server are stop",
//                 };
//                 res.json(status);
//             }
//
//         });
//
//     });
//
//
//     //
//     // collectionPro.find({}).toArray(function (err, mainDocs)  {
//     //    console.log(cout + " === > " +err +" --- 1111 ");
//     //    console.log(cout + " === > " +mainDocs.length +" --- 1245 ");
//     //  //    collectionSP.updateOne({pro_id : item.pro_id},{$set : {status : true}}),function (err, update) {
//     //  //        console.log(cout + " === > " +item.pro_id +" --- 222"+err);
//     //  //        console.log(cout + " === > " +item.pro_id +" --- 555"+update);
//     //  //
//     //  //        if (cout == 20000) {
//     //  //            var status = {
//     //  //                status: 1,
//     //  //                message: "Successfully server are stop",
//     //  //            };
//     //  //            res.json(status);
//     //  //        }
//     //  //
//     //  //    }
//     //  //   console.log(cout + " === > " +item.pro_id);
//     //     cout++;
//     //
//     // });
//  });


router.get('/copyTest', function (req, res, next) {

    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionSP = db.db(dbName).collection("test_pro_copy");
        var collectionPro = db.db(dbName).collection("test_pro");
        var proUnique = [];
        var cout = 0;
        collectionSP.find({}).forEach(function (item) {
            proUnique.push(item.product);
            cout++;
            if (cout == 3) {

                var status = {
                    status: 1,
                    message: "Successfully server are stop",
                    size: proUnique.length,
                    data: proUnique,
                };
                res.json(status);
            }
        });
    });
});


module.exports = router;

// I want the employees variable to be an array of employees