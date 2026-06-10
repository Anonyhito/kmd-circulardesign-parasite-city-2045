const app = document.getElementById('app');

const state = {
  chapter: 0,
  seen: new Set(),
  budget: 500,
  cart: [],
  museum: new Set(),
  currentImage: null,
  currentPlaceholder: null
};


const chapters = {
  apartment: {
    title: 'Chapter 1 : Apartment',
    status: '2045 / Morning',
    img: 'assets/aptbg.png',
    intro: 'You wake up in a small apartment. Everything looks normal, but breakfast feels smaller than you remember.',
    actions: [
      {
        id: 'fridge',
        label: 'Open refrigerator',
        text: 'Rice. Potato. Water. Nothing else. The empty shelf feels too clean.',
        img: 'assets/apt1.png',
        placeholder: 'ADD IMAGE HERE: open refrigerator with only rice, potatoes, and water'
      },
      {
        id: 'tv',
        label: 'Watch news',
        text: 'Coffee prices reach another record high. Fruit imports are suspended again.',
        img: 'assets/apt2.png',
        placeholder: 'ADD IMAGE HERE: TV/news report about rising food prices'
      },
      {
        id: 'photo',
        label: 'Look at old photo',
        text: 'A family table full of strawberries, oranges, and chocolate cake. You cannot remember the taste.',
        img: 'assets/apt3.png',
        placeholder: 'ADD IMAGE HERE: old family photo with fruit and cake'
      },
      {
        id: 'note',
        label: 'Read personal note',
        text: 'Buy dinner. Budget: ¥500. Avoid luxury items. Again.',
        img: 'assets/apt4.png',
        placeholder: 'ADD IMAGE HERE: handwritten note / shopping list'
      }
    ]
  },
  supermarket: {
    title: 'Chapter 2 : Supermarket',
    status: 'Budget: ¥500',
    img: 'assets/supermarket.png',
    intro: 'The supermarket is open, but most shelves are empty. A child nearby asks: “What did bees look like?”'
  },
  museum: {
    title: 'Chapter 3 : Museum of Ordinary Things',
    status: 'Archive Room',
    img: 'assets/museum.png',
    intro: 'Inside the museum, ordinary things from the past are displayed like ancient artifacts.'
  }
};

function sceneVisual(img, placeholder) {
  if (img) {
    return `<div class="scene-image" style="background-image:url('${img}')"></div>`;
  }
  return `<div class="scene-image placeholder"><div>${placeholder || 'ADD IMAGE HERE'}</div></div>`;
}

function layout({ title, status, img, intro, extra = '', actions = '', placeholder = null }) {
  app.innerHTML = `
    <section class="screen game">
      <div class="topbar">
        <div class="chapter">${title}</div>
        <div class="status">${status}</div>
      </div>
      <div class="scene">
        ${sceneVisual(img, placeholder)}
        <div class="panel">
          <h3>${title.split('—')[1]?.trim() || title}</h3>
          <p>${intro}</p>
        </div>
      </div>
      ${extra}
      <div class="actions">${actions}</div>
    </section>
  `;
}

function start() { renderApartment(); }

document.getElementById('startBtn').addEventListener('click', start);

function renderApartment(message = 'Choose what to investigate.', selected = null) {
  const c = chapters.apartment;
  const active = selected || { img: c.img, placeholder: null };
  const buttons = c.actions.map(item =>
    `<button class="choice ${state.seen.has(item.id) ? 'done' : ''}" data-act="${item.id}">${item.label}</button>`
  ).join('') + (state.seen.size >= 3 ? `<button class="primary" data-next="supermarket">Go to supermarket</button>` : '');

  layout({
    title: c.title,
    status: c.status,
    img: active.img,
    placeholder: active.placeholder,
    intro: c.intro,
    extra: `<div class="textlog">${message}</div>`,
    actions: buttons
  });

  document.querySelectorAll('[data-act]').forEach(btn => {
    btn.onclick = () => {
      const item = c.actions.find(a => a.id === btn.dataset.act);
      state.seen.add(btn.dataset.act);
      renderApartment(`<span class="notice">${item.label}</span><br>${item.text}`, item);
    };
  });
  const next = document.querySelector('[data-next="supermarket"]');
  if (next) next.onclick = renderSupermarket;
}

