'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var uuid = function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

var tag = function tag(_tagName, _args, children) {
  var tagnclasses = _tagName.split('.');
  var tagName = tagnclasses[0] || 'div';
  var args = _args || {};
  if (tagnclasses.length > 1) {
    var _tagnclasses = _toArray(tagnclasses),
        t = _tagnclasses[0],
        classes = _tagnclasses.slice(1);

    args.class = [args.class].concat(_toConsumableArray(classes)).filter(function (v) {
      return !!v;
    }).join(' ');
  }
  var argsStr = _.map(args, function (v, k) {
    return k + '="' + v + '"';
  }).join(' ');

  var tagWithAttrs = '' + [tagName, argsStr].filter(function (v) {
    return !!v;
  }).join(' ');

  var resultElem = _.includes(['br', 'img', 'meta'], tagName) ? '<' + tagWithAttrs + '/>' : '<' + tagWithAttrs + '>' + _.join(children, '') + '</' + tagName + '>';

  return resultElem;
};

var initUser = function initUser() {
  var user_id = localStorage.getItem('user_id');
  var user_name = localStorage.getItem('user_name');;

  if (!user_id) {
    user_id = uuid();
    user_name = '';

    localStorage.setItem('user_id', user_id);
    localStorage.setItem('user_name', user_name);
  }

  var userObj = { id: user_id, name: user_name };

  bumpUser(userObj);
  return userObj;
};

