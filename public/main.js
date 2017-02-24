'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var tag = function tag(tagName, args) {
  for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return children && children.length ? '<' + [tagName, args && args instanceof Array && args.map(function (v, k) {
    return k + '=' + v;
  })].filter(function (v) {
    return !!v;
  }).join() + '>' + children.join('') + '</' + tagName + '>' : '<' + tagName + '/>';
};

var elems = [tag('h2', {}, 'Initializing...')];

var render = function render() {
  var tree = tag.apply(undefined, ['div', {}].concat(_toConsumableArray(elems)));
  console.log({ elems: elems, tree: tree });
  document.body.innerHTML = tree;
};

fetch('/likes/1').then(function (r) {
  return r.json();
}).then(function (resp) {
  var likes = resp.likes || [];
  elems = [tag('p', {}, 'Prevoius likes: ' + likes.map(function (v) {
    return ':' + v + ':';
  }).join(', '))];
  render();

  var proto = location.protocol;
  var wsProto = proto === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(wsProto + '://' + location.host + '/');

  ws.onmessage = function (ev) {
    var data = null;
    try {
      data = JSON.parse(ev.data);
    } catch (e) {
      data = {};
    }

    elems.push(tag('p', {}, data.user_name + ': :' + data.emoji + ':'));
    render();
  };
});