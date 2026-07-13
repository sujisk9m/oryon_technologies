// ================= HEADER SCROLL STATE =================
const header = document.getElementById('site-header');
const onScroll = () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll);
onScroll();

// ================= MOBILE NAV =================
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

menuBtn.addEventListener('click', () => {
  const isActive = navLinks.classList.toggle('active');
  menuBtn.setAttribute('aria-expanded', isActive);
  menuBtn.innerHTML = isActive ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', false);
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ================= SCROLL REVEAL (progressive enhancement) =================
// Elements are visible by default in CSS. Only if this script runs do we
// add .pre-anim (which starts them hidden) and then reveal them as they
// scroll into view. This means the page is always readable even if JS
// fails to load or run.
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  revealEls.forEach(el => el.classList.add('pre-anim'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
}

// ================= ANIMATED COUNTERS =================
const counters = document.querySelectorAll('.counter');

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  };
  requestAnimationFrame(tick);
};

if ('IntersectionObserver' in window && counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

// ================= CONTACT FORM (demo submit) =================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Message Sent <i class="fas fa-check"></i>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      contactForm.reset();
    }, 2400);
  });
}

// ================= CART (persisted across pages via localStorage) =================
const CART_KEY = 'oryon_cart_v1';

const getCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
};
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const formatPrice = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cartBadge   = document.getElementById('cart-badge');
const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartSubtotalEl = document.getElementById('cart-subtotal');

const renderCart = () => {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.classList.toggle('show', count > 0);
  }

  if (!cartItemsEl) return; // this page has no drawer markup

  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    if (cartEmptyEl) cartEmptyEl.style.display = 'flex';
  } else {
    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-item-icon"><i class="' + (item.icon || 'fas fa-box') + '"></i></div>' +
        '<div class="cart-item-info">' +
          '<span class="cart-item-name">' + item.name + '</span>' +
          '<span class="cart-item-meta">' + formatPrice(item.price) + ' &times; ' + item.qty + '</span>' +
        '</div>' +
        '<button class="cart-item-remove" data-idx="' + idx + '" aria-label="Remove item"><i class="fas fa-xmark"></i></button>';
      cartItemsEl.appendChild(row);
    });
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);

  cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = getCart();
      c.splice(Number(btn.dataset.idx), 1);
      saveCart(c);
      renderCart();
    });
  });
};

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('added')) return;
    const name  = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const icon  = btn.dataset.icon;
    const cart = getCart();
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, icon, qty: 1 });
    saveCart(cart);
    renderCart();

    btn.classList.add('added');
    const label = btn.querySelector('.cta-label');
    const original = label ? label.textContent : null;
    if (label) label.textContent = 'Added';
    setTimeout(() => {
      btn.classList.remove('added');
      if (label && original) label.textContent = original;
    }, 1400);
  });
});

const openCart = () => {
  cartDrawer?.classList.add('open');
  cartOverlay?.classList.add('show');
  document.body.style.overflow = 'hidden';
};
const closeCart = () => {
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('show');
  document.body.style.overflow = '';
};

document.querySelector('.nav-cart')?.addEventListener('click', openCart);
document.getElementById('cart-close')?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

const checkoutBtn = document.getElementById('cart-checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const original = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = 'This is a demo site';
    checkoutBtn.disabled = true;
    setTimeout(() => { checkoutBtn.innerHTML = original; checkoutBtn.disabled = false; }, 2000);
  });
}

renderCart();

// ================= NEWSLETTER FORM (demo submit) =================
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = newsletterForm.querySelector('.newsletter-sub-msg');
    const btn = newsletterForm.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Subscribed <i class="fas fa-check"></i>';
    btn.disabled = true;
    if (msg) msg.classList.add('show');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      if (msg) msg.classList.remove('show');
      newsletterForm.reset();
    }, 2600);
  });
}