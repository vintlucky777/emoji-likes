'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.action = exports.auth = exports.request_logger = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request_logger = exports.request_logger = function request_logger(req, res, next) {
  console.log(req.method, req.url);next();
};

var auth = exports.auth = function auth(req, res, next) {
  var client_id = _lodash2.default.get(req.headers, 'x-client-id');

  if (!(0, _utils.isUUID)(client_id)) {
    res.status(400).json({ 'bad_header': 'x-client-id' });
    return;
  }

  _db2.default.users.get({ id: client_id }).then(function (users) {
    if (_lodash2.default.isEmpty(users)) {
      res.status(403).send();
      return;
    }

    req.user = users[0];
    next();
  });
};

var action = exports.action = function action(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res)).then(function () {
      if (next) next();
    }).catch(function (e) {
      return res.status(500).end();
    });
  };
};