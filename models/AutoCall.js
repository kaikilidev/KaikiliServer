var mongo = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
const math = require('mathjs');
var comman = require('../models/Comman');

var AutoCall = {


    autoTimerService() {
        console.log("=====" + " auto timer calll");

        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, dbas) {
            var collection = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
            var collectionPP = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
            var collectionShout = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout);
            var collectionInterested = dbas.db(config.dbName).collection(config.collections.sp_cu_send_interested);

            collection.find({sr_status: {$in: ["Open", "Rescheduled", "Scheduled", "Progress"]}}).toArray(function (err, mainDocs) {
                if (err) {
                } else {
                    console.log("=====" + mainDocs.length);

                    mainDocs.forEach(function (element) {

                        console.log("=====" + element.tran_id + " --- " + element.sr_status);

                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);

                            //var duration = moment.duration(end_date.diff(start_date));
                            var duration = end_date.getTime() - start_date.getTime();
                            timeMin = duration / 60000;

                            if (timeMin >= 4 && timeMin < 5) {
                                var message = "Customer Create New Service Remainder"
                                console.log("------->>> 111" + "Send Notification ......");
                                comman.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
                                //Send Notification
                            } else if (timeMin >= 5) {
                                //Auto remove
                                var serviceUpdate = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };

                                console.log("------->>> 222" + "Send Notification ......");
                                collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                var message = "Auto Cancel Service Remainder"
                                comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");

                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                bulkRemove.find({tran_id: element.tran_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        bulkRemove.removeOne({tran_id: element.tran_id});
                                    }
                                )

                            } else {
                                console.log("=====333 " + element.tran_id + "  open");
                            }
                        } else if (element.sr_status == "Rescheduled") {

                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.updateDate);
                            var end_date = new Date(res_time);
                            var duration =end_date.getTime() - start_date.getTime();

                            timeMin = duration / 60000;
                            if (timeMin >= 9 && timeMin < 10) {
                                console.log("=====444 " + element.tran_id + "  Rescheduled");
                                var message = "Service provider rescheduled your job Remainder"
                                comman.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
                                //Send Notification
                            } else if (timeMin >= 10) {
                                console.log("=====555 " + element.tran_id + "  Rescheduled");
                                //Auto remove
                                var serviceUpdate = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };
                                collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                var message = "Auto Cancel Service Remainder"
                                comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");


                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                bulkRemove.find({tran_id: element.tran_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        bulkRemove.removeOne({tran_id: element.tran_id});
                                    }
                                )
                            } else {
                                console.log("===== 666" + element.tran_id + "  Rescheduled");
                            }

                        } else if (element.sr_status == "Scheduled") {

                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.bookingDateTime);
                            var end_date = new Date(res_time);
                            console.log("===== end_date " + end_date.getTime());
                            console.log("===== start_date" + start_date.getTime());

                            var duration = end_date.getTime() - start_date.getTime();
                            // var duration = moment.duration(end_date.diff(start_date));

                            console.log("===== " + duration);
                            timeMin = duration / 60000;
                            console.log("===== " + timeMin);
                            console.log("===== 777" + element.tran_id + "  Scheduled");
                            if (timeMin <= -29 && timeMin > -30) {
                                console.log("===== 888" + element.tran_id + "  Scheduled");
                                console.log("2=====" + "Send Notification");
                                if (element.type_of_service == "customer_location") {
                                    var message = "Scheduled are next 30 min after start";
                                    comman.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
                                } else {
                                    var message = "Scheduled are next 30 min after start"
                                    comman.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
                                }

                                // }else if(timeMin >= 5){
                            } else if (timeMin >= 30 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {

                                console.log("===== 999" + element.tran_id + "  Scheduled");
                                if (element.type_of_service == "customer_location") {
                                    comman.cuServiceCancellationChargesSP(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {

                                    comman.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");

                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);
                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            } else if (timeMin >= 360 && (element.service_book_type == "shouting" || element.service_book_type == "interested")) {

                                console.log("===== AAAA" + element.tran_id + "  Scheduled");
                                if (element.type_of_service == "customer_location") {
                                    comman.cuServiceCancellationChargesSP(element);
                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");

                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id, false);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {
                                    comman.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Scheduled-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);

                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            }

                            console.log("===== id" + element.tran_id);
                            console.log("===== time" + timeMin);

                            // "type_of_service": "customer_location",
                            // "type_of_service": "provider_location",
                        } else if (element.sr_status == "Progress") {

                            console.log("===== bbbb" + element.tran_id + "  Scheduled");
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.bookingDateTime);
                            var end_date = new Date(res_time);
                            var duration = end_date.getTime() - start_date.getTime();

                            // var res_time = new Date().toUTCString();
                            console.log("===== res_time " + res_time);
                            // console.log("=====element.bookingDateTime" + element.bookingDateTime);
                            // var start_date = moment(element.bookingDateTime,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // // var duration1 = moment.duration(start_date.diff(end_date));
                            // var duration = moment.duration(end_date.diff(start_date,'minutes'));
                            console.log("=====" + duration);
                            timeMin = duration / 60000;
                            console.log("=====" + timeMin + " ----14");

                            // wait for 24 hour
                            if (timeMin >= 14 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {

                                if (element.type_of_service == "customer_location") {
                                    comman.cuServiceCancellationChargesSPProgress(element);
                                    var serviceUpdate = {
                                        sr_status: "Cancel-Progress-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");

                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id, false);


                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )

                                } else {
                                    comman.cuServiceCancellationCharges(element);

                                    var serviceUpdate = {
                                        sr_status: "Cancel-Progress-Auto",
                                        updateDate: new Date().toUTCString()
                                    };
                                    collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
                                    var message = "Auto Cancel Service Remainder"
                                    comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");

                                    comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);


                                    var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
                                    var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
                                    bulkRemove.find({tran_id: element.tran_id}).forEach(
                                        function (doc) {
                                            bulkInsert.insertOne(doc);
                                            bulkRemove.removeOne({tran_id: element.tran_id});
                                        }
                                    )
                                }
                            }

                        } else {
                            console.log("===== ccc" + element.tran_id + "  Scheduled");
                            console.log("===== id" + element.sr_status);
                        }

                    });
                }
            });

            collectionPP.find({sr_status: {$in: ["Open"]}}).toArray(function (err, mainDocs) {
                if (err) {
                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {

                        var timeMin;
                        var res_time = new Date().toUTCString();
                        var start_date = new Date(element.creationDate);
                        var end_date = new Date(res_time);
                        var duration = end_date.getTime() - start_date.getTime();

                        // var res_time = new Date().toUTCString();
                        // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                        // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                        // var duration = moment.duration(end_date.diff(start_date));
                        timeMin = duration / 60000;
                        console.log("pps id ---->>>" + element.pps_id);
                        if (timeMin >= 4 && timeMin < 5) {

                            var message = "New kaikili preferred provider Job."
                            element.preferredProvider.forEach(function (element11) {
                                comman.sendServiceNotification(element11, element.pps_id, message, "New", "pps");
                            });

                        } else if (timeMin >= 5) {
                            //Auto remove
                            var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
                            var bulkRemove = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
                            var cu_sp_pps_send = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_send);

                            var serviceUpdate = {
                                sr_status: "Cancel-New-Auto",
                                updateDate: new Date().toUTCString()
                            };

                            bulkRemove.update({pps_id: element.pps_id}, {$set: serviceUpdate});

                            element.preferredProvider.forEach(function (element11) {
                                console.log("1=====" + element.pps_id);
                                console.log("2=====" + element11);
                                cu_sp_pps_send.update({
                                    pps_id: element.pps_id,
                                    sp_id: element11
                                }, {$set: serviceUpdate});
                            });

                            var message = "Auto Cancel Service Remainder"
                            comman.sendCustomerNotification(element.cust_id, element.pps_id, message, "Cancel-New-Auto", "pps");


                            bulkRemove.find({pps_id: element.pps_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    bulkRemove.removeOne({pps_id: element.pps_id});
                                }
                            )
                        }
                    });
                }
            });

            collectionShout.find({}).toArray(function (err, mainDocs) {
                if (err) {

                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {
                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);
                            var duration = end_date.getTime() - start_date.getTime();


                            // var res_time = new Date().toISOString();
                            // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;

                            if (timeMin >= 4 && timeMin < 5) {
                                comman.sendCustomerNotification(element.cu_id, element.sp_cp_alert_send_id, "Service Provider Send Neighborhood Shout Request", "Neighborhood Shout", "shout");

                            } else if (timeMin >= 5) {

                                var updateTran = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };

                                collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                                var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                                collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                                    function (doc) {
                                        bulkInsert.insertOne(doc);
                                        collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                                    }
                                );

                            }
                        } else {
                            collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                            var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                            collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                                function (doc) {
                                    bulkInsert.insertOne(doc);
                                    collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                                }
                            );
                        }
                    });
                }
            });

            collectionInterested.find({}).toArray(function (err, mainDocs) {
                if (err) {

                } else {
                    console.log("=====" + mainDocs.length);
                    mainDocs.forEach(function (element) {
                        if (element.sr_status == "Open") {
                            var timeMin;
                            var res_time = new Date().toUTCString();
                            var start_date = new Date(element.creationDate);
                            var end_date = new Date(res_time);
                            var duration = end_date.getTime() - start_date.getTime();


                            // var res_time = new Date().toISOString();
                            // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
                            // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
                            // var duration = moment.duration(end_date.diff(start_date));
                            timeMin = duration / 60000;
                            // "cu_interested_rq_id": "cu_interested_rq_4",
                            if (timeMin >= 4 && timeMin < 5) {
                                comman.sendCustomerNotification(element.cu_id, element.cu_interested_rq_id, "Service Provider Send Interested Service Request", "Interested to Service", "cu_interested");

                            } else if (timeMin >= 5) {

                                var updateTran = {
                                    sr_status: "Cancel-New-Auto",
                                    updateDate: new Date().toUTCString()
                                };
                                collectionInterested.updateOne({cu_interested_rq_id: element.cu_interested_rq_id}, {$set: updateTran});
                            }
                        } else {
                            // collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
                            // var bulkInsert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
                            // collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
                            //     function (doc) {
                            //         bulkInsert.insertOne(doc);
                            //         collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
                            //     }
                            // );
                        }
                    });
                }
            });


        });
    },
}

