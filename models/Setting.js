var mongo = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var config = require('../db_config.json');
const math = require('mathjs')

var Provider_Cancel_Book_Service_Progress = 10;
var Provider_Cancel_Book_Service = 5;
var Customer_Cancel_Book_Service = 5;
var Marketing_Credit_Used_Provider = 25 ;
var Marketing_Credit_Give_To_Provider = 10 ;
var Kaikili_Credit_Used_To_Customer = 5 ;
var Sticker_marketing_max_credits  ;
var Service_provider_registration_credits = 100;
var Service_provider_referral_credits ;
var Customer_referral_credits ;



var Setting = {

    autoTimerUpdateSetting() {
        console.log("=====" + " auto timer calll");
        mongo.connect(config.dbUrl, {useUnifiedTopology: true}, function (err, dbas) {
            var collection = dbas.db(config.dbName).collection(config.collections.admin_setting);
            collection.find({}).toArray(function (err, mainDocs) {
                mainDocs.forEach(function(childData) {

                    if(childData.set_id == "AS001"){
                        Service_provider_registration_credits = childData.amount;
                    }else  if(childData.set_id == "AS002") {
                        Service_provider_referral_credits = childData.amount;
                    }else  if(childData.set_id == "AS003") {
                        Customer_referral_credits = childData.amount;
                    }else  if(childData.set_id == "AS004") {
                        Sticker_marketing_max_credits = childData.amount;
                    }else  if(childData.set_id == "AS005") {
                        Kaikili_Credit_Used_To_Customer = childData.amount;
                    }else  if(childData.set_id == "AS006") {
                        Marketing_Credit_Give_To_Provider = childData.amount;
                    }else  if(childData.set_id == "AS007") {
                        Marketing_Credit_Used_Provider = childData.amount;
                    }else  if(childData.set_id == "AS008") {
                        Customer_Cancel_Book_Service = childData.amount;
                    }else  if(childData.set_id == "AS009") {
                        Provider_Cancel_Book_Service = childData.amount;
                    }else  if(childData.set_id == "AS010") {
                        Provider_Cancel_Book_Service_Progress = childData.amount;
                    }


                });
            });
        });
    },

    getService_provider_registration_credits(){
        return Service_provider_registration_credits;
    },

    getService_provider_referral_credits(){
        return Service_provider_referral_credits;
    },

    getCustomer_referral_credits(){
        return Customer_referral_credits;
    },

    getSticker_marketing_max_credits(){
        return Sticker_marketing_max_credits;
    },

    getKaikili_Credit_Used_To_Customer(){
        return Kaikili_Credit_Used_To_Customer;
    },

    getMarketing_Credit_Give_To_Provider(){
        return Marketing_Credit_Give_To_Provider;
    },

    getMarketing_Credit_Used_Provider(){
        return Marketing_Credit_Used_Provider;
    },

    getCustomer_Cancel_Book_Service(){
        return Customer_Cancel_Book_Service;
    },

    getProvider_Cancel_Book_Service(){
        return Provider_Cancel_Book_Service;
    },

    getProvider_Cancel_Book_Service_Progress(){
        return Provider_Cancel_Book_Service_Progress;
    },
}

module.exports = Setting;