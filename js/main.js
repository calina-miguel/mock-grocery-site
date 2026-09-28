const PRODUCTS = [
  {
    id: 'p1',
    title: 'Ripe Plantains',
    price: 5.49,
    img: 'assets/product-1.png',
    category: 'produce',
    featured: true,
    badge: 'Fresh',
    desc: 'Sweet yellow plantains selected for frying, roasting, or adding to weekend stews.'
  },
  {
    id: 'p2',
    title: 'Stone-Ground Garri',
    price: 9.75,
    img: 'assets/product-2.png',
    category: 'pantry',
    featured: true,
    badge: 'Pantry',
    desc: 'Crisp cassava granules for eba, soaking, and quick family meals.'
  },
  {
    id: 'p3',
    title: 'Scotch Bonnet Pepper Mix',
    price: 7.25,
    img: 'assets/product-3.png',
    category: 'spices',
    featured: true,
    badge: 'Spicy',
    desc: 'A bright pepper blend with heat, fruitiness, and depth for soups and marinades.'
  },
  {
    id: 'p4',
    title: 'Jollof Starter Box',
    price: 28.00,
    img: 'assets/product-4.png',
    category: 'boxes',
    featured: true,
    badge: 'Bundle',
    desc: 'Rice, seasoning, tomato base, and aromatics bundled for an easy one-pot classic.'
  },
  {
    id: 'p5',
    title: 'Frozen Goat Meat Cuts',
    price: 18.50,
    img: 'assets/product-5.png',
    category: 'frozen',
    featured: false,
    badge: 'Frozen',
    desc: 'Clean-cut goat meat pieces packed for pepper soup, curry, and slow braises.'
  },
  {
    id: 'p6',
    title: 'Hibiscus Zobo Leaves',
    price: 6.95,
    img: 'assets/product-6.png',
    category: 'drinks',
    featured: false,
    badge: 'Drinks',
    desc: 'Dried hibiscus petals for brewing ruby-red zobo with ginger, citrus, and spice.'
  }
];

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('ayoMarketCart') || '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    return stored;
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem('ayoMarketCart', JSON.stringify(cart));
}

let cart = loadCart();

function formatPrice(n) {
  return n.toFixed(2);
}

