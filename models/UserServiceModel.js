var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var customerModel = require('../models/CustomerModel.js');
var config = require('../db_config.json');
var comman = require('../models/Comman');
var setting = require('../models/Setting');
// load math.js (using node.js)
const math = require('mathjs')
// const moment = require('moment')


var UserService = {

    addUserService: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                var addService = req.body;
                var sp_id = req.body.sp_id;
                var sr_id = req.body.sr_id;
                var recodeId = "";
                var sp_sr_status = req.body.sp_sr_status;

                var newCostComps = new Array();
                req.body.cost_components_on.forEach(function (element) {
                    newCostComps.push(element.cc_id);
                });

                var newServiceArr = new Array();
                newServiceArr.push(req.body.sr_id);

                var newCostCompsOFF = new Array();
                req.body.cost_components_off.forEach(function (element) {
                    newCostCompsOFF.push(element.cc_id);
                });

                var newQuoteServiceAddArr = new Array();
                var newQuoteServiceRemoveArr = new Array();

                if (parseInt(req.body.quote_accept) === 1) {
                    newQuoteServiceAddArr.push(req.body.sr_id);
                } else {
                    newQuoteServiceRemoveArr.push(req.body.sr_id);
                }
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                    console.log(sp_id);
                    console.log(sr_id);

                    collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs) {

                        if (docs.length > 0) {
                            recodeId = docs[0]._id;
                            console.log(recodeId);
                            // Update service record
                            collection.update({_id: recodeId}, {$set: addService}, function (err, records) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {

                                    if (sp_sr_status === "ON") {
                                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                                            var collection_location = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                            var cursor = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $addToSet: {
                                                        services: {$each: newServiceArr},
                                                        cost_comps: {$each: newCostComps},
                                                        quote_service: {$each: newQuoteServiceAddArr}
                                                    }
                                                }, {upsert: true});

                                            var cursor1 = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $pull: {
                                                        cost_comps: {$in: newCostCompsOFF},
                                                        quote_service: {$in: newQuoteServiceRemoveArr}
                                                    }
                                                }, {upsert: true});

                                        });
                                    } else {
                                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                                            var collection_location = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                            var cursor = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $pull: {
                                                        services: {$in: newServiceArr},
                                                        cost_comps: {$in: newCostComps},
                                                        quote_service: {$in: newQuoteServiceAddArr}
                                                    }
                                                }, {upsert: true});

                                        });
                                    }

                                    var status = {
                                        status: 1,
                                        message: "Success upload to old sub service to server",
                                        // data: records['ops'][0]
                                    };
                                    console.log(status);
                                    callback(status);
                                }
                            });

                        } else {
                            console.log(recodeId + " New Insert");
                            // Insert new service record
                            collection.insert(addService, function (err, records) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    if (sp_sr_status === "ON") {
                                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                                            var collection_location = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                            var cursor = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $addToSet: {
                                                        services: {$each: newServiceArr},
                                                        cost_comps: {$each: newCostComps},
                                                        quote_service: {$each: newQuoteServiceAddArr}
                                                    }
                                                }, {upsert: true});

                                            var cursor1 = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $pull: {
                                                        cost_comps: {$in: newCostCompsOFF},
                                                        quote_service: {$in: newQuoteServiceRemoveArr}
                                                    }
                                                }, {upsert: true});
                                        });
                                    } else {
                                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                                            var collection_location = db.db(config.dbName).collection(config.collections.sp_sr_geo_location);
                                            // "sp_sr_status":"OFF"
                                            var cursor1 = collection_location.updateOne({sp_id: sp_id},
                                                {
                                                    $pull: {
                                                        services: {$in: newServiceArr},
                                                        cost_comps: {$in: newCostComps},
                                                        quote_service: {$in: newQuoteServiceAddArr}
                                                    }
                                                }, {upsert: true});
                                        });
                                    }

                                    var status = {
                                        status: 1,
                                        message: "Success upload new sub service to server",
                                        // data: records['ops'][0]
                                    };
                                    console.log(status);
                                    callback(status);
                                }
                            });
                        }
                    });
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getUserService: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                var sr_id = req.body.sr_id;
                console.log(sr_id);
                console.log(sp_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                    console.log(err);
                    collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs) {

                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            var status = {
                                status: 1,
                                message: "Success get all service information",
                                data: docs
                            };
                            // console.log(status);
                            // db.close();
                            callback(status);
                        }
                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });

    },

    getUserServiceCatalogue: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                    console.log(err);

                    var cursorSearch = collection.aggregate([
                        {$match: {sp_id: sp_id}},
                        {
                            $lookup: {
                                from: config.collections.add_services,
                                localField: "sr_id",
                                foreignField: "sr_id",
                                as: "serviceInfo"
                            }
                        }, {
                            $unwind: "$serviceInfo"
                        }
                    ]);
                    cursorSearch.toArray(function (err, mainDocs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            var status = {
                                status: 1,
                                message: "Success get all service information",
                                data: mainDocs
                            };
                            callback(status);
                        }
                    });

                    // collection.find({sp_id: sp_id}, {
                    //     _id: 1,
                    //     sp_id: 2,
                    //     sr_id: 3,
                    //     sr_title: 4,
                    //     sp_sr_status: 5
                    // }).toArray(function (err, docs) {
                    //     // db.sp_sr_catalogue.find({sp_id: "SP00001"},{ _id: 1 ,sp_id: 5,sr_id: 2, sr_title:3,sp_sr_status:4}).toArray()
                    //     if (err) {
                    //         console.log(err);
                    //         var status = {
                    //             status: 0,
                    //             message: "Failed"
                    //         };
                    //         // console.log(status);
                    //         callback(status);
                    //
                    //     } else {
                    //         var status = {
                    //             status: 1,
                    //             message: "Success Get all service to Mongodb",
                    //             data: docs
                    //         };
                    //         callback(status);
                    //     }
                    // });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getUserTransitionSL: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                    var mysort = {updateDate: -1};
                    var collectionPPS = kdb.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                    var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    console.log(err);
                    collection.find({
                        sp_id: sp_id,
                        sp_review: "false",
                        sr_status: {$nin: ["Cancel", "Review", "Cancelled"]}
                    }).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {

                            collectionPPS.find({
                                preferredProvider: sp_id
                            }).sort(mysort).toArray(function (err, docspps) {


                                var status = {
                                    status: 1,
                                    message: "Success get all transition service information",
                                    data: docs,
                                    docspps: docspps
                                };
                                callback(status);

                            });
                        }
                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });

    },

    getUserNotification: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var mysort = {updateDate: -1};
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                    console.log(err);
                    collection.find({sp_id: sp_id},
                        {
                            _id: 1,
                            cu_name: 2,
                            conversation_id: 3,
                            tran_id: 4,
                            date: 5,
                            time: 6,
                            sr_title: 7,
                            updateDate: 8
                        }).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            var status = {
                                status: 1,
                                message: "Success get all transition service information",
                                data: docs
                            };
                            callback(status);
                        }
                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getUserSingleNotification: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                comman.singleNotification(req.body.tran_id, function (getData) {
                    callback(getData);
                });
                // var tran_id = req.body.tran_id;
                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var mysort = {updateDate: -1};
                //     var collection = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                //     console.log(err);
                //     collection.find({tran_id: tran_id}
                //     ).sort(mysort).toArray(function (err, docs) {
                //         if (err) {
                //             console.log(err);
                //             var status = {
                //                 status: 0,
                //                 message: "Failed !. Server Error....."
                //             };
                //             // console.log(status);
                //             callback(status);
                //
                //         } else {
                //             var status = {
                //                 status: 1,
                //                 message: "Success get all transition service information",
                //                 data: docs
                //             };
                //             callback(status);
                //         }
                //     });
                //
                // });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userNotificationPost: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var cu_id = req.body.cu_id;
                var body = req.body.message;

                comman.notificationPost(tran_id, null, sp_id, body, function (dataApi) {
                    callback(dataApi);
                });


                // comman.getTransitionInfo(tran_id, function (transitionData) {
                //
                //     var messagesBody;
                //     if (sp_id == null) {
                //         messagesBody = {
                //             author: cu_id,
                //             author_type: "CU",
                //             sp_delet: "0",
                //             cu_delte: "0",
                //             sp_read: "0",
                //             cu_read: "0",
                //             created_on: new Date().toISOString(),
                //             body: body
                //         };
                //
                //         try {
                //             comman.sendServiceNotification(transitionData.sp_id, tran_id, body, "Messages", "chat");
                //         } catch (error) {
                //             console.error(error);
                //         }
                //
                //
                //     } else {
                //         messagesBody = {
                //             author: sp_id,
                //             author_type: "SP",
                //             sp_delet: "0",
                //             cu_delte: "0",
                //             sp_read: "0",
                //             cu_read: "0",
                //             created_on: new Date().toISOString(),
                //             body: body
                //         };
                //         try {
                //             comman.sendCustomerNotification(transitionData.cust_id, tran_id, body, "Messages", "chat");
                //         } catch (error) {
                //             console.error(error);
                //         }
                //     }
                //
                //     mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //         var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                //         collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {
                //
                //             if (err) {
                //                 console.log(err);
                //                 var status = {
                //                     status: 0,
                //                     message: "Failed"
                //                 };
                //                 // console.log(status);
                //                 callback(status);
                //             } else {
                //                 var status = {
                //                     status: 1,
                //                     message: "Success to load bank info",
                //                     data: docs
                //                 };
                //                 callback(status);
                //                 // console.log("Update in Notification");
                //                 // console.log(docs);
                //             }
                //         });
                //
                //     });
                // });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userTransitionUpdate: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var dateNew1 = req.body.dateNew1;
                var timeNew1 = req.body.timeNew1;
                var timeNew2 = req.body.timeNew2;
                var dateNew2 = req.body.dateNew2;
                var bookingDateTime1 = req.body.bookingDateTime1;
                var bookingDateTime2 = req.body.bookingDateTime2;

                var serviceUpdate = {
                    sr_status: req.body.sr_status,
                    updateDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

                    // Update service record
                    collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
                        if (err) {
                            // console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Success upload to service to server",
                                data: docs
                            };

                            collection.find({tran_id: tran_id}).toArray(function (err, docs) {
                                var message = ""
                                if (req.body.sr_status == "Progress") {
                                    message = "Service provider on way.";
                                } else if (req.body.sr_status == "Cancel-New-Sp") {
                                    message = "Service provider to cancel job.";
                                } else if (req.body.sr_status == "Scheduled") {
                                    message = "Service provider accept your job.";
                                } else if (req.body.sr_status == "Rescheduled") {
                                    message = "Service provider rescheduled your job.";
                                } else if (req.body.sr_status == "Cancel-Scheduled-Sp") {
                                    message = "Service provider Cancelled your job.";
                                }

                                if (req.body.sr_status == "Progress" || req.body.sr_status == "Scheduled" || req.body.sr_status == "Rescheduled") {
                                    comman.sendCustomerNotification(docs[0].cust_id, tran_id, message, req.body.sr_status, "tran");
                                }
                                // "creationDate": "2019-09-28T15:25:28.922Z",
                                // console.log("start_date--------"+docs[0].creationDate);

                                var serviceTo25 = "OFF"
                                comman.getSPProfileServiceData(docs[0].sp_id, function (resultTime) {
                                    serviceTo25 = resultTime.custom_work_hours;
                                });

                                console.log("start_date--------" + serviceTo25);

                                var res_time = new Date().toUTCString();
                                var timeMin;

                                // var res_time = new Date().toISOString();
                                // var start_date = moment(docs[0].creationDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
                                // var end_date = moment(res_time, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
                                // var duration = moment.duration(end_date.diff(start_date));
                                // var timeMin = duration / 60000;
                                // dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
// Saturday, June 9th, 2007, 5:46:21 PM
                                // Thu, 17 Oct 2019 22:47:54 GMT  ddd, dd MMM yyyy HH:mm:ss Z
                                if (serviceTo25 == "ON") {
                                    var start_date = new Date(docs[0].creationDate);
                                    var end_date = new Date(res_time);
                                    var duration = end_date.getTime() - start_date.getTime();
                                    ;

                                    // var start_date = moment.utc(docs[0].creationDate);
                                    // var end_date = moment.utc(res_time);
                                    // var duration = moment.duration(end_date.diff(start_date));
                                    timeMin = duration / 60000;

                                } else {

                                    // console.log("====="+new Date(new Date().setTime(moment('14:00:00', 'HH:mm aa'))));
                                    var startTime = new Date(new Date().setHours(8, 0, 0)).toUTCString();
                                    console.log("-----" + startTime)
                                    // var bookTime = moment.utc(res_time);
                                    var bookTime = new Date(res_time);
                                    console.log("-----" + bookTime)
                                    var endTime = new Date(new Date().setHours(17, 0, 0)).toUTCString();
                                    console.log(">>>>>" + endTime)

                                    if ((startTime < bookTime) && (bookTime < endTime)) {
                                        // var duration = moment.duration(bookTime.diff(startTime));
                                        var duration = bookTime.getTime() - startTime.getTime();
                                        timeMin = duration / 60000;
                                    } else {
                                        timeMin = 1.0;
                                    }
                                }


                                var response = {
                                    sp_id: docs[0].sp_id,
                                    tran_id: docs[0].tran_id,
                                    sr_id: docs[0].sr_id,
                                    sr_book_time: docs[0].creationDate,
                                    sp_response_time: res_time,
                                    time_diff: parseFloat(timeMin.toFixed(2)),
                                    created_on: new Date().toUTCString()
                                };


                                if (req.body.sr_status == "Cancel-New-Sp" || req.body.sr_status == "Scheduled" || req.body.sr_status == "Rescheduled") {
                                    var collectionSPresponse = db.db(config.dbName).collection(config.collections.sp_cu_response);
                                    collectionSPresponse.insertOne(response, function (err, spData) {

                                        var cursorRating = collectionSPresponse.aggregate([
                                            {$match: {sp_id: docs[0].sp_id}},
                                            {
                                                $group: {
                                                    _id: "_id",
                                                    time_diff: {$avg: "$time_diff"}
                                                }
                                            }
                                        ]);
                                        cursorRating.toArray(function (err, docsnew) {
                                            console.log("111>>>--------" + Math.round(docsnew[0].time_diff));
                                            // console.log("22222--------"+docsnew[0].time_diff);
                                            // console.log("spId--------"+docs[0].sp_id);
                                            var updateRating = {
                                                avg_response: Math.round(docsnew[0].time_diff)
                                            };
                                            var spProfileUpdate = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                                            spProfileUpdate.updateOne({sp_id: docs[0].sp_id}, {$set: updateRating});
                                        });
                                    });

                                }


                                var messagesBody = {
                                    author: docs[0].sp_id,
                                    author_type: "SP",
                                    sp_delet: "0",
                                    cu_delte: "0",
                                    sp_read: "0",
                                    cu_read: "0",
                                    created_on: new Date().toISOString(),
                                    body: docs[0].sr_status + " - " + docs[0].sr_title
                                };

                                var rescheduled = {
                                    sp_id: docs[0].sp_id,
                                    sr_id: docs[0].sr_id,
                                    cust_id: docs[0].cust_id,
                                    tran_id: docs[0].tran_id,
                                    date: docs[0].date,
                                    time: docs[0].time,
                                    dateNew1: dateNew1,
                                    timeNew1: timeNew1,
                                    bookingDateTime1: bookingDateTime1,
                                    dateNew2: dateNew2,
                                    timeNew2: timeNew2,
                                    bookingDateTime2: bookingDateTime2,
                                    created_on: new Date().toUTCString(),
                                };

                                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Update in Notification");
                                        // console.log(docs);
                                    }
                                });

                                //Credit amount in Kaikili Wallet
                                if (req.body.sr_status == "Scheduled") {
                                    console.log("add kaikili wallet balenc");
                                    comman.kaikiliWalletCreditCustomerAmount(tran_id);
                                }

                                //Credit amount in Kaikili Wallet
                                if (req.body.sr_status == "Cancel-Scheduled-Sp") {
                                    comman.cuServiceCancellationChargesSP(docs[0]);
                                    comman.kaikiliWalletDebitCustomerAmount(tran_id, false);
                                }


                                if (req.body.sr_status == "Rescheduled") {
                                    var collectionRescheduled = db.db(config.dbName).collection(config.collections.cu_sp_reschedule);
                                    collectionRescheduled.insert(rescheduled, function (err, docs) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Inserted Reschedule data in server");
                                            // console.log(docs);
                                        }
                                    });
                                }

                                if (req.body.sr_status == "Cancel-New-Sp" || req.body.sr_status == "Cancel-Scheduled-Sp") {
                                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: tran_id});
                                            comman.sendCustomerNotification(docs[0].cust_id, tran_id, message, req.body.sr_status, "tran");
                                        }
                                    )
                                }
                            });
                            console.log();
                            callback(status);

                        }
                    });
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userTransitionCompleted: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var serviceUpdate = {
                    sr_status: req.body.sr_status,
                    txn_status: req.body.txn_status,
                    updateDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

                    // Update service record
                    collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Success upload to service to server"
                            };

                            collection.find({tran_id: tran_id}).toArray(function (err, docs) {

                                var messagesBody = {
                                    author: docs[0].sp_id,
                                    author_type: "SP",
                                    sp_delet: "0",
                                    cu_delte: "0",
                                    sp_read: "0",
                                    cu_read: "0",
                                    created_on: new Date().toISOString(),
                                    body: "Service completed - " + docs[0].sr_title + " "
                                };

                                comman.sendCustomerNotification(docs[0].cust_id, tran_id, "Service Completed", req.body.sr_status, "tran");

                                comman.updateServiceCompleted(docs[0].cust_id, docs[0].sp_id);


                                var paymentSettlementBody = {
                                    cust_id: docs[0].cust_id,
                                    cust_first_name: docs[0].cust_first_name,
                                    cust_last_name: docs[0].cust_last_name,
                                    sp_id: docs[0].sp_id,
                                    sp_first_name: docs[0].sp_first_name,
                                    sp_Last_name: docs[0].sp_Last_name,
                                    tran_id: docs[0].tran_id,
                                    date: docs[0].date,
                                    time: docs[0].time,
                                    sr_id: docs[0].sr_id,
                                    sr_title: docs[0].sr_title,
                                    sr_status: docs[0].sr_status,
                                    txn_status: docs[0].txn_status,
                                    payment_type: "Credit",
                                    net_payment: docs[0].sp_net_pay,
                                    kk_sr_commission_rat: docs[0].kaikili_commission.kk_sr_commission_rat,
                                    kk_sr_commission: docs[0].kaikili_commission.kk_sr_commission,
                                    kk_sp_pay: docs[0].kaikili_commission.kk_sp_pay,
                                    discount: docs[0].discount.ds_per,
                                    total: docs[0].sr_total,
                                    updateDate: new Date().toUTCString()
                                }


                                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Update in Notification");

                                        var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_completed_notification);
                                        var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                        bulkRemove.find({tran_id: tran_id}).forEach(
                                            function (doc) {
                                                bulkInsert.insertOne(doc);
                                                bulkRemove.removeOne({tran_id: tran_id});
                                            }
                                        )
                                    }
                                });

                                var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.cu_sp_payment_settlement);
                                collectionPaymentSettlement.insertOne(paymentSettlementBody, function (err, docs) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Update in payment Settlement ");
                                    }
                                });

                                var comment = docs[0].tran_id + " - " + docs[0].sr_id + " - " + " Completed Service - CU Pay $" + docs[0].sp_net_pay + " - KKC $" + docs[0].kaikili_commission.kk_sr_commission + " = SP Pay $" + docs[0].kaikili_commission.kk_sp_pay;

                                comman.spEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, docs[0].kaikili_commission.kk_sp_pay, 0, "Credit")


                                comman.getSPCurrentOfferCredit(sp_id, function (spCredit) {
                                    if (spCredit > 0) {
                                        var commissioBack = parseFloat(docs[0].kaikili_commission.kk_sr_commission) * setting.getMarketing_Credit_Used_Provider() / 100;
                                        // var commissioBack = parseFloat(docs[0].kaikili_commission.kk_sr_commission)* 25 / 100;
                                        if (spCredit >= commissioBack) {

                                            var kkCommissioBack = parseFloat(docs[0].kaikili_commission.kk_sr_commission) - commissioBack;
                                            comment = docs[0].tran_id + " - " + docs[0].sr_id + " - " + " Completed Service - CU Pay $" + docs[0].sp_net_pay + " - KKC $" + docs[0].kaikili_commission.kk_sr_commission + " - 25% kaikili credit $" + commissioBack + " = SP Pay $" + docs[0].kaikili_commission.kk_sp_pay + " + kaikili credit 25% $" + commissioBack;
                                            comman.sp_offer_kaiKiliWalletUpdate(sp_id, paymentSettlementBody.sp_first_name + " " + paymentSettlementBody.sp_Last_name, docs[0].tran_id, paymentSettlementBody.sr_title, comment, 0, commissioBack, "Debit");
                                            comman.kaiKiliEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, kkCommissioBack, 0, "Credit")
                                            comment = "Kaikili Credit " + docs[0].tran_id + " - " + docs[0].sr_id + " - " + " Completed Service - CU Pay $" + docs[0].sp_net_pay + " - KKC $" + docs[0].kaikili_commission.kk_sr_commission + " - 25% kaikili credit $" + commissioBack + " = SP Pay $" + docs[0].kaikili_commission.kk_sp_pay + " + kaikili credit 25% $" + commissioBack;
                                            comman.spEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, commissioBack, 0, "Credit")

                                        } else if (spCredit < commissioBack) {

                                            var kkCommissioBack = parseFloat(docs[0].kaikili_commission.kk_sr_commission) - spCredit;
                                            comment = docs[0].tran_id + " - " + docs[0].sr_id + " - " + " Completed Service - CU Pay $" + docs[0].sp_net_pay + " - KKC $" + docs[0].kaikili_commission.kk_sr_commission + " - 25% kaikili credit $" + spCredit + " = SP Pay $" + docs[0].kaikili_commission.kk_sp_pay + " + kaikili credit 25% $" + spCredit;
                                            comman.sp_offer_kaiKiliWalletUpdate(sp_id, paymentSettlementBody.sp_first_name + " " + paymentSettlementBody.sp_Last_name, docs[0].tran_id, paymentSettlementBody.sr_title, comment, 0, spCredit, "Debit");
                                            comman.kaiKiliEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, kkCommissioBack, 0, "Credit")
                                            comment = "Kaikili Credit " + docs[0].tran_id + " - " + docs[0].sr_id + " - " + " Completed Service - CU Pay $" + docs[0].sp_net_pay + " - KKC $" + docs[0].kaikili_commission.kk_sr_commission + " - 25% kaikili credit $" + commissioBack + " = SP Pay $" + docs[0].kaikili_commission.kk_sp_pay + " + kaikili credit 25% $" + commissioBack;
                                            comman.spEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, spCredit, 0, "Credit")
                                        }
                                    } else {
                                        comman.kaiKiliEranInfoUpdate(docs[0].sp_id, docs[0].tran_id, comment, docs[0].kaikili_commission.kk_sr_commission, 0, "Credit")
                                    }
                                });


                                // var transactionCompleted = db.db(config.dbName).collection(config.collections.cu_sp_transaction_completed);
                                // transactionCompleted.insertOne(docs[0], function (err, docs) {
                                //     if (err) {
                                //         console.log(err);
                                //     } else {
                                //         var transaction = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                //         transaction.removeOne({tran_id: tran_id}, function (err, docs) {
                                //             console.log(docs);
                                //         });
                                //         console.log("Update in payment Settlement ");
                                //     }
                                // });

                            });

                            console.log();
                            callback(status);

                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getUserCompletedTransition: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id);
                comman.spCurrentBalance(sp_id, function (currentBalance) {
                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var mysort = {_id: -1};
                        var collection = db.db(config.dbName).collection(config.collections.sp_earn_wallet);
                        console.log(err);
                        var cursorSearch = collection.aggregate([
                            {
                                $match: {
                                    sp_id: sp_id
                                }
                            }, {
                                $lookup: {
                                    from: config.collections.cu_sp_transaction_cancellation,
                                    localField: "tran_id",
                                    foreignField: "tran_id",
                                    as: "tran11"
                                }
                            },

                            {
                                $lookup: {
                                    from: config.collections.cu_sp_transaction_completed,
                                    localField: "tran_id",
                                    foreignField: "tran_id",
                                    as: "tran22"
                                }
                            },

                            {
                                $lookup: {
                                    from: config.collections.cu_sp_transaction,
                                    localField: "tran_id",
                                    foreignField: "tran_id",
                                    as: "tran33"
                                }
                            }

                        ]).sort(mysort);

                        cursorSearch.toArray(function (err, docs) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error.....",
                                    currentBalance: currentBalance
                                };
                                // console.log(status);
                                callback(status);

                            } else {

                                var status = {
                                    status: 1,
                                    message: "Success get all transition service information",
                                    total_count: docs.length,
                                    currentBalance: currentBalance,
                                    data: docs.slice(req.body.start, req.body.end)
                                };
                                callback(status);
                            }
                        });


                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userAddToServiceReview: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var reviewAdd = {
                    cust_id: req.body.cust_id,
                    sp_id: req.body.sp_id,
                    tran_id: req.body.tran_id,
                    sr_id: req.body.sr_id,
                    rating: req.body.rating,
                    comment: req.body.comment,
                    creationDate: new Date().toUTCString()
                };
                var updateTran = {
                    tran_id: req.body.tran_id,
                    sp_review: "true",
                    sr_status: "Completed"
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.sp_cu_review);
                    collectionPaymentSettlement.insertOne(reviewAdd, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                            collection.updateOne({tran_id: tran_id}, {$set: updateTran}, function (err, docs) {
                                var cursorRating = collectionPaymentSettlement.aggregate([
                                    {$match: {cust_id: req.body.cust_id}},
                                    {
                                        $group: {
                                            _id: "_id",
                                            rating: {$avg: "$rating"}
                                        }
                                    }
                                ]);
                                cursorRating.toArray(function (err, docs) {
                                    console.log(docs[0]);
                                    var updateRating = {
                                        avg_rating: docs[0].rating,
                                    };
                                    var spProfileUpdate = db.db(config.dbName).collection(config.collections.cu_profile);
                                    spProfileUpdate.updateOne({cu_id: req.body.cust_id}, {$set: updateRating}, function (err, docs) {
                                        var status = {
                                            status: 1,
                                            message: "Thank you fore review."
                                        };

                                        console.log();
                                        callback(status);

                                    });
                                });

                            });

                        }
                    });
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userCompletedService: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id + "=====  call completed ");
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                    var mysort = {_id: -1};
                    var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    collection.find({
                        sp_id: sp_id,
                        sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed", "Cancel-New-Auto", "Cancel-Scheduled-Auto"]}
                    }).sort(mysort).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {

                            var cancellation = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                            cancellation.find({
                                sp_id: sp_id,
                                sr_status: {$in: ["Cancel-New-Sp", "Cancel-New-Cp", "Cancel-Scheduled-Sp", "Cancel-Scheduled-Cp", "Completed", "Cancel-New-Auto", "Cancel-Scheduled-Auto"]}
                            }).sort(mysort).toArray(function (err, docs1) {
                                if (err) {

                                    if (docs.length > 0) {
                                        var status = {
                                            status: 1,
                                            message: "Success get all transition service list",
                                            data: docs
                                        };
                                        callback(status);
                                    } else {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed !. Server Error....."
                                        };
                                        callback(status);
                                        // console.log(status);
                                    }

                                } else {
                                    var children = docs.concat(docs1)
                                    var status = {
                                        status: 1,
                                        message: "Success get all transition service list",
                                        data: children.slice(req.body.start, req.body.end),
                                        total_count: children.length

                                    };
                                    callback(status);
                                }
                            });
                        }
                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getSingleTransitionInfo: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var sp_view = req.body.sp_view;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    if (sp_view == true) {
                        collection.update({tran_id: tran_id}, {$set: {sp_view: true}});
                    }

                    // Update service record
                    collection.findOne({tran_id: tran_id}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Success upload to service to server",
                                data: docs
                            };

                            console.log();
                            callback(status);

                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userAddBankInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var bankInfoAdd = {
                    sp_id: req.body.sp_id,
                    card_no: req.body.card_no,
                    bank_name: req.body.bank_name,
                    card_holder_name: req.body.card_holder_name,
                    month: req.body.month,
                    year: req.body.year,
                    cvc: req.body.cvc,
                    isUsed: "true",
                    creationDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.sp_bank_info);
                    collection.updateMany({sp_id: req.body.sp_id}, {$set: {isUsed: "false"}}, function (err, docs) {

                        console.log(docs);

                        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                            var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.sp_bank_info);
                            collectionPaymentSettlement.insertOne(bankInfoAdd, function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    var status = {
                                        status: 1,
                                        message: "Thank you fore add new card."
                                    };

                                    console.log();
                                    callback(status);
                                }
                            });
                        });
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUserBankInfoList: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.spCurrentBalance(sp_id, function (currentBalance) {
                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var bankdata = db.db(config.dbName).collection(config.collections.sp_bank_info);
                        var spProfileData = db.db(config.dbName).collection(config.collections.sp_sr_profile);
                        // var mysort = {creationDate: -1};
                        var mysort = {_id: -1};
                        spProfileData.findOne({sp_id: sp_id}, function (err, docsSP) {
                            bankdata.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "No Bank information.",
                                        service_count: docsSP.service_count,
                                        currentBalance: currentBalance
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    var status = {
                                        status: 1,
                                        message: "Thank you.",
                                        data: docs,
                                        service_count: docsSP.service_count,
                                        currentBalance: currentBalance

                                    };
                                    console.log();
                                    callback(status);
                                }
                            });
                        });
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUserDeleteBankInfo: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var pid = req.body.id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var bankdata = db.db(config.dbName).collection(config.collections.sp_bank_info);
                    var mysort = {creationDate: -1};
                    var myquery = {_id: ObjectID(pid), sp_id: sp_id};
                    bankdata.deleteOne(myquery, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Deleted your bank information",
                                data: docs
                            };
                            console.log();
                            callback(status);
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUserSetDefaultBankInfo: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var pid = req.body.id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.sp_bank_info);
                    // Update service record
                    collection.updateMany({sp_id: sp_id}, {$set: {isUsed: "false"}}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            // console.log(data);
                            collection.updateOne({
                                _id: ObjectID(pid),
                                sp_id: sp_id
                            }, {$set: {isUsed: "true"}}, function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {
                                    var status = {
                                        status: 1,
                                        message: "Successfully set information are default",
                                        data: docs
                                    };
                                    console.log();
                                    callback(status);
                                }
                            });
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    userTransitionCancellation: function (req, callback) {

        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var reason = req.body.reason;
                var serviceUpdate = {
                    sr_status: req.body.sr_status,
                    updateDate: new Date().toUTCString()
                };
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

                    // Update service record
                    collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs1) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            collection.find({tran_id: tran_id}).toArray(function (err, docs) {

                                var messagesBody = {
                                    author: docs[0].sp_id,
                                    author_type: "SP",
                                    sp_delet: "0",
                                    cu_delte: "0",
                                    sp_read: "0",
                                    cu_read: "0",
                                    created_on: new Date().toISOString(),
                                    body: docs[0].sr_status + " - " + reason + " - " + docs[0].sr_title
                                };
                                console.log(docs);
                                var cancellation = {
                                    sp_id: docs[0].sp_id,
                                    sr_id: docs[0].sr_id,
                                    sr_title: docs[0].sr_title,
                                    cust_id: docs[0].cust_id,
                                    tran_id: docs[0].tran_id,
                                    reason: reason,
                                    created_on: new Date().toUTCString(),
                                };


                                //Credit amount in Kaikili Wallet
                                if (req.body.sr_status == "Cancel-Scheduled-Sp") {
                                    if (reason != "Family Emergency"
                                        && reason != "Schedule Conflict"
                                        && reason != "Hospitalized"
                                        && reason != "Due to weather conditions"
                                        && reason != "Vehicle Repair"
                                    ) {
                                        comman.cuServiceCancellationChargesSP(docs[0]);
                                    }
                                    comman.kaikiliWalletDebitCustomerAmount(docs[0].tran_id, false);
                                }


                                if (req.body.sr_status == "Cancel-New-Sp" || req.body.sr_status == "Cancel-Scheduled-Sp") {
                                    var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: tran_id});
                                            var message = "Service provider Cancelled your job.";
                                            comman.sendCustomerNotification(docs[0].cust_id, tran_id, message, req.body.sr_status, "tran");
                                        }
                                    )
                                }

                                comman.checkProvidrTransitionInfoActive(docs[0].sp_id);

                                var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                                collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {

                                    if (err) {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed !. Server Error....."
                                        };
                                        console.log();
                                        callback(status);
                                    } else {
                                        var collectionCancellation = db.db(config.dbName).collection(config.collections.sp_cu_cancellation);
                                        collectionCancellation.insert(cancellation, function (err, docs) {

                                            if (err) {
                                                console.log(err);
                                                var status = {
                                                    status: 0,
                                                    message: "Failed !. Server Error....."
                                                };
                                                console.log();
                                                callback(status);
                                            } else {
                                                var status = {
                                                    status: 1,
                                                    message: "Success upload to service to server",
                                                };
                                                console.log();
                                                callback(status);
                                            }
                                        });
                                    }
                                });

                            });


                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    getUserServiceCatalogueData: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var sr_id = req.body.sr_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionService = db.db(config.dbName).collection(config.collections.add_services);
                    var collectionProvider = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
                    collectionService.find({
                        "sr_availability": "ON",
                        sr_id: sr_id,
                        "deleted": "0"
                    }).toArray(function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            // console.log(status);
                            callback(status);

                        } else {
                            if (docs.length > 0) {
                                collectionProvider.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs1) {
                                    if (err) {
                                        console.log(err);
                                        var status = {
                                            status: 0,
                                            message: "Failed !. Server Error....."
                                        };
                                        // console.log(status);
                                        callback(status);

                                    } else {
                                        var userSPidList = [];
                                        comman.getSPUserRadiusLocationOtherSP(sp_id, sr_id, function (result) {
                                            //  console.log("---->>" + result.length);
                                            result.forEach(function (element) {
                                                //  console.log(element.sp_id);
                                                if (element.sp_id != sp_id) {
                                                    userSPidList.push(element.sp_id);
                                                }
                                            });
                                            // console.log("------>" + userSPidList);
                                            var newCost_components = new Array();
                                            var ctr = 0;
                                            docs[0].cost_components.forEach(function (elementCost) {
                                                //  console.log(elementCost.sp_id);
                                                comman.getSPUserCCRatData(userSPidList, sr_id, elementCost.cc_id, function (resultCost) {
                                                    var userSPidSetRate = [];
                                                    resultCost.forEach(function (element) {
                                                        userSPidSetRate.push(element.cost_components_on[0].cc_rate_per_item)
                                                    });
                                                    // console.log("------1>" + elementCost.cc_id);
                                                    // console.log("------2>" + userSPidSetRate);
                                                    // console.log("------min >" + math.min(userSPidSetRate));
                                                    // console.log("------max >" + math.max(userSPidSetRate));
                                                    // console.log("------sum >" + math.sum(userSPidSetRate));
                                                    // console.log("------threshould_price >" + docs[0].threshould_price);
                                                    // console.log("------avg >" + (math.sum(userSPidSetRate) / userSPidSetRate.length));
                                                    // var minPri = math.min(userSPidSetRate);
                                                    // var apMinPri = (math.min(userSPidSetRate) * docs[0].threshould_price) / 100;
                                                    // console.log("------apMinPri >" + apMinPri);
                                                    var avg = 1;
                                                    // if (userSPidSetRate.length > 2) {
                                                    //     if ((math.sum(userSPidSetRate) / userSPidSetRate.length) >= 1) {
                                                    //
                                                    //         var n = userSPidSetRate.length;
                                                    //         avg = (math.sum(userSPidSetRate) / userSPidSetRate.length)
                                                    //         var std = math.std(userSPidSetRate);
                                                    //         console.log("------std >" + std);
                                                    //     }
                                                    // } else {
                                                    avg = elementCost.average;
                                                    // }

                                                    var costData = {
                                                        "cc_id": elementCost.cc_id,
                                                        "cc_cu_title": elementCost.cc_cu_title,
                                                        "cc_sp_title": elementCost.cc_sp_title,
                                                        "cc_status": elementCost.cc_status,
                                                        "hcc_id": elementCost.hcc_id,
                                                        "hcc_title": elementCost.hcc_title,
                                                        "required_field": elementCost.required_field,
                                                        "show_order": elementCost.show_order,
                                                        "avg_rate": avg
                                                    };
                                                    // console.log("------set new cost >"+costData);
                                                    newCost_components.push(costData);

                                                    ctr++;
                                                    if (ctr === docs[0].cost_components.length) {
                                                        if (docs1.length > 0) {
                                                            var status = {
                                                                status: 1,
                                                                data: {
                                                                    "_id": docs[0]._id,
                                                                    "sp_id": sp_id,
                                                                    "sr_id": sr_id,
                                                                    "sr_title": docs[0].sr_title,
                                                                    "sr_type": docs[0].sr_type,
                                                                    "sr_description": docs[0].sr_description,
                                                                    "cost_components_on": docs1[0].cost_components_on,
                                                                    "cost_components_off": docs1[0].cost_components_off,
                                                                    "sp_sr_status": docs1[0].sp_sr_status,
                                                                    "discount": docs1[0].discount,
                                                                    "neighbourhood_offer": docs1[0].neighbourhood_offer,
                                                                    "neighbourhood_offer_rat": docs1[0].neighbourhood_offer_rat,
                                                                    "repeated_service_book_offer": docs1[0].repeated_service_book_offer,
                                                                    "repeated_service_book_offer_rat": docs1[0].repeated_service_book_offer_rat,
                                                                    "minimum_charge": docs1[0].minimum_charge,
                                                                    "quote_accept": docs1[0].quote_accept,
                                                                    "threshould_price": docs[0].threshould_price,
                                                                    "type_of_service": docs[0].type_of_service,
                                                                    "preferred_provider": docs1[0].preferred_provider,
                                                                    // "cost_components": docs[0].cost_components,
                                                                    "notes": docs[0].notes,
                                                                    "cost_components": newCost_components
                                                                },
                                                                message: "Success Get all service to Mongodb",
                                                                // serviceData:docs,
                                                                // userData: docs1,
                                                            };
                                                            callback(status);
                                                        } else {
                                                            var status = {
                                                                status: 1,
                                                                data: {
                                                                    "_id": docs[0]._id,
                                                                    "sp_id": sp_id,
                                                                    "sr_id": sr_id,
                                                                    "sr_title": docs[0].sr_title,
                                                                    "sr_type": docs[0].sr_type,
                                                                    "sr_description": docs[0].sr_description,
                                                                    "cost_components_on": [],
                                                                    "cost_components_off": [],
                                                                    "sp_sr_status": "ON",
                                                                    "discount": docs[0].discount,
                                                                    "threshould_price": docs[0].threshould_price,
                                                                    "neighbourhood_offer": "OFF",
                                                                    "neighbourhood_offer_rat": "",
                                                                    "type_of_service": docs[0].type_of_service,
                                                                    "minimum_charge": "",
                                                                    "quote_accept": "",
                                                                    "preferred_provider": "",
                                                                    "cost_components": newCost_components,
                                                                    // "cost_components": docs[0].cost_components,
                                                                    "notes": docs[0].notes
                                                                },
                                                                message: "Success Get all service to Mongodb",
                                                                // serviceData:docs,
                                                                // userData: docs1,
                                                            };
                                                            callback(status);
                                                        }
                                                    }

                                                    //console.log("------cost  size >"+newCost_components.length);
                                                });

                                            });
                                            // console.log("------cost  size 1>"+newCost_components.length);


                                        });


                                    }
                                });

                            } else {
                                var status = {
                                    status: 0,
                                    message: "No Service Data"
                                };
                                // console.log(status);
                                callback(status);
                            }
                        }


                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });

    },


    // Nearest customer find in service provider location and work area 1-6-2019 changed
    getUserNearestShoutingData: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                comman.getSPUserServiceData(sp_id, function (result) {
                    // console.log(result.length + "  size------");

                    if (result.length > 0) {
                        var newAlert_components = new Array();
                        var ctr = 0;
                        var userSRidList = [];
                        var userLocationLatitude = "";
                        var userLocationLongitude = "";
                        var userSRData = new Array();
                        result.forEach(function (element) {
                            userSRidList.push(element.sr_id);
                            var userSRCCList = [];
                            element.cost_components_on.forEach(function (elementSub) {
                                userSRCCList.push(elementSub.cc_id);
                            });
                            userLocationLatitude = element.userprofile.coordinatePoint.latitude;
                            userLocationLongitude = element.userprofile.coordinatePoint.longitude;

                            var srData = {
                                "sr_id": element.sr_id,
                                "cc_ids": userSRCCList,
                                "service_area": element.userprofile.service_area,
                                "cost_components_on": element.cost_components_on,
                                "neighbourhood_offer": element.neighbourhood_offer,
                                "neighbourhood_offer_rat": element.neighbourhood_offer_rat
                            }
                            userSRData.push(srData)
                        });

                        comman.getAlreadySendShoutingId(sp_id, function (resultSendAlert) {

                            // console.log(resultSendAlert + "-------- out");

                            console.log(userLocationLongitude + " -----userLocationLongitude");
                            console.log(userLocationLatitude + " -----userLocationLatitude");


                            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                                var collection = kdb.db(config.dbName).collection(config.collections.cu_service_alert);
                                var cursorIndex = collection.createIndex({location: "2dsphere"});
                                var radius = (parseFloat(result[0].userprofile.radius) * parseFloat("1609.34"));


                                var cursorSearchMain = new Array();
                                var cursorSearchMain2 = new Array();

                                comman.getShoutingDataFilter1(longitude, latitude, userSRidList, radius, "customer_location", function (cursorSearchData) {
                                    cursorSearchMain = cursorSearchData;

                                    comman.getShoutingDataFilter1(userLocationLongitude, userLocationLatitude, userSRidList, radius, "provider_location", function (cursorSearch2) {

                                        cursorSearchMain2 = cursorSearch2;
                                        var newDataFilter = cursorSearchMain.concat(cursorSearchMain2);
                                        console.log("----aaa--" + newDataFilter.length);

                                        if (newDataFilter.length > 0) {

                                            newDataFilter.forEach(function (element) {

                                                if (!resultSendAlert.includes(element.cp_alert_id)) {
                                                    var neighbourhood_offer = "";
                                                    var neighbourhood_offer_rat = "";
                                                    var service_area = "";
                                                    var sr_cost_components = [];
                                                    var sr_cc_ids = [];
                                                    userSRData.forEach(function (userElement) {
                                                        if (userElement.sr_id == element.sr_id) {
                                                            sr_cost_components = userElement.cost_components_on;
                                                            sr_cc_ids = userElement.cc_ids;
                                                            neighbourhood_offer = userElement.neighbourhood_offer;
                                                            neighbourhood_offer_rat = userElement.neighbourhood_offer_rat;
                                                            service_area = userElement.service_area;
                                                        }
                                                    });

                                                    var allElement = true;
                                                    console.log("----11" + element.cc_ids);
                                                    element.cc_ids.forEach(function (ccid) {
                                                        if (!sr_cc_ids.includes(ccid)) {
                                                            allElement = false
                                                        }
                                                    });

                                                    if (allElement) {
                                                        var new_cost_item = new Array();
                                                        var totalCost = 0;
                                                        element.cost_item.forEach(function (ccid_item) {
                                                            sr_cost_components.forEach(function (sr_ccid_item) {
                                                                if (sr_ccid_item.cc_id == ccid_item.cc_id) {
                                                                    // console.log("----->"+sr_ccid_item.cc_sp_title);
                                                                    var cost = (parseFloat(ccid_item.cc_per_item_qut) * parseFloat(sr_ccid_item.cc_rate_per_item));
                                                                    totalCost = totalCost + cost;
                                                                    var cost_item_data = {
                                                                        "cc_id": ccid_item.cc_id,
                                                                        "cc_cu_title": ccid_item.cc_cu_title,
                                                                        "cc_sp_title": ccid_item.cc_sp_title,
                                                                        "cc_per_item_qut": ccid_item.cc_per_item_qut,
                                                                        "cc_per_item_rate": sr_ccid_item.cc_rate_per_item,
                                                                        "cc_per_item_cost": cost,
                                                                        "hcc_id": ccid_item.hcc_id,
                                                                        "hcc_title": ccid_item.hcc_title,
                                                                        "show_order": ccid_item.show_order
                                                                    }
                                                                    new_cost_item.push(cost_item_data)
                                                                }
                                                            });
                                                        });

                                                        // console.log(neighbourhood_offer_rat+"------");
                                                        // console.log(neighbourhood_offer+"------");
                                                        var discountGive = 0;
                                                        var discountAmount = 0;
                                                        var discountAfterPrice = 0;
                                                        if (neighbourhood_offer == "ON") {
                                                            discountGive = neighbourhood_offer_rat;
                                                            discountAmount = (totalCost * parseFloat(discountGive)) / 100;
                                                            discountAfterPrice = totalCost - discountAmount;
                                                        }

                                                        var costData = {
                                                            "cp_alert_id": element.cp_alert_id,
                                                            "id": element._id,
                                                            "comment": element.comment,
                                                            "address": element.address,
                                                            "sr_title": element.sr_title,
                                                            "sr_id": element.sr_id,
                                                            // "cost_item": element.cost_item,
                                                            "cost_item": new_cost_item,
                                                            "cu_id": element.cu_id,
                                                            "alert_active": element.alert_active,
                                                            // "cc_ids": element.cc_ids,
                                                            // "sr_cc_ids": sr_cc_ids,
                                                            "dist": element.dist,
                                                            "longitude": element.location.coordinates[0],
                                                            "latitude": element.location.coordinates[1],
                                                            "creationDate": element.creationDate,
                                                            "totalCost": totalCost,
                                                            "kaikili_commission": element.services.sr_commission,
                                                            "type_of_service": element.services.type_of_service,
                                                            "cu_first_name": element.cu_first_name,
                                                            "cu_last_name": element.cu_last_name,
                                                            "mobile_no": element.mobile_no,
                                                            "discountGive": discountGive,
                                                            "discountAfterPrice": discountAfterPrice,
                                                            "service_area": service_area

                                                        };
                                                        newAlert_components.push(costData)
                                                    }

                                                    ctr++;
                                                    if (ctr === newDataFilter.length) {
                                                        var status = {
                                                            status: 1,
                                                            message: "Service Data",
                                                            data: newAlert_components
                                                        };
                                                        callback(status);
                                                    }
                                                } else {
                                                    ctr++;
                                                    if (ctr === newDataFilter.length) {

                                                        if (newAlert_components.length > 0) {
                                                            var status = {
                                                                status: 1,
                                                                message: "Service Data",
                                                                data: newAlert_components
                                                            };
                                                            callback(status);
                                                        } else {
                                                            var status = {
                                                                status: 0,
                                                                message: "No Service Data"
                                                            };
                                                            callback(status);
                                                        }

                                                    }
                                                }
                                            });


                                        } else {
                                            var status = {
                                                status: 0,
                                                message: "No Service Data"
                                            };
                                            // console.log(status);
                                            callback(status);
                                        }
                                    });
                                });
                            });

                        });
                    } else {
                        var status = {
                            status: 0,
                            message: "No Service Data"
                        };
                        // console.log(status);
                        callback(status);
                    }
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUserShoutingSendCustomerInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.checkSPActive(req.body.sp_id, function (spCredit) {
                    if (spCredit) {
                        var userSRSendCUAlertData = req.body.shout_data;
                        var sp_id = req.body.sp_id;
                        var first_name = req.body.first_name;
                        var last_name = req.body.last_name;
                        var sp_mobile_no = req.body.sp_mobile_no;
                        var sp_images = "";
                        var uploadData = true;
                        var count = 0;
                        userSRSendCUAlertData.forEach(function (data) {
                            comman.getSPUserRadiusLocationToAVGShout(data.sr_id, data.longitude, data.latitude, data.cost_item, function (avgCost) {
                                comman.getNextSequenceUserID("sp_cu_shout_id", function (result) {
                                    var newAlertRequirement = {
                                        cp_alert_id: data.cp_alert_id,
                                        sp_cp_alert_send_id: "SHOUT0" + result,
                                        comment: data.comment,
                                        address: data.address,
                                        sr_title: data.sr_title,
                                        sp_id: sp_id,
                                        sp_first_name: first_name,
                                        sp_last_name: last_name,
                                        sp_mobile_no: sp_mobile_no,
                                        sp_images: sp_images,
                                        cu_first_name: data.cu_first_name,
                                        date: data.date,
                                        time: data.time,
                                        bookingDateTime: data.bookingDateTime,
                                        cu_last_name: data.cu_last_name,
                                        cu_mobile_no: data.mobile_no,
                                        type_of_service: data.type_of_service,
                                        sr_status: "Open",
                                        sr_id: data.sr_id,
                                        cost_item: data.cost_item,
                                        cu_id: data.cu_id,
                                        dist: data.dist,
                                        longitude: data.longitude,
                                        latitude: data.latitude,
                                        totalCost: data.totalCost,
                                        kaikili_commission: data.kaikili_commission,
                                        discountGive: data.discountGive,
                                        service_area: data.service_area,
                                        discountAfterPrice: data.discountAfterPrice,
                                        creationDate: new Date().toISOString(),
                                        avg_cost: avgCost.totalCost
                                    };

                                    mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                                        var collection = kdb.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                                        collection.insertOne(newAlertRequirement, function (err, records) {
                                            if (err) {
                                                uploadData = false;
                                            } else {
                                                comman.sendCustomerNotification(data.cu_id, "SHOUT0" + result, "Service Provider Send Neighborhood Shout Request", "Neighborhood Shout", "shout");

                                                count++;
                                                if (count == userSRSendCUAlertData.length) {
                                                    if (!uploadData) {
                                                        console.log(err);
                                                        var status = {
                                                            status: 0,
                                                            message: "Failed !. Server Error....."
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
                                                }
                                            }
                                        });
                                    });

                                });
                            });
                        });

                    } else {
                        var status = {
                            status: 2,
                            message: "This Account are  deactivated. Pleas contact support team.",
                        };
                        callback(status);
                    }
                });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    SPUsergetTowDayData: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                comman.getAlreadySendShoutingId(req.body.sp_id, function (result) {
                    var status = {
                        status: 1,
                        message: "Successfully set information are default",
                        data: result
                    };
                    console.log(result);
                    callback(status);

                });

                //
                // var sp_id = req.body.sp_id;
                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var collection = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                //     // Update service record
                //     collection.find({
                //         "creationDate":
                //             {
                //                 $gte: new Date(new Date().setHours(0, 0, 0)).toISOString(),
                //                 $lt: new Date(new Date().setHours(23, 59, 59)).toISOString()
                //             },"sp_id":sp_id
                //     }).toArray(function (err, docs) {
                //         if (err) {
                //             console.log(err);
                //             var status = {
                //                 status: 0,
                //                 message: "Failed"
                //             };
                //             callback(status);
                //         } else {
                //             var status = {
                //                 status: 1,
                //                 message: "Successfully set information are default",
                //                 data: docs
                //             };
                //             console.log(docs);
                //             callback(status);
                //         }
                //     });
                // });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    // Api Created 18-6-2019 Cancellation Transition Info
    getSingleCancellationTransitionInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);

                    // Update service record
                    collection.findOne({tran_id: tran_id}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Success upload to service to server",
                                data: docs
                            };

                            console.log();
                            callback(status);

                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    },

    // Api Created 22-6-2019 kaikili preferred provider Transition Info
    postSPupaterPPSInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var pps_id = req.body.pps_id;
                var sp_id = req.body.sp_id;
                var statusData = req.body.status;
                console.log(pps_id);
                console.log(sp_id);
                console.log(statusData);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                        var collection = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                        collection.find({pps_id: pps_id}).toArray(function (err, docs) {


                                console.log("------------------------------------>");
                                if (err) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {

                                    if (docs.length == 0) {

                                        var status = {
                                            status: 0,
                                            message: "This Service other service provider accepted."
                                        };

                                        console.log();
                                        callback(status);
                                    } else {
                                        var dist = "";
                                        docs[0].pps_data.forEach(function (ppsdata) {
                                            if (ppsdata.sp_id == sp_id) {
                                                dist = ppsdata.dist;
                                            }
                                        });

                                        if (statusData == "Cancel") {

                                            var serviceUpdate = {
                                                sr_status: "Cancel-New-Sp",
                                                updateDate: new Date().toUTCString()
                                            };

                                            var cu_sp_pps_send = db.db(config.dbName).collection(config.collections.cu_sp_pps_send);
                                            cu_sp_pps_send.update({pps_id: pps_id, sp_id: sp_id}, {$set: serviceUpdate});

                                            collection.updateOne({pps_id: pps_id}, {$pull: {preferredProvider: sp_id}}, function (err, docs) {
                                                console.log(docs + "----------1");
                                            });
                                            collection.updateOne({pps_id: pps_id}, {$pull: {pps_data: {sp_id: sp_id}}}, function (err, docs) {
                                                console.log(docs + "----------2");
                                            });
                                            var status = {
                                                status: 1,
                                                message: "Cancel service provider."
                                            };

                                            console.log();
                                            callback(status);

                                        } else {
                                            var serviceUpdate = {
                                                sr_status: "Scheduled",
                                                updateDate: new Date().toUTCString()
                                            };

                                            var cu_sp_pps_send = db.db(config.dbName).collection(config.collections.cu_sp_pps_send);
                                            cu_sp_pps_send.update({pps_id: pps_id, sp_id: sp_id}, {$set: serviceUpdate});
                                            collection.update({pps_id: pps_id}, {$set: serviceUpdate});

                                            var bulkInsert = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                                            var bulkRemove = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                                            bulkRemove.find({pps_id: req.body.pps_id}).forEach(
                                                function (doc) {
                                                    bulkInsert.insertOne(doc);
                                                    bulkRemove.removeOne({pps_id: pps_id});
                                                }
                                            );
                                            comman.getSPProfileData(sp_id, function (result) {

                                                var discount = {
                                                    ds_title: "Disount",
                                                    ds_rate_per_item: "0",
                                                    ds_per: "0"
                                                };

                                                var postJob = {
                                                    address: docs[0].address,
                                                    comment: docs[0].comment,
                                                    sr_id: docs[0].sr_id,
                                                    sr_title: docs[0].sr_title,
                                                    time: docs[0].time,
                                                    date: docs[0].date,
                                                    bookingDateTime: docs[0].bookingDateTime,
                                                    cust_id: docs[0].cust_id,
                                                    cust_first_name: docs[0].cust_first_name,
                                                    cust_last_name: docs[0].cust_last_name,
                                                    sr_status: "Scheduled",
                                                    txn_status: "",
                                                    minimum_charge: "0",
                                                    totalCost: docs[0].totalCost,
                                                    itemCost: docs[0].itemCost,
                                                    last_cancel_tran_id: docs[0].last_cancel_tran_id,
                                                    last_cancel_sp_id: docs[0].last_cancel_sp_id,
                                                    re_book: docs[0].re_book,
                                                    type_of_service: docs[0].type_of_service,
                                                    discount: discount,
                                                    kaikili_commission: docs[0].kaikili_commission,
                                                    sr_type: docs[0].sr_type,
                                                    sr_total: docs[0].sr_total,
                                                    sp_net_pay: docs[0].sp_net_pay,
                                                    coordinatePoint: docs[0].coordinatePoint,
                                                    cp_review: docs[0].cp_review,
                                                    sp_review: docs[0].sp_review,
                                                    sp_first_name: result[0].first_name,
                                                    sp_Last_name: result[0].last_name,
                                                    sp_id: sp_id,
                                                    sp_image: result[0].userprofile.profile_image,
                                                    sp_service_area: result[0].userprofile.service_area,
                                                    distance: dist,
                                                    coupon_code: result[0].coupon_code,
                                                    coupon_apply: result[0].coupon_apply,
                                                    coupon_code_discount_amount: result[0].coupon_code_discount_amount,
                                                }

                                                comman.getBookPPService(postJob, function (result) {
                                                    callback(result);
                                                });

                                            });
                                        }
                                    }
                                }
                            }
                        );
                    }
                );
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        })
        ;
    },

