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
const renderDOM = (elems) => {
  const tree = tag('.root', {}, elems);
  const overlay = tag('.overlay');

  if (app) {
    app.innerHTML = tree + overlay;
  }
};

const offset = {x: 0, y: 0};
const onDrag = (rx, ry) => {
  const sensitivity = 0.07;
  offset.x += rx * sensitivity;
  offset.y += ry * sensitivity;
};
const onClick = (x, y) => {
  console.log('onClick', {x, y});
};

let isAnimating = true;
let bubbles = null;
const mesh = _.flatten(_.map(_.range(-4, 5), y => _.map(_.range(-4, 5), x => [x + (0.5 * (y % 2)), y * Math.sqrt(3) * 0.5])));

const renderBubbles = () => {
  const elems = _.map(mesh, ([x, y], i) => tag('.bubble', {style: `transform: translate3d(0)`}, [`${i}`]));
  renderDOM(elems);
}

const effectRadiusInv = .34;
const effectBrokeInv = 1.5;
const effectScale = 1.5;
const effectScaleToRadMult = .25;
const animate = () => {
  if (!bubbles) {
    bubbles = document.querySelectorAll('.bubble');
  }

  _.map(bubbles, (b, i) => {
    const pos_x = mesh[i][0] + offset.x;
    const pos_y = mesh[i][1] + offset.y;
    const r = Math.sqrt(pos_x * pos_x + pos_y * pos_y) * effectRadiusInv;
    const R = Math.max(0, Math.min(effectScale - (effectScale - 1) * effectBrokeInv * r,
                                   (1 - r) * effectBrokeInv / (effectBrokeInv - 1)));
    const r_mult = 1 + R * effectScaleToRadMult;
    b.setAttribute('style', `      transform: translate3d(${110 * pos_x * r_mult}%, ${110 * pos_y * r_mult}%, ${10*R}px) scale3d(${R}, ${R}, 1)`);
  })

  isAnimating && requestAnimationFrame(animate);
};

const bindInputs = (DOMnode, {onClick, onDrag}) => {
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
    }

    isPressed = false;
    pressStart = null;
    isDrag = false;
  };

  const onPressDrag = (ev, cx, cy) => {
    console.log({ev})
    ev.preventDefault();

    const _dx = 100 * (cx - cursor.x) / app.clientWidth;
    const _dy = 100 * (cy - cursor.y) / app.clientWidth;

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

  DOMnode.onmousedown = (ev) => onPressStart(ev, ev.offsetX, ev.offsetY);
  DOMnode.onmousemove = (ev) => onPressDrag(ev, ev.offsetX, ev.offsetY);
  DOMnode.onmouseup = (ev) => onPressEnd(ev, ev.offsetX, ev.offsetY);
  DOMnode.ontouchstart = (ev) => onPressStart(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  DOMnode.ontouchmove = (ev) => onPressDrag(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  DOMnode.ontouchend = (ev) => onPressEnd(ev, ev.changedTouches[0].pageX, ev.changedTouches[0].pageY);
  // DOMnode.onpointerdown = (ev) => onPressStart(ev, ev.offsetX, ev.offsetY);
  // DOMnode.onpointermove = (ev) => onPressDrag(ev, ev.offsetX, ev.offsetX);
  // DOMnode.onpointerup = (ev) => onPressEnd(ev, ev.offsetX, ev.offsetY);
};

bindInputs(app, {onClick, onDrag});

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
