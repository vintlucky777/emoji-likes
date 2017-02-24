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

  return { id: user_id, name: user_name };
};

var user = initUser();

var app = document.querySelector('#app');
var renderDOM = function renderDOM(elems) {
  var tree = tag('.root', {}, elems);
  var overlay = tag('.overlay');

  if (app) {
    app.innerHTML = tree + overlay;
  }
};

var offset = { x: 0, y: 0 };
var onDrag = function onDrag(rx, ry) {
  var sensitivity = 0.07;
  offset.x += rx * sensitivity;
  offset.y += ry * sensitivity;
};
var onClick = function onClick(x, y) {
  console.log('onClick', { x: x, y: y });
};

var isAnimating = true;
var bubbles = null;
var mesh = _.flatten(_.map(_.range(-4, 5), function (y) {
  return _.map(_.range(-4, 5), function (x) {
    return [x + 0.5 * (y % 2), y * Math.sqrt(3) * 0.5];
  });
}));

var renderBubbles = function renderBubbles() {
  var elems = _.map(mesh, function (_ref, i) {
    var _ref2 = _slicedToArray(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

    return tag('.bubble', { style: 'transform: translate3d(0)' }, ['' + i]);
  });
  renderDOM(elems);
};

var effectRadiusInv = .34;
var effectBrokeInv = 1.5;
var effectScale = 1.5;
var effectScaleToRadMult = .25;
var animate = function animate() {
  if (!bubbles) {
    bubbles = document.querySelectorAll('.bubble');
  }

  _.map(bubbles, function (b, i) {
    var pos_x = mesh[i][0] + offset.x;
    var pos_y = mesh[i][1] + offset.y;
    var r = Math.sqrt(pos_x * pos_x + pos_y * pos_y) * effectRadiusInv;
    var R = Math.max(0, Math.min(effectScale - (effectScale - 1) * effectBrokeInv * r, (1 - r) * effectBrokeInv / (effectBrokeInv - 1)));
    var r_mult = 1 + R * effectScaleToRadMult;
    b.setAttribute('style', '      transform: translate3d(' + 110 * pos_x * r_mult + '%, ' + 110 * pos_y * r_mult + '%, ' + 10 * R + 'px) scale3d(' + R + ', ' + R + ', 1)');
  });

  isAnimating && requestAnimationFrame(animate);
};

var bindInputs = function bindInputs(DOMnode, _ref3) {
  var onClick = _ref3.onClick,
      onDrag = _ref3.onDrag;

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
    }

    isPressed = false;
    pressStart = null;
    isDrag = false;
  };

  var onPressDrag = function onPressDrag(ev, cx, cy) {
    console.log({ ev: ev });
    ev.preventDefault();

    var _dx = 100 * (cx - cursor.x) / app.clientWidth;
    var _dy = 100 * (cy - cursor.y) / app.clientWidth;

    cursor.x = cx;
    cursor.y = cy;

    if (!isPressed) {
      return;
    }

    if (!isDrag && Math.abs(_dx) < 1 && Math.abs(_dy) < 1) {
      return;
    }

    isDrag = true;
    onDrag(_dx, _dy);
  };

  DOMnode.onmousedown = function (ev) {
    return onPressStart(ev, ev.offsetX, ev.offsetY);
  };
  DOMnode.onmousemove = function (ev) {
    return onPressDrag(ev, ev.offsetX, ev.offsetY);
  };
  DOMnode.onmouseup = function (ev) {
    return onPressEnd(ev, ev.offsetX, ev.offsetY);
  };
  DOMnode.ontouchstart = function (ev) {
    return onPressStart(ev, ev.offsetX, ev.offsetY);
  };
  DOMnode.ontouchmove = function (ev) {
    return onPressDrag(ev, ev.movementX, ev.movementY);
  };
  DOMnode.ontouchend = function (ev) {
    return onPressEnd(ev, ev.offsetX, ev.offsetY);
  };
  // DOMnode.onpointerdown = (ev) => onPressStart(ev, ev.offsetX, ev.offsetY);
  // DOMnode.onpointermove = (ev) => onPressDrag(ev, ev.offsetX, ev.offsetX);
  // DOMnode.onpointerup = (ev) => onPressEnd(ev, ev.offsetX, ev.offsetY);
};

bindInputs(app, { onClick: onClick, onDrag: onDrag });

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
  };
});

renderBubbles();
animate();