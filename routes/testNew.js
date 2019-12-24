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


router.get('/getPro', function (req, res, next) {
    mongo.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
        var collectionSP = db.db(dbName).collection(product_id);

        collectionSP.findOne({stetus: false}, {sort: {_id: -1}}, function (err, tesData) {
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


module.exports = router;

// I want the employees variable to be an array of employees