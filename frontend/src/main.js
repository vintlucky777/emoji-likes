const uuid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

const tag = (_tagName, _args, children) => {
  const tagnclasses = _tagName.split('.');
  let tagName = tagnclasses[0] || 'div';
  let args = _args || {};
  if (tagnclasses.length > 1) {
    const [t, ...classes] = tagnclasses;
    args.class = [args.class, ...classes].filter(v => !!v).join(' ');
  }
  const argsStr = _.map(args, (v, k) => `${k}="${v}"`).join(' ');

  const tagWithAttrs = `${[tagName, argsStr].filter(v => !!v).join(' ')}`;

  const resultElem = _.includes(['br', 'img', 'meta'], tagName)
    ? `<${tagWithAttrs}/>`
    : `<${tagWithAttrs}>${_.join(children, '')}</${tagName}>`;

  return resultElem;
};

const initUser = () => {
  let user_id = localStorage.getItem('user_id');
  let user_name = localStorage.getItem('user_name');;

  if (!user_id) {
    user_id = uuid();
    user_name = '';

    localStorage.setItem('user_id', user_id);
    localStorage.setItem('user_name', user_name);
  }

  const userObj = {id: user_id, name: user_name};

  bumpUser(userObj);
  return userObj;
}

const bumpUser = (userObj) => {
  fetch('/users', {method: 'PUT', headers: {'x-client-id': userObj.id}, body: `{"name":"${userObj.name}"}`})
};

const user = initUser();

const app = document.querySelector('#app');
let root = null;
const renderDOM = (elems) => {
  const tree = tag('.root', {}, elems);
  const overlay = tag('.overlay');

  if (app) {
    app.innerHTML = tree + overlay;
  }

  setTimeout(() => root = document.querySelector('.root'), 10);
};

const offset = {x: 0, y: 0};
const onDrag = (rx, ry) => {
  const sensitivity = 0.07;
  offset.x += rx * sensitivity;
  offset.y += ry * sensitivity;
};
const onClick = (x, y) => {

};


// Prime-selected 80 emojis
const emojis = [
  ':thumbsup:',
  ':thumbsdown:',
  ':ok_hand:',
  ':punch:',
  ':fist:',
  ':v:',
  ':hand:',
  ':raised_hands:',
  ':pray:',
  ':heart:',
  ':clap:',
  ':muscle:',
  ':metal:',
  ':boom:',
  ':runner:',
  ':smile:',
  ':surfer:',
  ':laughing:',
  ':blush:',
  ':smiley:',
  ':relaxed:',
  ':smirk:',
  ':heart_eyes:',
  ':kissing_heart:',
  ':kissing_closed_eyes:',
  ':relieved:',
  ':tada:',
  ':grin:',
  ':wink:',
  ':stuck_out_tongue_winking_eye:',
  ':stuck_out_tongue_closed_eyes:',
  ':grinning:',
  ':kissing:',
  ':stuck_out_tongue:',
  ':sleeping:',
  ':worried:',
  ':frowning:',
  ':anguished:',
  ':open_mouth:',
  ':grimacing:',
  ':confused:',
  ':hushed:',
  ':expressionless:',
  ':unamused:',
  ':sweat_smile:',
  ':sweat:',
  ':disappointed_relieved:',
  ':weary:',
  ':pensive:',
  ':disappointed:',
  ':confounded:',
  ':cold_sweat:',
  ':persevere:',
  ':cry:',
  ':sob:',
  ':joy:',
  ':astonished:',
  ':scream:',
  ':neckbeard:',
  ':tired_face:',
  ':angry:',
  ':rage:',
  ':triumph:',
  ':sunglasses:',
  ':princess:',
  ':smiley_cat:',
  ':smile_cat:',
  ':heart_eyes_cat:',
  ':kissing_cat:',
  ':smirk_cat:',
  ':scream_cat:',
  ':crying_cat_face:',
  ':joy_cat:',
  ':pouting_cat:',
  ':see_no_evil:',
  ':hear_no_evil:',
  ':speak_no_evil:',
  ':guardsman:',
  ':skull:',
  ':feet:',
];

let isAnimating = true;
let bubbles = null;
const mesh = _.flatten(_.map(_.range(-4, 5), y => _.map(_.range(-4, 5), x => [x + (0.5 * (y % 2)), y * Math.sqrt(3) * 0.5])));

const renderBubbles = () => {
  const elems = [
    tag('h2.title', {}, ['re-frame-a-to-z']),
    ..._.map(mesh, ([x, y], i) => tag('.bubble', {style: `transform: translate3d(0)`}, [emojis[i]])),
  ];
  renderDOM(elems);
  emojify.setConfig({tag_type: 'div', mode: 'data-url'});
  emojify.run();
}

