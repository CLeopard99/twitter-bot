const firebase = require("firebase");

const firebaseConfig = {
    apiKey: "AIzaSyCnc-u034KY4YRAabgTJfoZrkCyzkL7YvM",
    authDomain: "mytwitterbot-b13dc.firebaseapp.com",
    databaseURL: "https://mytwitterbot-b13dc.firebaseio.com",
    projectId: "mytwitterbot-b13dc",
    storageBucket: "mytwitterbot-b13dc.appspot.com",
};
const app = firebase.initializeApp(firebaseConfig);
module.exports =  db = app.database();

