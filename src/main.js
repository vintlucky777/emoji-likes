import _ from 'lodash';
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import emoji_kw from 'emoji-keywords';

import DB from './db';
import {request_logger, auth, action} from './middleware';
import {isUUID, isEmoji} from './utils';


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json({limit: '50mb'}));       // json body parser
app.use(compression());
app.use(cors());
app.use(express.static('public'));
app.use(request_logger);

wss.on('connection', (ws) => {
  // const location = url.parse(ws.upgradeReq.url, true);
  // console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const broadcastUpdate = (payload) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(payload));
  });
}

app.options('*', cors());
app.get('/ping', (req, res) => res.status(200).send('pong'));

app.put('/users', action((req, res) => {
  const client_id = _.get(req.headers, 'x-client-id');
  const name = _.get(req.body, 'name', '').slice(0, 256);

  if (!isUUID(client_id)) {
    res.status(400).json({'bad_header': 'x-client-id'});
    return;
  }

  return DB.users.put({id: client_id, name})
    .then(() => res.status(201).send());
}));

const project_id = 1;

app.put('/likes/:proj_id', auth, action((req, res) => {
  const project_id = parseInt(req.params.proj_id);

  if (!_.isFinite(project_id)) {
    res.status(404).send();
  }

  const emoji = _.get(req.body, 'emoji');

  if (!isEmoji(emoji)) {
    res.status(400).json({'bad_argument': 'emoji'});
    return;
  }

  const user_id = req.user.id;
  const user_name = req.user.name;
  return DB.reactions.getUser({project_id, user_id})
    .then((result) => {
      const reactions = _.uniq(_.map(result, 'emoji'));

      if (!_.includes(reactions, emoji)) {
        return DB.reactions.put({project_id, user_id, emoji})
          .then(() => {
            broadcastUpdate({project_id, user: {id: user_id, name: user_name}, emoji});
            res.send({reactions: _.concat(reactions, emoji)})
          });
      }

      res.send({reactions});
    });
}));

app.get('/likes/:proj_id', action((req, res) => {
  const project_id = parseInt(req.params.proj_id);

  if (!_.isFinite(project_id)) {
    res.status(404).send();
    return;
  }

  return DB.reactions.get({project_id})
    .then((result) => {
      const reactions = _.map(result, 'emoji');
      res.send({reactions});
    });
}));

const port = process.env.PORT || 5000;

server.listen(port, function () {
  console.log(`app is listening on port ${port}!`)
});
