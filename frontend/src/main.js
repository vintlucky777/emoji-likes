document.body.innerHtml = '<h2>Initializing...</h2>';

const ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = (msg) => document.write(msg + '<br/>');