var bumpUser = function bumpUser(userObj) {
  fetch('/users', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-client-id': userObj.id }, body: '{"name":"' + userObj.name + '"}' });
};

var user = initUser();

var app = document.querySelector('#app');
var root = null;
var bottomlight = null;
var renderDOM = function renderDOM(elems) {
  var tree = tag('.root', {}, elems);
  // const overlay = tag('.overlay');
  var bl = tag('.bottomlight', {}, [tag('.reaction'), tag('.username')]);

  if (app) {
    app.innerHTML = tree + bl;
  }

  setTimeout(function () {
    root = document.querySelector('.root');
    bottomlight = document.querySelector('.bottomlight');
  }, 10);
};

var offset = { x: 0, y: 0 };
var onDrag = function onDrag(rx, ry) {
  var sensitivity = 0.07;
  offset.x += rx * sensitivity;
  offset.y += ry * sensitivity;
};
var onClick = function onClick(x, y) {};

// Prime-selected 80 emojis
var emojis = [':thumbsup:', ':thumbsdown:', ':ok_hand:', ':punch:', ':fist:', ':v:', ':hand:', ':raised_hands:', ':pray:', ':heart:', ':clap:', ':muscle:', ':weary:', ':kissing:', ':runner:', ':smile:', ':surfer:', ':laughing:', ':blush:', ':smiley:', ':relaxed:', ':confused:', ':heart_eyes:', ':kissing_heart:', ':kissing_closed_eyes:', ':relieved:', ':open_mouth:', ':grin:', ':wink:', ':stuck_out_tongue_winking_eye:', ':stuck_out_tongue_closed_eyes:', ':grinning:', ':boom:', ':stuck_out_tongue:', ':sleeping:', ':worried:', ':frowning:', ':anguished:', ':tada:', ':grimacing:', ':smirk:', ':joy:', ':expressionless:', ':unamused:', ':sweat_smile:', ':sweat:', ':disappointed_relieved:', ':metal:', ':scream:', ':neckbeard:', ':confounded:', ':cold_sweat:', ':persevere:', ':cry:', ':sob:', ':hushed:', ':astonished:', ':disappointed:', ':pensive:', ':tired_face:', ':angry:', ':rage:', ':triumph:', ':sunglasses:', ':princess:', ':smiley_cat:', ':smile_cat:', ':heart_eyes_cat:', ':kissing_cat:', ':smirk_cat:', ':scream_cat:', ':crying_cat_face:', ':joy_cat:', ':pouting_cat:', ':see_no_evil:', ':hear_no_evil:', ':speak_no_evil:', ':guardsman:', ':skull:', ':feet:'];

var isAnimating = true;
var bubbles = null;
var mesh = _.flatten(_.map(_.range(-4, 5), function (y) {
  return _.map(_.range(-4, 5), function (x) {
    return [x + 0.5 * (y % 2), y * Math.sqrt(3) * 0.5];
  });
}));

var renderBubbles = function renderBubbles() {
  var elems = [].concat(_toConsumableArray(_.map(mesh, function (_ref, i) {
    var _ref2 = _slicedToArray(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

    return tag('.bubble', { style: 'transform: translate3d(0)' }, [emojis[i]]);
  })), [tag('.overlay')]);
  renderDOM(elems);
  emojify.setConfig({ tag_type: 'div', mode: 'data-url' });
  emojify.run();
};

var effect = {
  BrokeInv: 1.7,
  RadiusInv: .29,
  Scale: 1.5,
  ScaleToRadMult: .38
};
// const effect = {
//   BrokeInv: 1.56,
//   RadiusInv: .26,
//   Scale: 1.7,
//   ScaleToRadMult: .38,
// };

var flickBg = function flickBg() {
  root.className = 'root success';
  root.setAttribute('style', 'background: rgb(' + _.random(200) + ', ' + _.random(200) + ', ' + _.random(200) + ')');
  setTimeout(function () {
    root.setAttribute('style', '');
    root.className = 'root';
  }, 100);
};

var flickBottom = function flickBottom() {
  bottomlight.className = 'bottomlight active';
  bottomlight.setAttribute('style', 'box-shadow: 0 0 50vmin 25vmin rgb(' + _.random(200) + ', ' + _.random(200) + ', ' + _.random(200) + ')');
  setTimeout(function () {
    bottomlight.setAttribute('style', '');
    bottomlight.className = 'bottomlight';
  }, 100);
};

var setBottomEmoji = function setBottomEmoji(reaction, username) {
  bottomlight.querySelector('.reaction').innerHTML = ':' + reaction + ':';
  bottomlight.querySelector('.username').innerHTML = username;
  emojify.run(bottomlight.querySelector('.reaction'));
};

var sendEmoji = function sendEmoji(name) {
  fetch('/likes/1', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-client-id': user.id }, body: '{"emoji":"' + name.replace(/[^\w]/g, '') + '"}' }).then(function (res) {
    if (res.status === 200 || res.status === 201) {
      flickBg();
    }
  });
};

var animate = function animate() {
  if (!bubbles) {
    bubbles = document.querySelectorAll('.bubble');
    var _emojis = document.querySelectorAll('.bubble div');
    // _.map(emojis, e => bindInputs(e, {onClick, onDrag}));
    _.map(_emojis, function (e) {
      return bindInputs(e, { onClick: onClick, onDrag: onDrag, onDragStart: onDragStart, onDragEnd: onDragEnd, onActualClick: function onActualClick() {
          return sendEmoji(e.getAttribute('title'));
        } });
    });
  }

  _.map(bubbles, function (b, i) {
    var pos_x = mesh[i][0] + offset.x;
    var pos_y = mesh[i][1] + offset.y;
    var r = Math.sqrt(pos_x * pos_x + pos_y * pos_y) * effect.RadiusInv;
    var R = Math.max(0, Math.min(effect.Scale - (effect.Scale - 1) * effect.BrokeInv * r, (1 - r) * effect.BrokeInv / (effect.BrokeInv - 1)));
    var r_mult = 1 + R * effect.ScaleToRadMult;
    b.setAttribute('style', 'transform: translate3d(' + 110 * pos_x * r_mult + '%, ' + 110 * pos_y * r_mult + '%, ' + 100 * R + 'px) scale3d(' + R + ', ' + R + ', 1)');
  });

  isAnimating && requestAnimationFrame(animate);
};

var bindInputs = function bindInputs(DOMnode, _ref3) {
  var onClick = _ref3.onClick,
      onDrag = _ref3.onDrag,
      onDragStart = _ref3.onDragStart,
      onDragEnd = _ref3.onDragEnd,
      onActualClick = _ref3.onActualClick;

  // const bindInputs = (DOMnode, {onClick, onDrag}) => {
  var isPressed = false;
  var pressStart = null;
  var isDrag = false;
  var cursor = { x: 0, y: 0 };

  var onPressStart = function onPressStart(ev, cx, cy) {
    ev.preventDefault();
    cursor.x = cx;
    cursor.y = cy;
    isPressed = true;
    pressStart = Date.now();
  };
  var onPressEnd = function onPressEnd(ev, cx, cy) {
    ev.preventDefault();
    if (!isDrag && Date.now() - pressStart < 400) {
      onClick(cx, cy);
      onActualClick && onActualClick();
    }

    isPressed = false;
    pressStart = null;
    isDrag = false;
    onDragEnd();
  };

  var onPressDrag = function onPressDrag(ev, cx, cy) {
    ev.preventDefault();

    var _dx = 100 * (cx - cursor.x) / app.clientWidth;
    var _dy = 100 * (cy - cursor.y) / app.clientWidth;

    if (!isPressed) {
      return;
    }

    cursor.x = cx;
    cursor.y = cy;

    if (!isDrag && Math.abs(_dx) < .5 && Math.abs(_dy) < .5) {
      return;
    }

    isDrag = true;
    onDragStart();
    onDrag(_dx, _dy);
  };

  DOMnode.onmousedown = function (ev) {
    return onPressStart(ev, ev.pageX, ev.pageY);
  };
  DOMnode.onmousemove = function (ev) {
    return onPressDrag(ev, ev.pageX, ev.pageY);
  };
  DOMnode.onmouseup = function (ev) {
    return onPressEnd(ev, ev.pageX, ev.pageY);
  };
  DOMnode.ontouchstart = function (ev) {
    return onPressStart(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  };
  DOMnode.ontouchmove = function (ev) {
    return onPressDrag(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  };
  DOMnode.ontouchend = function (ev) {
    return onPressEnd(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  };
  DOMnode.ontouchcancel = function (ev) {
    return onPressEnd(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  };
  // DOMnode.onpointerdown = (ev) => onPressStart(ev, ev.offsetX, ev.offsetY);
  // DOMnode.onpointermove = (ev) => onPressDrag(ev, ev.offsetX, ev.offsetX);
  // DOMnode.onpointerup = (ev) => onPressEnd(ev, ev.offsetX, ev.offsetY);
};

var onDragStart = function onDragStart() {
  if (root) {
    root.className = 'root dragged';
  }
};
var onDragEnd = function onDragEnd() {
  if (root) {
    root.className = 'root';
  }
};

// bindInputs(app, {onClick, onDrag});
bindInputs(app, { onClick: onClick, onDrag: onDrag, onDragStart: onDragStart, onDragEnd: onDragEnd });

fetch('/likes/1').then(function (r) {
  return r.json();
}).then(function (resp) {
  var likes = resp.likes || [];

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

    console.log(data.user_name + ': :' + data.emoji + ':');
    setBottomEmoji(data.emoji, data.user_name);
    flickBottom();
  };
});

renderBubbles();
animate();