const effect = {
  BrokeInv: 1.7,
  RadiusInv: .29,
  Scale: 1.5,
  ScaleToRadMult: .38,
};
// const effect = {
//   BrokeInv: 1.56,
//   RadiusInv: .26,
//   Scale: 1.7,
//   ScaleToRadMult: .38,
// };

const sendEmoji = (name) => {
  fetch('/likes/1', {method: 'PUT', headers: {'content-type': 'application/json', 'x-client-id': user.id}, body: `{"emoji":"${name.replace(/[^\w]/g, '')}"}`})
    .then(res => console.log('status', res.status))
};

const animate = () => {
  if (!bubbles) {
    bubbles = document.querySelectorAll('.bubble');
    const emojis = document.querySelectorAll('.bubble div');
    // _.map(emojis, e => bindInputs(e, {onClick, onDrag}));
    _.map(emojis, e => bindInputs(e, {onClick, onDrag, onDragStart, onDragEnd, onActualClick: () => sendEmoji(e.getAttribute('title'))}));
  }

  _.map(bubbles, (b, i) => {
    const pos_x = mesh[i][0] + offset.x;
    const pos_y = mesh[i][1] + offset.y;
    const r = Math.sqrt(pos_x * pos_x + pos_y * pos_y) * effect.RadiusInv;
    const R = Math.max(0, Math.min(effect.Scale - (effect.Scale - 1) * effect.BrokeInv * r,
                                   (1 - r) * effect.BrokeInv / (effect.BrokeInv - 1)));
    const r_mult = 1 + R * effect.ScaleToRadMult;
    b.setAttribute('style', `transform: translate3d(${110 * pos_x * r_mult}%, ${110 * pos_y * r_mult}%, ${100*R}px) scale3d(${R}, ${R}, 1)`);
  })

  isAnimating && requestAnimationFrame(animate);
};

const bindInputs = (DOMnode, {onClick, onDrag, onDragStart, onDragEnd, onActualClick}) => {
// const bindInputs = (DOMnode, {onClick, onDrag}) => {
  let isPressed = false;
  let pressStart = null;
  let isDrag = false;
  const cursor = {x: 0, y: 0};

  const onPressStart = (ev, cx, cy) => {
    ev.preventDefault();
    cursor.x = cx;
    cursor.y = cy;
    isPressed = true;
    pressStart = Date.now();
  };
  const onPressEnd = (ev, cx, cy) => {
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

  const onPressDrag = (ev, cx, cy) => {
    ev.preventDefault();

    const _dx = 100 * (cx - cursor.x) / app.clientWidth;
    const _dy = 100 * (cy - cursor.y) / app.clientWidth;

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

  DOMnode.onmousedown = (ev) => onPressStart(ev, ev.pageX, ev.pageY);
  DOMnode.onmousemove = (ev) => onPressDrag(ev, ev.pageX, ev.pageY);
  DOMnode.onmouseup = (ev) => onPressEnd(ev, ev.pageX, ev.pageY);
  DOMnode.ontouchstart = (ev) => onPressStart(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  DOMnode.ontouchmove = (ev) => onPressDrag(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  DOMnode.ontouchend = (ev) => onPressEnd(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  DOMnode.ontouchcancel = (ev) => onPressEnd(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  // DOMnode.onpointerdown = (ev) => onPressStart(ev, ev.offsetX, ev.offsetY);
  // DOMnode.onpointermove = (ev) => onPressDrag(ev, ev.offsetX, ev.offsetX);
  // DOMnode.onpointerup = (ev) => onPressEnd(ev, ev.offsetX, ev.offsetY);
};

const onDragStart = () => {
  if (root) {
    root.className = 'root dragged';
  }
};
const onDragEnd = () => {
  if (root) {
    root.className = 'root';
  }
};

// bindInputs(app, {onClick, onDrag});
bindInputs(app, {onClick, onDrag, onDragStart, onDragEnd});

fetch('/likes/1')
  .then(r => r.json())
  .then(resp => {
    const likes = resp.likes || [];

    const proto = location.protocol;
    const wsProto = proto === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProto}://${location.host}/`);

    ws.onmessage = (ev) => {
      let data = null;
      try {
        data = JSON.parse(ev.data);
      } catch (e) {
        data = {};
      }

      console.log(`${data.user_name}: :${data.emoji}:`);
    };
});

renderBubbles();
animate();