// Api Created 22-6-2019 Preferred Provider Transition Info
    getPreferredProviderInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                var pps_id = req.body.pps_id;
                comman.preferredProviderInfo(req.body.pps_id, req.body.read, function (getData) {
                    callback(getData);
                });

                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var collection = db.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                //
                //     if (req.body.read == true)
                //         collection.update({pps_id: pps_id}, {$set: {sp_show: true}});
                //
                //     // Update service record
                //     collection.find({pps_id: pps_id}).toArray(function (err, docs) {
                //         if (err) {
                //             console.log(err);
                //             var status = {
                //                 status: 0,
                //                 message: "Failed !. Server Error....."
                //             };
                //             console.log(status);
                //             callback(status);
                //         } else {
                //             var status = {
                //                 status: 1,
                //                 message: "Success upload to service to server",
                //                 ppsdata: docs
                //             };
                //             console.log();
                //             callback(status);
                //
                //         }
                //     });
                // });

            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

// Api Created 24-6-2019 Preferred Provider Transition Info
    getPreferredProviderInfoCancel: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var pps_id = req.body.pps_id;

                comman.preferredProviderInfoCancel(req.body.pps_id, function (getData) {
                    callback(getData);
                });

                // mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                //     var collection = db.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                //
                //     // Update service record
                //     collection.find({pps_id: pps_id}).toArray(function (err, docs) {
                //         if (err) {
                //             console.log(err);
                //             var status = {
                //                 status: 0,
                //                 message: "Failed !. Server Error....."
                //             };
                //             console.log(status);
                //             callback(status);
                //         } else {
                //             var status = {
                //                 status: 1,
                //                 message: "Success upload to service to server",
                //                 ppsdata: docs
                //             };
                //             console.log();
                //             callback(status);
                //
                //         }
                //     });
                // });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

