'use strict';

document.body.innerHtml = '<h2>Initializing...</h2>';

var ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = function (ev) {
  console.log({ ev: ev });
  document.write(ev.data.user_name + ': :' + ev.data.emoji + ':' + '<br/>');
};