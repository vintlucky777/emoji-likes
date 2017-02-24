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

  return {id: user_id, name: user_name};
}

const user = initUser();

const app = document.querySelector('#app');
const render = (elems) => {
  const tree = tag('.root', {}, elems);
  const overlay = tag('.overlay');

  if (app) {
    app.innerHTML = tree + overlay;
  }
};

const offset = {x: 0, y: 0};
const onDrag = (rx, ry) => {
  offset.x += rx;
  offset.y += ry;
  // console.log('onDrag', {rx, ry});
};
const onClick = (x, y) => {
  console.log('onClick', {x, y});
};

let isAnimating = true;
let emojis = null;
const renderLoop = () => {
  if (!emojis) {
    emojis = document.querySelectorAll('.emoji');
    console.log({emojis})
  }
  isAnimating && requestAnimationFrame(renderLoop);
};

const bindInputs = (DOMnode, {onClick, onDrag}) => {
  let isPressed = false;
  let pressStart = null;
  let isDrag = false;

  const onPressStart = (cx, cy) => {
    isPressed = true;
    pressStart = Date.now();
  };
  const onPressEnd = (cx, cy) => {
    if (!isDrag && Date.now() - pressStart < 400) {
      onClick(cx, cy);
    }

    isPressed = false;
    pressStart = null;
    isDrag = false;
  };

  const onPressDrag = (dx, dy) => {
    if (!isPressed) {
      return;
    }

    isDrag = true;
    onDrag(100 * dx / app.clientWidth, 100 * dy / app.clientHeight);
  };

  DOMnode.onmousedown = (ev) => onPressStart(ev.offsetX, ev.offsetY);
  DOMnode.onmousemove = (ev) => onPressDrag(ev.movementX, ev.movementY);
  DOMnode.onmouseup = (ev) => onPressEnd(ev.offsetX, ev.offsetY);
  DOMnode.ontouchstart = (ev) => onPressStart(ev.offsetX, ev.offsetY);
  DOMnode.ontouchmove = (ev) => onPressDrag(ev.movementX, ev.movementY);
  DOMnode.ontouchend = (ev) => onPressEnd(ev.offsetX, ev.offsetY);
};

bindInputs(app, {onClick, onDrag});

const initApp = () => {
  const mesh = _.flatten(_.map(_.range(-480, 481, 120), x => _.map(_.range(-480, 481, 120), y => [x, y])));
  const elems = _.map(mesh, ([x, y]) => tag('.emoji', {style: `transform: translate3d(${x}%, ${y}%, 0)`}));

  render(elems);
}

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

initApp();
renderLoop();