function renderSupermarket(message = 'Choose dinner with a limited budget.', selected = null) {
  const c = chapters.supermarket;
  const active = selected || { img: c.img, placeholder: null };
  const items = [
    { name: 'Rice', price: 120, note: 'Reliable. Plain.', img: 'assets/rice.png', placeholder: 'ADD IMAGE HERE: rice package / plain meal' },
    { name: 'Potato', price: 100, note: 'Again.', img: 'assets/potato.png', placeholder: 'ADD IMAGE HERE: potatoes on a shelf' },
    { name: 'Soy Paste', price: 180, note: 'A little taste of something.', img: 'assets/soy-paste.png', placeholder: 'ADD IMAGE HERE: soy paste product' },
    { name: 'Apple', price: null, note: 'OUT OF STOCK : pollinator shortage.', img: 'assets/apple.png', placeholder: 'ADD IMAGE HERE: empty apple shelf / out of stock sign' },
    { name: 'Coffee', price: 3850 , note: 'Luxury import.', img: 'assets/coffee.png', placeholder: 'ADD IMAGE HERE: expensive coffee price tag' },
    { name: 'Chocolate', price: null, note: 'No delivery this month.', img: 'assets/chocolate.png', placeholder: 'ADD IMAGE HERE: empty chocolate shelf' }
  ];
  const cards = items.map(item => {
    const disabled = item.price === null || item.price > state.budget;
    const price = item.price === null ? 'Unavailable' : `¥${item.price}`;
    return `<div class="item-card" data-select="${item.name}">
      <h4>${item.name}</h4>
      <p>${item.note}</p>
      <div class="price">${price}</div>
      <button ${disabled ? 'disabled' : ''} data-buy="${item.name}" data-price="${item.price || 0}">Buy</button>
    </div>`;
  }).join('');
  const actions = `<button data-next="museum" class="primary" ${state.cart.length ? '' : 'disabled'}>Leave supermarket</button><button data-reset>Reset cart</button>`;
  layout({
    title: c.title,
    status: `Budget left: ¥${state.budget}`,
    img: active.img,
    placeholder: active.placeholder,
    intro: c.intro,
    extra: `<div class="shop-grid">${cards}</div><div class="textlog">${message}<br><span class="small">Cart: ${state.cart.join(', ') || 'empty'}</span></div>`,
    actions
  });
  document.querySelectorAll('[data-select]').forEach(card => {
    card.onclick = (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      const item = items.find(i => i.name === card.dataset.select);
      renderSupermarket(`<span class="notice">${item.name}</span><br>${item.note}`, item);
    };
  });
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => {
      const price = Number(btn.dataset.price);
      const item = items.find(i => i.name === btn.dataset.buy);
      if (state.budget >= price) {
        state.budget -= price;
        state.cart.push(btn.dataset.buy);
        renderSupermarket(`<span class="notice">Purchased ${btn.dataset.buy}.</span><br>The choices feel smaller than the shelves.`, item);
      }
    };
  });
  document.querySelector('[data-reset]').onclick = () => {
    state.budget = 500; state.cart = []; renderSupermarket('Cart reset. The shelves are still empty.');
  };
  const next = document.querySelector('[data-next="museum"]');
  if (next) next.onclick = renderMuseum;
}

function renderMuseum(message = 'Examine the exhibits to piece together what happened.', selected = null) {
  const c = chapters.museum;
  const active = selected || { img: c.img, placeholder: null };
  const exhibits = [
    { id: 'bee', name: 'Bee', note: 'Common pollinator. Last stable urban record: 2037.', img: 'assets/bee.png', placeholder: 'ADD IMAGE HERE: bee exhibit / bee specimen in glass case' },
    { id: 'butterfly', name: 'Butterfly', note: 'Once seen in parks and school gardens.', img: 'assets/butterfly.png', placeholder: 'ADD IMAGE HERE: butterfly exhibit' },
    { id: 'strawberry', name: 'Strawberry', note: 'Formerly common. Depended on pollination and stable farming systems.', img: 'assets/strawberry.png', placeholder: 'ADD IMAGE HERE: strawberry artifact / museum fruit display' },
    { id: 'coffee', name: 'Coffee', note: 'A daily drink that became a luxury artifact.', img: 'assets/coffee.png', placeholder: 'ADD IMAGE HERE: coffee exhibit / preserved coffee cup' },
    { id: 'record', name: 'Archive Record', note: 'No single villain. Only pesticide use, habitat loss, climate pressure, and ordinary demand accumulating over time.', img: 'assets/record.png', placeholder: 'ADD IMAGE HERE: archive document / old record screen' }
  ];
  const cards = exhibits.map(item => `<div class="item-card">
    <h4>${item.name}</h4>
    <p>${state.museum.has(item.id) ? item.note : 'Exhibit sealed. Select to inspect.'}</p>
    <button class="choice ${state.museum.has(item.id) ? 'done' : ''}" data-exhibit="${item.id}">Examine</button>
  </div>`).join('');
  const actions = state.museum.size >= 4 ? `<button class="primary" data-ending>Finish</button>` : '';
  layout({
    title: c.title,
    status: c.status,
    img: active.img,
    placeholder: active.placeholder,
    intro: c.intro,
    extra: `<div class="museum-grid">${cards}</div><div class="textlog">${message}</div>`,
    actions
  });
  document.querySelectorAll('[data-exhibit]').forEach(btn => {
    btn.onclick = () => {
      const ex = exhibits.find(e => e.id === btn.dataset.exhibit);
      state.museum.add(btn.dataset.exhibit);
      renderMuseum(`<span class="notice">${ex.name}</span><br>${ex.note}`, ex);
    };
  });
  const end = document.querySelector('[data-ending]');
  if (end) end.onclick = renderEnding;
}

function renderEnding() {
  app.innerHTML = `
    <section class="screen ending">
      <div class="ending-content">

        <p class="eyebrow">Ending</p>

        <h1>Something was missing.</h1>

        <p class="ending-text">
          It was not only insects.
          It was breakfast, fruit, coffee, choice, memory,
          and the everyday life people stopped noticing.
        </p>

        <p class="ending-message">
          Ecological collapse did not arrive suddenly.<br>
          It emerged through thousands of ordinary decisions.
        </p>

        <button class="primary" onclick="location.reload()">
          Play Again
        </button>

      </div>
    </section>
  `;
}

