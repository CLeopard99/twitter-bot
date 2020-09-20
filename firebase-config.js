const firebase = require("firebase");

const firebaseConfig = {
    apiKey: "XXXXXXXX",
    authDomain: "XXXXXXXX.firebaseapp.com",
    databaseURL: "https://XXXXXXXX.firebaseio.com",
    projectId: "XXXXXXXX",
    storageBucket: "XXXXXXXX.appspot.com",
};
const app = firebase.initializeApp(firebaseConfig);
module.exports =  db = app.database();

