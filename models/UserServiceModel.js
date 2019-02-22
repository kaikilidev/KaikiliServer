var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');


var UserService = {

    addUserService: function (req, callback) {
        var addService = req.body;
        var sp_id = req.body.sp_id;
        var sr_id = req.body.sr_id;
        var recodeId = "";

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
                                message: "Failed"
                            };
                            console.log(status);
                            callback(status);
                        } else {
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
                                message: "Failed"
                            };
                            console.log(status);
                            callback(status);
                        } else {
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
    },

    getUserService: function (req, callback) {
        var sp_id = req.body.sp_id;
        var sr_id = req.body.sr_id;
        console.log(sr_id);
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            console.log(err);
            collection.find({sp_id: sp_id, sr_id: sr_id}).toArray(function (err, docs) {

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
                        message: "Success Get all service to Mongodb",
                        data: docs
                    };
                    // console.log(status);
                    // db.close();
                    callback(status);
                }
            });

        });
    },

    getUserServiceCatalogue: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_sr_catalogue);
            console.log(err);
            collection.find({sp_id: sp_id}, {
                _id: 1,
                sp_id: 2,
                sr_id: 3,
                sr_title: 4,
                sp_sr_status: 5
            }).toArray(function (err, docs) {
                // db.sp_sr_catalogue.find({sp_id: "SP00001"},{ _id: 1 ,sp_id: 5,sr_id: 2, sr_title:3,sp_sr_status:4}).toArray()
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
                        message: "Success Get all service to Mongodb",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    getUserTransitionSL: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var mysort = {updateDate: -1};
            var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
            console.log(err);
            collection.find({
                sp_id: sp_id,
                sp_review: "false",
                sr_status: {$ne: ["Cancel", "Review"]}
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
                        message: "Success Get all Transition service to Mongodb",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    getUserNotification: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
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
                        message: "Failed"
                    };
                    // console.log(status);
                    callback(status);

                } else {
                    var status = {
                        status: 1,
                        message: "Success Get all Transition service to Mongodb",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    getUserSingleNotification: function (req, callback) {
        var sp_id = req.body.sp_id;
        var tran_id = req.body.tran_id;
        var conversation_id = req.body.conversation_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var mysort = {updateDate: -1};
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
            console.log(err);
            collection.find({sp_id: sp_id, tran_id: tran_id, conversation_id: conversation_id}
            ).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success Get all Transition service to Mongodb",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    userTransitionUpdate: function (req, callback) {
        var tran_id = req.body.tran_id;

        var serviceUpdate = {
            sr_status: req.body.sr_status,
            updateDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            // Update service record
            collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
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
                        message: "Success upload to service to server",
                        data: docs
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
                            body: docs[0].sr_status + " - " + docs[0].sr_title + " " + docs[0].date + " " + docs[0].time
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

                    });
                    console.log();
                    callback(status);

                }
            });
        });
    },

    userNotificationPost: function (req, callback) {

        var tran_id = req.body.tran_id;
        var sp_id = req.body.sp_id;
        var body = req.body.message;

        var messagesBody = {
            author: sp_id,
            author_type: "SP",
            sp_delet: "0",
            cu_delte: "0",
            sp_read: "0",
            cu_read: "0",
            created_on: new Date().toISOString(),
            body: body
        };
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
            collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {

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
                        message: "Success to load bank info",
                        data: docs
                    };
                    callback(status);
                    // console.log("Update in Notification");
                    // console.log(docs);
                }
            });

        });

    },

    userTransitionCompleted: function (req, callback) {

        var tran_id = req.body.tran_id;

        var serviceUpdate = {
            sr_status: req.body.sr_status,
            txn_status: req.body.txn_status,
            updateDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            // Update service record
            collection.update({tran_id: tran_id}, {$set: serviceUpdate}, function (err, docs) {
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
                            body: +"Service completed - " + docs[0].sr_title + " " + docs[0].date + " " + docs[0].time
                        };


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
                            kaikili_comm: docs[0].kaikili_commission.kk_rate_per_item,
                            discount: docs[0].discount.ds_rate_per_item,
                            total: docs[0].sr_total,
                            updateDate: new Date().toISOString()
                        }


                        var collectionNotification = db.db(config.dbName).collection(config.collections.cu_sp_notifications);
                        collectionNotification.update({tran_id: tran_id}, {$push: {messages: messagesBody}}, function (err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Update in Notification");
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

                    });

                    console.log();
                    callback(status);

                }
            });
        });
    },

    getUserCompletedTransition: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var mysort = {updateDate: -1};
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_payment_settlement);
            console.log(err);
            collection.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
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
                        message: "Success Get all Transition service to Mongodb",
                        data: docs
                    };
                    callback(status);
                }
            });

        });
    },

    userAddToServiceReview: function (req, callback) {

        var tran_id = req.body.tran_id;
        var reviewAdd = {
            cust_id: req.body.cust_id,
            sp_id: req.body.sp_id,
            tran_id: req.body.tran_id,
            sr_id: req.body.sr_id,
            rating: req.body.rating,
            comment: req.body.comment,
            creationDate: new Date().toISOString()
        };

        var updateTran = {
            tran_id: req.body.tran_id,
            sp_review: "true",
            sr_status: "Completed"
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.cu_sp_review);
            collectionPaymentSettlement.insertOne(reviewAdd, function (err, docs) {
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
                        message: "Thank you fore review."
                    };

                    var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);
                    collection.updateOne({tran_id: tran_id}, {$set: updateTran}, function (err, docs) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log();
                            // callback(status);
                        }
                    });

                    console.log();
                    callback(status);
                }
            });
        });
    },


    userCompletedService: function (req, callback) {
        var sp_id = req.body.sp_id;
        console.log(sp_id);
        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, kdb) {
            var mysort = {updateDate: -1};
            var collection = kdb.db(config.dbName).collection(config.collections.cu_sp_transaction);
            console.log(err);
            collection.find({
                sp_id: sp_id,
                sr_status: "Completed"
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

    getSingleTransitionInfo: function (req, callback) {
        var tran_id = req.body.tran_id;


        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.cu_sp_transaction);

            // Update service record
            collection.findOne({tran_id: tran_id}, function (err, docs) {
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
                        message: "Success upload to service to server",
                        data: docs
                    };

                    console.log();
                    callback(status);

                }
            });
        });
    },


    userAddBankInfo: function (req, callback) {

        var bankInfoAdd = {
            sp_id: req.body.sp_id,
            card_no: req.body.card_no,
            bank_name: req.body.bank_name,
            card_holder_name: req.body.card_holder_name,
            month: req.body.month,
            year: req.body.year,
            cvc: req.body.cvc,
            isUsed: "false",
            creationDate: new Date().toISOString()
        };

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collectionPaymentSettlement = db.db(config.dbName).collection(config.collections.sp_bank_info);
            collectionPaymentSettlement.insertOne(bankInfoAdd, function (err, docs) {
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
                        message: "Thank you fore add new card."
                    };

                    console.log();
                    callback(status);
                }
            });
        });
    },

    SPUserBankInfoList: function (req, callback) {

        var sp_id = req.body.sp_id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var bankdata = db.db(config.dbName).collection(config.collections.sp_bank_info);
            var mysort = {creationDate: -1};

            bankdata.find({sp_id: sp_id}).sort(mysort).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "l  "
                    };
                    console.log(status);
                    callback(status);
                } else {
                    var status = {
                        status: 1,
                        message: "Thank you.",
                        data: docs
                    };
                    console.log();
                    callback(status);
                }
            });
        });
    },

    SPUserDeleteBankInfo: function (req, callback) {

        var sp_id = req.body.sp_id;
        var pid = req.body.id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var bankdata = db.db(config.dbName).collection(config.collections.sp_bank_info);
            var mysort = {creationDate: -1};
            var myquery = { _id: ObjectID(pid), sp_id: sp_id};
            bankdata.deleteOne(myquery, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "l  "
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
    },

    SPUserSetDefaultBankInfo: function (req, callback) {

        var sp_id = req.body.sp_id;
        var pid = req.body._id;

        mongo.connect(config.dbUrl, {useNewUrlParser: true}, function (err, db) {
            var collection = db.db(config.dbName).collection(config.collections.sp_bank_info);
            // Update service record
            collection.updateMany({sp_id: sp_id}, {$set: {isUsed: "false"}}, function (err, docs) {
                if (err) {
                    console.log(err);
                    var status = {
                        status: 0,
                        message: "Failed"
                    };
                    console.log(status);
                    callback(status);
                } else {
                    // console.log(data);
                   collection.updateOne({ _id: ObjectID(pid) ,sp_id: sp_id }, {$set: {isUsed: "true"}}, function (err, docs) {
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
    },

}
module.exports = UserService;