module.exports = AutoCall;

// autoTimerService() {
//     console.log("=====" + " auto timer calll");
//
//     mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, dbas) {
//         var collection = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//         var collectionPP = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
//         var collectionShout = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout);
//         var collectionInterested = dbas.db(config.dbName).collection(config.collections.sp_cu_send_interested);
//
//         collection.find({sr_status: {$in: ["Open", "Rescheduled", "Scheduled", "Progress"]}}).toArray(function (err, mainDocs) {
//             if (err) {
//             } else {
//                 console.log("=====" + mainDocs.length);
//
//                 mainDocs.forEach(function (element) {
//
//                     console.log("=====" + element.tran_id + " --- " + element.sr_status);
//
//                     if (element.sr_status == "Open") {
//                         var timeMin;
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.creationDate);
//                         var end_date = new Date(res_time);
//
//                         //var duration = moment.duration(end_date.diff(start_date));
//                         var duration = Math.abs(end_date.getTime() - start_date.getTime());
//                         timeMin = duration / 60000;
//
//                         if (timeMin >= 4 && timeMin < 5) {
//                             var message = "Customer Create New Service Remainder"
//                             console.log("------->>> 111" + "Send Notification ......");
//                             comman.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
//                             //Send Notification
//                         } else if (timeMin >= 5) {
//                             //Auto remove
//                             var serviceUpdate = {
//                                 sr_status: "Cancel-New-Auto",
//                                 updateDate: new Date().toUTCString()
//                             };
//
//                             console.log("------->>> 222" + "Send Notification ......");
//                             collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
//                             var message = "Auto Cancel Service Remainder"
//                             comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");
//
//                             var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                             var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                             bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                 function (doc) {
//                                     bulkInsert.insertOne(doc);
//                                     bulkRemove.removeOne({tran_id: element.tran_id});
//                                 }
//                             )
//
//                         } else {
//                             console.log("=====333 " + element.tran_id + "  open");
//                         }
//                     } else if (element.sr_status == "Rescheduled") {
//
//                         var timeMin;
//
//
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.updateDate);
//                         var end_date = new Date(res_time);
//                         var duration = Math.abs(end_date.getTime() - start_date.getTime());
//
//                         // var res_time = new Date().toUTCString();
//                         // var start_date = moment(element.updateDate,"MMM dd, yyyy HH:mm:ss z");
//                         //
//                         // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                         // var duration = moment.duration(end_date.diff(start_date));
//                         timeMin = duration / 60000;
//
//                         if (timeMin >= 9 && timeMin < 10) {
//                             console.log("=====444 " + element.tran_id + "  Rescheduled");
//                             var message = "Service provider rescheduled your job Remainder"
//                             comman.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
//                             //Send Notification
//                         } else if (timeMin >= 10) {
//                             console.log("=====555 " + element.tran_id + "  Rescheduled");
//                             //Auto remove
//                             var serviceUpdate = {
//                                 sr_status: "Cancel-New-Auto",
//                                 updateDate: new Date().toUTCString()
//                             };
//                             collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
//                             var message = "Auto Cancel Service Remainder"
//                             comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-New-Auto", "tran");
//
//
//                             var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                             var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                             bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                 function (doc) {
//                                     bulkInsert.insertOne(doc);
//                                     bulkRemove.removeOne({tran_id: element.tran_id});
//                                 }
//                             )
//                         } else {
//                             console.log("===== 666" + element.tran_id + "  Rescheduled");
//                         }
//
//                     } else if (element.sr_status == "Scheduled") {
//
//                         var timeMin;
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.bookingDateTime);
//                         var end_date = new Date(res_time);
//                         console.log("===== end_date " + end_date.getTime());
//                         console.log("===== start_date" + start_date.getTime());
//
//                         var duration =  end_date.getTime() - start_date.getTime();
//
//
//                         // var res_time = new Date().toUTCString();
//                         // console.log("=====" + res_time);
//                         // var start_date = moment(element.bookingDateTime,"MMM dd, yyyy HH:mm:ss z");
//                         // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                         // // var duration1 = moment.duration(start_date.diff(end_date));
//                         // var duration = moment.duration(end_date.diff(start_date));
//                         console.log("===== " + duration);
//                         timeMin = duration / 60000;
//                         console.log("===== " + timeMin);
//                         // console.log("1=====" + timeMin >= -24);
//                         // console.log("2=====" + timeMin < -25 );I am doing my 5 minutes check
//                         // if (timeMin >= -5 && timeMin < -4) {
//                         console.log("===== 777" + element.tran_id + "  Scheduled");
//                         if (timeMin <= -29 && timeMin > -30) {
//                             console.log("===== 888" + element.tran_id + "  Scheduled");
//                             console.log("2=====" + "Send Notification");
//                             if (element.type_of_service == "customer_location") {
//                                 var message = "Scheduled are next 30 min after start";
//                                 comman.sendServiceNotification(element.sp_id, element.tran_id, message, element.sr_status, "tran");
//                             } else {
//                                 var message = "Scheduled are next 30 min after start"
//                                 comman.sendCustomerNotification(element.cust_id, element.tran_id, message, element.sr_status, "tran");
//                             }
//
//                             // }else if(timeMin >= 5){
//                         } else if (timeMin >= 30 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {
//
//                             console.log("===== 999" + element.tran_id + "  Scheduled");
//                             if (element.type_of_service == "customer_location") {
//                                 comman.cuServiceCancellationChargesSP(element);
//
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Scheduled-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id);
//
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//
//                             } else {
//
//                                 comman.cuServiceCancellationCharges(element);
//
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Scheduled-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
//
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//                             }
//                         } else if (timeMin >= 360 && (element.service_book_type == "shouting" || element.service_book_type == "interested")) {
//
//                             console.log("===== AAAA" + element.tran_id + "  Scheduled");
//                             if (element.type_of_service == "customer_location") {
//                                 comman.cuServiceCancellationChargesSP(element);
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Scheduled-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
//
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id, false);
//
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//
//                             } else {
//                                 comman.cuServiceCancellationCharges(element);
//
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Scheduled-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Scheduled-Auto", "tran");
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);
//
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//                             }
//                         }
//
//                         console.log("===== id" + element.tran_id);
//                         console.log("===== time" + timeMin);
//
//                         // "type_of_service": "customer_location",
//                         // "type_of_service": "provider_location",
//                     } else if (element.sr_status == "Progress") {
//
//                         console.log("===== bbbb" + element.tran_id + "  Scheduled");
//                         var timeMin;
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.bookingDateTime);
//                         var end_date = new Date(res_time);
//                         var duration = Math.abs(end_date.getTime() - start_date.getTime());
//
//                         // var res_time = new Date().toUTCString();
//                         console.log("===== res_time " + res_time);
//                         // console.log("=====element.bookingDateTime" + element.bookingDateTime);
//                         // var start_date = moment(element.bookingDateTime,"MMM dd, yyyy HH:mm:ss z");
//                         // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                         // // var duration1 = moment.duration(start_date.diff(end_date));
//                         // var duration = moment.duration(end_date.diff(start_date,'minutes'));
//                         console.log("=====" + duration);
//                         timeMin = duration / 60000;
//                         console.log("=====" + timeMin + " ----14");
//
//                         // wait for 24 hour
//                         if (timeMin >= 14 && (element.service_book_type == "preferred_provider" || element.service_book_type == "customer_book")) {
//
//                             if (element.type_of_service == "customer_location") {
//                                 comman.cuServiceCancellationChargesSPProgress(element);
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Progress-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.updateOne({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendCustomerNotification(element.cust_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");
//
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id, false);
//
//
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//
//                             } else {
//                                 comman.cuServiceCancellationCharges(element);
//
//                                 var serviceUpdate = {
//                                     sr_status: "Cancel-Progress-Auto",
//                                     updateDate: new Date().toUTCString()
//                                 };
//                                 collection.update({tran_id: element.tran_id}, {$set: serviceUpdate});
//                                 var message = "Auto Cancel Service Remainder"
//                                 comman.sendServiceNotification(element.sp_id, element.tran_id, message, "Cancel-Progress-Auto", "tran");
//
//                                 comman.kaikiliWalletDebitCustomerAmount(element.tran_id, true);
//
//
//                                 var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction_cancellation);
//                                 var bulkRemove = dbas.db(config.dbName).collection(config.collections.cu_sp_transaction);
//                                 bulkRemove.find({tran_id: element.tran_id}).forEach(
//                                     function (doc) {
//                                         bulkInsert.insertOne(doc);
//                                         bulkRemove.removeOne({tran_id: element.tran_id});
//                                     }
//                                 )
//                             }
//                         }
//
//                     } else {
//                         console.log("===== ccc" + element.tran_id + "  Scheduled");
//                         console.log("===== id" + element.sr_status);
//                     }
//
//                 });
//             }
//         });
//
//         collectionPP.find({sr_status: {$in: ["Open"]}}).toArray(function (err, mainDocs) {
//             if (err) {
//             } else {
//                 console.log("=====" + mainDocs.length);
//                 mainDocs.forEach(function (element) {
//
//                     var timeMin;
//                     var res_time = new Date().toUTCString();
//                     var start_date = new Date(element.creationDate);
//                     var end_date = new Date(res_time);
//                     var duration = Math.abs(end_date.getTime() - start_date.getTime());
//
//                     // var res_time = new Date().toUTCString();
//                     // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
//                     // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                     // var duration = moment.duration(end_date.diff(start_date));
//                     timeMin = duration / 60000;
//                     console.log("pps id ---->>>" + element.pps_id);
//                     if (timeMin >= 4 && timeMin < 5) {
//
//                         var message = "New kaikili preferred provider Job."
//                         element.preferredProvider.forEach(function (element11) {
//                             comman.sendServiceNotification(element11, element.pps_id, message, "New", "pps");
//                         });
//
//                     } else if (timeMin >= 5) {
//                         //Auto remove
//                         var bulkInsert = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_cancellation);
//                         var bulkRemove = dbas.db(config.dbName).collection(config.collections.cp_sp_preferred_provider);
//                         var cu_sp_pps_send = dbas.db(config.dbName).collection(config.collections.cu_sp_pps_send);
//
//                         var serviceUpdate = {
//                             sr_status: "Cancel-New-Auto",
//                             updateDate: new Date().toUTCString()
//                         };
//
//                         bulkRemove.update({pps_id: element.pps_id}, {$set: serviceUpdate});
//
//                         element.preferredProvider.forEach(function (element11) {
//                             console.log("1=====" + element.pps_id);
//                             console.log("2=====" + element11);
//                             cu_sp_pps_send.update({
//                                 pps_id: element.pps_id,
//                                 sp_id: element11
//                             }, {$set: serviceUpdate});
//                         });
//
//                         var message = "Auto Cancel Service Remainder"
//                         comman.sendCustomerNotification(element.cust_id, element.pps_id, message, "Cancel-New-Auto", "pps");
//
//
//                         bulkRemove.find({pps_id: element.pps_id}).forEach(
//                             function (doc) {
//                                 bulkInsert.insertOne(doc);
//                                 bulkRemove.removeOne({pps_id: element.pps_id});
//                             }
//                         )
//                     }
//                 });
//             }
//         });
//
//         collectionShout.find({}).toArray(function (err, mainDocs) {
//             if (err) {
//
//             } else {
//                 console.log("=====" + mainDocs.length);
//                 mainDocs.forEach(function (element) {
//                     if (element.sr_status == "Open") {
//                         var timeMin;
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.creationDate);
//                         var end_date = new Date(res_time);
//                         var duration = Math.abs(end_date.getTime() - start_date.getTime());
//
//
//                         // var res_time = new Date().toISOString();
//                         // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
//                         // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                         // var duration = moment.duration(end_date.diff(start_date));
//                         timeMin = duration / 60000;
//
//                         if (timeMin >= 4 && timeMin < 5) {
//                             comman.sendCustomerNotification(element.cu_id, element.sp_cp_alert_send_id, "Service Provider Send Neighborhood Shout Request", "Neighborhood Shout", "shout");
//
//                         } else if (timeMin >= 5) {
//
//                             var updateTran = {
//                                 sr_status: "Cancel-New-Auto",
//                                 updateDate: new Date().toUTCString()
//                             };
//
//                             collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
//                             var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
//                             collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
//                                 function (doc) {
//                                     bulkInsert.insertOne(doc);
//                                     collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
//                                 }
//                             );
//
//                         }
//                     } else {
//                         collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
//                         var bulkInsert = dbas.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
//                         collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
//                             function (doc) {
//                                 bulkInsert.insertOne(doc);
//                                 collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
//                             }
//                         );
//                     }
//                 });
//             }
//         });
//
//         collectionInterested.find({}).toArray(function (err, mainDocs) {
//             if (err) {
//
//             } else {
//                 console.log("=====" + mainDocs.length);
//                 mainDocs.forEach(function (element) {
//                     if (element.sr_status == "Open") {
//                         var timeMin;
//                         var res_time = new Date().toUTCString();
//                         var start_date = new Date(element.creationDate);
//                         var end_date = new Date(res_time);
//                         var duration = Math.abs(end_date.getTime() - start_date.getTime());
//
//
//                         // var res_time = new Date().toISOString();
//                         // var start_date = moment(element.creationDate,"MMM dd, yyyy HH:mm:ss z");
//                         // var end_date = moment(res_time,"MMM dd, yyyy HH:mm:ss z");
//                         // var duration = moment.duration(end_date.diff(start_date));
//                         timeMin = duration / 60000;
//                         // "cu_interested_rq_id": "cu_interested_rq_4",
//                         if (timeMin >= 4 && timeMin < 5) {
//                             comman.sendCustomerNotification(element.cu_id, element.cu_interested_rq_id, "Service Provider Send Interested Service Request", "Interested to Service", "cu_interested");
//
//                         } else if (timeMin >= 5) {
//
//                             var updateTran = {
//                                 sr_status: "Cancel-New-Auto",
//                                 updateDate: new Date().toUTCString()
//                             };
//                             collectionInterested.updateOne({cu_interested_rq_id: element.cu_interested_rq_id}, {$set: updateTran});
//                         }
//                     } else {
//                         // collectionShout.updateOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id}, {$set: updateTran});
//                         // var bulkInsert = db.db(config.dbName).collection(config.collections.sp_cu_send_shout_cancellation);
//                         // collectionShout.find({sp_cp_alert_send_id: element.sp_cp_alert_send_id}).forEach(
//                         //     function (doc) {
//                         //         bulkInsert.insertOne(doc);
//                         //         collectionShout.removeOne({sp_cp_alert_send_id: element.sp_cp_alert_send_id});
//                         //     }
//                         // );
//                     }
//                 });
//             }
//         });
//
//
//     });
// },