const express = require('express');
const router = express.Router();
const request = require('request');

const fbtoken = process.env.FB_PAGE_ACCESS_TOKEN;

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// for Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
      res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

router.post('/webhook/', function (req, res) {
  console.log('/webhook/ POST');
  let messagingEvents = req.body.entry[0].messaging;
  console.log('messagingEvents:' + JSON.stringify(messagingEvents));
  for (let i = 0; i < messagingEvents.length; i++) {
    let event = messagingEvents[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      sendTextMessage(sender, 'Text received, echo: ' + event.message.text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: fbtoken },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: { text: text },
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('body:' + JSON.stringify(response.body));
    }
  });
}

module.exports = router;
