import 'whatwg-fetch'

document.body.innerHtml = '<h2>Initializing...</h2>';
fetch('google.com').then(res => document.write(res));

ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = (msg) => document.write(msg + '<br/>');
