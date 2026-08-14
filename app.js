const products = {
  menu: {
    name: 'Menù', base: 6.9,
    formats: [
      { id: 'a4', label: 'A4', sub: '21 × 29,7 cm' },
      { id: 'square', label: 'Quadrato', sub: '23 × 23 cm' },
      { id: 'a5', label: 'A5', sub: '14,8 × 21 cm' }
    ],
    preview: 'preview-menu'
  },
  placemat: {
    name: 'Tovaglietta', base: 4.7,
    formats: [
      { id: 'rectangle', label: 'Rettangolare', sub: 'misura libera' },
      { id: 'round', label: 'Rotonda', sub: 'misura libera' },
      { id: 'oval', label: 'Ovale', sub: 'misura libera' },
      { id: 'pentagon', label: 'Pentagono', sub: 'misura libera' },
      { id: 'hexagon', label: 'Esagono', sub: 'misura libera' },
      { id: 'drop', label: 'Goccia', sub: 'misura libera' },
      { id: 'custom', label: 'Taglio custom', sub: 'su tracciato' }
    ],
    preview: 'preview-placemat'
  },
  coaster: {
    name: 'Sottobicchiere', base: 1.75,
    formats: [
      { id: 'round', label: 'Rotondo', sub: 'Ø 10 cm' },
      { id: 'square', label: 'Quadrato', sub: '10 × 10 cm' },
      { id: 'custom', label: 'Custom', sub: 'su tracciato' }
    ],
    preview: 'preview-coaster'
  },
  bread: {
    name: 'Porta pane', base: 11.5,
    formats: [{ id: 'signature', label: 'Signature', sub: 'modello unico' }],
    preview: 'preview-bread'
  },
  place: {
    name: 'Segna posto', base: 2.6,
    formats: [{ id: 'signature', label: 'Signature', sub: 'modello unico' }],
    preview: 'preview-place'
  },
  bill: {
    name: 'Porta conto', base: 7.6,
    formats: [
      { id: 'slim', label: 'Slim', sub: '11 × 22 cm' },
      { id: 'classic', label: 'Classic', sub: '13 × 24 cm' }
    ],
    preview: 'preview-bill'
  }
};

const colors = [
  { name: 'Nero carbone', value: '#24231f' },
  { name: 'Testa di moro', value: '#544233' },
  { name: 'Cuoio cognac', value: '#8b6544' },
  { name: 'Sabbia', value: '#b9aa8f' },
  { name: 'Borgogna', value: '#593833' },
  { name: 'Verde bosco', value: '#39463f' },
  { name: 'Blu notte', value: '#303b46' },
  { name: 'Avorio', value: '#d8d0c1' }
];

const state = {
  product: 'menu',
  format: 'a4',
  color: colors[0],
  texture: 'Nappa',
  technique: 'Stampa UV',
  quantity: 50,
  width: 40,
  height: 30
};

const productChoices = document.querySelector('#productChoices');
const formatChoices = document.querySelector('#formatChoices');
const colorChoices = document.querySelector('#colorChoices');
const customSizeStep = document.querySelector('#customSizeStep');
const preview = document.querySelector('#previewObject');
const quantityInput = document.querySelector('#quantity');

function buildProductChoices() {
  productChoices.innerHTML = Object.entries(products).map(([key,p], i) => `
    <button class="choice ${key === state.product ? 'active' : ''}" type="button" data-product-choice="${key}">
      ${p.name}<small>0${i+1}</small>
    </button>`).join('');
}

function buildFormats() {
  const product = products[state.product];
  if (!product.formats.some(f => f.id === state.format)) state.format = product.formats[0].id;
  formatChoices.innerHTML = product.formats.map(f => `
    <button class="choice ${f.id === state.format ? 'active' : ''}" type="button" data-format="${f.id}">
      ${f.label}<small>${f.sub}</small>
    </button>`).join('');
  customSizeStep.hidden = state.product !== 'placemat' && state.format !== 'custom';
  if (state.product === 'placemat') customSizeStep.hidden = false;
}

function buildColors() {
  colorChoices.innerHTML = colors.map((c,i) => `<button class="swatch ${i===0?'active':''}" type="button" style="--swatch:${c.value}" data-color="${i}" aria-label="${c.name}" title="${c.name}"></button>`).join('');
}

function selectedFormat() {
  return products[state.product].formats.find(f => f.id === state.format) || products[state.product].formats[0];
}

function formatSummary() {
  const f = selectedFormat();
  if (state.product === 'placemat' || state.format === 'custom') return `${f.label} · ${state.width} × ${state.height} cm`;
  return `${f.label} · ${f.sub}`;
}

function calculateEstimate() {
  let unit = products[state.product].base;
  const techMultiplier = state.technique === 'Stampa UV' ? 1.18 : state.technique === 'Incisione a secco' ? 1.12 : 1.07;
  const textureMultiplier = state.texture === 'Nappa' ? 1 : state.texture === 'Saffiano' ? 1.04 : state.texture === 'Grana' ? 1.05 : 1.035;
  const qtyDiscount = state.quantity >= 500 ? .73 : state.quantity >= 250 ? .78 : state.quantity >= 100 ? .86 : state.quantity >= 50 ? .92 : 1;
  let shapeMultiplier = 1;
  if (state.product === 'placemat' && ['pentagon','hexagon','drop','custom'].includes(state.format)) shapeMultiplier = 1.12;
  if (state.product === 'placemat') {
    const area = Math.max(200, state.width * state.height);
    shapeMultiplier *= Math.max(.75, Math.min(1.55, area / 1200));
  }
  const setup = state.technique === 'Incisione a secco' ? 95 : state.technique === 'Stampa UV' ? 38 : 28;
  return Math.round(unit * techMultiplier * textureMultiplier * qtyDiscount * shapeMultiplier * state.quantity + setup);
}

