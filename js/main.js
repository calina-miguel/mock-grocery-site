// main.js - handles product data, modal, cart, and simple form validation

const PRODUCTS = [
  { id: 'p1', title: 'Organic Apples', price: 4.50, img: 'assets/product-1.jpg', category: 'produce', featured: true, desc: 'Crisp, locally grown apples.' },
  { id: 'p2', title: 'Whole Grain Bread', price: 3.25, img: 'assets/product-2.jpg', category: 'pantry', featured: true, desc: 'Freshly baked whole grain loaf.' },
  { id: 'p3', title: 'Pantry Olive Oil', price: 12.00, img: 'assets/product-3.jpg', category: 'pantry', featured: true, desc: 'Cold-pressed extra virgin olive oil.' },
  { id: 'p4', title: 'Seasonal Veg Box', price: 24.00, img: 'assets/product-4.jpg', category: 'boxes', featured: false, desc: 'A curated box of seasonal vegetables.' },
  { id: 'p5', title: 'Free-range Eggs (dozen)', price: 6.75, img: 'assets/product-5.jpg', category: 'pantry', featured: false, desc: 'Farm fresh eggs.' },
  { id: 'p6', title: 'Local Honey', price: 8.50, img: 'assets/product-6.jpg', category: 'pantry', featured: false, desc: 'Raw local honey.' }
];

let cart = {}; // { productId: qty }

function formatPrice(n){ return n.toFixed(2); }

function renderFeatured(){
  const container = document.getElementById('featuredList');
  if(!container) return;
  const featured = PRODUCTS.filter(p => p.featured);
  container.innerHTML = featured.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>$${formatPrice(p.price)}</p>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button class="btn" onclick="openProductModal('${p.id}')">Quick view</button>
        <button class="btn primary" onclick="addToCart('${p.id}',1)">Add</button>
      </div>
    </div>
  `).join('');
}

function renderProductsGrid(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>$${formatPrice(p.price)}</p>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button class="btn" onclick="openProductModal('${p.id}')">Quick view</button>
        <button class="btn primary" onclick="addToCart('${p.id}',1)">Add to cart</button>
      </div>
    </div>
  `).join('');
}

function openProductModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:8px" />
      <div>
        <h2>${p.title}</h2>
        <p style="color:#666">${p.desc}</p>
        <p><strong>$${formatPrice(p.price)}</strong></p>
        <div style="display:flex;gap:.5rem;margin-top:1rem">
          <input id="qty_${p.id}" type="number" min="1" value="1" style="width:80px;padding:.5rem;border-radius:8px;border:1px solid #ddd" />
          <button class="btn primary" onclick="addToCartFromModal('${p.id}')">Add to cart</button>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';
}

function closeModal(){
  const modal = document.getElementById('modal');
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
}

function addToCartFromModal(id){
  const qtyInput = document.getElementById(`qty_${id}`);
  const qty = Math.max(1, parseInt(qtyInput.value || 1, 10));
  addToCart(id, qty);
  closeModal();
}

function addToCart(id, qty=1){
  cart[id] = (cart[id] || 0) + qty;
  updateCartUI();
}

function removeFromCart(id){
  delete cart[id];
  updateCartUI();
}

function changeQty(id, qty){
  if(qty <= 0) removeFromCart(id);
  else cart[id] = qty;
  updateCartUI();
}

function updateCartUI(){
  // update counts
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  const cartCountEls = document.querySelectorAll('#cartCount, #cartCount2');
  cartCountEls.forEach(el => el.textContent = count);

  // update drawer items
  const drawer = document.getElementById('cartDrawer') || document.querySelector('.cart-drawer');
  const itemsContainer = document.getElementById('cartItems') || document.getElementById('cartItems2');
  const totalEl = document.getElementById('cartTotal') || document.getElementById('cartTotal2');
  if(!itemsContainer || !totalEl) return;

  const rows = Object.keys(cart).map(id => {
    const p = PRODUCTS.find(x=>x.id===id);
    const qty = cart[id];
    const subtotal = p.price * qty;
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.title}" />
        <div style="flex:1">
          <strong>${p.title}</strong>
          <div style="color:#666">$${formatPrice(p.price)} x 
            <input type="number" min="1" value="${qty}" style="width:60px" onchange="changeQty('${id}', parseInt(this.value,10))" />
          </div>
        </div>
        <div style="text-align:right">
          <div>$${formatPrice(subtotal)}</div>
          <button class="btn" onclick="removeFromCart('${id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  itemsContainer.innerHTML = rows || '<p>Your cart is empty.</p>';
  const total = Object.keys(cart).reduce((s,id)=> s + (PRODUCTS.find(p=>p.id===id).price * cart[id]), 0);
  totalEl.textContent = formatPrice(total);
}

// Cart drawer open/close handlers
function openCartDrawer(){
  const drawer = document.getElementById('cartDrawer');
  if(!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
}
function closeCartDrawer(){
  const drawer = document.getElementById('cartDrawer');
  if(!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
}

// Newsletter form
function handleNewsletter(){
  const form = document.getElementById('newsletterForm');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    const msg = document.getElementById('newsletterMsg');
    if(!email || !email.includes('@')) {
      msg.textContent = 'Please enter a valid email.';
      return;
    }
    msg.textContent = 'Thanks — you are subscribed (mock).';
    form.reset();
  });
}

// Contact form
function handleContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const msg = document.getElementById('contactMsg');
    if(!name || !email || !message) {
      msg.textContent = 'Please fill in all fields.';
      return;
    }
    msg.textContent = 'Message sent (mock). We will reply soon.';
    form.reset();
  });
}

// Modal close binding
document.addEventListener('click', (e) => {
  if(e.target && e.target.id === 'modalClose') closeModal();
  if(e.target && e.target.id === 'closeCart') closeCartDrawer();
  if(e.target && e.target.id === 'closeCart2') closeCartDrawer();
});

// Close modal on background click
document.getElementById && document.getElementById('modal')?.addEventListener('click', (e) => {
  if(e.target === e.currentTarget) closeModal();
});

// Wire up header cart buttons
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderProductsGrid();
  handleNewsletter();
  handleContactForm();
  updateCartUI();

  // header cart buttons
  document.querySelectorAll('#cartBtn, #cartBtn2').forEach(btn => {
    btn?.addEventListener('click', openCartDrawer);
  });

  // checkout mock
  document.querySelectorAll('#checkoutBtn, #checkoutBtn2').forEach(b => {
    b?.addEventListener('click', () => {
      alert('Checkout is a mock in this demo.');
    });
  });

  // modal close button
  document.getElementById('modalClose')?.addEventListener('click', closeModal);

  // set year in footers
  document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());
});
