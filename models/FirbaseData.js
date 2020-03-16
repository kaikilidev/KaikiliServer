var comman = require('../models/Comman');
var firebase = require('firebase/app');
require('firebase/database');

// var moment = require('moment');
var config = {
    apiKey: "AIzaSyCSN-Py-eM65QmCO63aHG-EJMuUFdaZdO4",
    authDomain: "kaikili-service.firebaseapp.com",
    databaseURL: "https://kaikili-service.firebaseio.com",
    projectId: "kaikili-service",
    storageBucket: "kaikili-service.appspot.com",
    messagingSenderId: "881771145407",
};
firebase.initializeApp(config);

var FirbaseData = {
    autoCheckOnlineUser() {

        var ref = firebase.database().ref("kaikili-service-provider");
        ref.once("value",)
            .then(function (snap) {
                // console.log(snap.val());
                snap.forEach(function(childSnapshot) {
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    // console.log("childKey", childKey);
                    // console.log("childData", childData.lastUpdated);
                    var sp_id = childKey;

                    var timeMin;
                    var res_time = new Date().toUTCString();
                    var start_date = new Date(childData.lastUpdated);
                    var end_date = new Date(res_time);

                    // console.log("start--->"+start_date)
                    // console.log("start--->"+start_date.getTime)
                    // console.log("end--->"+end_date)
                    // console.log("end--->"+end_date.getTime())
                    var duration = end_date.getTime() - start_date.getTime();
                    timeMin = duration / 60000;
                    // console.log("diff--->"+timeMin)
                    var onlineStatusSet = false;
                    if (timeMin <= 4 && timeMin >= -4  ) {
                        // console.log("time ", timeMin);
                        console.log(childKey +"------->>"+"Online");
                        onlineStatusSet = true;
                    }else {
                        // console.log("time ", timeMin);
                        console.log(childKey +"------->>"+"Offline");
                        onlineStatusSet = false;
                    }
                    comman.spUserUpdateStatus(sp_id,onlineStatusSet);

                });

            });
    },


}
module.exports = FirbaseData;