function updatePreviewShape() {
  preview.className = 'preview-object ' + products[state.product].preview;
  if (state.product === 'placemat') {
    if (state.format === 'round') preview.classList.add('shape-round');
    if (state.format === 'oval') preview.classList.add('shape-oval');
    if (state.format === 'pentagon') preview.classList.add('shape-pentagon');
    if (state.format === 'hexagon') preview.classList.add('shape-hexagon');
    if (state.format === 'drop') preview.classList.add('shape-drop');
  }
  preview.style.backgroundColor = state.color.value;
}

function updateSummary() {
  document.querySelector('#summaryProduct').textContent = products[state.product].name;
  document.querySelector('#summaryFormat').textContent = formatSummary();
  document.querySelector('#summaryColor').textContent = state.color.name;
  document.querySelector('#summaryTexture').textContent = state.texture;
  document.querySelector('#summaryTechnique').textContent = state.technique;
  document.querySelector('#summaryQuantity').textContent = `${state.quantity} pz`;
  document.querySelector('#previewTexture').textContent = state.texture.toUpperCase();
  document.querySelector('#estimatePrice').textContent = `€ ${calculateEstimate().toLocaleString('it-IT')}`;
  updatePreviewShape();
}

function selectProduct(key, scroll=true) {
  state.product = key;
  state.format = products[key].formats[0].id;
  buildProductChoices();
  buildFormats();
  updateSummary();
  if (scroll) document.querySelector('#configuratore').scrollIntoView({behavior:'smooth'});
}

buildProductChoices();
buildFormats();
buildColors();
updateSummary();

productChoices.addEventListener('click', e => {
  const btn = e.target.closest('[data-product-choice]');
  if (!btn) return;
  selectProduct(btn.dataset.productChoice, false);
});

formatChoices.addEventListener('click', e => {
  const btn = e.target.closest('[data-format]');
  if (!btn) return;
  state.format = btn.dataset.format;
  buildFormats();
  updateSummary();
});

colorChoices.addEventListener('click', e => {
  const btn = e.target.closest('[data-color]');
  if (!btn) return;
  state.color = colors[Number(btn.dataset.color)];
  colorChoices.querySelectorAll('.swatch').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateSummary();
});

document.querySelector('.technique-choices').addEventListener('click', e => {
  const btn = e.target.closest('[data-tech]');
  if (!btn) return;
  state.technique = btn.dataset.tech;
  document.querySelectorAll('[data-tech]').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateSummary();
});

document.querySelector('.texture-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-texture]');
  if (!btn) return;
  state.texture = btn.dataset.texture;
  document.querySelectorAll('.texture-card').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateSummary();
});

function setQuantity(value) {
  state.quantity = Math.max(10, Number(value) || 10);
  quantityInput.value = state.quantity;
  document.querySelectorAll('.qty-preset').forEach(b=>b.classList.toggle('active', Number(b.dataset.qty) === state.quantity));
  updateSummary();
}

document.querySelector('.quantity-row').addEventListener('click', e => {
  const btn = e.target.closest('[data-qty]');
  if (btn) setQuantity(btn.dataset.qty);
});
quantityInput.addEventListener('input', e => setQuantity(e.target.value));

document.querySelector('#customWidth').addEventListener('input', e => { state.width = Number(e.target.value) || 0; updateSummary(); });
document.querySelector('#customHeight').addEventListener('input', e => { state.height = Number(e.target.value) || 0; updateSummary(); });

document.querySelectorAll('.product-card').forEach(card => {
  const open = () => selectProduct(card.dataset.product);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
});

document.querySelectorAll('[data-filter]').forEach(a => a.addEventListener('click', () => setTimeout(()=>selectProduct(a.dataset.filter), 80)));

const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
mobileToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileToggle.textContent = open ? '×' : '☰';
});
mobileMenu.addEventListener('click', e => {
  if (e.target.matches('a')) {
    mobileMenu.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded','false');
    mobileToggle.textContent = '☰';
  }
});

const dialog = document.querySelector('#quoteDialog');
function configText() {
  return `Prodotto: ${products[state.product].name}\nFormato: ${formatSummary()}\nColore: ${state.color.name}\nGoffratura: ${state.texture}\nPersonalizzazione: ${state.technique}\nQuantità: ${state.quantity} pz\nStima indicativa: € ${calculateEstimate().toLocaleString('it-IT')}`;
}
document.querySelector('#quoteButton').addEventListener('click', () => {
  document.querySelector('#dialogSummary').textContent = configText();
  dialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#copyConfig').addEventListener('click', async e => {
  try {
    await navigator.clipboard.writeText(configText());
    e.target.textContent = 'Configurazione copiata ✓';
    setTimeout(()=> e.target.textContent = 'Copia configurazione', 1800);
  } catch {
    e.target.textContent = 'Seleziona e copia il riepilogo';
  }
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
