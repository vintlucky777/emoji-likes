'use strict';

document.body.innerHtml = '<h2>Initializing...</h2>';

ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = function (msg) {
  return document.write(msg + '<br/>');
};