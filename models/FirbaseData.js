var comman = require('../models/Comman');
var firebase = require('firebase/app');
require('firebase/database');

var moment = require('moment');
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
                    console.log("childKey", childKey);
                    console.log("childData", childData.lastUpdated);
                    var sp_id = childKey;

                    var timeMin;
                    var res_time = new Date()
                    var start_date = moment.utc(childData.lastUpdated);

                    var end_date = moment.utc(res_time);
                    var duration = moment.duration(end_date.diff(start_date));
                    timeMin = duration / 60000;
                    var onlineStatusSet = false;
                    if (timeMin <= 4 && timeMin >= -4  ) {
                        console.log("time ", timeMin);
                        console.log(childKey +"------->>"+"Online");
                        onlineStatusSet = true;
                    }else {
                        console.log("time ", timeMin);
                        console.log(childKey +"------->>"+"Offline");
                        onlineStatusSet = false;
                    }
                    comman.spUserUpdateStatus(sp_id,onlineStatusSet);

                });

            });
    },


}
module.exports = FirbaseData;