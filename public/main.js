'use strict';

require('whatwg-fetch');

document.body.innerHtml = '<h2>Initializing...</h2>';
fetch('google.com').then(function (res) {
  return document.write(res);
});

ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = function (msg) {
  return document.write(msg + '<br/>');
};
