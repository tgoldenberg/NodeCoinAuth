import 'babel-polyfill';

import Client from 'pusher-js';
import Pusher from 'pusher';
import express from 'express';

require('dotenv').config();


const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const socketOptions = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
  encrypted: true
};

const socket = new Pusher(socketOptions);

app.post('/pusher/auth', function(req, res) {
  console.log('> Presence auth: ', req.params, req.body, req.connection.remoteAddress);
  const socket_id = req.body.socket_id;
  const channel_name = req.body.channel_name;
  const ip_addr = req.body.ip_addr;
  const port = parseInt(req.body.port);
  const data = { user_id: ip_addr, port: port };
  const auth = socket.authenticate(socket_id, channel_name, data);
  res.send(auth);
});

// broadcast new transaction 
app.post('/transaction', async function(req, res) {
  console.log('> New transaction: ', req.body);
  // send out to Pusher channel - "transaction:new"
  socket.trigger('presence-node-coin', 'transaction:new', { tx: req.body.tx });
  res.status(200).send({ sent: true });
});

app.listen(process.env.PORT || 3001, function() {
  console.log('> Server listening on port 3001...', process.env.PORT);
});
