importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyBpX2XZM4YbN1XL5emw07LzAG5i0PpanPE",
    authDomain: "blog-9a5ab.firebaseapp.com",
    databaseURL: "https://blog-9a5ab.firebaseio.com",
    projectId: "blog-9a5ab",
    storageBucket: "blog-9a5ab.appspot.com",
    messagingSenderId: "97460591548",
    appId: "1:97460591548:web:0382f5da7008cabd9969b9",
    measurementId: "G-PRYCPK52S2"
});
const messaging = firebase.messaging();