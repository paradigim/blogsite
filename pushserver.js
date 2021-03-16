
const webpush = require('web-push');
const express = require('express');

const vapidKeys = {
    "publicKey":"BF7ekuEOKJrtvX4ornpRrZkkv_ALrNVb4r5RzeqzOgZP-oorGGxQsUROVK2oTymCDEkQKlaNb2WVYplrrtp9MtE",
    "privateKey":"M9B2G_q8S6QaN_QwOhshyNa-4tvhm4KzsSrNF51ZNGg"
};

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();

const port = process.env.PORT || 8082;
app.listen(port)

app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    const notificationPayload = {
        "notification": {
            "title": "Angular News",
            "body": "Newsletter Available!",
            // "icon": "assets/blog1.jpg",
            // "vibrate": [100, 50, 100],
            // "data": {
            //     "dateOfArrival": Date.now(),
            //     "primaryKey": 1
            // },
            // "actions": [{
            //     "action": "explore",
            //     "title": "Go to the site"
            // }]
        }
    };

    Promise.resolve(webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
        .then(() => {
            res.status(200).json({message: 'Newsletter sent successfully.'})
        })
        .catch(err => {
            console.error("Error sending notification, reason: ", err);
            res.sendStatus(500);
        })
    )
})