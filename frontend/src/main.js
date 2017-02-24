const tag = (tagName, args, ...children) => children && children.length
  ? `<${[tagName, args && args instanceof Array && args.map((v, k) => `${k}=${v}`)].filter(v => !!v).join()}>${children.join('')}</${tagName}>`
  : `<${tagName}/>`;

let elems = [
  tag('h2', {}, 'Initializing...')
];

const render = () => {
  const tree = tag('div', {}, ...elems)
  console.log({elems, tree});
  document.body.innerHTML = tree;
};

fetch('/likes/1')
  .then(r => r.json())
  .then(resp => {
    const likes = resp.likes || [];
    elems = [tag('p', {}, `Prevoius likes: ${likes.map(v => `:${v}:`).join(', ')}`)]
    render();

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

      elems.push(tag('p', {}, `${data.user_name}: :${data.emoji}:`));
      render();
    };
});
