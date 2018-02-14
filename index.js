require('dotenv').config();

const Socket = require('pusher');
const Client = require('pusher-js');
const express = require('express');
const ip = require('ip');
const flatfile = require('flat-file-db');
const app = express();
const net = require('net');
const Blockchain = require('./blockchain');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var ipAddr = ip.address();

var db = flatfile.sync('/tmp/node-coin.db');
var lastBlock = db.get('last_block');
var firstBlock = db.get('first_block')
var wholeChain = db.get('whole_chain');

var socketOptions = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
  encrypted: true
};

var socket = new Socket(socketOptions);

app.post('/pusher/auth', function(req, res) {
  console.log('> Presence auth: ', req.params, req.body, req.connection.remoteAddress);
  var socket_id = req.body.socket_id;
  var channel_name = req.body.channel_name;
  var data = { user_id: req.connection.remoteAddress.replace('::ffff:', '') };
  var auth = socket.authenticate(socket_id, channel_name, data);
  res.send(auth);
});

app.listen(process.env.PORT || 3000, function() {
  console.log('> Server listening on port 3000...', process.env.PORT);
});
