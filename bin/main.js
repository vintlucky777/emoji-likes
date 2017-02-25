'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _emojiKeywords = require('emoji-keywords');

var _emojiKeywords2 = _interopRequireDefault(_emojiKeywords);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _middleware = require('./middleware');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = _http2.default.createServer(app);
var wss = new _ws2.default.Server({ server: server });

app.use(_bodyParser2.default.json({ limit: '50mb' })); // json body parser
app.use((0, _compression2.default)());
app.use((0, _cors2.default)());
app.use(_express2.default.static('public'));
app.use(_middleware.request_logger);

wss.on('connection', function (ws) {
  // const location = url.parse(ws.upgradeReq.url, true);
  // console.log('Client connected');
  ws.on('close', function () {
    return console.log('Client disconnected');
  });
});

var broadcastUpdate = function broadcastUpdate(payload) {
  wss.clients.forEach(function (client) {
    client.send(JSON.stringify(payload));
  });
};

app.options('*', (0, _cors2.default)());
app.get('/ping', function (req, res) {
  return res.status(200).send('pong');
});

app.put('/users', (0, _middleware.action)(function (req, res) {
  var client_id = _lodash2.default.get(req.headers, 'x-client-id');
  var name = _lodash2.default.get(req.body, 'name', '').slice(0, 256);

  if (!(0, _utils.isUUID)(client_id)) {
    res.status(400).json({ 'bad_header': 'x-client-id' });
    return;
  }

  return _db2.default.users.put({ id: client_id, name: name }).then(function () {
    return res.status(201).send();
  });
}));

var project_id = 1;

app.put('/likes/:proj_id', _middleware.auth, (0, _middleware.action)(function (req, res) {
  var project_id = parseInt(req.params.proj_id);

  if (!_lodash2.default.isFinite(project_id)) {
    res.status(404).send();
  }

  var emoji = _lodash2.default.get(req.body, 'emoji');
  console.log({ emoji: emoji });

  if (!(0, _utils.isEmoji)(emoji)) {
    res.status(400).json({ 'bad_argument': 'emoji' });
    return;
  }

  var user_id = req.user.id;
  var user_name = req.user.name;
  return _db2.default.likes.getUser({ project_id: project_id, user_id: user_id }).then(function (result) {
    var likes = _lodash2.default.uniq(_lodash2.default.map(result, 'emoji'));

    return _db2.default.likes.put({ project_id: project_id, user_id: user_id, emoji: emoji }).then(function () {
      broadcastUpdate({ project_id: project_id, user_name: user_name, emoji: emoji });
      res.send({ likes: _lodash2.default.concat(likes, emoji) });
    });
  });
}));

app.get('/likes/:proj_id', (0, _middleware.action)(function (req, res) {
  var project_id = parseInt(req.params.proj_id);

  if (!_lodash2.default.isFinite(project_id)) {
    res.status(404).send();
    return;
  }

  return _db2.default.likes.get({ project_id: project_id }).then(function (result) {
    var likes = _lodash2.default.map(result, 'emoji');
    res.send({ likes: likes });
  });
}));

app.get('/projects', (0, _middleware.action)(function (req, res) {
  return _db2.default.projects.get().then(function (projects) {
    res.send({ projects: projects });
  });
}));

var port = process.env.PORT || 5000;

server.listen(port, function () {
  console.log('app is listening on port ' + port + '!');
});