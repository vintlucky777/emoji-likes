'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEmoji = exports.isUUID = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _emojiKeywords = require('emoji-keywords');

var _emojiKeywords2 = _interopRequireDefault(_emojiKeywords);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid_mask = '00000000-0000-0000-0000-000000000000';

var isUUID = exports.isUUID = function isUUID(str) {
  return str && str.length === 36 && str.replace(/[0-9A-Fa-f]/g, '0') === uuid_mask;
};
var isEmoji = exports.isEmoji = function isEmoji(key) {
  return typeof key === 'string' && key.length < 64 && _lodash2.default.includes(_emojiKeywords2.default, key);
};