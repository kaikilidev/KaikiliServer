// var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb').MongoClient;
var dbUrl = "mongodb://64.225.42.173:27017/";

var product = "product_info"
var product_id = "product_id"
var product_info = "product_info"
var cetagary_info = "cetagary_info"
var dbName = "mmc"

var express = require('express');
var router = express.Router();


router.post('/addData', function (req, res, next) {

    var newDataList = req.body.data;

    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        console.log(err);
        console.log(db);
        var collectionSP = db.db(dbName).collection(product_id);

        // console.log("=====" + newDataList.length);
        var count = 0;
        newDataList.forEach(function (element) {

            var newPost = {
                pro_id: element.id,
                page: [element.page],
                stetus: false,
                creationDate: new Date().toUTCString()
            };
            console.log("element.id ---->" + element.id);
            collectionSP.find({"pro_id": element.id}).toArray(function (err, tesData) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed !. Server Error....." + element.id
                    };
                    console.log(status);
                    // callback(status);
                    res.json(status);
                } else {
                    console.log(tesData.length + "----->>> product  " + element.page + "  " + count);
                    // console.log(tesData);
                    if (tesData.length > 0) {
                        collectionSP.updateOne({pro_id: element.id}, {$push: {page: element.page}});
                    } else {
                        collectionSP.insertOne(newPost);
                    }
                    count++
                    if (count === newDataList.length) {
                        var status = {
                            status: 1,
                            message: "Successfully add information",
                            //data: dataSet
                        };
                        // console.log(status);
                        // callback(status);
                        res.json(status);
                    }
                }
            });
        });


    });


});


router.get('/getPro', function (req, res, next) {
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionSP = db.db(dbName).collection(product_id);

        collectionSP.findOne({stetus: false},{sort:{_id:-1}}, function (err, tesData) {
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

                // console.log(tesData.pro_id);
                // collectionSP.updateMany({pro_id: tesData.pro_id}, {$set: {stetus: true}}, (err, collection) => {
                //     if (err) throw err;
                //     console.log(collection.result.nModified + " Record(s) updated successfully");	//It will console the number of rows updated
                //     console.log(collection);
                //         var status = {
                //             status: 1,
                //             message: "Successfully server are stop",
                //             data: collection,
                //             proid : tesData.pro_id
                //         };
                //     res.json(status);
                // });


  
                //         // console.log(tesData.pro_id);
                //         // res.json(tesData.pro_id);
            }
        });


    });
});


router.post('/addCatPro', function (req, res, next) {
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionPro = db.db(dbName).collection(cetagary_info);
        collectionPro.updateOne({pageNo: req.body.pageNo}, {$set: {product: req.body.product}}, (err, collection) => {
            if (err) throw err;
            console.log(collection.result.nModified + " Record(s) updated successfully");	//It will console the number of rows updated
            console.log(collection);
            var status = {
                status: 1,
                message: "Successfully server are stop",
                data: collection,
                cat_no : req.body.pageNo
            };
            res.json(status);
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
                proid : tesData.pro_id
            };
            res.json(status);
        });



        // collectionSP.updateOne({pro_id: req.body.pro_id}, {$set: {stetus: true}}, function (err, data) {
        //     collectionPro.insertOne(newDataPost);
        //     var status = {
        //         status: 1,
        //         message: "Successfully add information",
        //         //data: dataSet
        //     };
        //     res.json(status);
        // });
        // console.log(status);
        // callback(status);

    });

});

//
// userServiceModel.addUserService(req, function (err, result) {
//     if (err) {
//         res.json(err);
//         console.log(err);
//     } else {
//         console.log(result);
//         res.json(result);//or return count for 1 & 0
//
//     }
// });
// });

//
// mongo.connect(dbUrl, {useNewUrlParser: true}, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db(dbName);
//     dbo.createCollection(product, function(err, res) {
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

module.exports = router;

// I want the employees variable to be an array of employees