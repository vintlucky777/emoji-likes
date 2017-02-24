'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insert = exports.query = exports.rawQuery = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pg = require('pg');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_pg.native, { multiArgs: true });

var _query = function _query(q, args, resultTransform) {
  console.log(q, args);
  return _pg.native.connectAsync(_config2.default.connectionString).spread(function (connection, release) {
    var queryResult = connection.queryAsync(q, args);

    var transformedResult = queryResult.then(function (result) {
      if (resultTransform) {
        return resultTransform(result);
      } else {
        return result;
      }
    });

    return transformedResult.finally(function () {
      return release();
    });
  });
};

var rawQuery = exports.rawQuery = function rawQuery(q, args) {
  return _query(q, args, function (res) {
    return res[0];
  });
};
var query = exports.query = function query(q, args) {
  return _query(q, args, function (res) {
    return res[0].rows;
  });
};
var insert = exports.insert = function insert(q, args) {
  return _query(q, args, function (res) {
    return res[0].rowCount;
  });
};

var DB = {
  projects: {
    get: function get() {
      return query('select id, name from projects');
    }
  },
  users: {
    get: function get(_ref) {
      var id = _ref.id;
      return query('select * from users where id = $1', [id]);
    },
    put: function put(_ref2) {
      var id = _ref2.id,
          name = _ref2.name;
      return query('insert into users values ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2', [id, name]);
    }
  },
  reactions: {
    get: function get(_ref3) {
      var project_id = _ref3.project_id;
      return query('select * from reactions where project_id = $1', [project_id]);
    },
    getUser: function getUser(_ref4) {
      var project_id = _ref4.project_id,
          user_id = _ref4.user_id;
      return query('select emoji, created_at from reactions where project_id = $1 and user_id = $2', [project_id, user_id]);
    },
    put: function put(_ref5) {
      var project_id = _ref5.project_id,
          user_id = _ref5.user_id,
          emoji = _ref5.emoji;
      return query('insert into reactions (project_id, user_id, emoji) values ($1, $2, $3)', [project_id, user_id, emoji]);
    }
  }
};

exports.default = DB;