// new Api Check Otp - 24-7-2019
    checkServiceOPT: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var tran_id = req.body.tran_id;
                    var otp = req.body.otp;
                    console.log(otp);
                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    collection.findOne({tran_id: tran_id}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "OTP Not Valid",
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            console.log(docs.otp);
                            if (docs.otp == otp) {
                                var status = {
                                    status: 1,
                                    message: "OTP Valid"
                                };
                                console.log(status);
                                callback(status);
                            } else {
                                var status = {
                                    status: 0,
                                    message: "OTP Not Valid"
                                };
                                console.log(status);
                                callback(status);
                            }
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

// Interested To Hire customer find in service provider location and work area 29-8-2019 changed
    getUserNearestInterestedToHire: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var sp_id = req.body.sp_id;
                var latitude = req.body.latitude;
                var longitude = req.body.longitude;
                comman.getSPUserServiceData(sp_id, function (result) {
                    console.log(result.length + "  size------");

                    if (result.length > 0) {
                        var newAlert_components = new Array();
                        var ctr = 0;
                        var userSRidList = [];
                        var userLocationLatitude = "";
                        var userLocationLongitude = "";
                        var userSRData = new Array();
                        result.forEach(function (element) {
                            userSRidList.push(element.sr_id);
                            var userSRCCList = [];
                            element.cost_components_on.forEach(function (elementSub) {
                                userSRCCList.push(elementSub.cc_id);
                            });
                            userLocationLatitude = element.userprofile.coordinatePoint.latitude;
                            userLocationLongitude = element.userprofile.coordinatePoint.longitude;

                            var srData = {
                                "sr_id": element.sr_id,
                                "cc_ids": userSRCCList,
                                "service_area": element.userprofile.service_area,
                                "cost_components_on": element.cost_components_on,
                                "neighbourhood_offer": element.neighbourhood_offer,
                                "neighbourhood_offer_rat": element.neighbourhood_offer_rat,
                                "minimum_charge": element.minimum_charge,
                                "discount": element.discount
                            }
                            userSRData.push(srData)
                            console.log(srData + "-------- out");

                        });


                        comman.getAlreadySendInterestedRequestId(sp_id, function (resultSendAlert) {

                            console.log(resultSendAlert + "-------- out");

                            console.log(userLocationLongitude + " -----userLocationLongitude");
                            console.log(userLocationLatitude + " -----userLocationLatitude");

                            mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                                var collection = kdb.db(config.dbName).collection(config.collections.cu_interested_services);
                                var cursorIndex = collection.createIndex({location: "2dsphere"});
                                var radius = (parseFloat(result[0].userprofile.radius) * parseFloat("1609.34"));
                                var cursorSearchMain = new Array();
                                var cursorSearchMain2 = new Array();

                                comman.getInterestedRequestDataFilter1(longitude, latitude, userSRidList, radius, "customer_location", function (cursorSearchData) {
                                    cursorSearchMain = cursorSearchData;

                                    comman.getInterestedRequestDataFilter1(userLocationLongitude, userLocationLatitude, userSRidList, radius, "provider_location", function (cursorSearch2) {
                                        cursorSearchMain2 = cursorSearch2;

                                        var newDataFilter = cursorSearchMain.concat(cursorSearchMain2);
                                        console.log("----aaa--" + newDataFilter.length);

                                        if (newDataFilter.length > 0) {

                                            newDataFilter.forEach(function (element) {

                                                if (!resultSendAlert.includes(element.cu_search_id)) {
                                                    var minimum_charge = "";
                                                    var discount;
                                                    var service_area = "";
                                                    var sr_cost_components = [];
                                                    var sr_cc_ids = [];
                                                    userSRData.forEach(function (userElement) {
                                                        if (userElement.sr_id == element.sr_id) {
                                                            sr_cost_components = userElement.cost_components_on;
                                                            sr_cc_ids = userElement.cc_ids;
                                                            minimum_charge = userElement.minimum_charge;
                                                            discount = userElement.discount;
                                                            service_area = userElement.service_area;

                                                        }
                                                    });

                                                    var allElement = true;
                                                    console.log("----11" + element.cc_ids);
                                                    element.cc_ids.forEach(function (ccid) {
                                                        if (!sr_cc_ids.includes(ccid)) {
                                                            allElement = false
                                                        }
                                                    });

                                                    if (allElement) {
                                                        var new_cost_item = new Array();
                                                        var totalCost = 0;
                                                        element.cost_item.forEach(function (ccid_item) {
                                                            sr_cost_components.forEach(function (sr_ccid_item) {
                                                                if (sr_ccid_item.cc_id == ccid_item.cc_id) {
                                                                    // console.log("----->"+sr_ccid_item.cc_sp_title);
                                                                    var cost = (parseFloat(ccid_item.cc_per_item_qut) * parseFloat(sr_ccid_item.cc_rate_per_item));
                                                                    totalCost = totalCost + cost;
                                                                    var cost_item_data = {
                                                                        "cc_id": ccid_item.cc_id,
                                                                        "cc_cu_title": ccid_item.cc_cu_title,
                                                                        "cc_sp_title": ccid_item.cc_sp_title,
                                                                        "cc_per_item_qut": ccid_item.cc_per_item_qut,
                                                                        "cc_per_item_rate": sr_ccid_item.cc_rate_per_item,
                                                                        "cc_per_item_cost": cost,
                                                                        "hcc_id": ccid_item.hcc_id,
                                                                        "hcc_title": ccid_item.hcc_title,
                                                                        "show_order": ccid_item.show_order
                                                                    }
                                                                    new_cost_item.push(cost_item_data)
                                                                }
                                                            });
                                                        });

                                                        console.log(minimum_charge + "------");
                                                        console.log(discount + "------");
                                                        var discountGive = 0;
                                                        var discountAmount = 0;
                                                        var discountAfterPrice = 0;
                                                        if (discount.ds_check_box == "ON") {
                                                            discountGive = discount.ds_rate_per_item;
                                                            discountAmount = (totalCost * parseFloat(discountGive)) / 100;
                                                            discountAfterPrice = totalCost - discountAmount;
                                                        }

                                                        comman.getCustomerData(element.cu_id, function (customerData) {
                                                            console.log(customerData.search_show + "------xxx");
                                                            if (customerData.search_show == 1) {
                                                                var costData = {
                                                                    "cu_search_id": element.cu_search_id,
                                                                    "id": element._id,
                                                                    "comment": element.comment,
                                                                    "address": element.address,
                                                                    "sr_title": element.sr_title,
                                                                    "sr_id": element.sr_id,
                                                                    // "cost_item": element.cost_item,
                                                                    "cost_item": new_cost_item,
                                                                    "cu_id": customerData.cu_id,
                                                                    // "alert_active": element.alert_active,
                                                                    // "cc_ids": element.cc_ids,
                                                                    // "sr_cc_ids": sr_cc_ids,
                                                                    "dist": element.dist,
                                                                    "date": element.date,
                                                                    "time": element.time,
                                                                    "time": element.time,
                                                                    "cc_ids": element.cc_ids,
                                                                    "longitude": element.location.coordinates[0],
                                                                    "latitude": element.location.coordinates[1],
                                                                    "creationDate": element.creationDate,
                                                                    "totalCost": totalCost,
                                                                    "kaikili_commission": element.services.sr_commission,
                                                                    "type_of_service": element.services.type_of_service,
                                                                    "cu_first_name": customerData.first_name,
                                                                    "cu_last_name": customerData.last_name,
                                                                    "mobile_no": element.mobile_no,
                                                                    "cu_images": customerData.cu_image,
                                                                    "discountGive": discountGive,
                                                                    "discount": discount,
                                                                    "minimum_charge": minimum_charge,
                                                                    "discountAfterPrice": discountAfterPrice,
                                                                    "service_area": service_area

                                                                };
                                                                newAlert_components.push(costData)
                                                                console.log("add data in list" + "------xxx");
                                                            }
                                                            ctr++;
                                                            if (ctr === newDataFilter.length) {
                                                                var status = {
                                                                    status: 1,
                                                                    message: "Service Data",
                                                                    data: newAlert_components
                                                                };
                                                                callback(status);
                                                            }
                                                        });

                                                    }

                                                    // ctr++;
                                                    // if (ctr === newDataFilter.length) {
                                                    //     var status = {
                                                    //         status: 1,
                                                    //         message: "Service Data",
                                                    //         data: newAlert_components
                                                    //     };
                                                    //     callback(status);
                                                    // }
                                                } else {
                                                    ctr++;
                                                    if (ctr === newDataFilter.length) {

                                                        if (newAlert_components.length > 0) {
                                                            var status = {
                                                                status: 1,
                                                                message: "Service Data",
                                                                data: newAlert_components
                                                            };
                                                            callback(status);
                                                        } else {
                                                            var status = {
                                                                status: 0,
                                                                message: "No Service Data"
                                                            };
                                                            callback(status);
                                                        }

                                                    }
                                                }
                                            });


                                        } else {
                                            var status = {
                                                status: 0,
                                                message: "No Service Data"
                                            };
                                            // console.log(status);
                                            callback(status);
                                        }
                                    });
                                });
                            });

                        });
                    } else {
                        var status = {
                            status: 0,
                            message: "No Service Data"
                        };
                        // console.log(status);
                        callback(status);
                    }
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

    SPUserInterestedSendCustomerInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                comman.checkSPActive(req.body.sp_id, function (spCredit) {
                   if(spCredit){
                       var userSRSendCUAlertData = req.body.shout_data;
                       var sp_id = req.body.sp_id;
                       var first_name = req.body.first_name;
                       var last_name = req.body.last_name;
                       var sp_mobile_no = req.body.sp_mobile_no;
                       var sp_images = "";
                       var uploadData = true;
                       var count = 0;

                       userSRSendCUAlertData.forEach(function (data) {
                           comman.getNextSequenceUserID("cu_interested", function (result) {
                               var newAlertRequirement = {
                                   cu_search_id: data.cu_search_id,
                                   cu_interested_rq_id: "cu_interested_rq_" + result,
                                   comment: data.comment,
                                   address: data.address,
                                   sr_title: data.sr_title,
                                   sp_id: sp_id,
                                   sp_first_name: first_name,
                                   sp_last_name: last_name,
                                   sp_mobile_no: sp_mobile_no,
                                   sp_images: sp_images,
                                   cu_first_name: data.cu_first_name,
                                   cu_last_name: data.cu_last_name,
                                   mobile_no: data.mobile_no,
                                   cu_images: data.cu_images,
                                   type_of_service: data.type_of_service,
                                   sr_status: "Open",
                                   sr_id: data.sr_id,
                                   cost_item: data.cost_item,
                                   cu_id: data.cu_id,
                                   cu_ids: data.cc_ids,
                                   time: data.time,
                                   date: data.date,
                                   bookingDateTime: data.bookingDateTime,
                                   dist: data.dist,
                                   longitude: data.longitude,
                                   latitude: data.latitude,
                                   totalCost: data.totalCost,
                                   kaikili_commission: data.kaikili_commission,
                                   discountGive: data.discountGive,
                                   service_area: data.service_area,
                                   discountAfterPrice: data.discountAfterPrice,
                                   minimum_charge: data.minimum_charge,
                                   creationDate: new Date().toISOString()
                               };

                               mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, kdb) {
                                   var collection = kdb.db(config.dbName).collection(config.collections.sp_cu_send_interested);
                                   collection.insertOne(newAlertRequirement, function (err, records) {
                                       if (err) {
                                           uploadData = false;
                                       } else {
                                           comman.sendCustomerNotification(data.cu_id, newAlertRequirement.cu_interested_rq_id, "Service Provider Send Interested Service Request", "Interested to Service", "cu_interested");

                                           count++;
                                           if (count == userSRSendCUAlertData.length) {
                                               if (!uploadData) {
                                                   console.log(err);
                                                   var status = {
                                                       status: 0,
                                                       message: "Failed !. Server Error....."
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
                                           }
                                       }
                                   });
                               });

                           });

                       });
                   }else {

                       var status = {
                           status: 2,
                           message: "This Account are  deactivated. Pleas contact support team.",
                       };
                       callback(status);
                   }
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

    getUserServiceCostHelperInfo: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var sr_id = req.body.sr_id;
                var cost_item = req.body.cost_item;
                var cc_ids = req.body.cc_ids;
                console.log(sp_id);
                comman.getCostHelperNearestServiceProvider(sp_id, sr_id, cc_ids, cost_item, function (resultNearbuy) {
                    callback(resultNearbuy);
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

    userSendShoutInterestedPostList: function (req, callback) {
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                console.log(sp_id);
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var mysort = {creationDate: -1};
                    var collection = db.db(config.dbName).collection(config.collections.sp_cu_send_interested);
                    var collectionShout = db.db(config.dbName).collection(config.collections.sp_cu_send_shout);
                    var collectionCanShout = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                    console.log(err);
                    collection.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
                            if (err) {
                                console.log(err);
                                var status = {
                                    status: 0,
                                    message: "Failed !. Server Error....."
                                };
                                // console.log(status);
                                callback(status);

                            } else {
                                collectionShout.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs1) {
                                        if (err) {
                                            console.log(err);
                                            var status = {
                                                status: 0,
                                                message: "Failed !. Server Error....."
                                            };
                                            // console.log(status);
                                            callback(status);

                                        } else {
                                            if (docs1 == null) {
                                                docs1 = [];
                                            }
                                            collectionCanShout.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs2) {
                                                if (err) {
                                                    console.log(err);
                                                    var status = {
                                                        status: 0,
                                                        message: "Failed !. Server Error....."
                                                    };
                                                    // console.log(status);
                                                    callback(status);

                                                } else {
                                                    if (docs2 == null) {
                                                        docs2 = [];
                                                    }
                                                    var doc = docs1.concat(docs2);
                                                    var status = {
                                                        status: 1,
                                                        message: "Success get all transition service information",
                                                        dataInterested: docs,
                                                        dataShout: doc,
                                                    };
                                                    callback(status);
                                                }
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    );

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

    SPcashOutToBanck: function (req, callback) {
        var sp_id = req.body.sp_id;
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {

                comman.checkSPActive(req.body.sp_id, function (spCredit) {
                     if (spCredit) {
                        var sp_name = req.body.sp_name;
                        var cash_out = req.body.cash_out;

                        comman.spEranInfoUpdate(sp_id, "CASH-OUT", "Cash out to user", 0, cash_out, "Debit");
                        comman.kaiKiliWalletUpdate(sp_id, sp_name, "", "", "CASH-OUT", "Cash Out", "Cash out to service provider", 0, cash_out, "Debit")

                        var status = {
                            status: 1,
                            message: "Successfully update information ",
                        };
                        console.log(status);
                        callback(status);

                    } else {
                        var status = {
                            status: 2,
                            message: "This Account are  deactivated. Pleas contact support team.",
                        };
                        console.log(status);
                        callback(status);
                    }


                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,

    getTransitionInfoFull: function (req, callback) {
        var sp_id = req.body.sp_id;
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var tran_id = req.body.tran_id;
                var sp_view = req.body.sp_view;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collection_transaction = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    var collection_transaction_completed = db.db(config.dbName).collection(config.collections.cu_sp_transaction_completed);
                    var collection_transaction_cancellation = db.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                    if (sp_view == true) {
                        collection_transaction.update({tran_id: tran_id}, {$set: {sp_view: true}});
                    }

                    collection_transaction.find({tran_id: tran_id}).toArray(function (err1, docsOnTr) {
                        collection_transaction_completed.find({tran_id: tran_id}).toArray(function (err2, docsOnTrCom) {
                            collection_transaction_cancellation.find({tran_id: tran_id}).toArray(function (err3, docsOnTrCan) {

                                if (err1 || err2 || err3) {
                                    console.log(err);
                                    var status = {
                                        status: 0,
                                        message: "Failed !. Server Error....."
                                    };
                                    console.log(status);
                                    callback(status);
                                } else {

                                    var doc = docsOnTr.concat(docsOnTrCom);
                                    var doc = doc.concat(docsOnTrCan);

                                    if (doc.length > 0) {
                                        var status = {
                                            status: 1,
                                            message: "Success upload to service to server",
                                            data: doc[0]
                                        };
                                        console.log();
                                        callback(status);
                                    } else {
                                        var status = {
                                            status: 0,
                                            message: "No Transaction found.",
                                        };
                                        console.log();
                                        callback(status);
                                    }
                                }

                            });
                        });
                    });

                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,


// 1-6-2019 created Api (Customer Shouting SR status update)
    getCustomerData(req, callback) {
        var sp_id = req.body.sp_id;
        var sp_id = req.body.sp_id;
        var key = req.body.key;
        comman.checkSPValidLogin(sp_id, key, function (validUser) {
            if (validUser) {
                var cu_id = req.body.cu_id;
                mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, db) {
                    var collectionSP = db.db(config.dbName).collection(config.collections.cu_profile);
                    collectionSP.findOne({cu_id: cu_id}, function (err, records) {
                        if (err) {
                            console.log(err);
                            var status = {
                                status: 0,
                                message: "Failed !. Server Error....."
                            };
                            console.log(status);
                            callback(status);
                        } else {
                            var status = {
                                status: 1,
                                message: "Successfully update information.",
                                data: records
                            };
                            console.log(status);
                            callback(status);
                        }
                    });
                });
            } else {
                var status = {
                    status: -1,
                    message: "Login in other mobile",
                };
                callback(status);
            }
        });
    }
    ,


}
module.exports = UserService;