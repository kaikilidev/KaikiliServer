var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
var comman = require('../models/Comman');
var bcrypt = require('bcrypt');


var Customer = {
    addNewUser: function (req, callback) {
        comman.getNextSequenceUserID("cu_user", function (result) {
            //  console.log(result);
            var newUser = {
                cu_id: "CU0" + result,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
                gender: req.body.gender,
                mobile_no: req.body.mobile_no,
                password: req.body.password,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
                collectionCU.find({email: req.body.email}).toArray(function (err, docs) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        callback(status);
                    } else {
                        // assert.equal(1, docs.length);
                        if (docs.length == 1) {
                            var status = {
                                status: 0,
                                message: "This Email id already register",
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            bcrypt.hash(req.body.password, 10, function (err, hash) {
                                newUser.password = hash;
                                var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
                                collectionSP.insert(newUser, function (err, records) {
                                    if (err) {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed"
                                        };
                                        console.log(status);
                                        callback(status);
                                    } else {
                                        var status = {
                                            status: 1,
                                            message: "Success create new user",
                                            data: records['ops'][0]
                                        };
                                        console.log(status);
                                        callback(status);
                                    }
                                });
                            });
                        }
                    }
                });
            });
        });


    },


    checkCUUserCreated: function (req, callback) {
        var mobile_no = req.body.mobile_no;
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.find({mobile_no: mobile_no}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    // assert.equal(1, docs.length);
                    if (docs.length == 1) {
                        var status = {
                            status: 1,
                            message: "Successfully data getting",
                            data: docs[0]

                        };
                    } else {
                        var status = {
                            status: 0,
                            message: "No User"
                        };
                    }

                    console.log(status);
                    callback(status);
                }
            });
        });
    },


    CUUserLogin: function (req, callback) {

        var email = req.body.email;
        var password = req.body.password;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionCU = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionCU.find({email: email}).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    console.log(docs);
                    if (docs.length == 1) {

                        bcrypt.compare(password, docs[0].password, function (err, res) {
                            if (res) {
                                // Passwords match
                                var status = {
                                    status: 1,
                                    message: "Successfully data getting",
                                    data: docs[0]
                                };
                                console.log(status);
                                callback(status);

                            } else {
                                var status = {
                                    status: 0,
                                    message: "User Id and Passwords don't match"
                                };
                                console.log(status);
                                callback(status);
                                // Passwords don't match
                            }
                        });


                    } else {
                        var status = {
                            status: 0,
                            message: "This Email id are not register."
                        };
                        console.log(status);
                        callback(status);
                    }
                }
            });
        });
    },

    CURegiCheck: function (req, callback) {

        var cu_id = req.body.cu_id;
        var checkCU = {
            cu_personal: false,
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
            collectionSP.findOne({cu_id: cu_id}, function (err, docs) {
                if (docs != null) {
                    checkCU.cu_personal = true;
                } else {
                    checkCU.cu_personal = false;
                }
                console.log(checkCU.cu_personal);
                console.log(checkCU);
                callback(checkCU);
            });
        });
    },

    addUserAddress: function (req, callback) {
        comman.getNextSequenceUserID("cu_user", function (result) {
            //  console.log(result);
            var newAddress = {
                cu_id: req.body.cu_id,
                title: req.body.title,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                creationDate: new Date().toISOString()
            };

            mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
                var collectionSP = db.db(config.dbName).collection(config.collections.cu_address);
                collectionSP.insert(newAddress, function (err, records) {
                    if (err) {
                        console.log(err);
                        var status = {
                            status: 0,
                            message: "Failed"
                        };
                        console.log(status);
                        callback(status);
                    } else {
                        var status = {
                            status: 1,
                            message: "Successfully add user address",
                            data: records
                        };
                        console.log(status);
                        callback(status);
                    }
                });
            });

        });
    },


    userGetAddress: function (req, callback) {
        var cu_id = req.body.cu_id;
        console.log(cu_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var mysort = {updateDate: -1};
            var collection = kdb.db(config.dbName).collection(config.collections.cu_address);
            console.log(err);
            collection.find({
                cu_id: cu_id
            }).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success Get all Transition service list",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    searchServiceProvider: function (req, callback) {
        var sr_id = req.body.sr_id;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var cc_ids = req.body.cc_ids;
        var cost_item = req.body.cost_item;
        // console.log(longitude + " --- " + latitude);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {

            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
            var cursor = collection.aggregate([
                {
                    $geoNear: {
                        near: {type: "Point", coordinates: [parseFloat(latitude), parseFloat(longitude)]},
                        key: "location",
                        maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
                        distanceField: "dist", //give values in metre
                        query: {services: sr_id, cost_comps: cc_ids}
                    }
                }]);


            cursor.toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    // console.log(status);
                    callback(status);

                } else {

                    var newArrData = new Array();
                    var ctr = 0;
                    var newArrServic = new Array();
                    if(docs.length>0){
                    docs.forEach(function (element) {
                        var newRadius = element.radius * 1609.34;
                        if (element.dist <= newRadius) {
                            newArrData.push(element.sp_id);
                            var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                            // console.log(err);
                            collection.find({sp_id: element.sp_id, sr_id: sr_id}
                            ).toArray(function (err, docs) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    var children = docs[0].cost_comps_per_item_on.concat(docs[0].cost_comps_pro_rate_on);
                                    var newItemCost = new Array();
                                    var totalCost =0;
                                    cost_item.forEach(function (element) {
                                        var picked = children.filter(function(value){ return value.cc_id==element.cc_id;})
                                        var cost = (parseFloat(picked[0].cc_rate_per_item) * parseFloat(element.cc_per_item_qut));
                                        // console.log(cost +"--------"+ picked[0].cc_rate_per_item+" ---  "+ element.cc_per_item_qut);
                                        totalCost = totalCost+cost;
                                        var dataCostItem = {
                                            cc_id:element.cc_id,
                                            cc_title:element.cc_title,
                                            cc_per_item_qut:element.cc_per_item_qut,
                                            cc_per_item_rate:picked[0].cc_rate_per_item,
                                            cc_per_item_cost:cost,
                                        };
                                        newItemCost.push(dataCostItem);

                                    });
                                    // console.log("******");
                                    var discountGive = 0;
                                    if(docs[0].discount.ds_check_box == "ON"){
                                        discountGive = docs[0].discount.ds_rate_per_item;
                                    }

                                    var discountAmount = (totalCost*parseFloat(discountGive))/100;
                                    // console.log(discountAmount);
                                    var discountAfterPrice = totalCost - discountAmount;
                                    var dataShow = {
                                        sp_id: docs[0].sp_id,
                                        minimum_charge:docs[0].minimum_charge,
                                        totalCost:totalCost,
                                        itemCost: newItemCost,
                                        discountGive:discountGive,
                                        discountAfterPrice:discountAfterPrice

                                    };
                                    newArrServic.push(dataShow);
                                    ctr++;
                                    if (ctr === docs.length) {
                                        var status = {
                                            status: 1,
                                            message: "Success Get all Transition service list",
                                            data: newArrServic
                                        };
                                        callback(status);
                                    }
                                }
                            });
                        }
                    });
                    }else {
                        var status = {
                            status: 1,
                            message: "Success Get all Transition service list",
                            data: newArrServic
                        };
                        callback(status);
                    }
                }
            });

        });
    },


    // var cursor = collection.aggregate([
    //     {
    //         $geoNear: {
    //             near: {type: "Point", coordinates: [parseFloat(latitude), parseFloat(longitude)]},
    //             key: "location",
    //             maxDistance: 80467.2,// 1 mil = 1609.34 metre ****maxDistance set values metre accept
    //             distanceField: "dist", //give values in metre
    //             query: {services: sr_id }
    //         }
    //     }]);

    // searchServiceProvider: function (req, callback) {
    //     var sr_id = req.body.sr_id;
    //     var latitude = req.body.latitude;
    //     var longitude = req.body.longitude;
    //     console.log(req.body.sr_id);
    //
    //     mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
    //         var collection = kdb.db(config.dbName).collection(config.collections.sp_sr_geo_location);
    //         collection.find({services: sr_id}).toArray(function (err, docs) {
    //             if (err) {
    //                 console.log(err);
    //                 var status = {
    //                     status: 0,
    //                     message: "Failed"
    //                 };
    //                 // console.log(status);
    //                 callback(status);
    //
    //             } else {
    //
    //                 var newArrData = new Array();
    //                 docs.forEach(function (element) {
    //                     comman.getDistanceFromLatLonInKm(element.location.coordinates[0],element.location.coordinates[1],latitude,longitude,function (result){
    //                         console.log(result+"-------------------"+element.radius);
    //                         if(result<=element.radius){
    //                             newArrData.push(element);
    //                         }
    //                     })
    //                 });
    //
    //                 var status = {
    //                     status: 1,
    //                     message: "Success Get all Transition service list",
    //                     data: newArrData
    //                 };
    //                 callback(status);
    //                 // res.json(docs);
    //
    //
    //             }
    //         });
    //
    //     });
    // },


}
module.exports = Customer;