function productCard(p) {
  return `
    <article class="card product-card" id="${p.category}-${p.id}" tabindex="0">
      <div class="product-image-wrap">
        <img src="${p.img}" alt="${p.title}" />
        <span class="badge">${p.badge}</span>
      </div>
      <div class="card-body">
        <p class="eyebrow">${p.category}</p>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="product-meta">
          <strong>$${formatPrice(p.price)}</strong>
          <button class="btn" type="button" onclick="openProductModal('${p.id}')">View</button>
          <button class="btn primary" type="button" onclick="addToCart('${p.id}',1)">Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const container = document.getElementById('featuredList');
  if (!container) return;
  container.innerHTML = PRODUCTS.filter(p => p.featured).map(productCard).join('');
}

function renderProductsGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(productCard).join('');
}

function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  if (!p || !modal || !body) return;

  body.innerHTML = `
    <div class="quick-view">
      <img src="${p.img}" alt="${p.title}" />
      <div>
        <p class="eyebrow">${p.badge}</p>
        <h2>${p.title}</h2>
        <p>${p.desc}</p>
        <p class="price">$${formatPrice(p.price)}</p>
        <div class="qty-row">
          <label for="qty_${p.id}">Qty</label>
          <input id="qty_${p.id}" type="number" min="1" value="1" />
          <button class="btn primary" type="button" onclick="addToCartFromModal('${p.id}')">Add to cart</button>
        </div>
      </div>
    </div>
  `;
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
}

function addToCartFromModal(id) {
  const qtyInput = document.getElementById(`qty_${id}`);
  const qty = Math.max(1, parseInt(qtyInput?.value || 1, 10));
  addToCart(id, qty);
  closeModal();
}

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  updateCartUI();
  openCartDrawer();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  updateCartUI();
}

function changeQty(id, qty) {
  if (qty <= 0 || Number.isNaN(qty)) removeFromCart(id);
  else {
    cart[id] = qty;
    saveCart();
  }
  updateCartUI();
}

function updateCartUI() {
  const count = Object.values(cart).reduce((sum, n) => sum + n, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = count;
  });

  const itemsContainer = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsContainer || !totalEl) return;

  const rows = Object.keys(cart).map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return '';
    const qty = cart[id];
    const subtotal = p.price * qty;
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.title}" />
        <div>
          <strong>${p.title}</strong>
          <label>
            <span>$${formatPrice(p.price)} x</span>
            <input type="number" min="1" value="${qty}" onchange="changeQty('${id}', parseInt(this.value,10))" />
          </label>
        </div>
        <div class="cart-line-total">
          <span>$${formatPrice(subtotal)}</span>
          <button class="text-btn" type="button" onclick="removeFromCart('${id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  itemsContainer.innerHTML = rows || '<p>Your basket is empty.</p>';
  const total = Object.keys(cart).reduce((sum, id) => {
    const p = PRODUCTS.find(product => product.id === id);
    return sum + (p ? p.price * cart[id] : 0);
  }, 0);
  totalEl.textContent = formatPrice(total);
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

function handleNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    const msg = document.getElementById('newsletterMsg');
    if (!email || !email.includes('@')) {
      msg.textContent = 'Please enter a valid email.';
      return;
    }
    msg.textContent = 'You are on the list. Fresh updates coming soon.';
    form.reset();
  });
}

function handleContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const msg = document.getElementById('contactMsg');
    if (!name || !email || !message) {
      msg.textContent = 'Please fill in all fields.';
      return;
    }
    msg.textContent = 'Message received. We will reply shortly.';
    form.reset();
  });
}

function setupProductCardPop() {
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover) return;

  document.querySelectorAll('.product-card').forEach(card => {
    let popTimer;

    card.addEventListener('pointerup', event => {
      if (event.target.closest('button, a, input, label')) return;
      window.clearTimeout(popTimer);
      card.classList.add('is-popped');
      popTimer = window.setTimeout(() => {
        card.classList.remove('is-popped');
      }, 520);
    });

    card.addEventListener('pointercancel', () => {
      window.clearTimeout(popTimer);
      card.classList.remove('is-popped');
    });
  });
}

function setupScrollEffects() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const revealTargets = document.querySelectorAll(
    '.service-grid > div, .section-heading, .category-card, .product-card, .feature-block, .team .card, #recipeList .card, .recipe-notes article, .newsletter-inner'
  );

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.setProperty('--stagger-index', index % 4);
  });

  document.querySelectorAll('.grid, .service-grid').forEach(group => {
    group.classList.add('reveal-stagger');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (reduceMotion) return;

  const parallaxEls = document.querySelectorAll('.hero-panel, .service-band, .newsletter');
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight || 1;

    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const y = Math.max(-22, Math.min(22, centerOffset * -32));
      const x = Math.max(-36, Math.min(36, scrollY * .035));
      el.style.setProperty('--parallax-y', `${y}px`);
      el.style.setProperty('--parallax-x', `${x}px`);
    });

    ticking = false;
  };

  const requestParallax = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
}

document.addEventListener('click', e => {
  if (e.target?.id === 'modalClose') closeModal();
  if (e.target?.id === 'closeCart') closeCartDrawer();
});

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderProductsGrid();
  handleNewsletter();
  handleContactForm();
  setupProductCardPop();
  setupScrollEffects();
  updateCartUI();

  document.querySelectorAll('[data-cart-open]').forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });

  document.querySelectorAll('[data-checkout]').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Checkout is a mock in this demo.');
    });
  });

  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.querySelectorAll('[id^="year"]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
