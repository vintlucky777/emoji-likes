document.body.innerHtml = '<h2>Initializing...</h2>';

const ws = new WebSocket('wss://clojure-likes.herokuapp.com/');
ws.onmessage = (ev) => document.write(`${ev.data.user_name}: :${ev.data.emoji}:` + '<br/>');
